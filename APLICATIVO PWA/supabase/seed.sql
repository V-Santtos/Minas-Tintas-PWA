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
--   Pintor Teste:      pedidos=5  aprovados=2  volume=5000  saldo=350
--   Pintor Sintetico:  pedidos=2  aprovados=1  volume=1000  saldo=10
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
-- cost é sensível (só admin via RLS). Poucos itens; os reais virão
-- da integração futura. order_items são snapshot, então sobrevivem.
insert into products (id, code, name, brand, price, cost, stock) values
  ('00000000-0000-0000-0000-0000000000d1', 'SUV-18-BN', 'Tinta látex acrílica fosca 18L — Branco Neve', 'Suvinil', 320.00, 196.00, 47),
  ('00000000-0000-0000-0000-0000000000d2', 'SUV-MC-25', 'Massa corrida 25kg',                            'Suvinil',  84.90,  58.00, 84),
  ('00000000-0000-0000-0000-0000000000d3', 'COR-SE-18', 'Selador acrílico 18L',                          'Coral',   162.00, 108.00, 12),
  ('00000000-0000-0000-0000-0000000000d4', 'TIG-RO-23', 'Rolo de lã 23 cm — anti-gota',                  'Tigre',    28.50,  16.80,  6);

-- ── Itens da lojinha de pontos ─────────────────────────────
-- custo em pontos = round(valor_base × (multiplicador ?? settings.multiplicador_padrao=3.0))
--   L1 herda (null→3)   → 600
--   L2 promo (2 < 3)    → 600  (mesmo custo de L1, mas com selo de promoção)
--   L3 herda            → 1200
--   L4 herda            → 750
--   L5 acima do padrão  → 4000 (mais caro, SEM selo)
insert into loja_items (id, name, valor_base, multiplicador, stock, categoria) values
  ('00000000-0000-0000-0000-0000000000b1', 'Boné Minas Tintas',              200.00, null, 10, 'brindes'),
  ('00000000-0000-0000-0000-0000000000b2', 'Rolo profissional anti-gota 23cm',300.00, 2.00,  5, 'ferramentas'),
  ('00000000-0000-0000-0000-0000000000b3', 'Kit pincéis Atlas (3 peças)',     400.00, null,  2, 'ferramentas'),
  ('00000000-0000-0000-0000-0000000000b4', 'Camiseta Minas Tintas',           250.00, null,  8, 'camisetas'),
  ('00000000-0000-0000-0000-0000000000b5', 'Lixadeira orbital 5"',           1000.00, 4.00,  1, 'ferramentas');

-- ── Pedidos ────────────────────────────────────────────────
-- numero é generated always as identity (não passamos).
-- aprovado/estornado têm confirmação preenchida; pendente/rascunho não.
-- valor_bruto é a BASE do bônus (congelada).
insert into orders (id, client_id, painter_id, status, valor_bruto, desconto, pagamento,
                    confirmed_at, confirmed_by, valor_confirmado) values
  -- Pintor Teste
  ('00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-0000000000c1', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     'aprovado',  3000.00, 0,   'Pix da loja', now() - interval '20 days', (select auth_user_id from admins limit 1), 3000.00),
  ('00000000-0000-0000-0000-00000000aa02', '00000000-0000-0000-0000-0000000000c2', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     'aprovado',  2000.00, 100, 'Maquininha',  now() - interval '15 days', (select auth_user_id from admins limit 1), 1900.00),
  ('00000000-0000-0000-0000-00000000aa03', '00000000-0000-0000-0000-0000000000c3', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     'pendente',  1500.00, 0,   'Vai pagar na loja', null, null, null),
  ('00000000-0000-0000-0000-00000000aa04', '00000000-0000-0000-0000-0000000000c1', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     'estornado', 2500.00, 0,   'Maquininha',  now() - interval '25 days', (select auth_user_id from admins limit 1), 2500.00),
  ('00000000-0000-0000-0000-00000000aa05', '00000000-0000-0000-0000-0000000000c4', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     'rascunho',   800.00, 0,   null, null, null, null),
  -- Pintor Sintetico
  ('00000000-0000-0000-0000-00000000aa06', '00000000-0000-0000-0000-0000000000c2', '85b0f493-d414-43fd-ad7c-e6c9452695e7',
     'aprovado',  1000.00, 0,   'Dinheiro',    now() - interval '10 days', (select auth_user_id from admins limit 1), 1000.00),
  ('00000000-0000-0000-0000-00000000aa07', '00000000-0000-0000-0000-0000000000c3', '85b0f493-d414-43fd-ad7c-e6c9452695e7',
     'pendente',  1200.00, 0,   'Pix da loja', null, null, null);

-- ── Itens dos pedidos (snapshot) ───────────────────────────
-- name/unit_price congelados; product_id é referência fraca (set null).
insert into order_items (order_id, product_id, name, unit_price, qty) values
  ('00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-0000000000d1', 'Tinta látex acrílica fosca 18L — Branco Neve', 320.00, 6),
  ('00000000-0000-0000-0000-00000000aa01', '00000000-0000-0000-0000-0000000000d2', 'Massa corrida 25kg',                            84.90, 12),
  ('00000000-0000-0000-0000-00000000aa02', '00000000-0000-0000-0000-0000000000d3', 'Selador acrílico 18L',                         162.00,  8),
  ('00000000-0000-0000-0000-00000000aa02', '00000000-0000-0000-0000-0000000000d4', 'Rolo de lã 23 cm — anti-gota',                  28.50, 10),
  ('00000000-0000-0000-0000-00000000aa04', '00000000-0000-0000-0000-0000000000d1', 'Tinta látex acrílica fosca 18L — Branco Neve', 320.00,  5),
  ('00000000-0000-0000-0000-00000000aa06', '00000000-0000-0000-0000-0000000000d2', 'Massa corrida 25kg',                            84.90,  6);

-- ── Resgate ────────────────────────────────────────────────
-- Pintor Teste resgatou o Boné (600 pts congelados), já entregue.
insert into resgates (id, painter_id, loja_item_id, pontos_congelados, status, iniciado_por,
                       entregue_em, entregue_por) values
  ('00000000-0000-0000-0000-00000000ee01', '94f21de4-f8dd-4c91-9014-92f5946f483e',
     '00000000-0000-0000-0000-0000000000b1', 600, 'entregue', 'pintor',
     now() - interval '5 days', (select auth_user_id from admins limit 1));

-- ── Ledger de pontos (por último: depende de orders e resgates) ──
-- Coerência: bonus/estorno→order_id; resgate→resgate_id; ajuste→nenhum.
-- ajuste e estorno EXIGEM motivo. created_by null = sistema.
insert into point_transactions (painter_id, valor, tipo, order_id, resgate_id, motivo, created_by) values
  -- Pintor Teste
  ('94f21de4-f8dd-4c91-9014-92f5946f483e',  30, 'bonus',   '00000000-0000-0000-0000-00000000aa01', null, null, null),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e',  20, 'bonus',   '00000000-0000-0000-0000-00000000aa02', null, null, null),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e',  25, 'bonus',   '00000000-0000-0000-0000-00000000aa04', null, null, null),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e', -25, 'estorno', '00000000-0000-0000-0000-00000000aa04', null,
     'Pagamento recusado pelo banco; compra cancelada.', (select auth_user_id from admins limit 1)),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e', 900, 'ajuste',  null, null,
     'Saldo inicial migrado do controle manual.', (select auth_user_id from admins limit 1)),
  ('94f21de4-f8dd-4c91-9014-92f5946f483e',-600, 'resgate', null, '00000000-0000-0000-0000-00000000ee01', null, null),
  -- Pintor Sintetico
  ('85b0f493-d414-43fd-ad7c-e6c9452695e7',  10, 'bonus',   '00000000-0000-0000-0000-00000000aa06', null, null, null);

commit;

-- ============================================================
-- ROLLBACK DO SEED (descomente e rode pra limpar tudo que foi semeado)
-- A ordem respeita as FKs. point_transactions NÃO aceita DELETE pela
-- trigger de imutabilidade — por isso a limpeza usa um caminho que a
-- trigger permite só se você desabilitar a trigger antes (service_role).
-- ------------------------------------------------------------
-- begin;
--   alter table point_transactions disable trigger trg_ledger_imutavel;
--   delete from point_transactions where painter_id in
--     ('94f21de4-f8dd-4c91-9014-92f5946f483e','85b0f493-d414-43fd-ad7c-e6c9452695e7');
--   alter table point_transactions enable trigger trg_ledger_imutavel;
--   delete from resgates    where id = '00000000-0000-0000-0000-00000000ee01';
--   delete from order_items where order_id like '00000000-0000-0000-0000-00000000aa%';
--   delete from orders      where id like '00000000-0000-0000-0000-00000000aa%';
--   delete from loja_items  where id like '00000000-0000-0000-0000-0000000000b%';
--   delete from products    where id like '00000000-0000-0000-0000-0000000000d%';
--   delete from clients     where id like '00000000-0000-0000-0000-0000000000c%';
-- commit;
-- ============================================================