-- O multiplicador individual da lojinha passa a ser um DELTA relativo ao
-- multiplicador_padrao (settings), e não mais um multiplicador ABSOLUTO.
--
-- Porque: a escrita gravava `padrao + mod` (absoluto), cozinhando o padrão
-- vigente NO MOMENTO da escrita. Itens com mod individual viravam não-nulos e
-- deixavam de herdar -> mudar o multiplicador global depois NÃO reprecificava
-- esses itens (ficavam congelados). Com delta, o efetivo é calculado em leitura
-- como `padrao + coalesce(delta, 0)`, então itens com mod individual acompanham
-- o multiplicador global.
--
-- null = herda (sem delta). A coluna é renomeada p/ mult_delta para o nome não
-- mentir sobre o conteúdo (e p/ o rename quebrar qualquer call-site esquecido em
-- tempo de migration/build, em vez de silenciosamente errar a conta).

alter table loja_items rename column multiplicador to mult_delta;

comment on column loja_items.mult_delta is
  'Ajuste (delta) relativo a settings.multiplicador_padrao. null = herda. Efetivo em leitura = padrao + coalesce(mult_delta, 0).';

-- Os valores legados eram ABSOLUTOS e não dá pra recuperar, por linha, qual
-- padrão estava vigente na escrita -> converter "no chute" assaria um delta
-- errado. Como são dados de TESTE, zera todos (voltam a herdar); os poucos mods
-- individuais reais são reinseridos pelo admin já na semântica de delta.
update loja_items set mult_delta = null;

-- View: custo_pts e selo de promo agora derivam do delta.
-- (drop + create, e não "create or replace": replace não permite renomear
--  coluna de saída, só adicionar no fim.)
drop view loja_items_admin;
create view loja_items_admin with (security_invoker = on) as
select li.id, li.name, li.valor_base, li.mult_delta, li.stock, li.categoria,
       li.imagem, li.descricao, li.active,
       round(li.valor_base * (s.multiplicador_padrao + coalesce(li.mult_delta, 0))) as custo_pts,
       (coalesce(li.mult_delta, 0) < 0) as promo
from loja_items li cross join settings s;

grant select on loja_items_admin to authenticated;

-- RPC de resgate: mesma fórmula aditiva (charged == displayed). Única mudança é
-- a linha do select (coluna + coalesce aditivo); o resto é idêntico à original.
create or replace function resgatar_item(p_item_id uuid)
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
  v_custo   integer;
  v_saldo   bigint;
  v_resgate uuid;
begin
  v_painter := current_painter_id();
  if v_painter is null then
    raise exception 'Pintor não identificado' using errcode = 'P0001';
  end if;

  -- trava o pintor: serializa resgates concorrentes (anti double-spend)
  perform 1 from painters where id = v_painter for update;

  select multiplicador_padrao into v_padrao from settings where id = 1;

  -- trava o item; exige ativo. efetivo = padrao + delta (delta null = herda)
  select valor_base, (v_padrao + coalesce(mult_delta, 0))
    into v_base, v_mult
  from loja_items
  where id = p_item_id and active
  for update;
  if not found then
    raise exception 'Item indisponível' using errcode = 'P0002';
  end if;

  -- custo: mesma fórmula da view loja_items_admin (charged == displayed)
  v_custo := round(v_base * v_mult)::integer;
  if v_custo <= 0 then
    raise exception 'Custo inválido' using errcode = 'P0003';
  end if;

  select coalesce(sum(valor), 0) into v_saldo
  from point_transactions where painter_id = v_painter;
  if v_saldo < v_custo then
    raise exception 'Saldo insuficiente' using errcode = 'P0004';
  end if;

  update loja_items set stock = stock - 1
  where id = p_item_id and stock > 0;
  if not found then
    raise exception 'Sem estoque' using errcode = 'P0005';
  end if;

  insert into resgates (painter_id, loja_item_id, pontos_congelados, iniciado_por)
  values (v_painter, p_item_id, v_custo, 'pintor')
  returning id into v_resgate;

  insert into point_transactions (painter_id, valor, tipo, resgate_id)
  values (v_painter, -v_custo, 'resgate', v_resgate);

  return v_resgate;
end;
$$;

revoke all on function resgatar_item(uuid) from public;
grant execute on function resgatar_item(uuid) to authenticated;