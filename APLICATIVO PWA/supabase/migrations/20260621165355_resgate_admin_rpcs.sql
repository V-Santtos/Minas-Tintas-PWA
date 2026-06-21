-- Gestão de resgate pelo admin. RPCs SECURITY DEFINER gated por is_admin(),
-- travando o resgate e exigindo pendente_retirada.

-- Entregar (marca retirada). Sem ledger — os pontos já foram debitados no resgate.
create or replace function entregar_resgate(p_resgate_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Apenas admin' using errcode='P0030'; end if;
  update resgates
    set status='entregue', entregue_em=now(), entregue_por=auth.uid()
  where id = p_resgate_id and status='pendente_retirada';
  if not found then raise exception 'Resgate não está pendente' using errcode='P0031'; end if;
end; $$;

-- Recusar/cancelar pelo admin: devolve pontos (snapshot pontos_congelados) + estoque.
-- Espelha cancelar_resgate, mas gated por is_admin e resolvendo o pintor da própria linha.
create or replace function cancelar_resgate_admin(p_resgate_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_item uuid; v_painter uuid; v_pts integer;
begin
  if not is_admin() then raise exception 'Apenas admin' using errcode='P0030'; end if;
  select loja_item_id, painter_id, pontos_congelados into v_item, v_painter, v_pts
  from resgates where id = p_resgate_id and status='pendente_retirada' for update;
  if not found then raise exception 'Resgate não pode ser cancelado' using errcode='P0031'; end if;
  update resgates set status='cancelado', cancelado_em=now() where id=p_resgate_id;
  if v_item is not null then update loja_items set stock=stock+1 where id=v_item; end if;
  insert into point_transactions (painter_id, valor, tipo, resgate_id, created_by)
  values (v_painter, v_pts, 'devolucao', p_resgate_id, auth.uid());
end; $$;

revoke all on function entregar_resgate(uuid) from public;
revoke all on function cancelar_resgate_admin(uuid) from public;
grant execute on function entregar_resgate(uuid) to authenticated;
grant execute on function cancelar_resgate_admin(uuid) to authenticated;