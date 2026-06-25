-- Nome da obra/projeto do orçamento (ex.: "Igreja São Francisco").
-- Autorado na criação do orçamento (escrita, 3b); nulo nos pedidos pré-existentes.
alter table orders add column titulo text;