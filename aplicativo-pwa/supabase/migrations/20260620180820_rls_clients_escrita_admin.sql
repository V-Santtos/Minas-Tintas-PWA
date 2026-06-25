-- Escrita de clients pelo admin (CRUD do balcão). Espelha a leitura is_admin().
-- Pintor NÃO escreve clients por policy aqui — é decisão de modelo de um bloco próprio
-- (agenda do pintor vs. vínculo derivado de orders).
create policy "admin insere clientes" on clients
  for insert with check (is_admin());

create policy "admin edita clientes" on clients
  for update using (is_admin()) with check (is_admin());