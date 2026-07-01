-- Preco/promocao editado na lojinha do admin nao chegava ao pintor sem
-- fechar/reabrir o app: loja_items nunca entrou na publicacao do Realtime
-- (so orders/point_transactions/resgates, da migration original). Aditivo.
--
-- Sem REPLICA IDENTITY FULL aqui, diferente de orders/resgates: a policy de
-- leitura ("autenticado le lojinha") nao filtra por linha, e igual pra todo
-- mundo -- a decisao da RLS nunca depende da linha antiga, entao o default
-- (so PK no WAL) basta.
alter publication supabase_realtime add table loja_items;