-- Enviar orçamento pelo pintor: cria pedido (pendente) + itens numa transação.
-- SECURITY DEFINER; resolve o pintor pelo JWT. Preço SEMPRE de products
-- (autoritativo) — o cliente manda só product_id + qty, nunca o preço, senão
-- inflaria valor_bruto e o próprio bônus. Cliente: id existente (precisa ser
-- cliente do pintor) ou novo via find-or-create por documento.
create or replace function enviar_orcamento(
  p_client_id  uuid,
  p_new_client jsonb,
  p_items      jsonb,
  p_titulo     text default null,
  p_desconto   numeric default 0,
  p_pagamento  text default null,
  p_observacao text default null
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_painter uuid; v_client uuid; v_doc text;
  v_order uuid; v_numero integer; v_bruto numeric := 0;
  v_item jsonb; v_pid uuid; v_qty integer; v_name text; v_price numeric;
begin
  v_painter := current_painter_id();
  if v_painter is null then raise exception 'Pintor não identificado' using errcode='P0020'; end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Orçamento sem itens' using errcode='P0021';
  end if;

  -- resolve cliente
  if p_client_id is not null then
    if not exists (select 1 from orders o where o.client_id = p_client_id and o.painter_id = v_painter) then
      raise exception 'Cliente inválido' using errcode='P0022';
    end if;
    v_client := p_client_id;
  elsif p_new_client is not null then
    v_doc := btrim(coalesce(p_new_client->>'documento',''));
    if v_doc = '' or btrim(coalesce(p_new_client->>'nome','')) = '' then
      raise exception 'Cliente novo incompleto' using errcode='P0023';
    end if;
    select id into v_client from clients where documento = v_doc;   -- find
    if v_client is null then                                        -- or create
      insert into clients (nome, type, documento, telefone, cep, rua, numero, complemento, bairro, cidade)
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
        nullif(btrim(coalesce(p_new_client->>'cidade','')),'')
      ) returning id into v_client;
    end if;
  else
    raise exception 'Cliente não informado' using errcode='P0024';
  end if;

  -- cria o pedido (bruto 0 placeholder; not null) e soma no loop de itens
  insert into orders (client_id, painter_id, status, valor_bruto, desconto, pagamento, observacao, titulo)
  values (v_client, v_painter, 'pendente', 0, coalesce(p_desconto,0),
          nullif(btrim(coalesce(p_pagamento,'')),''),
          nullif(btrim(coalesce(p_observacao,'')),''),
          nullif(btrim(coalesce(p_titulo,'')),''))
  returning id, numero into v_order, v_numero;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_pid := (v_item->>'product_id')::uuid;
    v_qty := (v_item->>'qty')::integer;
    if v_qty is null or v_qty <= 0 then raise exception 'Quantidade inválida' using errcode='P0025'; end if;
    select name, price into v_name, v_price from products where id = v_pid and active;  -- preço autoritativo
    if not found then raise exception 'Produto indisponível' using errcode='P0026'; end if;
    insert into order_items (order_id, product_id, name, unit_price, qty)
    values (v_order, v_pid, v_name, v_price, v_qty);
    v_bruto := v_bruto + v_price * v_qty;
  end loop;

  update orders set valor_bruto = v_bruto where id = v_order;
  return jsonb_build_object('id', v_order, 'numero', v_numero);
end; $$;

revoke all on function enviar_orcamento(uuid, jsonb, jsonb, text, numeric, text, text) from public;
grant execute on function enviar_orcamento(uuid, jsonb, jsonb, text, numeric, text, text) to authenticated;