-- Itens da lojinha p/ o admin: custo em pontos derivado + selo de promoção.
-- custo_pts = round(valor_base × (multiplicador ?? settings.multiplicador_padrao)).
-- cross join settings: traz o multiplicador global (singleton) pra cada linha.
-- security_invoker=on → reusável no app pintor com a RLS do usuário.
create view loja_items_admin with (security_invoker = on) as
select li.id, li.name, li.valor_base, li.multiplicador, li.stock, li.categoria,
       li.imagem, li.descricao, li.active,
       round(li.valor_base * coalesce(li.multiplicador, s.multiplicador_padrao)) as custo_pts,
       (li.multiplicador is not null and li.multiplicador < s.multiplicador_padrao) as promo
from loja_items li cross join settings s;

grant select on loja_items_admin to authenticated;

-- Resgates p/ o admin: nomes resolvidos (pintor, item) + dados do resgate.
-- left join em loja_items porque loja_item_id é nullable (on delete set null).
create view resgates_admin with (security_invoker = on) as
select r.id, r.painter_id, pa.nome as painter_nome,
       r.loja_item_id, li.name as item_nome, li.imagem as item_imagem,
       r.pontos_congelados, r.status, r.iniciado_por,
       r.created_at, r.entregue_em, r.cancelado_em
from resgates r
join painters pa on pa.id = r.painter_id
left join loja_items li on li.id = r.loja_item_id;

grant select on resgates_admin to authenticated;