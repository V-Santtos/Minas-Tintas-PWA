-- Resgate cancelado: registrar QUEM cancelou (pintor x loja/admin) pra notificar o
-- pintor só quando foi a LOJA que cancelou (auto-cancelamento é silencioso).
-- Aditivo: coluna nulável reusando o enum existente resgate_origin; os 2 RPCs de
-- cancelar passam a gravar quem cancelou; a view resgates_admin expõe a coluna.
-- Não altera dado existente (cancelamentos antigos ficam com cancelado_por = null).

alter table resgates
  add column cancelado_por resgate_origin;

comment on column resgates.cancelado_por is
  'Quem cancelou o resgate: pintor (auto-cancelamento) ou admin (a loja cancelou). null enquanto não cancelado. Base da notificação "Resgate cancelado pela loja".';

-- View: expõe cancelado_por (append no fim — aditivo, mesmo corpo vigente).
create or replace view resgates_admin with (security_invoker = on) as
select r.id, r.painter_id, pa.nome as painter_nome,
       r.loja_item_id, li.name as item_nome, li.imagem as item_imagem,
       r.pontos_congelados, r.status, r.iniciado_por,
       r.created_at, r.entregue_em, r.cancelado_em,
       r.quantidade, r.cancelado_por
from resgates r
join painters pa on pa.id = r.painter_id
left join loja_items li on li.id = r.loja_item_id;

grant select on resgates_admin to authenticated;

-- RPC pintor: grava cancelado_por = 'pintor'. Corpo idêntico ao vigente + a coluna.
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
    set status = 'cancelado', cancelado_em = now(), cancelado_por = 'pintor'
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

-- RPC admin: grava cancelado_por = 'admin'. Corpo idêntico ao vigente + a coluna.
create or replace function cancelar_resgate_admin(p_resgate_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_item uuid; v_painter uuid; v_pts integer; v_qtd integer;
begin
  if not is_admin() then raise exception 'Apenas admin' using errcode='P0030'; end if;
  select loja_item_id, painter_id, pontos_congelados, quantidade
    into v_item, v_painter, v_pts, v_qtd
  from resgates where id = p_resgate_id and status='pendente_retirada' for update;
  if not found then raise exception 'Resgate não pode ser cancelado' using errcode='P0031'; end if;
  update resgates set status='cancelado', cancelado_em=now(), cancelado_por='admin' where id=p_resgate_id;
  if v_item is not null then update loja_items set stock=stock+v_qtd where id=v_item; end if;
  if v_pts > 0 then
    insert into point_transactions (painter_id, valor, tipo, resgate_id, created_by)
    values (v_painter, v_pts, 'devolucao', p_resgate_id, auth.uid());
  end if;
end; $$;
