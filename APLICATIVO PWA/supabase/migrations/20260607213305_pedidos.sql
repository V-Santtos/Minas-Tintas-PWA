-- Pedido/orçamento: tabela única, o status carrega o ciclo de vida.
create table orders (
  id uuid primary key default gen_random_uuid(),
  numero integer generated always as identity unique,
  client_id uuid not null references clients (id) on delete restrict,
  painter_id uuid not null references painters (id) on delete restrict,
  status order_status not null default 'rascunho',
  valor_bruto numeric(10,2) not null,
  desconto numeric(10,2) not null default 0,
  observacao text,
  pagamento text,
  created_at timestamptz not null default now(),
  -- Confirmação: nulos até o admin confirmar o pagamento
  confirmed_at timestamptz,
  confirmed_by uuid references admins (auth_user_id) on delete set null,
  valor_confirmado numeric(10,2),
  nota_fiscal text
);

-- Itens do pedido: snapshot do produto no momento. Filho de orders (cascade).
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  name text not null,
  unit_price numeric(10,2) not null,
  qty integer not null check (qty > 0)
);