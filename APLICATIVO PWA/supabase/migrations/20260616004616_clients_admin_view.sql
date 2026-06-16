-- Clientes para o admin: + pintor mais recente (derivado de orders, pois clients
-- não tem coluna de pintor). Cliente pode ter vários pintores ao longo do tempo;
-- mostra o do pedido mais recente. security_invoker=on.
create view clients_admin with (security_invoker = on) as
select c.id, c.nome, c.type, c.telefone, c.documento,
       c.cep, c.rua, c.numero, c.complemento, c.bairro, c.cidade,
       (select pa.nome from orders o
        join painters pa on pa.id = o.painter_id
        where o.client_id = c.id
        order by o.created_at desc limit 1) as painter_nome
from clients c;

grant select on clients_admin to authenticated;