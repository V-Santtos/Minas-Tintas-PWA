-- Escrita de settings pelo admin (linha única id=1). Só UPDATE — sem insert/delete
-- (singleton já semeado). Leitura segue livre para autenticado.
create policy "admin edita settings" on settings
  for update using (is_admin()) with check (is_admin());