-- Retorna true se o usuário autenticado atual está na tabela admins.
-- SECURITY DEFINER: roda com privilégio do dono, furando o RLS DENTRO dela,
-- pra não cair em recursão (a policy de admins consultaria admins de novo).
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admins where auth_user_id = auth.uid()
  );
$$;

alter table admins enable row level security;

-- Auto-leitura: o admin lê a PRÓPRIA linha (é o que o gate do app Admin faz).
create policy "admin lê a própria linha"
  on admins for select
  using (auth_user_id = auth.uid());

  alter table painters enable row level security;

-- Pintor lê a PRÓPRIA linha (é o que o gate do app Pintor faz).
create policy "pintor lê a própria linha"
  on painters for select
  using (auth_user_id = auth.uid());

-- Admin lê todos os pintores (o painel lista/gerencia pintores).
create policy "admin lê todos os pintores"
  on painters for select
  using (is_admin());