-- Notificacao de promo nunca marcava como lida: o card nao tinha data de
-- evento propria e usava Date.now() a cada render -> sempre mais novo que
-- notif_visto_em -> eternamente nao-lido. A correcao e registrar QUANDO o
-- item entrou em promocao.
--
-- Trigger (e nao escrita no admin): promo e derivado de mult_delta, entao o
-- carimbo acompanha qualquer caminho de escrita, presente ou futuro.
alter table loja_items add column promo_desde timestamptz;

comment on column loja_items.promo_desde is
  'Quando o item entrou em promocao (mult_delta < 0). null = fora de promo. Mantido por trigger.';

create or replace function marcar_promo_desde()
returns trigger
language plpgsql
as $$
begin
  if coalesce(new.mult_delta, 0) < 0 then
    -- entrou em promo agora (antes nao estava): carimba. Ja estava: preserva.
   if TG_OP = 'INSERT' or coalesce(old.mult_delta, 0) >= 0 or old.promo_desde is null then
      new.promo_desde := now();
    end if;
  else
    new.promo_desde := null;
  end if;
  return new;
end;
$$;

create trigger trg_promo_desde
  before insert or update of mult_delta on loja_items
  for each row execute function marcar_promo_desde();

-- Backfill: promos ja ativas ganham o carimbo de agora (nao da pra saber a
-- data real retroativa; aproximacao honesta).
update loja_items set promo_desde = now() where coalesce(mult_delta, 0) < 0;

-- View: promo_desde no FIM (create or replace so permite acrescentar no fim;
-- a ordem existente — custo_pts/promo antes de resgate_unico/pos/is_brinde —
-- vem da definicao vigente, da migration do brinde).
create or replace view loja_items_admin with (security_invoker = on) as
select li.id, li.name, li.valor_base, li.mult_delta, li.stock, li.categoria,
       li.imagem, li.descricao, li.active,
       round(li.valor_base * (s.multiplicador_padrao + coalesce(li.mult_delta, 0))) as custo_pts,
       (coalesce(li.mult_delta, 0) < 0) as promo,
       li.resgate_unico,
       li.imagem_pos_x, li.imagem_pos_y,
       li.is_brinde,
       li.promo_desde
from loja_items li cross join settings s;