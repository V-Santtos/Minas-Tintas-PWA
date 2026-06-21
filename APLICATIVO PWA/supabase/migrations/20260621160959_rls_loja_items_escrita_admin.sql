-- Escrita de loja_items pelo admin (CRUD da lojinha de pontos). Espelha o padrão
-- de clients: leitura é de qualquer autenticado (o pintor vê o catálogo da
-- lojinha); escrita (insert/update) só admin. Sem DELETE — "remover" será
-- active=false num bloco futuro.
create policy "admin insere loja_items" on loja_items
  for insert with check (is_admin());

create policy "admin edita loja_items" on loja_items
  for update using (is_admin()) with check (is_admin());