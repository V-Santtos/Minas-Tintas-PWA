-- Notificacoes: marco de "visto ate quando" por pintor (controla a bolinha do
-- sininho). O feed em si e DERIVADO dos fatos existentes (orders/resgates/promos)
-- - nada de tabela de notificacoes. "Nao lido" = existe evento com created_at mais
-- novo que este timestamp. Mesma tabela/padrao do brinde_visto_em.

alter table painter_settings
  add column notif_visto_em timestamptz;

comment on column painter_settings.notif_visto_em is
  'Timestamp da ultima vez que o pintor abriu as notificacoes. Nao-lido = evento com created_at > este valor. null = nunca abriu (tudo conta como nao lido).';

create or replace function marcar_notif_visto()
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
    raise exception 'Pintor nao identificado' using errcode = 'P0021';
  end if;

  insert into painter_settings (painter_id, notif_visto_em)
  values (v_painter, now())
  on conflict (painter_id) do update
    set notif_visto_em = excluded.notif_visto_em;
end;
$$;

revoke all on function marcar_notif_visto() from public;
grant execute on function marcar_notif_visto() to authenticated;