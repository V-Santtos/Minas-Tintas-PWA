-- Agenda standalone do pintor: relacao M:N pintor<->cliente, independente de pedido.
-- O pintor pode vincular-se a um cliente (novo ou ja existente) sem precisar de um
-- orcamento. Um cliente pode ter varios pintores (linhas independentes) — o briefing
-- preve "cliente com varios pintores ao longo do tempo". Cada pintor ve so o proprio
-- vinculo (nao enxerga os demais pintores de um cliente).
create table painter_clients (
  painter_id uuid not null references painters(id) on delete cascade,
  client_id  uuid not null references clients(id)  on delete cascade,
  created_at timestamptz not null default now(),
  primary key (painter_id, client_id)
);

alter table painter_clients enable row level security;

-- Pintor le SO os proprios vinculos.
create policy "pintor le seus vinculos" on painter_clients for select
  using (painter_id = current_painter_id());

-- Admin ve todos os vinculos.
create policy "admin le vinculos" on painter_clients for select
  using (is_admin());

-- Leitura de clients ampliada: alem de "tem pedido com esse pintor", agora tambem
-- "tem vinculo de agenda com esse pintor". Mantem a policy de pedido intacta.
drop policy if exists "pintor lê seus clientes" on clients;
create policy "pintor lê seus clientes" on clients for select
  using (
    exists (
      select 1 from orders o
      where o.client_id = clients.id and o.painter_id = current_painter_id()
    )
    or exists (
      select 1 from painter_clients pc
      where pc.client_id = clients.id and pc.painter_id = current_painter_id()
    )
  );

-- RPC: vincular cliente ao pintor (find-or-create por documento). SECURITY DEFINER
-- porque o find por documento checa a tabela inteira (fura a RLS de leitura do pintor).
-- Identidade pelo JWT, nunca por parametro. NAO sobrescreve cadastro existente (edicao
-- do cliente e so do admin).
create or replace function vincular_cliente_pintor(p_new_client jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_painter uuid;
  v_client  uuid;
  v_doc     text;
  v_client_created boolean := false;
  v_link_created   boolean := false;
begin
  v_painter := current_painter_id();
  if v_painter is null then
    raise exception 'Pintor nao identificado' using errcode='P0021';
  end if;

  v_doc := btrim(coalesce(p_new_client->>'documento',''));
  if v_doc = '' or btrim(coalesce(p_new_client->>'nome','')) = '' then
    raise exception 'Cliente incompleto' using errcode='P0023';
  end if;

  select id into v_client from clients where documento = v_doc;   -- find
  if v_client is null then                                        -- or create
    insert into clients (nome, type, documento, telefone, cep, rua, numero, complemento, bairro, cidade, observacoes)
    values (
      btrim(p_new_client->>'nome'),
      coalesce(p_new_client->>'type','pessoa')::client_type,
      v_doc,
      nullif(btrim(coalesce(p_new_client->>'telefone','')),''),
      nullif(btrim(coalesce(p_new_client->>'cep','')),''),
      nullif(btrim(coalesce(p_new_client->>'rua','')),''),
      nullif(btrim(coalesce(p_new_client->>'numero','')),''),
      nullif(btrim(coalesce(p_new_client->>'complemento','')),''),
      nullif(btrim(coalesce(p_new_client->>'bairro','')),''),
      nullif(btrim(coalesce(p_new_client->>'cidade','')),''),
      nullif(btrim(coalesce(p_new_client->>'observacoes','')),'')
    ) returning id into v_client;
    v_client_created := true;
  end if;

  insert into painter_clients (painter_id, client_id)
  values (v_painter, v_client)
  on conflict (painter_id, client_id) do nothing;
  v_link_created := found;

  return jsonb_build_object(
    'client_id', v_client,
    'client_created', v_client_created,
    'link_created', v_link_created
  );
end;
$$;

grant execute on function vincular_cliente_pintor(jsonb) to authenticated;