-- Escrita de painters pelo admin (editar nome/documento, ativar/inativar).
-- Só UPDATE — criação é pelo route /api/pintores (service_role, cria auth+linha);
-- sem DELETE (pintor não é apagado, é inativado). Pintor não edita a própria linha
-- (telefone é credencial; nome/documento/active são gestão do admin). Leitura intacta.
create policy "admin edita painters" on painters
  for update using (is_admin()) with check (is_admin());