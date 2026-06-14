-- Stats derivados do pintor (guardar o fato, derivar o rótulo): saldo = soma do ledger,
-- pedidos/aprovados/volume = agregados sobre orders. Nada disso é coluna.
-- security_invoker = on: a view aplica a RLS das tabelas-base como o usuário logado.
--   admin → vê todas as linhas; pintor → vê só a própria (reuso no app pintor).
create view painter_stats with (security_invoker = on) as
select
  p.id, p.nome, p.telefone, p.documento, p.email, p.active, p.created_at,
  count(o.id)                                                       as pedidos,
  count(o.id) filter (where o.status = 'aprovado')                  as aprovados,
  coalesce(sum(o.valor_bruto) filter (where o.status = 'aprovado'), 0) as volume,
  -- saldo via subconsulta correlacionada, NÃO um segundo left join: juntar orders
  -- E point_transactions na mesma query infla um agregado pelo outro (fan-out).
  coalesce((select sum(pt.valor) from point_transactions pt where pt.painter_id = p.id), 0) as saldo
from painters p
left join orders o on o.painter_id = p.id
group by p.id;

grant select on painter_stats to authenticated;