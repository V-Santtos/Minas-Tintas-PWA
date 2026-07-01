# Sessão atual

**Atualizado:** 2026-07-01

---

## Estado consolidado

Repositório: `https://github.com/V-Santtos/Minas-Tintas-PWA`
Apps Admin e Pintor validados e publicados. Duas features fecharam nesta sessão:

- **Brinde de boas-vindas** (banco + concessão + front real) — **CONCLUÍDO**.
- **Notificações do pintor: feed real + não-lido (T6a/T6b)** — **CONCLUÍDO**.

O que falta do sistema de notificações (T6c push, T6d avisos da loja) está registrado
abaixo como bloco futuro.

---

## Brinde de boas-vindas — ✅

- Cada pintor novo ganha **um** brinde (boné **ou** pincel), sorteado **no banco** na
  criação do pintor (RPC `conceder_brinde_boas_vindas`, service_role, idempotente, trava
  de estoque no boné: 10 fixos, esgotou todos pegam pincel). Nasce como **resgate grátis**
  pendente (`pontos_congelados = 0`, sem ledger).
- Modelagem **A**: itens-brinde são `loja_items` com `is_brinde = true` (IDs fixos
  `…c1` boné / `…c2` pincel), fora da grade da lojinha do pintor **e** do admin (ambas as
  queries filtram `is_brinde = false`). O card de **resgates** do brinde continua no admin.
- `stock` virou nulável (`null` = ilimitado, caso do pincel). `resgates.pontos_congelados`
  aceita `>= 0`. Cancelamentos (pintor/admin) não lançam `devolucao` quando é grátis.
- "Já viu o modal" = `painter_settings.brinde_visto_em` (RPC `marcar_brinde_visto`).
- Front do pintor lê o objeto `brinde` do contexto (derivado no layout): `BrindeModal`
  (mostra se `brinde && !visto`, fecha chamando a RPC), `BottomNav` (bolinha = pendente e
  não visto), `notificacoes` (card enquanto pendente). Preview `?brinde=bone|pincel` na home.

## Notificações — feed real + não-lido (T6a/T6b) — ✅

- **Feed derivado** dos fatos que o `layout` já busca (sem tabela de notificações):
  pedidos aprovados (pts reais do ledger) e recusados, resgates pendentes, promoções
  (`mult_delta < 0`) e o brinde. Cada tipo respeita `notifPrefs` (enfim com consumidor).
- Tela `/notificacoes` renderiza o feed agrupado por **Hoje/Ontem/Anteriores** com tempo
  relativo e estado vazio. Mock (HOJE/ONTEM hardcoded) removido.
- **Não-lido:** `painter_settings.notif_visto_em` + RPC `marcar_notif_visto` (padrão do
  brinde). Não-lido = evento com `created_at` > último visto. Bolinha do sininho na home
  (antes fixa) passou a depender de `data.notifNaoLidas`; abrir a tela carimba o visto.
- Casa com o Realtime: app aberto → evento novo → `router.refresh()` → bolinha acende só.
- **Escopo:** funciona **com o app aberto**. App fechado = vê na próxima abertura (T6c cobre).

**Decisões travadas (notificações):** feed é projeção derivada, não tabela; não-lido é um
**marco temporal único** por pintor (não "lido por item" — o feed não tem id persistente).

---

## Próximo bloco — restante das notificações (T6c/T6d)

Adiados conscientes; **não** bloqueiam o resto do projeto.

- **T6c — Push real (INFRA):** notificação no celular com o app **fechado** — service worker
  - Web Push + permissão do navegador + tabela de `subscriptions`. Bloco pesado e
    independente do feed. É o que falta pra "receber com o app fechado".
- **T6d — Avisos livres da loja (BANCO):** comunicados escritos à mão pelo admin
  ("Fechado dia 25") que **não** derivam de evento do domínio → exigem **tabela própria**
  de notificações + tela no admin pra escrever. (O único caso que quebra o "derivar do fato".)

---

## Pendências gerais registradas (ver CLAUDE.md p/ detalhe)

- **Auditar o `seed.sql` ponta a ponta antes do go-live** — aplicar todas as migrations num
  PG16 limpo + rodar o seed inteiro, pra pegar colunas defasadas que só aparecem num reset.
  Baixa urgência; fazer antes do passo de seed do go-live.
- Admin não distingue visualmente os brindes na lista da lojinha (agora escondidos de vez;
  ponto resolvido). Restante: badge/UX é melhoria futura se algum dia forem reexpostos.
- SMTP p/ recuperação de senha (fim do projeto); troca de telefone do pintor (troca de
  credencial dupla); real-time de estoque via webhook Hiper (pós-produção, informativo).
- Infra multi-cliente (Vercel Pro + Supabase cloud vs. multi-tenant vs. hybrid/VPS) —
  interesse no hybrid/VPS; constraint = zero perda de dados (snapshots + pg_dump + WAL).
