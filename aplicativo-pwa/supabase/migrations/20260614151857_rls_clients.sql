-- RLS faltante em clients (corrige omissão do rls_dominio).
alter table clients enable row level security;

-- Admin lê todos os clientes.
create policy "admin lê clientes" on clients for select
  using (is_admin());

-- Pintor lê só os clientes com quem tem ao menos um pedido (vínculo derivado).
create policy "pintor lê seus clientes" on clients for select
  using (
    exists (
      select 1 from orders o
      where o.client_id = clients.id
        and o.painter_id = current_painter_id()
    )
  );