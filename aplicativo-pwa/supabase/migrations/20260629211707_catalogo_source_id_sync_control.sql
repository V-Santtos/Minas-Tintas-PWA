-- Alicerce aditivo da integração do catálogo Hiper -> products.
--
-- source_id = id (uuid) do produto no Hiper. Chave de upsert idempotente
-- (onConflict). A PK local (products.id) NÃO muda, então o FK
-- order_items.product_id continua intacto. unique permite vários NULL: linhas de
-- origem não-Hiper (legado/manual) convivem; o enforce vale só nos sincronizados.
alter table products add column source_id uuid;
alter table products add constraint products_source_id_key unique (source_id);

comment on column products.source_id is
  'id (uuid) do produto no ERP Hiper. Chave de upsert idempotente (onConflict). null = origem nao-Hiper (legado/manual).';

-- Cursor de sincronização incremental por recurso: guarda o último
-- pontoDeSincronizacao do Hiper para a próxima chamada pegar só o delta.
create table sync_control (
  recurso text primary key,                         -- ex.: 'produtos'
  ponto_de_sincronizacao integer not null default 0,
  atualizado_em timestamptz not null default now()
);

comment on table sync_control is
  'Cursor incremental por recurso (pontoDeSincronizacao do Hiper). Escrito/lido so pelo service_role (RLS ligada, sem policy).';

-- RLS ligada e SEM policy: nenhuma role autenticada lê/escreve. Só o service_role
-- (sync server-only) acessa, pois bypassa RLS. Leitura admin pode ser adicionada
-- depois (policy aditiva) se a UI precisar exibir "última sincronização".
alter table sync_control enable row level security;