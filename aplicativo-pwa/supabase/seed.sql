-- ============================================================
-- Minas Tintas — SEED de desenvolvimento (item 3a, leituras)
-- ------------------------------------------------------------
-- NÃO é migration. NÃO sobe no `supabase db push`.
-- Aplicar manualmente (SQL editor ou `psql`) com service_role,
-- que é isento de RLS — não precisa de policy de escrita pra semear.
--
-- Premissas (já existem no banco, NÃO são criadas aqui):
--   • 1 admin (login real)
--   • 3 painters com login:
--       Pintor Teste      94f21de4-f8dd-4c91-9014-92f5946f483e  (33999990000)
--       Pintor Sintetico  85b0f493-d414-43fd-ad7c-e6c9452695e7  (33988881111)
--       Pintor ComEmail   cae0462c-e0af-4ca8-a962-2c76b52a1883  (33977772222)
--
-- ComEmail fica SEM dados de propósito: caso de derivação ZERO
-- (a lista do admin deve mostrar 0/0/0, não quebrar).
--
-- Alvos de conferência (bater à mão depois de aplicar):
--   Pintor Teste:      pedidos=5  aprovados=2  volume=4519.80  saldo=695
--   Pintor Sintetico:  pedidos=2  aprovados=1  volume=509.40  saldo=5
--   Pintor ComEmail:   pedidos=0  aprovados=0  volume=0     saldo=0
--
-- Para remover tudo: ver bloco "ROLLBACK DO SEED" no final (comentado).
-- ============================================================

begin;

-- ── Clientes ───────────────────────────────────────────────
-- documento é NOT NULL UNIQUE (CPF/CNPJ). Endereço opcional.
insert into clients (id, nome, type, telefone, documento, cidade) values
  ('00000000-0000-0000-0000-0000000000c1', 'Roberto Alves',          'pessoa',  '33999991111', '111.222.333-44',   'Simonésia'),
  ('00000000-0000-0000-0000-0000000000c2', 'Construtora Vale Verde', 'empresa', '33333334444', '12.345.678/0001-90','Manhuaçu'),
  ('00000000-0000-0000-0000-0000000000c3', 'Fernanda Costa',         'pessoa',  '33999992222', '222.333.444-55',   'Simonésia'),
  ('00000000-0000-0000-0000-0000000000c4', 'Diego Santos',           'pessoa',  '33999993333', '333.444.555-66',   'Manhuaçu');

-- ── Produtos (catálogo de venda) ───────────────────────────
-- Poucos itens de teste; os reais virão da integração com o ERP (Hiper).
-- order_items são snapshot, então sobrevivem a remoções.
insert into products (id, code, name, brand, price, stock) values
  ('00000000-0000-0000-0000-0000000000d1', 'SUV-18-BN', 'Tinta látex acrílica fosca 18L — Branco Neve', 'Suvinil', 320.00, 47),
  ('00000000-0000-0000-0000-0000000000d2', 'SUV-MC-25', 'Massa corrida 25kg',                            'Suvinil',  84.90, 84),
  ('00000000-0000-0000-0000-0000000000d3', 'COR-SE-18', 'Selador acrílico 18L',                          'Coral',   162.00, 12),
  ('00000000-0000-0000-0000-0000000000d4', 'TIG-RO-23', 'Rolo de lã 23 cm — anti-gota',                  'Tigre',    28.50, 6);

-- ── Itens da lojinha de pontos ─────────────────────────────
-- custo em pontos = round(valor_base × (multiplicador_padrao=3 + coalesce(mult_delta,0)))
-- mult_delta: null = herda o padrão; <0 = promo (com selo); >0 = mais caro (sem selo).
--   L1 herda (null → 3×)      → 600
--   L2 promo (delta -1 → 2×)  → 600  (mesmo custo de L1, mas com selo de promoção)
--   L3 herda (null → 3×)      → 1200
--   L4 herda (null → 3×)      → 750
--   L5 acima (delta +1 → 4×)  → 4000 (mais caro, SEM selo)
insert into loja_items (id, name, valor_base, mult_delta, stock, categoria) values
  ('00000000-0000-0000-0000-0000000000b1', 'Boné Minas Tintas',              200.00, null,   9, 'brindes'),
  ('00000000-0000-0000-0000-0000000000b2', 'Rolo profissional anti-gota 23cm',300.00, -1.00,  5, 'ferramentas'),
  ('00000000-0000-0000-0000-0000000000b3', 'Kit pincéis Atlas (3 peças)',     400.00, null,   2, 'ferramentas'),
  ('00000000-0000-0000-0000-0000000000b4', 'Camiseta Minas Tintas',           250.00, null,   7, 'camisetas'),
  ('00000000-0000-0000-0000-0000000000b5', 'Lixadeira orbital 5"',           1000.00,  1.00,  1, 'ferramentas');

-- ── Pedidos ────────────────────────────────────────────────
-- numero é generated always as identity (não passamos).
-- aprovado/estornado têm confirmação preenchida; pendente/rascunho não.
-- valor_bruto é a BASE do bônus (congelada).
insert into orders (id, client_id, painter_id, status, valor_bruto, desconto, pagamento,
                    confirmed_at, confirmed_by, valor_confirmado, created_at) values
  -- Pintor Teste
  ('00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-0000000000c1', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     'aprovado',  2938.80, 0,   'Pix da loja', now() - interval '66 days', (select auth_user_id from admins limit 1), 2938.80, now() - interval '70 days'),
  ('00000000-0000-0000-0000-00000000aa02', '00000000-0000-0000-0000-0000000000c2', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     'aprovado',  1581.00, 100, 'Maquininha',  now() - interval '64 days', (select auth_user_id from admins limit 1), 1481.00, now() - interval '68 days'),
  ('00000000-0000-0000-0000-00000000aa03', '00000000-0000-0000-0000-0000000000c3', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     'pendente',  1508.00, 0,   'Vai pagar na loja', null, null, null, now() - interval '12 days'),
  ('00000000-0000-0000-0000-00000000aa04', '00000000-0000-0000-0000-0000000000c1', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     'estornado', 1600.00, 0,   'Maquininha',  now() - interval '42 days', (select auth_user_id from admins limit 1), 1600.00, now() - interval '45 days'),
  ('00000000-0000-0000-0000-00000000aa05', '00000000-0000-0000-0000-0000000000c4', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     'rascunho',   509.40, 0,   null, null, null, null, now() - interval '6 days'),
  -- Pintor Sintetico
  ('00000000-0000-0000-0000-00000000aa06', '00000000-0000-0000-0000-0000000000c2', '85b0f493-d414-43fd-ad7c-e6c9452695e7',
     'aprovado',   509.40, 0,   'Dinheiro',    now() - interval '28 days', (select auth_user_id from admins limit 1), 509.40, now() - interval '30 days'),
  ('00000000-0000-0000-0000-00000000aa07', '00000000-0000-0000-0000-0000000000c3', '85b0f493-d414-43fd-ad7c-e6c9452695e7',
     'pendente',  1149.60, 0,   'Pix da loja', null, null, null, now() - interval '2 days');

-- ── Itens dos pedidos (snapshot) ───────────────────────────
-- name/unit_price congelados; product_id é referência fraca (set null).
insert into order_items (order_id, product_id, name, unit_price, qty) values
  ('00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-0000000000d1', 'Tinta látex acrílica fosca 18L — Branco Neve', 320.00, 6),
  ('00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-0000000000d2', 'Massa corrida 25kg',                            84.90, 12),
  ('00000000-0000-0000-0000-00000000aa02', '00000000-0000-0000-0000-0000000000d3', 'Selador acrílico 18L',                         162.00,  8),
  ('00000000-0000-0000-0000-00000000aa02', '00000000-0000-0000-0000-0000000000d4', 'Rolo de lã 23 cm — anti-gota',                  28.50, 10),
  ('00000000-0000-0000-0000-00000000aa04', '00000000-0000-0000-0000-0000000000d1', 'Tinta látex acrílica fosca 18L — Branco Neve', 320.00,  5),
  ('00000000-0000-0000-0000-00000000aa06', '00000000-0000-0000-0000-0000000000d2', 'Massa corrida 25kg',                            84.90,  6),
  -- #3 pendente
  ('00000000-0000-0000-0000-00000000aa03', '00000000-0000-0000-0000-0000000000d1', 'Tinta látex acrílica fosca 18L — Branco Neve', 320.00,  4),
  ('00000000-0000-0000-0000-00000000aa03', '00000000-0000-0000-0000-0000000000d4', 'Rolo de lã 23 cm — anti-gota',                  28.50,  8),
  -- #5 rascunho
  ('00000000-0000-0000-0000-00000000aa05', '00000000-0000-0000-0000-0000000000d2', 'Massa corrida 25kg',                            84.90,  6),
  -- #7 pendente
  ('00000000-0000-0000-0000-00000000aa07', '00000000-0000-0000-0000-0000000000d3', 'Selador acrílico 18L',                         162.00,  5),
  ('00000000-0000-0000-0000-00000000aa07', '00000000-0000-0000-0000-0000000000d2', 'Massa corrida 25kg',                            84.90,  4);

-- ── Resgate ────────────────────────────────────────────────
-- Pintor Teste resgatou o Boné (600 pts congelados), já entregue.
insert into resgates (id, painter_id, loja_item_id, pontos_congelados, status, iniciado_por,
                       entregue_em, entregue_por, cancelado_em) values
  -- R1 entregue: Boné (600 pts) — estoque já consumido
  ('00000000-0000-0000-0000-00000000ee01', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     '00000000-0000-0000-0000-0000000000b1', 600, 'entregue', 'pintor',
     now() - interval '5 days', (select auth_user_id from admins limit 1), null),
  -- R2 pendente de retirada: Camiseta (750 pts) — estoque segurado, aguarda retirada
  ('00000000-0000-0000-0000-00000000ee02', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     '00000000-0000-0000-0000-0000000000b4', 750, 'pendente_retirada', 'pintor',
     null, null, null),
  -- R3 cancelado: Kit pincéis (1200 pts) — pontos e estoque devolvidos
  ('00000000-0000-0000-0000-00000000ee03', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     '00000000-0000-0000-0000-0000000000b3', 1200, 'cancelado', 'pintor',
     null, null, now() - interval '7 days');

-- ── Ledger de pontos (por último: depende de orders e resgates) ──
-- Coerência: bonus/estorno→order_id; resgate→resgate_id; ajuste→nenhum.
-- ajuste e estorno EXIGEM motivo. created_by null = sistema.
insert into point_transactions (painter_id, valor, tipo, order_id, resgate_id, motivo, created_by) values
  -- Pintor Teste
  ('94f21de4-f8dd-4c91-9014-92f5946f483e',  29, 'bonus',   '00000000-0000-0000-0000-00000000aa01', null, null, null),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e',  16, 'bonus',   '00000000-0000-0000-0000-00000000aa02', null, null, null),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e',  16, 'bonus',   '00000000-0000-0000-0000-00000000aa04', null, null, null),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e', -16, 'estorno', '00000000-0000-0000-0000-00000000aa04', null,
     'Pagamento recusado pelo banco; compra cancelada.', (select auth_user_id from admins limit 1)),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e', 2000, 'ajuste', null, null,
     'Saldo inicial migrado do controle manual.', (select auth_user_id from admins limit 1)),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e',-600, 'resgate', null, '00000000-0000-0000-0000-00000000ee01', null, null),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e',-750, 'resgate', null, '00000000-0000-0000-0000-00000000ee02', null, null),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e',-1200,'resgate', null, '00000000-0000-0000-0000-00000000ee03', null, null),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e', 1200,'devolucao',null,'00000000-0000-0000-0000-00000000ee03', null, (select auth_user_id from admins limit 1)),
  -- Pintor Sintetico
  ('85b0f493-d414-43fd-ad7c-e6c9452695e7',   5, 'bonus',   '00000000-0000-0000-0000-00000000aa06', null, null, null);

commit;

-- ============================================================
-- CLEAN SLATE (descomente e rode como service_role ANTES de entrar dado
-- real). Zera TODOS os dados de teste por tabela inteira — nao por uuid do
-- seed — porque os pintores de teste acumularam dados criados pelo app
-- (uuids aleatorios) alem do seed. Mantem `settings` (config global) e
-- `admins`. A ordem respeita as FKs; a trigger de imutabilidade do ledger
-- e desabilitada so durante o delete. Validado em sandbox PG16.
-- ------------------------------------------------------------
-- begin;
--   alter table point_transactions disable trigger trg_ledger_imutavel;
--   delete from point_transactions;
--   alter table point_transactions enable trigger trg_ledger_imutavel;
--   delete from resgates;
--   delete from order_items;
--   delete from orders;
--   delete from painter_clients;
--   delete from painter_settings;
--   delete from loja_items;
--   delete from products;
--   delete from clients;
--   delete from painters;          -- remove os 4 pintores de teste
-- commit;
--
-- Depois, no painel do Supabase (Auth -> Users), apague os 4 logins de teste
-- (o painel limpa sessions/identities junto; NAO use delete from auth.users cru):
--   teste@pintor.com          Pintor Teste          94f21de4-f8dd-4c91-9014-92f5946f483e
--   33988881111@pintor.local  Pintor Sintetico      85b0f493-d414-43fd-ad7c-e6c9452695e7
--   33977772222@pintor.local  Pintor ComEmail       cae0462c-e0af-4ca8-a962-2c76b52a1883
--   33944445555@pintor.local  Pintor Teste - ADMIN  b5289b82-4b50-431e-8d89-a9d26cb6238b
-- ============================================================
-- ============================================================