-- Publica orders, point_transactions e resgates no Realtime.
-- Padrao "evento -> router.refresh()": o payload e ignorado; o cliente so usa
-- o evento como gatilho pra re-buscar no servidor (RLS/views intactos).
--
-- REPLICA IDENTITY FULL em orders/resgates: essas tabelas recebem UPDATE
-- (mudanca de status). Na avaliacao de RLS de um UPDATE/DELETE, o Realtime
-- precisa do painter_id na linha "antiga"; por padrao o WAL so loga a PK ali.
-- Sem FULL: a policy "painter_id = current_painter_id()" ve painter_id NULL ->
-- falha fechada -> o evento de aprovacao NAO chega ao pintor (quebra a feature).
-- Com FULL: a linha completa vai no WAL, a RLS filtra certo, cada pintor so
-- recebe o evento do proprio pedido.
-- point_transactions e append-only (ledger imutavel, so INSERT): a linha NOVA
-- ja traz painter_id -> REPLICA IDENTITY default (PK) basta.

alter table orders   replica identity full;
alter table resgates replica identity full;

alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table point_transactions;
alter publication supabase_realtime add table resgates;