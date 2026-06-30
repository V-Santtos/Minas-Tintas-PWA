-- Brinde de boas-vindas: itens-brinde sao loja_items separados do catalogo
-- (flag is_brinde), concedidos de graca na criacao do pintor via RPC dedicada.
-- Tudo aditivo: colunas novas com default, view por append, RPC nova.

-- 1) Item de brinde: fora da grade comum da lojinha (filtro fica no app/query,
--    nao na view, pra nao quebrar o admin que precisa enxergar tudo).
alter table loja_items
  add column is_brinde boolean not null default false;

comment on column loja_items.is_brinde is
  'Item de brinde de boas-vindas (concedido gratis na criacao do pintor). Fora da grade normal da lojinha; o resgate ainda referencia via loja_item_id (reusa nome/imagem/estoque).';

-- 2) Estoque nulavel: null = ilimitado (pincel). Boné continua com numero fixo.
--    check (stock >= 0) ja existente aceita null sem alteracao (constraint so
--    reprova quando a expressao da FALSE; null avalia unknown = passa).
alter table loja_items
  alter column stock drop not null;

-- 3) Resgate gratis: pontos_congelados pode ser 0.
alter table resgates
  drop constraint resgates_pontos_congelados_check;
alter table resgates
  add constraint resgates_pontos_congelados_check check (pontos_congelados >= 0);

-- 4) View: append de is_brinde no fim (mantem create or replace aditivo).
create or replace view loja_items_admin with (security_invoker = on) as
select li.id, li.name, li.valor_base, li.mult_delta, li.stock, li.categoria,
       li.imagem, li.descricao, li.active,
       round(li.valor_base * (s.multiplicador_padrao + coalesce(li.mult_delta, 0))) as custo_pts,
       (coalesce(li.mult_delta, 0) < 0) as promo,
       li.resgate_unico,
       li.imagem_pos_x, li.imagem_pos_y,
       li.is_brinde
from loja_items li cross join settings s;

grant select on loja_items_admin to authenticated;

-- 5) Os dois itens-brinde (separados de qualquer item igual no catalogo comprável).
--    valor_base = 0: campo morto pra item gratis (custo real vem hardcoded na RPC).
insert into loja_items (id, name, valor_base, stock, categoria, imagem, descricao, is_brinde) values
  ('00000000-0000-0000-0000-0000000000c1', 'Boné Minas Tintas',
   0, 10, 'brinde-boas-vindas', '/assets/brinde-bone.png',
   'Boné Minas Tintas em sarja, bordado exclusivo da parceria. Tamanho único com ajuste traseiro.',
   true),
  ('00000000-0000-0000-0000-0000000000c2', 'Pincel Condor 2"',
   0, null, 'brinde-boas-vindas', '/assets/brinde-pincel.png',
   'Pincel Condor RecorT 727, cerda macia 2". Acabamento liso — ideal para portas, janelas e recortes.',
   true);

-- 6) RPC de concessao: chamada pelo backend admin (service_role, fora de
--    contexto de JWT de pintor/admin) logo apos o insert em painters.
--    Idempotente: se o pintor ja tem resgate de brinde, nao faz nada de novo.
--    FOR UPDATE no bone trava a corrida: nunca passa de 10 concedidos.
create or replace function conceder_brinde_boas_vindas(p_painter_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bone_id   uuid := '00000000-0000-0000-0000-0000000000c1';
  v_pincel_id uuid := '00000000-0000-0000-0000-0000000000c2';
  v_bone_stock integer;
  v_item_id   uuid;
  v_resgate   uuid;
begin
  select id into v_resgate
  from resgates
  where painter_id = p_painter_id
    and loja_item_id in (v_bone_id, v_pincel_id)
  limit 1;
  if found then
    return v_resgate;
  end if;

  select stock into v_bone_stock
  from loja_items where id = v_bone_id
  for update;

  if v_bone_stock is not null and v_bone_stock > 0 then
    v_item_id := v_bone_id;
    update loja_items set stock = stock - 1 where id = v_bone_id;
  else
    v_item_id := v_pincel_id;
  end if;

  insert into resgates (painter_id, loja_item_id, pontos_congelados, iniciado_por)
  values (p_painter_id, v_item_id, 0, 'admin')
  returning id into v_resgate;

  return v_resgate;
end;
$$;

revoke all on function conceder_brinde_boas_vindas(uuid) from public;
grant execute on function conceder_brinde_boas_vindas(uuid) to service_role;

-- 7) Cancelamento de resgate gratis nao pode tentar lancar devolucao de 0
--    (violaria o check valor <> 0 do ledger). Guarda condicional nos dois
--    caminhos de cancelamento (pintor e admin).
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

  if v_pts > 0 then
    insert into point_transactions (painter_id, valor, tipo, resgate_id)
    values (v_painter, v_pts, 'devolucao', p_resgate_id);
  end if;
end;
$$;

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
  if v_pts > 0 then
    insert into point_transactions (painter_id, valor, tipo, resgate_id, created_by)
    values (v_painter, v_pts, 'devolucao', p_resgate_id, auth.uid());
  end if;
end; $$;

-- 8) Flag "ja viu o modal": por pintor, em painter_settings (mesma separacao
--    de painters que ja existe, mesmo padrao de RPC self-service do
--    salvar_notif_prefs).
alter table painter_settings
  add column brinde_visto_em timestamptz;

comment on column painter_settings.brinde_visto_em is
  'Timestamp de quando o pintor fechou o modal de brinde de boas-vindas. null = ainda nao viu.';

create or replace function marcar_brinde_visto()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_painter uuid;
begin
  v_painter := current_painter_id();
  if v_painter is null then
    raise exception 'Pintor não identificado' using errcode = 'P0021';
  end if;

  insert into painter_settings (painter_id, brinde_visto_em)
  values (v_painter, now())
  on conflict (painter_id) do update
    set brinde_visto_em = excluded.brinde_visto_em;
end;
$$;

revoke all on function marcar_brinde_visto() from public;
grant execute on function marcar_brinde_visto() to authenticated;