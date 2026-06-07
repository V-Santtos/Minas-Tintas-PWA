-- Pintor: fonte de verdade do parceiro. Existe com ou sem login (balcão).
create table painters (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  documento text,
  active boolean not null default true,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Admin: só existe pra usar o painel. Login obrigatório (PK = a própria auth).
create table admins (
  auth_user_id uuid primary key references auth.users (id) on delete cascade,
  nome text not null,
  created_at timestamptz not null default now()
);

-- Cliente: documento é a chave única (briefing). Sem coluna de pintor (derivado dos pedidos).
create table clients (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  type client_type not null,
  telefone text,
  documento text not null unique,
  cep text,
  rua text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  observacoes text,
  created_at timestamptz not null default now()
);

-- Catálogo de venda (orçamentos). Cadastrado pelo admin. Módulo separado da lojinha.
create table products (
  id uuid primary key default gen_random_uuid(),
  code text,
  name text not null,
  brand text,
  price numeric(10,2) not null,
  cost numeric(10,2),
  stock integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

