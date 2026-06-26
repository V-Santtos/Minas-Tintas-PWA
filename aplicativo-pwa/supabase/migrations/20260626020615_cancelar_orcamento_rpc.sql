-- Cancelar orçamento pelo pintor: só pendentes, só os do próprio pintor.
-- SECURITY DEFINER; identidade pelo JWT (current_painter_id), nunca por parâmetro.
-- Guarda de status impede cancelar algo já aprovado/creditado; FOR UPDATE evita
-- corrida com a aprovação do admin no mesmo instante. Pendente não tem lançamento
-- no ledger, então cancelar não estorna nada.
create or replace function cancelar_orcamento(
  p_numero integer
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_painter uuid;
  v_status  order_status;
begin
  v_painter := current_painter_id();
  if v_painter is null then
    raise exception 'Pintor não identificado' using errcode='P0020';
  end if;

  -- trava a linha e confirma posse pelo pintor do JWT
  select status into v_status
  from orders
  where numero = p_numero and painter_id = v_painter
  for update;

  if not found then
    raise exception 'Pedido não encontrado' using errcode='P0030';
  end if;

  if v_status <> 'pendente' then
    raise exception 'Só é possível cancelar um orçamento pendente' using errcode='P0031';
  end if;

  update orders set status = 'cancelado'
  where numero = p_numero and painter_id = v_painter;
end; $$;

revoke all on function cancelar_orcamento(integer) from public;
grant execute on function cancelar_orcamento(integer) to authenticated;