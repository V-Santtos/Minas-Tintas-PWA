-- Função companheira: painters.id do usuário logado (espelha is_admin).
create or replace function current_painter_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select id from painters where auth_user_id = auth.uid();
$$;

-- ORDERS: pintor vê os seus, admin vê todos.
alter table orders enable row level security;
create policy "pintor lê seus pedidos" on orders for select
  using (painter_id = current_painter_id());
create policy "admin lê todos os pedidos" on orders for select
  using (is_admin());

-- ORDER_ITEMS: segue o pedido pai (vê o item se vê o pedido).
alter table order_items enable row level security;
create policy "lê itens de pedidos visíveis" on order_items for select
  using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
        and (o.painter_id = current_painter_id() or is_admin())
    )
  );

-- POINT_TRANSACTIONS: pintor vê o próprio extrato, admin vê tudo.
alter table point_transactions enable row level security;
create policy "pintor lê seu extrato" on point_transactions for select
  using (painter_id = current_painter_id());
create policy "admin lê todo o ledger" on point_transactions for select
  using (is_admin());

-- RESGATES: pintor vê os seus, admin vê todos.
alter table resgates enable row level security;
create policy "pintor lê seus resgates" on resgates for select
  using (painter_id = current_painter_id());
create policy "admin lê todos os resgates" on resgates for select
  using (is_admin());

-- LOJA_ITEMS: catálogo — qualquer autenticado lê.
alter table loja_items enable row level security;
create policy "autenticado lê lojinha" on loja_items for select
  using (auth.uid() is not null);

-- SETTINGS: qualquer autenticado lê (app precisa do percentual/multiplicador).
alter table settings enable row level security;
create policy "autenticado lê settings" on settings for select
  using (auth.uid() is not null);

-- PRODUCTS: só admin lê (contém cost sensível; pintor ainda não consome catálogo).
alter table products enable row level security;
create policy "admin lê products" on products for select
  using (is_admin());