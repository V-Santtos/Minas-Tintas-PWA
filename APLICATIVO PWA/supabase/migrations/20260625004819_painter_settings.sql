-- Preferencias de notificacao por pintor (configuracoes do app). Tabela separada de
-- painters para nao expor identidade/credencial a escrita self: aqui o pintor so mexe
-- nas proprias preferencias. Hoje sem consumidor (sistema de notificacao ainda nao
-- existe); persistido para sobreviver a reload e ficar pronto quando as notificacoes
-- forem construidas.
create table painter_settings (
  painter_id      uuid primary key references painters(id) on delete cascade,
  notif_pedidos   boolean not null default true,
  notif_pontos    boolean not null default true,
  notif_resgates  boolean not null default true,
  notif_promocoes boolean not null default false,
  updated_at      timestamptz not null default now()
);

alter table painter_settings enable row level security;

-- Pintor le so as proprias preferencias (a escrita e pelo RPC abaixo).
create policy "pintor le suas settings" on painter_settings for select
  using (painter_id = current_painter_id());

-- RPC: salva (upsert) as preferencias do proprio pintor. SECURITY DEFINER, identidade
-- pelo JWT (current_painter_id), nunca por parametro. Mesmo padrao das demais escritas
-- do pintor (enviar_orcamento, resgatar_item, vincular_cliente_pintor).
create or replace function salvar_notif_prefs(p_prefs jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_painter uuid;
begin
  v_painter := current_painter_id();
  if v_painter is null then
    raise exception 'Pintor nao identificado' using errcode='P0021';
  end if;

  insert into painter_settings (painter_id, notif_pedidos, notif_pontos, notif_resgates, notif_promocoes, updated_at)
  values (
    v_painter,
    coalesce((p_prefs->>'pedidos')::boolean,  true),
    coalesce((p_prefs->>'pontos')::boolean,   true),
    coalesce((p_prefs->>'resgates')::boolean, true),
    coalesce((p_prefs->>'promocoes')::boolean,false),
    now()
  )
  on conflict (painter_id) do update set
    notif_pedidos   = excluded.notif_pedidos,
    notif_pontos    = excluded.notif_pontos,
    notif_resgates  = excluded.notif_resgates,
    notif_promocoes = excluded.notif_promocoes,
    updated_at      = now();
end;
$$;

grant execute on function salvar_notif_prefs(jsonb) to authenticated;