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

- Estou **aprendendo a programar**. O objetivo é entender o raciocínio de cada passo, não só
  receber solução pronta.
- **Eu mesmo faço as mudanças no código**, localmente, e depois commito/faço push. Não me mande
  patches prontos pra aplicar. Em vez disso: explique **o quê** fazer, **onde** e **por quê**;
  depois espere eu executar e reportar antes de seguir.
- Trabalhe **passo a passo**, uma etapa de cada vez. Razão e contexto antes da ação.
- Antes de instruir sobre um arquivo, **confira o código/config real** (clonando o repo) em vez de
  assumir — já fomos mordidos por suposições.
- **Verifique o resultado no remoto** (clone fresco) quando eu disser que fiz push.
- Prefira **commits separados** por mudança lógica, com histórico legível.

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
2. **Auth** — e-mail/senha, sessão, proteção de rotas, perfis pintor/admin. _(próximo)_
3. **Camada de dados** real substituindo os mocks, mantendo a UI intacta.
4. **Integração com sistema de gestão** da loja (catálogo) — adiada; por ora o catálogo
   (`products`) é cadastrado manualmente pelo admin.

**Fase 2 — Offline funcional:** navegar/montar orçamento sem sinal e sincronizar depois
(depende da camada de dados).

---

## Endurecimento pendente (resolver na etapa de Auth)

- **RLS** em todas as tabelas (hoje `UNRESTRICTED`): pintor só vê o que é dele, admin vê tudo,
  `settings`/`cost` só admin.
- **Trigger de imutabilidade** em `point_transactions` (hoje a imutabilidade é só disciplina).
- **`rules.ts` ler a taxa do `settings`** em vez de constante no código.

---

## Em aberto / observações

- Login ainda **cosmético** (`router.push` sem validar; sem sessão nem proteção de rota) — alvo da Fase 1.2.
- Mocks **não persistem** entre reloads (sem backend ligado à UI ainda).
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
