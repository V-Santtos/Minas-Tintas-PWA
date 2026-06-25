-- Criar pedido pelo admin: nasce APROVADO (confirma pagamento + credita bônus na hora).
-- Estrutura do enviar_orcamento (preço autoritativo de products), mas o pintor vem por
-- parâmetro (admin escolhe), gated por is_admin. Cliente é id existente (cliente novo é
-- criado antes pelo CadastrarClienteModal). Bônus = round(valor_bruto × settings.bonus_percent).
create or replace function criar_pedido_admin(
  p_painter_id uuid,
  p_client_id  uuid,
  p_items      jsonb,
  p_titulo     text default null,
  p_desconto   numeric default 0,
  p_pagamento  text default null,
  p_observacao text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_admin uuid; v_order uuid; v_numero integer; v_bruto numeric := 0;
  v_item jsonb; v_pid uuid; v_qty integer; v_name text; v_price numeric;
  v_percent numeric; v_bonus integer;
begin
  if not is_admin() then raise exception 'Apenas admin' using errcode='P0050'; end if;
  v_admin := auth.uid();

  if p_painter_id is null or not exists (select 1 from painters where id = p_painter_id and active) then
    raise exception 'Pintor inválido' using errcode='P0051';
  end if;
  if p_client_id is null or not exists (select 1 from clients where id = p_client_id) then
    raise exception 'Cliente inválido' using errcode='P0052';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Pedido sem itens' using errcode='P0053';
  end if;

  insert into orders (client_id, painter_id, status, valor_bruto, desconto,
                      pagamento, observacao, titulo, confirmed_at, confirmed_by, valor_confirmado)
  values (p_client_id, p_painter_id, 'aprovado', 0, coalesce(p_desconto,0),
          nullif(btrim(coalesce(p_pagamento,'')),''),
          nullif(btrim(coalesce(p_observacao,'')),''),
          nullif(btrim(coalesce(p_titulo,'')),''),
          now(), v_admin, 0)
  returning id, numero into v_order, v_numero;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::integer;
    if v_qty is null or v_qty <= 0 then raise exception 'Quantidade inválida' using errcode='P0054'; end if;
    select name, price into v_name, v_price from products where id = v_pid and active;
    if not found then raise exception 'Produto indisponível' using errcode='P0055'; end if;
    insert into order_items (order_id, product_id, name, unit_price, qty)
    values (v_order, v_pid, v_name, v_price, v_qty);
    v_bruto := v_bruto + v_price * v_qty;
  end loop;

  select bonus_percent into v_percent from settings where id = 1;
  v_bonus := round(v_bruto * v_percent)::integer;

  update orders set valor_bruto = v_bruto, valor_confirmado = v_bruto where id = v_order;

  if v_bonus > 0 then
    insert into point_transactions (painter_id, valor, tipo, order_id, created_by)
    values (p_painter_id, v_bonus, 'bonus', v_order, v_admin);
  end if;

  return jsonb_build_object('id', v_order, 'numero', v_numero);
end; $$;

revoke all on function criar_pedido_admin(uuid, uuid, jsonb, text, numeric, text, text) from public;
grant execute on function criar_pedido_admin(uuid, uuid, jsonb, text, numeric, text, text) to authenticated;