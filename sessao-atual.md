# Sessão atual

**Atualizado:** 2026-07-01

---

## ⚠️ INSTRUÇÕES DE BANCO — rodar no Supabase (Claude não aplica direto)

Claude versiona a migration no repo; **o dev roda no banco hospedado** (`supabase db push` ou o SQL
pelo dashboard). Pendente desta sessão:

1. **`20260701150000_resgate_cancelado_por.sql`** — adiciona `resgates.cancelado_por` (enum
   `resgate_origin`), atualiza os RPCs `cancelar_resgate`/`cancelar_resgate_admin` (gravam quem
   cancelou) e a view `resgates_admin` (expõe a coluna). **Bloqueia** a notificação "Resgate
   cancelado pela loja": sem ela, a query degrada pra vazio (não quebra o app), mas a notificação
   não aparece. **Aditiva**, não altera dado existente. Rodar **antes** de depender do recurso.

> Regra geral: migrations aditivas (coluna com default, `create or replace`, RPC nova) são seguras
> num banco populado; rename/drop são breaking → expand/contract (subir código compatível antes do
> `db push`). Conferir também se as migrations anteriores (brinde, notif_visto) já foram aplicadas.

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

## Interações de toque (mobile / pintor) — em andamento

Objetivo: todo elemento tocável reconhecer o toque na hora (feedback `:active`),
pra matar a sensação de "não clicou" + o multi-clique durante o round-trip da ação.
Descoberto no botão **Cancelar** do resgate pendente (loja) — não tinha feedback nenhum.

- **Categoria A — ✅** classes que só tinham estado *selecionado*, sem press: `.back-btn`
  (opacity), `.qty-btn`/`.period-btn`/`.nav-item` (scale). Fix único no `globals.css`.
- **Categoria B — ✅** 21 botões estilizados por `style` inline (não herdavam `:active`
  de classe): criada a utilitária `.tap` (`scale(0.96)` + reset de tap-highlight) e
  aplicada em Cancelar, filtros, steppers, segmentos Pessoa/Empresa, Sair, toggles,
  fechar modal, etc. Card de cliente inerte (sem `onClick`) deixado de fora.
- **Categoria C — decisão: adiada, não é fix necessário agora.** São tocáveis
  **não-`<button>`** (`<div onClick>`: pickClient, openNewClientForm; `.pill` de filtro;
  `.dd-option` de menu; opção de pagamento). O *resultado* do toque já dá feedback
  visual (item destaca, menu fecha, form abre) → não sofrem do problema "botão morto".
  Dois resíduos separados, se um dia quisermos: (1) `:active` sutil em `.pill`/`.dd-option`
  por consistência (trivial); (2) **a11y** — os `<div onClick>` não são botões reais
  (sem foco/teclado/`role`); bloco próprio, mais delicado que feedback visual.

**PENDÊNCIA (ADM, fora de foco agora):** auditar o **admin** pelo mesmo padrão
(botões inline sem `:active`). Admin é desktop/hover → menos crítico, mas a mesma
inconsistência inline provavelmente existe. Lapidar quando voltarmos ao admin.

## Overlays acima da bottom-nav (mobile) — em andamento

Overlays (`fixed`) renderizados dentro do `.pintor-scroll` ficam **atrás da bottom-nav**
(no mobile o `-webkit-overflow-scrolling: touch` do scroll prende o `fixed`; a nav é irmã
do scroll com `z-index: 40`). Sintoma: o saldo do sheet de resgate saía cortado pela barra.

- **Sheet de sucesso do resgate (`loja/[id]`) — ✅** via `createPortal` para **`.pintor-app`**
  (a "moldura"), não pro `body`. `.pintor-app` é "a tela do app" nos dois contextos: no
  desktop é o frame (com `transform` que contém os `fixed`); no mobile é a tela cheia. Assim
  o mesmo código serve preview desktop **e** PWA real, sem `if desktop`. **Lição travada:**
  portal de overlay vai pro `.pintor-app`, nunca pro `document.body` (senão vaza da moldura
  no preview desktop). Bônus: **barrinha vira swipe-to-dismiss** (arrastar a folha pra baixo
  fecha; `closeSheet` reusado pelo timer e pelo arrasto).
- **`BrindeModal` — ✅** mesma correção aplicada: `createPortal` pro `.pintor-app`. Sintoma era
  só no **iPhone** (WebKit): ao abrir o pop-up a bottom-nav subia e "reassentava" ao arrastar —
  assinatura do `fixed` preso no `-webkit-overflow-scrolling: touch` do scroll; Android/Blink
  ignora a propriedade e não sofre. Era um fix que já existira (commit `a1088c1`) e fora
  revertido sem querer na sequência de "teste de fix" até o `1a8c039`.
- **Resíduo latente (mapeado, não corrigido):** o **orçamento** tem o mesmo padrão solto —
  `.cart-bar` e o toast de `submitError` são `fixed` dentro do `.pintor-scroll` sem portal. Não
  incomodou ainda; se aparecer o mesmo tranco lá no iPhone, a cura é idêntica (portal pro
  `.pintor-app`). Dropdowns de filtro não alcançam a barra.

## Ajustes pontuais desta sessão (pintor) — ✅

- **Pop-up de brinde reaparecendo no `/home` — ✅** `marcarVisto` carimbava `brinde_visto_em` no
  banco mas **não** fazia `router.refresh()`. Como o `(app)/layout.tsx` é o ponto único de fetch
  e **não re-executa em navegação interna** (layout preservado pelo App Router), `brinde.visto`
  ficava congelado em `false` na sessão → o `BrindeModal` reabria a cada remontagem do `/home`
  (ex.: voltar da Loja), até um reload frio. Add `router.refresh()` após o RPC — mesmo padrão de
  `marcar_notif_visto`. Agora o pop-up aparece **uma vez** no 1º login e não volta mais (fechar
  ou "Ver na lojinha" encerram de vez), independente de o admin já ter liberado o brinde.
- **Spin loader no botão Entrar (login) — ✅** ao enviar, "Entrar" vira um `Loader2` girando
  (centralizado no mesmo botão, `.btn` já é flex-center), botão `disabled` durante o request
  (anti duplo-envio), volta a "Entrar" em erro e segue girando no redirect de sucesso. Add
  `@keyframes spin` no `globals.css` do pintor (o admin já tinha; mesma convenção `animation`
  inline no ícone).

## Notificações in-app do pintor — clareza + tipos faltando — ✅ (código) / ⏳ (1 migration)

Feed derivado (sem tabela; `layout.tsx` monta, `notificacoes/page.tsx` renderiza via `LOOK[kind]`,
`pintor-store.tsx` tem o tipo `NotifItem.kind`). Trabalho desta sessão:

**Clareza (existentes):**
- "Resgate **disponível**" → "Resgate **pendente**" (alinha com "RESGATES PENDENTES" da Loja).
- Novo `kind: "resgate_entregue"` (`PackageCheck` **verde**), distinto do pendente (`Store` âmbar).

**Tipos que faltavam:**
- **"Pedido estornado"** (`RotateCcw` vermelho) — aprovação revertida, pontos removidos. Deriva de
  `point_transactions` tipo `estorno`. **Sem toggle** (evento crítico). **Sem DB.**
- **"Resgate cancelado pela loja"** (`PackageX` vermelho) — só quando o **admin** cancela
  (auto-cancelamento do pintor é silencioso). **Sem toggle. EXIGE migration** (abaixo).

**Decisões travadas:**
- **Orçamento cancelado NÃO notifica:** a loja nunca cancela orçamento (ela recusa/estorna, já
  cobertos); `cancelar_orcamento` é só do próprio pintor → silêncio.
- **Não multiplicar toggles** ([[feedback-notificacoes-sem-toggle]]): eventos críticos são só o
  evento. Toggle "Pontos creditados" (`notif_pontos`) **voltou a ser ghost** (a "Pontos
  devolvidos"/"creditados" foi criada e **removida** — devolução = cancelamento de resgate, já
  coberto por "Resgate cancelado"; ajuste manual não existe). **Pendência:** decidir se remove o
  toggle da tela de Configurações.
- Brinde: **Modelo A** travado (só "reservado", some ao entregar; sem "Brinde entregue").

**Preview:** `/notificacoes?preview` mostra UMA de cada (8 tipos) — ferramenta de design, inócua em
prod (só liga com o param). `buildSampleFeed()` em `notificacoes/page.tsx`.

**⏳ MIGRATION A RODAR (bloqueia o "Resgate cancelado"):**
`20260701150000_resgate_cancelado_por.sql` — `resgates.cancelado_por` (enum `resgate_origin`), os 2
RPCs `cancelar_resgate`/`cancelar_resgate_admin` gravam quem cancelou, view `resgates_admin` expõe.
Aditiva. **Rodar antes** de o código valer (é coluna que o código lê; sem ela a query degrada pra
vazio, não quebra).

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
