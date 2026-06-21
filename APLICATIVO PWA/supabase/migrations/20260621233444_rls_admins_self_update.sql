-- Self-update do admin (editar o próprio nome na conta). Escopo é a própria linha
-- (auth_user_id = auth.uid()), não is_admin() — um admin não edita outro. Só UPDATE:
-- criação/remoção de admin é operação de banco, não da UI.
create policy "admin edita a própria linha"
  on admins for update
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());