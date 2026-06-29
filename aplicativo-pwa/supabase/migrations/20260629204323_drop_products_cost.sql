-- Remove products.cost. O ERP (Hiper) não fornece custo, só preço de venda, e o
-- catálogo passa a ser read-only alimentado pela sync (não há CRUD admin que
-- escreva custo). Sem fonte, a coluna ficaria sempre nula. Os consumidores de
-- cost já foram removidos do código e deployados (margem no orçamento; exibição
-- e prefill na lojinha) ANTES deste push — por isso o drop é seguro nesta janela.
-- Nenhuma view/policy/trigger depende de cost (products_public não a seleciona).
alter table products drop column cost;