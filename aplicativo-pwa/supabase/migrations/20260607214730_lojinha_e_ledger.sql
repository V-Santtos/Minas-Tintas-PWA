-- Item da lojinha de pontos. Custo é DERIVADO (base × multiplicador), não guardado.
-- multiplicador nulo = herda o padrão global (settings.multiplicador_padrao).
create table loja_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  valor_base numeric(10,2) not null,
  multiplicador numeric(4,2),
  stock integer not null default 0 check (stock >= 0),
  categoria text,
  imagem text,
  descricao text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Resgate: estado-máquina de 3 status. Guarda o custo congelado (pra devolução exata).
create table resgates (
  id uuid primary key default gen_random_uuid(),
  painter_id uuid not null references painters (id) on delete restrict,
  loja_item_id uuid references loja_items (id) on delete set null,
  pontos_congelados integer not null check (pontos_congelados > 0),
  status resgate_status not null default 'pendente_retirada',
  iniciado_por resgate_origin not null,
  created_at timestamptz not null default now(),
  entregue_em timestamptz,
  entregue_por uuid references admins (auth_user_id) on delete set null,
  cancelado_em timestamptz
);

-- Ledger de pontos: linhas IMUTÁVEIS. O saldo do pintor = soma de valor.
-- Origem polimórfica: vem de um pedido OU de um resgate OU de nenhum (ajuste manual).
create table point_transactions (
  id uuid primary key default gen_random_uuid(),
  painter_id uuid not null references painters (id) on delete restrict,
  valor integer not null check (valor <> 0),
  tipo point_tx_type not null,
  order_id uuid references orders (id) on delete set null,
  resgate_id uuid references resgates (id) on delete set null,
  motivo text,
  created_by uuid references admins (auth_user_id) on delete set null,
  created_at timestamptz not null default now(),

  -- Coerência da origem conforme o tipo
  constraint tx_origem_coerente check (
    (tipo in ('bonus', 'estorno')   and order_id is not null   and resgate_id is null) or
    (tipo in ('resgate', 'devolucao') and resgate_id is not null and order_id is null) or
    (tipo = 'ajuste' and order_id is null and resgate_id is null)
  ),

  -- Manuais exigem motivo
  constraint tx_motivo_obrigatorio check (
    tipo not in ('ajuste', 'estorno') or motivo is not null
  )
);