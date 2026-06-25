-- Inclui o endereço do pintor na view (fonte canônica usada por admin e app do pintor).
-- p.id é a PK agrupada → colunas entram por dependência funcional, sem tocar o GROUP BY.
-- As 6 colunas são acrescentadas NO FIM: create or replace view só permite append,
-- não reordenar colunas já existentes. security_invoker mantém a RLS por usuário.
create or replace view painter_stats with (security_invoker = on) as
select
  p.id, p.nome, p.telefone, p.documento, p.email, p.active, p.created_at,
  count(o.id) filter (where o.status <> 'rascunho')                    as pedidos,
  count(o.id) filter (where o.status = 'aprovado')                     as aprovados,
  coalesce(sum(o.valor_bruto) filter (where o.status = 'aprovado'), 0) as volume,
  coalesce((select sum(pt.valor) from point_transactions pt where pt.painter_id = p.id), 0) as saldo,
  p.cep, p.rua, p.numero, p.complemento, p.bairro, p.cidade
from painters p
left join orders o on o.painter_id = p.id
group by p.id;