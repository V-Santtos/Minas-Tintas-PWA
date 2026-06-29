# Minas Tintas PWA — Contexto do Projeto

Sistema de relacionamento com **pintores parceiros** da Minas Tintas (loja de tintas em
Simonésia-MG, representante da Maza Tintas). O usuário final é o **pintor**, não o
consumidor: o pintor monta orçamentos no campo, a loja confirma o pagamento, o sistema
credita bônus em pontos ao pintor responsável, e os pontos são trocados por produtos numa
lojinha de pontos.

São **dois apps** num monorepo:

- **Pintor** (`aplicativo-pwa/minas-tintas-pintor/`) — mobile-first, **é PWA** (instalável, offline shell).
- **Admin** (`aplicativo-pwa/minas-tintas-app/`) — desktop-first, **NÃO é PWA** (decisão deliberada:
  roda na máquina fixa da loja, sempre online; cache de service worker seria desvantagem).

---

## Contexto obrigatório — leia sempre no início de cada sessão

Antes de responder ou executar qualquer tarefa, leia:

| Arquivo                                                       | O que contém                                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Minas Tintas/03 - Briefing/briefing.md`                      | **Fonte de verdade funcional** — bônus, lojinha, fluxos, cadastros, admin, offline |
| `aplicativo-pwa/inventario-schema-supabase.md`                | **Mapa do schema** — tabelas, enums, decisões e o diagrama ER                      |
| `Minas Tintas/01 - Identidade Visual/paleta/design-tokens.md` | Tokens do sistema visual (Warm Editorial)                                          |
| `Minas Tintas/05 - App/CONTEXTO.md`                           | Status da fase de telas (o que foi validado)                                       |

**Regra:** nunca diga que uma informação não existe sem antes ter lido esses arquivos.

---

## Como trabalhar comigo (Agostinho)

- Tenho **noção de programação**; o que me falta costuma ser **conhecimento técnico específico**,
  não a lógica. Seja **conciso** e foque no técnico que falta — corte a explicação de conceitos que
  eu já domino. **Mantenha o porquê** de decisões técnicas reais (ex.: "set null vs cascade aqui
  porque X"), que é o que me impede de copiar sem entender o trade-off. Quando eu quiser aprofundar,
  eu peço.
- **Eu mesmo faço as mudanças no código**, localmente, e commito/faço push. Explique **o quê**,
  **onde** e **por quê**, e espere eu executar e reportar antes de seguir. (Documentação e arquivos
  de referência você pode gerar prontos pra eu revisar e colocar.)
- **Passo a passo**, uma etapa por vez. Razão e contexto antes da ação.
- Antes de instruir sobre um arquivo, **confira o código/config real** (clonando o repo) em vez de
  assumir — já fomos mordidos por suposições.
- **Verifique no remoto** (clone fresco) quando eu disser que fiz push — pega descompasso entre o
  que apliquei e o que subiu.
- **Commits: gere você a mensagem pronta** ao fim de cada **bloco lógico** (não a cada passo),
  em _conventional commits_ (`tipo(escopo): resumo`) — uma linha pras simples, com **corpo**
  quando houver várias peças. **Um único título por commit**: se o bloco junta várias mudanças,
  descreva-as no corpo — não concatene vários títulos na linha do assunto. Separe DB de código
  quando fizer sentido.
- **Pendências e decisões adiadas:** mantenha registradas nos docs, pra nada virar buraco esquecido.

---

## Stack e decisões travadas (não reabrir sem motivo)

| Decisão           | Valor                                                                                                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | Next.js 16 (App Router)                                                                                                                                                      |
| React             | 19                                                                                                                                                                           |
| Linguagem         | TypeScript                                                                                                                                                                   |
| CSS               | Tailwind v4, tokens Warm Editorial em `@theme {}` no `globals.css`                                                                                                           |
| Fontes            | `next/font` — Inter (corpo), Plus Jakarta Sans (display), Playfair Display (editorial)                                                                                       |
| Ícones / gráficos | lucide-react, recharts                                                                                                                                                       |
| PWA               | **Só no Pintor**, via Serwist (`@serwist/next` + `serwist`, v9.5.x). Builda com **webpack** (Serwist não suporta Turbopack). `public/sw.js` gerado no build, no `.gitignore` |
| Banco             | **Supabase** (Postgres), free tier, hospedado                                                                                                                                |
| Login             | E-mail + senha simples (sem OAuth)                                                                                                                                           |
| Hosting           | Vercel                                                                                                                                                                       |

**Regra de bônus:** 1% do valor **bruto** do orçamento aprovado, configurável pelo admin.
Lógica centralizada em `src/lib/rules.ts` (`BONUS_PERCENT`, `bonusPoints`), **duplicado de
propósito** nos dois apps (decisão travada — não extrair pra lib compartilhada). Sem percentual
hardcoded em nenhum outro lugar.

**Atenção:** nomes de arquivo em `public/assets/` não podem ter espaços/vírgulas/acentos
(quebram o precache do service worker).

---

## Estrutura do repositório

| Pasta/Arquivo                                  | O que é                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| `aplicativo-pwa/minas-tintas-app/`             | App Admin (Next.js, desktop)                                                         |
| `aplicativo-pwa/minas-tintas-pintor/`          | App Pintor (Next.js, mobile, PWA)                                                    |
| `aplicativo-pwa/supabase/`                     | Projeto Supabase: `config.toml` + `migrations/` (versionado)                         |
| `aplicativo-pwa/inventario-schema-supabase.md` | Mapa legível do schema                                                               |
| `Minas Tintas/`                                | Especificação (briefing, identidade visual, protótipos validados) — **não é código** |

Referências de design **(não alterar)**: protótipos em `Minas Tintas/05 - App/ui_kits/{admin,pintor}/*.html`
e tokens em `Minas Tintas/05 - App/colors_and_type.css`.

---

## Fases do projeto

**Histórico (concluído):** briefing funcional → protótipos HTML validados pelo cliente →
construção das telas dos dois apps em Next.js (dados mock).

**Fase 0 — Fundação técnica (concluída):** bônus corrigido para 1% e centralizado em `rules.ts`;
casca-PWA do Pintor (instalável + offline shell + fallback `~offline`); decisão de não fazer PWA no
admin; assets renomeados sem espaços; `sw.js` no `.gitignore`.

**Fase 1 — Backend (em andamento):**

1. **Schema** ✅ — definido e versionado em `aplicativo-pwa/supabase/migrations/` (9 tabelas, 5 enums).
   Documentado em `inventario-schema-supabase.md`.
2. **Auth** ✅ — `@supabase/ssr` nos dois apps (clients browser/server, middleware de sessão).
   Admin loga por **e-mail**; pintor loga por **telefone** (credencial única; e-mail sintético
   `{telefone}@pintor.local` por baixo; e-mail real é só contato). Proteção de rota por Server
   Component com `getUser()` + papel via lookup (`admins`/`painters`). Criação de pintor e reset
   de senha pelo admin via `POST`/`PATCH /api/pintores` (admin client `service_role`, server-only).
   RLS ligado em todas as tabelas; ledger imutável por trigger. `rules.ts` aceita a taxa por parâmetro.
3. **Camada de dados** ✅ — leitura **e** escrita reais substituindo os mocks, UI intacta (detalhe abaixo).
4. **Integração com sistema de gestão** da loja (catálogo via **Hiper**) — **em andamento**.
   `products` é alimentado pela sync incremental do Hiper (upsert por `source_id`); a 1ª carga
   real já rodou (1658 produtos, cursor 30786). Detalhe em "Integração do catálogo (Hiper)".

**Fase 2 — Offline funcional:** navegar/montar orçamento sem sinal e sincronizar depois
(depende da camada de dados).

---

## Camada de dados (item 3)

### Leitura — CONCLUÍDA (admin + pintor)

Todas as telas de leitura migraram de mock para Supabase real.

**Admin** (padrão **server-wrapper + client-view**: `page.tsx` Server Component busca/mapeia →
`*Client.tsx` recebe por prop): Pintores (lista + detalhe), Pedidos (lista + detalhe), Lojinha,
Clientes (`dashboard`), Relatórios (year-aware).

**Pintor** (padrão **layout = ponto único de fetch**): o `(app)/layout.tsx` busca todo o payload
de leitura uma vez e semeia o `PintorProvider`; as telas leem do contexto. Reais: Home (saldo,
pedidos recentes, carrossel de loja, "a liberar"), Pedidos (lista + detalhe), Loja (lista +
detalhe), Perfil (principal, Meus dados, Clientes, Atividade), e o **catálogo** do Orçamento.

### Arquitetura de leitura

- **RLS faz o escopo.** As views derivadas são `security_invoker = on` → o mesmo view serve admin
  e pintor: admin vê tudo, pintor vê só o próprio. Reuso total.
- **Exceção `products_public`**: `security_invoker = off` (roda como dono) pra furar a RLS
  só-admin de `products` e mostrar o catálogo ao pintor — **sem `cost`**.
- **Offline plugável (pintor)**: o fetch fica concentrado no `layout.tsx`. Offline (Fase 2) troca
  esse fetch por cache nesse arquivo só, sem tocar nas telas. Hoje 100% online; offline é
  aditivo/desligável.
- **Views derivadas** (detalhe no `inventario-schema-supabase.md`): `painter_stats`,
  `pedidos_admin`, `loja_items_admin`, `resgates_admin`, `clients_admin`, `products_public`.

### Escrita (3b) — CONCLUÍDA

**Roteamento (travado):** escrita simples de uma tabela escopada ao papel → **policy de RLS**
(`is_admin()` ou self `auth_user_id = auth.uid()`) + server action; escrita atômica / de autoria do
sistema / que fura a RLS de leitura (ledger, status+bônus, resgate+estoque, pedido+itens) → **RPC
`SECURITY DEFINER`** chamada por server action, com identidade pelo JWT (nunca por parâmetro) e
`FOR UPDATE` nas invariantes. Após a escrita, `router.refresh()` reSemeia o payload (sem estado
otimista). Cada RPC/policy está detalhada no `inventario-schema-supabase.md`.

**Pintor:** enviar orçamento (find-or-create de cliente por `documento`), resgatar e cancelar resgate.
**Admin:** decisão de pedido (aprovar/recusar/estornar), criar pedido (já aprovado), CRUD de item da
lojinha + multiplicador padrão, gestão de resgate (entregar/recusar), CRUD de cliente, cadastrar/
editar/resetar/ativar pintor, editar `bonus_percent`, conta do admin (nome + senha; e-mail read-only).
Pintor novo via `POST /api/pintores`; reset de senha via `PATCH`.

**Não entrou na 3b (adiado consciente):** imagens (item da lojinha + foto do admin) via **Supabase
Storage** — bloco próprio.
_Auth/SMTP:_ troca de **e-mail** do admin e **recuperação por e-mail** (e-mail do admin é read-only
hoje); troca de **telefone** do pintor (troca de credencial: `painters.telefone` + o e-mail sintético
do `auth.users` juntos).

### Adiado (sem fase)

- **Gráficos reais da Atividade do pintor** — hoje lista do ledger; evoluir pra série temporal
  agregada de `point_transactions`.
- **Offline (Fase 2)** — cache do payload no `layout.tsx`.

### Dados / seed

- **Login do Pintor Teste**: ficou com `teste@pintor.com` em vez do sintético
  `33999990000@pintor.local` → login por telefone não acha. Corrigir no Auth (ou recriar).
- **`order_items` no seed**: pedido sem itens cai no placeholder `DEFAULT_DETAIL_ITEMS` no detalhe.
- **Limpeza do seed** ao encerrar: bloco "ROLLBACK DO SEED" em `supabase/seed.sql` (apaga
  `point_transactions` por `painter_id`; exige desabilitar a trigger de imutabilidade, já no bloco).
- **Seed de `loja_items` migrado pra `mult_delta`** (corrigido): inseria na coluna antiga
  `multiplicador` (renomeada) com valores **absolutos** → `db reset` limpo quebrava. Agora usa
  `mult_delta` com valores recalculados como **delta = absoluto − 3** (b2 `-1.00`, b5 `1.00`; demais
  herdam `null`). Validado em PG16 (custo_pts 600/600/1200/750/4000; promo só no b2).
- **PENDÊNCIA — auditar o `seed.sql` ponta a ponta antes do go-live:** aplicar todas as migrations num
  PG16 limpo + rodar o seed inteiro, pra pegar outras colunas defasadas que só aparecem num reset (o
  `mult_delta` foi achado por acaso). Baixa urgência (seed só roda em reset/go-live); fazer **antes**
  do passo de seed do go-live.

### Futuro (sem fase)

Troca de telefone do pintor pelo admin; recuperação por e-mail (SMTP).

- **Real-time de estoque (catálogo)** — pós-produção. O `stock` do catálogo é **informativo** (não
  baixa na aprovação; a baixa real é no Hiper), então defasagem aqui é dica visual, não risco de
  venda-dupla. Pra frescura quase-imediata: **webhook do Hiper** (`webhook-config`) →
  `sincronizarCatalogo()` (só **mais um gatilho**, reusa tudo), opcionalmente + **Supabase Realtime
  em `products`** (migration aditiva: incluir na publicação) pra empurrar pras telas abertas. Aditivo,
  não reabre nada.

## Em aberto / observações

- Leitura (item 3) **concluída** — mocks substituídos por Supabase real. A persistência restante
  (escritas) é o **3b**.
- `rules.ts` duplicado idêntico nos dois apps **de propósito** — decisão travada, não vira lib
  compartilhada. A duplicação é intencional, não dívida.
- O `.gitignore` raiz exclui: `.claude/` (config local), `sessao-atual.md` (notas de sessão),
  `**/node_modules/`, `**/.next/`, `**/.env*`.
- **Endereço do pintor** entregue: colunas em `painters` + na view `painter_stats`; admin edita no
  detalhe, pintor vê read-only no `meus-dados`. Resíduo: lista de pintores e relatórios ainda
  mostram `city = '—'` (placeholder, não ligado à coluna); o `*` em "Cidade" no form é decorativo
  (o campo é opcional).
- **Agenda standalone de cliente do pintor** entregue: junção M:N `painter_clients` + RPC
  `vincular_cliente_pintor` (find-or-create por `documento`); a aba Clientes do pintor persiste e o
  cliente aparece também no seletor do orçamento. Edição do cadastro segue só no admin. Resíduos: o
  card da lista virou inerte (futuro: "ver detalhes"); `note` mapeia em `complemento` (convenção
  herdada do orçamento, não `observacoes`).
- **Preferências de notificação do pintor** persistidas: tabela `painter_settings` + RPC
  `salvar_notif_prefs`; os toggles de Configurações agora salvam por pintor. **Sem consumidor
  ainda** — o sistema de notificação (push + feed in-app) não existe e é bloco próprio futuro;
  as prefs ficam prontas pra quando ele for construído.
- **Preview de bônus do pintor** alinhado ao runtime: "A liberar" (home), bônus do carrinho e do
  pedido agora leem `settings.bonus_percent` via `data.bonusPercent`, batendo com o crédito do
  `aprovar_pedido`. `BONUS_PERCENT` fica só como fallback.
- **`documento` gravado mascarado** (CPF/CNPJ com pontuação) — decisão travada, **não** normalizar
  pra dígitos. O `unique` é sobre o texto cru e todos os writers mascaram igual (`fmtCpf`/`maskCpf`);
  qualquer fluxo futuro (import, API) deve mascarar antes de gravar.
- **Atualização em tempo real (auto-update) entregue:** Supabase Realtime no padrão
  `evento → router.refresh()`. A migration publica `orders`, `point_transactions` e `resgates`
  na `supabase_realtime` (com `replica identity full` em `orders`/`resgates`, que recebem UPDATE de
  status); um `RealtimeRefresh` no `layout` de cada app assina `postgres_changes` e dispara
  `router.refresh()` com debounce — o servidor re-busca com RLS/views intactos e o **payload é
  ignorado** (nada sensível trafega pro cliente errado; a RLS de `select` escopa os eventos por
  assinante). Pintor escuta `orders`/`point_transactions`/`resgates`; admin escuta `orders`/`resgates`.
  O listener assina **depois** de `getSession()` + `realtime.setAuth(token)` — senão o canal sobe
  anônimo e a RLS filtra tudo ("não atualiza"). **Decisão travada:** o browser client fica no padrão
  (`autoRefreshToken` ligado); desligar quebra o re-auth do canal quando o token expira. **Resíduo
  conhecido (só dev):** rodar os dois apps no mesmo `localhost`/navegador colide o cookie de sessão
  (mesmo nome `sb-<ref>-auth-token`) e troca as identidades → "Requer Admin"/"Pintor não identificado".
  Testar em perfis/abas-anônimas separadas; ou dar nome de cookie distinto por app via
  `cookieOptions.name` nos 3 arquivos `utils/supabase/*` (não aplicado — inócuo em prod, domínios
  já isolam).
- **Multiplicador individual da lojinha = delta** (corrigido): `loja_items.multiplicador` virou
  `mult_delta` e guarda o **ajuste relativo** ao `multiplicador_padrao`, não o multiplicador absoluto.
  Antes a escrita gravava `padrão + mod`, cozinhando o padrão vigente → itens com mod individual
  ficavam congelados e não reprecificavam quando o multiplicador global mudava. Agora
  `lojinha/actions.ts` grava `input.mod` cru (sem ler `settings`); `lojinha/page.tsx` lê `mult_delta`
  e mapeia `itemMod` direto do delta; view e RPC resolvem o efetivo como `padrão + coalesce(delta, 0)`.
  Pintor sem mudança (lê `custo_pts`/`promo` da view). **Decisão travada:** delta, nunca absoluto.
- **Lição (deploy): rename de coluna é breaking na janela de deploy.** Migrar o DB antes de subir o
  código deixa qualquer consumidor que ainda pede a coluna antiga no escuro — foi o que sumiu os itens
  do admin (view já com `mult_delta`, código deployado ainda pedindo `multiplicador`; pintor não
  quebrou porque nunca pediu a coluna). Em renames futuros: subir o código compatível **antes** do
  `db push`, ou a view expor os dois nomes por um deploy (expand/contract). Relevante pro catálogo
  via API mais à frente.
- **Lojinha: quantidade no resgate + item de resgate único** entregue. `resgates.quantidade` (1 linha
  cobre N unidades; `pontos_congelados` = total) e `loja_items.resgate_unico`. A RPC `resgatar_item`
  passou a `(item, qtd default 1)`: baixa `qtd` de estoque, debita `qtd × custo`, grava 1 resgate;
  item único força qtd 1 e barra se o pintor já tem resgate dele em `pendente_retirada`/`entregue`
  (**cancelado libera** — desfez). Cancelamentos (pintor e admin) devolvem `quantidade` de estoque.
  Admin: checkbox de único no form + "×N" no card de resgate. Pintor: seletor de quantidade na tela
  do item (capado por estoque e saldo, escondido p/ único), badge "ÚNICO"/"RESGATADO" e item
  já-resgatado fica inativo (esmaecido + cadeado). **Decisões travadas:** quantidade como coluna (não
  N linhas); cancelado libera o único.
  já-resgatado fica inativo (esmaecido + cadeado). **Decisões travadas:** quantidade como coluna (não
  N linhas); cancelado libera o único.
- **`products.cost` removido + item de estoque usa preço.** A coluna só existia esperando vir do ERP;
  a API do Hiper expõe **preço de venda, não custo**, e o catálogo passa a ser read-only alimentado
  pela sync (sem CRUD admin que escreva custo) → sem fonte, `cost` ficaria sempre nulo. Removidos os
  consumidores: a **margem** `(1 − cost/price)` no card de busca do orçamento e a **exibição/prefill
  de custo** na busca do catálogo da lojinha. Efeito no add-item da lojinha: item vindo do **estoque**
  deriva o `valor_base` (e os pontos) do **preço do produto**, não mais do custo — no modo estoque o
  campo "Custo" some e o valor sai de "Preço de venda"; a entrada manual mantém "Custo (R$)".
  Migration `…_drop_products_cost.sql`; drop seguro por expand/contract (código sem `cost` deployado
  **antes** do `db push`). Seed de `products` ajustado (sem `cost`). **Decisão travada:** catálogo sem
  `cost` enquanto o Hiper não fornecer; pontos do item de estoque = preço × multiplicador.

### Integração do catálogo (Hiper)

Catálogo de orçamento (`products`) alimentado pela API e-commerce do **Hiper Gestão** (ERP).
**Fork B:** `products` segue como tabela canônica (PK local intacta → FK de `order_items` preservado);
só as 6 colunas do catálogo são mapeadas — campos ricos do Hiper (categoria, ncm, dimensões…) ficam de
fora até haver demanda.

**Feito (blocos a/b/c1/c2):**

- **(a) Schema** — `products.source_id uuid unique` (chave de upsert idempotente = `id` do Hiper) +
  `sync_control(recurso pk, ponto_de_sincronizacao, atualizado_em)` (cursor; RLS trancada, só
  `service_role`). Migration `…_catalogo_source_id_sync_control.sql`.
- **(b) Função core** — `src/lib/hiper/client.ts` (auth + leitura do delta) e `src/lib/hiper/sync.ts`
  (`sincronizarCatalogo()`), ambos `server-only`. Auth em 2 passos: `GET /auth/gerar-token/{chave}` →
  Bearer (~6h, cache por execução, retry em 401). Leitura incremental por cursor `pontoDeSincronizacao`.
  Upsert por `source_id` em lote por página; cursor persistido **a cada página** (timeout no meio
  retoma). **Soft-delete:** `active = ativo && !removido` (nunca delete). Mapeamento: `codigo→code`
  (String), `nome→name` (null → `Produto {codigo}`), `marca→brand` (""→null), `preco→price`,
  `round(quantidadeEmEstoque)→stock`.
- **(c1) Gatilho automático** — rota `GET /api/sync/catalogo` (`route.ts`, `maxDuration 60`, protegida
  por `CRON_SECRET` via `Authorization: Bearer`) + `vercel.json` com cron **diário** (`0 6 * * *` UTC).
  Hobby roda 1×/dia; **em Pro trocar pra `0 * * * *` (horário) + redeploy**. (c1 entrou no mesmo commit
  do fix abaixo, `881849a`, não num commit próprio.)

**Lições (Hiper, confirmadas na prática):**

- **"Nada novo" vem como HTTP 400** (não 200 como o swagger sugeria), com
  `errors: ["Nenhum produto encontrado"]` e `produtos: null`. `getProdutosDelta` detecta pelo **corpo**
  (não pelo status) e trata como fim; outros 4xx/5xx continuam erro.
- **Wipe de `products` exige zerar o cursor:** `delete from sync_control;` junto, senão a próxima sync
  começa do cursor salvo e **não recarrega** o catálogo apagado.

**Envs (server-only, projeto admin — local `.env.local` + Vercel):** `HIPER_CHAVE_SEGURANCA`
(obrigatório), `HIPER_BASE` (opcional, default `https://ms-ecommerce.hiper.com.br/api/v1`),
`CRON_SECRET` (protege a rota; a Vercel envia como Bearer no cron).

**Estado:** 1ª carga real feita — 1658 produtos, `sync_control` em 30786. Incremental ok ("nada novo"
retorna `{ok:true, paginas:0}`).

- **(c2) Gatilho manual** — botão "Sincronizar agora" no admin (`configuracoes/`).
  Server action `sincronizarCatalogoAction` (gate de admin via `getUser` + lookup em
  `admins`; a rota de cron usa `CRON_SECRET` porque não tem sessão) chama
  `sincronizarCatalogo()` e revalida `/lojinha` e `/pedidos` (as duas telas do admin que
  leem `products`). Feedback do `SyncResult` no card. **Watch-point:** a page é `"use client"`,
  então a action herda o `maxDuration` padrão (sem override). Inofensivo no incremental;
  num reload do zero (após wipe) pode estourar, mas o cursor por página torna o re-clique
  retomável — timeout não corrompe. Se virar incômodo: mover pra route handler `POST` com
  `maxDuration` próprio e o botão chamar via `fetch`.

---

## Princípios de trabalho

- **Não avance sem entender.** Cada passo claro antes do próximo.
- **Documente decisões** com o motivo.
- **Pergunte antes de assumir.** Ambiguidade → levante a dúvida.
- **Guarde o fato, derive o rótulo.** Nada que possa ser derivado vira coluna/estado guardado
  (saldo, vínculo de cliente, promoção, custo em pontos). É o fio condutor do schema.
