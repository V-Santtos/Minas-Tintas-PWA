-- Resgate pelo pintor: operação atômica (resgate + débito no ledger + baixa de
-- estoque) com checagem de saldo à prova de corrida. SECURITY DEFINER porque
-- escreve no ledger (que a RLS do pintor proíbe); resolve o pintor por
-- current_painter_id() (do JWT), nunca por parâmetro.
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

  -- trava o item; exige ativo
  select valor_base, coalesce(multiplicador, v_padrao)
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

-- Cancelar resgate pelo pintor: espelho — devolve pontos (snapshot, exatamente
-- o debitado) + estoque. Só o próprio pintor e só enquanto pendente_retirada.
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
begin
  v_painter := current_painter_id();
  if v_painter is null then
    raise exception 'Pintor não identificado' using errcode = 'P0001';
  end if;

  select loja_item_id, pontos_congelados
    into v_item, v_pts
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
    update loja_items set stock = stock + 1 where id = v_item;
  end if;

  insert into point_transactions (painter_id, valor, tipo, resgate_id)
  values (v_painter, v_pts, 'devolucao', p_resgate_id);
end;
$$;

revoke all on function resgatar_item(uuid) from public;
revoke all on function cancelar_resgate(uuid) from public;
grant execute on function resgatar_item(uuid) to authenticated;
grant execute on function cancelar_resgate(uuid) to authenticated;