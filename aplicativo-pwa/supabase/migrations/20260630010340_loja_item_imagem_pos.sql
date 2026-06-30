-- Recorte/reposição da imagem do item da lojinha (object-position do crop).
-- Cosmético: só afeta onde object-fit é cover (cards admin/pintor + carrossel home).
-- null = 50% (centro). Guardado como % inteiro (0-100); o drag arredonda no write.
alter table loja_items
  add column imagem_pos_x smallint,
  add column imagem_pos_y smallint,
  add constraint loja_items_imagem_pos_x_range
    check (imagem_pos_x is null or imagem_pos_x between 0 and 100),
  add constraint loja_items_imagem_pos_y_range
    check (imagem_pos_y is null or imagem_pos_y between 0 and 100);

comment on column loja_items.imagem_pos_x is
  'object-position X em % (0-100) do crop da imagem. null = 50 (centro). So afeta render com object-fit cover.';
comment on column loja_items.imagem_pos_y is
  'object-position Y em % (0-100) do crop da imagem. null = 50 (centro). So afeta render com object-fit cover.';

-- View: append das colunas no fim (mantém ordem/tipos das existentes p/ create or replace).
create or replace view loja_items_admin with (security_invoker = on) as
select li.id, li.name, li.valor_base, li.mult_delta, li.stock, li.categoria,
       li.imagem, li.descricao, li.active,
       round(li.valor_base * (s.multiplicador_padrao + coalesce(li.mult_delta, 0))) as custo_pts,
       (coalesce(li.mult_delta, 0) < 0) as promo,
       li.resgate_unico,
       li.imagem_pos_x, li.imagem_pos_y
from loja_items li cross join settings s;

grant select on loja_items_admin to authenticated;