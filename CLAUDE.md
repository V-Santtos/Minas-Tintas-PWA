# Minas Tintas PWA — Contexto do Projeto

Sistema de relacionamento com **pintores parceiros** da Minas Tintas (loja de tintas em
Simonésia-MG, representante da Maza Tintas). O usuário final é o **pintor**, não o
consumidor: o pintor monta orçamentos no campo, a loja confirma o pagamento, o sistema
credita bônus em pontos ao pintor responsável, e os pontos são trocados por produtos numa
lojinha de pontos.

São **dois apps** num monorepo:

- **Pintor** (`APLICATIVO PWA/minas-tintas-pintor/`) — mobile-first, **é PWA** (instalável, offline shell).
- **Admin** (`APLICATIVO PWA/minas-tintas-app/`) — desktop-first, **NÃO é PWA** (decisão deliberada:
  roda na máquina fixa da loja, sempre online; cache de service worker seria desvantagem).

---

## Contexto obrigatório — leia sempre no início de cada sessão

Antes de responder ou executar qualquer tarefa, leia:

| Arquivo                                                       | O que contém                                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Minas Tintas/03 - Briefing/briefing.md`                      | **Fonte de verdade funcional** — bônus, lojinha, fluxos, cadastros, admin, offline |
| `APLICATIVO PWA/inventario-schema-supabase.md`                | **Mapa do schema** — tabelas, enums, decisões e o diagrama ER                      |
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
Lógica centralizada em `src/lib/rules.ts` (`BONUS_PERCENT`, `bonusPoints`), idêntico nos dois apps
(candidato a lib compartilhada). Sem percentual hardcoded em nenhum outro lugar.

**Atenção:** nomes de arquivo em `public/assets/` não podem ter espaços/vírgulas/acentos
(quebram o precache do service worker).

---

## Estrutura do repositório

| Pasta/Arquivo                                  | O que é                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| `APLICATIVO PWA/minas-tintas-app/`             | App Admin (Next.js, desktop)                                                         |
| `APLICATIVO PWA/minas-tintas-pintor/`          | App Pintor (Next.js, mobile, PWA)                                                    |
| `APLICATIVO PWA/supabase/`                     | Projeto Supabase: `config.toml` + `migrations/` (versionado)                         |
| `APLICATIVO PWA/inventario-schema-supabase.md` | Mapa legível do schema                                                               |
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

1. **Schema** ✅ — definido e versionado em `APLICATIVO PWA/supabase/migrations/` (9 tabelas, 5 enums).
   Documentado em `inventario-schema-supabase.md`.
2. **Auth** ✅ — `@supabase/ssr` nos dois apps (clients browser/server, middleware de sessão).
   Admin loga por **e-mail**; pintor loga por **telefone** (credencial única; e-mail sintético
   `{telefone}@pintor.local` por baixo; e-mail real é só contato). Proteção de rota por Server
   Component com `getUser()` + papel via lookup (`admins`/`painters`). Criação de pintor e reset
   de senha pelo admin via `POST`/`PATCH /api/pintores` (admin client `service_role`, server-only).
   RLS ligado em todas as tabelas; ledger imutável por trigger. `rules.ts` aceita a taxa por parâmetro.
3. **Camada de dados** real substituindo os mocks, mantendo a UI intacta. _(próximo)_
4. **Integração com sistema de gestão** da loja (catálogo) — adiada; por ora o catálogo
   (`products`) é cadastrado manualmente pelo admin.

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

### Escrita (3b) — PENDENTE

Princípio de roteamento: atômico / autoria do sistema / que fure a RLS de leitura (ledger,
status+bônus, resgate+estoque) → endpoint/RPC `service_role`; escrita simples de uma tabela
escopada ao dono → policy de RLS.

**Pintor:**

- Enviar orçamento (pedido rascunho→pendente + itens) — inclui a **escolha de cliente** no
  orçamento, ainda mock (`CLIENTS`/`CURRENT_PAINTER`), por ser parte do fluxo.
- Resgatar + cancelar resgate (devolução) — hoje otimista/sessão, não persiste no ledger.
- Cadastrar/editar cliente (aba Clientes) — hoje só estado local.

**Admin:**

- Aprovar/recusar pedido; confirmar pagamento/estorno.
- CRUD de item da loja + ajustar multiplicador global.
- Aprovar/recusar/entregar resgate.
- CRUD de cliente (modal); criar pedido (modal, hoje pré-visualização).
- Cadastrar/resetar pintor (ligar a `/api/pintores`; aqui entram as **colunas de endereço** de
  `painters`, hoje ausentes → `city = '—'` nas telas).
- Editar `settings` (`bonus_percent`, `multiplicador`).
- `configuracoes` dos dois apps são 3b: pintor = toggles de notificação + copy estática; admin =
  conta (nome/email/foto/senha, hoje placeholder — semear com o admin real ao construir a escrita).

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

### Futuro (sem fase)

Troca de telefone do pintor pelo admin; recuperação por e-mail (SMTP); lib compartilhada do
`rules.ts` (o "a liberar" do pintor ainda usa a taxa default do `bonusPts`, não `settings`).

## Em aberto / observações

- Leitura (item 3) **concluída** — mocks substituídos por Supabase real. A persistência restante
  (escritas) é o **3b**.
- `rules.ts` duplicado idêntico nos dois apps (candidato a lib compartilhada).
- O `.gitignore` raiz exclui: `.claude/` (config local), `sessao-atual.md` (notas de sessão),
  `**/node_modules/`, `**/.next/`, `**/.env*`.

---

## Princípios de trabalho

- **Não avance sem entender.** Cada passo claro antes do próximo.
- **Documente decisões** com o motivo.
- **Pergunte antes de assumir.** Ambiguidade → levante a dúvida.
- **Guarde o fato, derive o rótulo.** Nada que possa ser derivado vira coluna/estado guardado
  (saldo, vínculo de cliente, promoção, custo em pontos). É o fio condutor do schema.
