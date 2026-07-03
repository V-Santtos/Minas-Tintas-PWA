-- Brinde de boas-vindas: a concessao vira sorteio de verdade.
-- A versao anterior era fila (bone deterministico ate esgotar os 10, depois
-- pincel) -- o sorteio validado localmente era o stub de Math.random no
-- navegador (5fb2d1f), removido na migracao pros dados reais sem equivalente
-- no banco. A intencao documentada sempre foi sortear enquanto ha bone.
-- So o if muda: moeda 50/50 por cadastro enquanto ha bone em estoque;
-- esgotou, todos recebem pincel. Idempotencia, FOR UPDATE e grants intactos
-- (create or replace preserva os grants existentes). Nao retroativo.
create or replace function conceder_brinde_boas_vindas(p_painter_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bone_id   uuid := '00000000-0000-0000-0000-0000000000c1';
  v_pincel_id uuid := '00000000-0000-0000-0000-0000000000c2';
  v_bone_stock integer;
  v_item_id   uuid;
  v_resgate   uuid;
begin
  select id into v_resgate
  from resgates
  where painter_id = p_painter_id
    and loja_item_id in (v_bone_id, v_pincel_id)
  limit 1;
  if found then
    return v_resgate;
  end if;

  select stock into v_bone_stock
  from loja_items where id = v_bone_id
  for update;

  if v_bone_stock is not null and v_bone_stock > 0 and random() < 0.5 then
    v_item_id := v_bone_id;
    update loja_items set stock = stock - 1 where id = v_bone_id;
  else
    v_item_id := v_pincel_id;
  end if;

  insert into resgates (painter_id, loja_item_id, pontos_congelados, iniciado_por)
  values (p_painter_id, v_item_id, 0, 'admin')
  returning id into v_resgate;

  return v_resgate;
end;
$$;
