-- Web Push (T6c): subscriptions de notificação do pintor.
-- 1 linha por dispositivo/navegador (endpoint é a identidade do aparelho);
-- o mesmo pintor pode ter N aparelhos. Aditiva — segura em banco populado.

create table push_subscriptions (
  endpoint    text primary key,
  painter_id  uuid not null references painters(id) on delete cascade,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

-- Envio lê por pintor (service_role no admin).
create index push_subscriptions_painter_idx on push_subscriptions (painter_id);

alter table push_subscriptions enable row level security;

-- Pintor gerencia só as próprias subscriptions (mesmo padrão self do resto do
-- schema: lookup do painter pelo auth.uid()). O envio pelo admin usa
-- service_role (fura RLS) — admin não precisa de policy.
create policy "push_subscriptions self select" on push_subscriptions
  for select using (
    painter_id = (select id from painters where auth_user_id = auth.uid())
  );

create policy "push_subscriptions self insert" on push_subscriptions
  for insert with check (
    painter_id = (select id from painters where auth_user_id = auth.uid())
  );

create policy "push_subscriptions self update" on push_subscriptions
  for update using (
    painter_id = (select id from painters where auth_user_id = auth.uid())
  ) with check (
    painter_id = (select id from painters where auth_user_id = auth.uid())
  );

create policy "push_subscriptions self delete" on push_subscriptions
  for delete using (
    painter_id = (select id from painters where auth_user_id = auth.uid())
  );
