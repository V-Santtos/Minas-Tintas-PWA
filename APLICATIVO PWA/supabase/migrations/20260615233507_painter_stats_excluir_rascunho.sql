-- pedidos no admin conta apenas orçamentos enviados; rascunho é WIP do pintor,
-- então não entra na contagem (nem na lista). aprovados/volume/saldo não mudam
-- (rascunho nunca é aprovado nem credita ponto).
create or replace view painter_stats with (security_invoker = on) as
select
  p.id, p.nome, p.telefone, p.documento, p.email, p.active, p.created_at,
  count(o.id) filter (where o.status <> 'rascunho')                    as pedidos,
  count(o.id) filter (where o.status = 'aprovado')                     as aprovados,
  coalesce(sum(o.valor_bruto) filter (where o.status = 'aprovado'), 0) as volume,
  coalesce((select sum(pt.valor) from point_transactions pt where pt.painter_id = p.id), 0) as saldo
from painters p
left join orders o on o.painter_id = p.id
group by p.id;