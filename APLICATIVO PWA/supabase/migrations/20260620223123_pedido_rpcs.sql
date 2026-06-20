-- Decisão de pedido pelo admin. RPCs SECURITY DEFINER, gated por is_admin(),
-- que travam o pedido (FOR UPDATE) verificando o status atual — impede
-- aprovar/estornar duas vezes (bônus dobrado). created_by/confirmed_by = auth.uid()
-- (que é o admins.auth_user_id, já que is_admin() passou).

-- pendente -> aprovado: confirma pagamento + credita bônus (1% do bruto, taxa do settings)
create or replace function aprovar_pedido(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_admin uuid; v_painter uuid; v_bruto numeric; v_percent numeric; v_bonus integer;
begin
  if not is_admin() then raise exception 'Apenas admin' using errcode='P0010'; end if;
  v_admin := auth.uid();
  select painter_id, valor_bruto into v_painter, v_bruto
  from orders where id = p_order_id and status = 'pendente' for update;
  if not found then raise exception 'Pedido não está pendente' using errcode='P0011'; end if;
  select bonus_percent into v_percent from settings where id = 1;
  v_bonus := round(v_bruto * v_percent)::integer;
  update orders set status='aprovado', confirmed_at=now(), confirmed_by=v_admin, valor_confirmado=v_bruto
  where id = p_order_id;
  if v_bonus > 0 then
    insert into point_transactions (painter_id, valor, tipo, order_id, created_by)
    values (v_painter, v_bonus, 'bonus', p_order_id, v_admin);
  end if;
end; $$;

-- pendente -> recusado (sem ledger). Via RPC p/ não abrir UPDATE de orders ao client.
create or replace function recusar_pedido(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Apenas admin' using errcode='P0010'; end if;
  update orders set status='recusado' where id = p_order_id and status='pendente';
  if not found then raise exception 'Pedido não está pendente' using errcode='P0011'; end if;
end; $$;

-- aprovado -> estornado: reverte o bônus REALMENTE creditado (soma das linhas bonus)
create or replace function estornar_pedido(p_order_id uuid, p_motivo text)
returns void language plpgsql security definer set search_path = public as $$
declare v_admin uuid; v_painter uuid; v_credit integer;
begin
  if not is_admin() then raise exception 'Apenas admin' using errcode='P0010'; end if;
  v_admin := auth.uid();
  if coalesce(btrim(p_motivo),'') = '' then raise exception 'Motivo obrigatório' using errcode='P0012'; end if;
  select painter_id into v_painter
  from orders where id = p_order_id and status='aprovado' for update;
  if not found then raise exception 'Pedido não está aprovado' using errcode='P0013'; end if;
  update orders set status='estornado' where id = p_order_id;
  select coalesce(sum(valor),0) into v_credit
  from point_transactions where order_id = p_order_id and tipo='bonus';
  if v_credit > 0 then
    insert into point_transactions (painter_id, valor, tipo, order_id, motivo, created_by)
    values (v_painter, -v_credit, 'estorno', p_order_id, p_motivo, v_admin);
  end if;
end; $$;

revoke all on function aprovar_pedido(uuid) from public;
revoke all on function recusar_pedido(uuid) from public;
revoke all on function estornar_pedido(uuid, text) from public;
grant execute on function aprovar_pedido(uuid) to authenticated;
grant execute on function recusar_pedido(uuid) to authenticated;
grant execute on function estornar_pedido(uuid, text) to authenticated;