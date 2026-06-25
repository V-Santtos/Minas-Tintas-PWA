-- Catálogo exposto ao pintor: SEM cost (sensível). security_invoker OFF (default) →
-- roda como dono e ignora a RLS só-admin de products; lista os ativos.
create view products_public as
select id, code, name, brand, price, stock, active
from products
where active;

grant select on products_public to authenticated;