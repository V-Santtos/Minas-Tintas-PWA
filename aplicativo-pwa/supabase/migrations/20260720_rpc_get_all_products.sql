-- RPC para retornar todos os produtos ativos (sem limite de 1000)
create or replace function get_all_products()
returns table (id uuid, code text, name text, brand text, price numeric, stock integer)
language sql
stable
security definer
set search_path = public
as $$
  select id, code, name, brand, price, stock
  from products
  where active = true
  order by name;
$$;

grant execute on function get_all_products() to authenticated;
