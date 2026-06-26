-- Resgate ganha quantidade, e item da lojinha pode ser "resgate único por pintor".
--
-- quantidade: 1 linha de resgate passa a cobrir N unidades (em vez de N linhas).
--   pontos_congelados = TOTAL (custo_unit * qtd); a devolução já reembolsa o
--   snapshot exato, então segue correto. Estoque baixa qtd de uma vez; cancelar
--   (pintor e admin) devolve qtd, não 1.
-- resgate_unico: cada pintor só pode resgatar o item uma vez. "Uma vez" conta
--   resgates em pendente_retirada/entregue; cancelado devolveu -> libera de novo.
--   Trava na RPC (autoritativa); a UI só espelha. Item único força quantidade 1.
--
-- Tudo aditivo: colunas novas (default), RPC com parâmetro default e views por
-- append -> não quebra o código deployado antigo (db push pode ir primeiro).

alter table loja_items
  add column resgate_unico boolean not null default false;

alter table resgates
  add column quantidade integer not null default 1 check (quantidade > 0);

comment on column loja_items.resgate_unico is
  'Se true, cada pintor so pode resgatar este item uma vez (conta pendente_retirada/entregue; cancelado libera). Forca quantidade 1.';
comment on column resgates.quantidade is
  'Unidades cobertas por esta linha de resgate. pontos_congelados e o TOTAL (custo_unit * quantidade).';

-- Views: append da coluna nova (create or replace permite adicionar no fim).
create or replace view loja_items_admin with (security_invoker = on) as
select li.id, li.name, li.valor_base, li.mult_delta, li.stock, li.categoria,
       li.imagem, li.descricao, li.active,
       round(li.valor_base * (s.multiplicador_padrao + coalesce(li.mult_delta, 0))) as custo_pts,
       (coalesce(li.mult_delta, 0) < 0) as promo,
       li.resgate_unico
from loja_items li cross join settings s;

grant select on loja_items_admin to authenticated;

create or replace view resgates_admin with (security_invoker = on) as
select r.id, r.painter_id, pa.nome as painter_nome,
       r.loja_item_id, li.name as item_nome, li.imagem as item_imagem,
       r.pontos_congelados, r.status, r.iniciado_por,
       r.created_at, r.entregue_em, r.cancelado_em,
       r.quantidade
from resgates r
join painters pa on pa.id = r.painter_id
left join loja_items li on li.id = r.loja_item_id;

grant select on resgates_admin to authenticated;

-- RPC de resgate: assinatura muda (+ p_qtd default 1), então drop + create.
-- O default mantém a chamada antiga (so p_item_id) funcionando durante o deploy.
drop function resgatar_item(uuid);
create function resgatar_item(p_item_id uuid, p_qtd integer default 1)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_painter uuid;
  v_padrao  numeric;
  v_base    numeric;
  v_mult    numeric;
  v_unico   boolean;
  v_custo   integer;  -- custo unitario
  v_total   integer;  -- custo unitario * qtd
  v_saldo   bigint;
  v_resgate uuid;
begin
  v_painter := current_painter_id();
  if v_painter is null then
    raise exception 'Pintor não identificado' using errcode = 'P0001';
  end if;

  if p_qtd is null or p_qtd < 1 then
    raise exception 'Quantidade inválida' using errcode = 'P0008';
  end if;

  -- trava o pintor: serializa resgates concorrentes (anti double-spend)
  perform 1 from painters where id = v_painter for update;

  select multiplicador_padrao into v_padrao from settings where id = 1;

  -- trava o item; exige ativo. efetivo = padrao + delta (delta null = herda)
  select valor_base, (v_padrao + coalesce(mult_delta, 0)), resgate_unico
    into v_base, v_mult, v_unico
  from loja_items
  where id = p_item_id and active
  for update;
  if not found then
    raise exception 'Item indisponível' using errcode = 'P0002';
  end if;

  -- item unico: sempre 1 unidade, e so se o pintor ainda nao tem um ativo/entregue
  if v_unico then
    p_qtd := 1;
    if exists (
      select 1 from resgates
      where painter_id = v_painter and loja_item_id = p_item_id
        and status in ('pendente_retirada', 'entregue')
    ) then
      raise exception 'Item de resgate único já resgatado' using errcode = 'P0007';
    end if;
  end if;

  -- custo: mesma fórmula da view loja_items_admin (charged == displayed)
  v_custo := round(v_base * v_mult)::integer;
  if v_custo <= 0 then
    raise exception 'Custo inválido' using errcode = 'P0003';
  end if;
  v_total := v_custo * p_qtd;

  select coalesce(sum(valor), 0) into v_saldo
  from point_transactions where painter_id = v_painter;
  if v_saldo < v_total then
    raise exception 'Saldo insuficiente' using errcode = 'P0004';
  end if;

  update loja_items set stock = stock - p_qtd
  where id = p_item_id and stock >= p_qtd;
  if not found then
    raise exception 'Estoque insuficiente' using errcode = 'P0005';
  end if;

  insert into resgates (painter_id, loja_item_id, pontos_congelados, quantidade, iniciado_por)
  values (v_painter, p_item_id, v_total, p_qtd, 'pintor')
  returning id into v_resgate;

  insert into point_transactions (painter_id, valor, tipo, resgate_id)
  values (v_painter, -v_total, 'resgate', v_resgate);

  return v_resgate;
end;
$$;

revoke all on function resgatar_item(uuid, integer) from public;
grant execute on function resgatar_item(uuid, integer) to authenticated;

-- Cancelamento (pintor): devolve quantidade de estoque (nao 1).
create or replace function cancelar_resgate(p_resgate_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_painter uuid;
  v_item    uuid;
  v_pts     integer;
  v_qtd     integer;
begin
  v_painter := current_painter_id();
  if v_painter is null then
    raise exception 'Pintor não identificado' using errcode = 'P0001';
  end if;

  select loja_item_id, pontos_congelados, quantidade
    into v_item, v_pts, v_qtd
  from resgates
  where id = p_resgate_id
    and painter_id = v_painter
    and status = 'pendente_retirada'
  for update;
  if not found then
    raise exception 'Resgate não pode ser cancelado' using errcode = 'P0006';
  end if;

  update resgates
    set status = 'cancelado', cancelado_em = now()
  where id = p_resgate_id;

  if v_item is not null then
    update loja_items set stock = stock + v_qtd where id = v_item;
  end if;

  insert into point_transactions (painter_id, valor, tipo, resgate_id)
  values (v_painter, v_pts, 'devolucao', p_resgate_id);
end;
$$;

-- Cancelamento (admin): idem, devolve quantidade.
create or replace function cancelar_resgate_admin(p_resgate_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_item uuid; v_painter uuid; v_pts integer; v_qtd integer;
begin
  if not is_admin() then raise exception 'Apenas admin' using errcode='P0030'; end if;
  select loja_item_id, painter_id, pontos_congelados, quantidade
    into v_item, v_painter, v_pts, v_qtd
  from resgates where id = p_resgate_id and status='pendente_retirada' for update;
  if not found then raise exception 'Resgate não pode ser cancelado' using errcode='P0031'; end if;
  update resgates set status='cancelado', cancelado_em=now() where id=p_resgate_id;
  if v_item is not null then update loja_items set stock=stock+v_qtd where id=v_item; end if;
  insert into point_transactions (painter_id, valor, tipo, resgate_id, created_by)
  values (v_painter, v_pts, 'devolucao', p_resgate_id, auth.uid());
end; $$;