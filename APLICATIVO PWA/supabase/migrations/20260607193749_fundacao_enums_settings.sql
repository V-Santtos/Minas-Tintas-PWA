-- Tipos enumerados — listas fixas de valores válidos, a fonte de verdade dos status
create type order_status as enum (
  'rascunho', 'pendente', 'aprovado', 'recusado', 'cancelado', 'estornado'
);

create type point_tx_type as enum (
  'bonus', 'resgate', 'estorno', 'ajuste', 'devolucao'
);

create type resgate_status as enum (
  'pendente_retirada', 'entregue', 'cancelado'
);

create type client_type as enum ('pessoa', 'empresa');

create type resgate_origin as enum ('pintor', 'admin');

-- Configurações gerais — linha única (id sempre = 1), guarda o "agora"
create table settings (
  id int primary key default 1,
  bonus_percent numeric(5,4) not null default 0.01,
  multiplicador_padrao numeric(4,2) not null default 3.0,
  constraint settings_singleton check (id = 1)
);

-- Cria a linha única com os valores acordados
insert into settings (id) values (1); 