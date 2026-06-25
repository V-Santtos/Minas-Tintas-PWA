-- Read surface dos pedidos p/ o admin: resolve nomes (painter, cliente, cidade) e dois
-- derivados do ledger. security_invoker=on → admin vê tudo; pintor verá só os seus ao reusar.
create view pedidos_admin with (security_invoker = on) as
select
  o.id, o.numero, o.titulo, o.status, o.valor_bruto, o.desconto, o.pagamento,
  o.observacao, o.created_at, o.confirmed_at,
  o.painter_id, pa.nome as painter_nome,
  o.client_id,  c.nome  as client_nome, c.cidade as client_cidade,
  -- bônus REALMENTE creditado (linha 'bonus' do ledger); 0 até aprovar. Não recalcula por %.
  coalesce((select sum(pt.valor) from point_transactions pt
            where pt.order_id = o.id and pt.tipo = 'bonus'), 0) as bonus_creditado,
  -- motivo do estorno, da linha 'estorno' do ledger (se houver)
  (select pt.motivo from point_transactions pt
   where pt.order_id = o.id and pt.tipo = 'estorno' order by pt.created_at desc limit 1) as estorno_motivo
from orders o
join painters pa on pa.id = o.painter_id
join clients  c  on c.id  = o.client_id;

grant select on pedidos_admin to authenticated;