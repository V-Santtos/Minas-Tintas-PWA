# Sessão atual

**Atualizado:** 2026-06-30

---

## Projeto ativo — Minas Tintas PWA · Brinde de boas-vindas **CONCLUÍDO**

Repositório: `https://github.com/V-Santtos/Minas-Tintas-PWA`
Apps Admin e Pintor já validados e publicados. A feature de **brinde de boas-vindas**
ao app do Pintor está **completa** (banco + concessão + front real).

### A feature (resumo)

- Cada **novo pintor** recebe **UM** brinde, **sorteado** entre dois:
  **Boné Minas Tintas** ou **Pincel Condor 2"** (é um ou outro).
- O sorteio acontece **no banco**, na **criação do pintor** pelo admin — o brinde
  nasce como um **resgate pendente** (grátis) na lojinha. O 1º login só **anuncia**.
- No 1º login, abre um **modal** celebratório. Ao fechar, uma **bolinha vermelha**
  aparece na Lojinha (até ele ver) e uma **notificação** entra no sininho (enquanto
  o brinde estiver pendente de retirada).
- O admin valida a entrega quando o pintor retira na loja (fluxo de resgate normal).

### Decisões travadas

- **Modelagem:** modelo **A** — itens-brinde são `loja_items` com flag `is_brinde`
  (reusa CRUD/imagem/estoque/FK do resgate), **não** tabela `brindes` própria. Migrar
  pra tabela só **se** virar programa gerenciável (vários brindes, pesos, admin trocando).
- **Kit?** Não — dois itens distintos; cada pintor recebe **um**.
- **Quando concede:** na **criação do pintor** (resgate já nasce pendente); 1º login anuncia.
- **Retroativo?** Só **novos** pintores.
- **Estoque:** boné = **10 fixos**; pincel = **ilimitado** (`stock` nulável). Enquanto há
  boné, sorteia; esgotou, todos recebem pincel.
- **Persistência do "já viu":** coluna `painter_settings.brinde_visto_em` (não localStorage).
- **Bolinha da Lojinha:** some ao **ver o modal** (não ao entrar na loja).
- **Card do sininho:** fica enquanto o brinde estiver **pendente de retirada**.

---

## 📋 TAREFAS

Legenda: ✅ feito · ⏳ pendente · 🗄️ precisa de banco

### T1 — Modal de brinde no 1º login · ✅

`BrindeModal.tsx` lê o objeto `brinde` do contexto (mostra se `brinde && !visto`);
sorteio removido do front (vem do banco). Fechar chama a RPC `marcar_brinde_visto`.

### T2 — Bolinha vermelha na Lojinha · ✅

`BottomNav.tsx`: `lojaBadge = brinde.pendente && !brinde.visto`, derivado do contexto
(sem localStorage/eventos).

### T3 — Notificação do brinde no sininho · ✅

`notificacoes/page.tsx`: card de brinde derivado do contexto (fica enquanto pendente).
O resto do feed do sininho ainda é mock (ver T6).

### T4 — Itens-brinde no banco · ✅

Migration `…_brinde_boas_vindas.sql`: boné (`…c1`) e pincel (`…c2`) inseridos com
`is_brinde = true`, imagens em `/assets/`, boné com 10 fixos, pincel ilimitado.

### T5 — Regras reais do brinde · ✅

- `loja_items.is_brinde` (fora da grade do pintor) + `stock` nulável (ilimitado).
- `resgates.pontos_congelados >= 0` (resgate grátis).
- RPC `conceder_brinde_boas_vindas` (service_role, idempotente, sorteio com trava de
  estoque no boné) chamada no `POST /api/pintores`.
- Cancelamentos (pintor/admin) não lançam `devolucao` quando `pontos_congelados = 0`.
- `painter_settings.brinde_visto_em` + RPC `marcar_brinde_visto`.
- Front trocou os stubs de localStorage pelos dados reais (payload do `layout`).

Tudo validado em sandbox PG16 (distribuição bone->pincel, idempotencia, ledger limpo,
devolucao de estoque no cancelamento, upsert do visto, trava de identidade).

---

## No horizonte (próximo)

### T6 — Sistema de notificação · ⏳ FRONT + 🗄️ BANCO

Hoje o sininho ainda é **majoritariamente mock** (HOJE/ONTEM hardcoded; só o card de
brinde é real). Dividido em:

- **T6a — Feed real (FRONT):** trocar o mock por feed **derivado** do payload que o
  layout já busca — `orders` aprovados, `resgates` pendentes, `loja_items` em promoção
  (`mult_delta < 0`), + o brinde (já real). Casa com "guardar o fato, derivar o rótulo".
- **T6b — "Lido / não lido" (🗄️ BANCO):** não é derivável. Uma coluna timestamp por
  pintor (`notif_visto_em`) + RPC pra carimbar controla a bolinha do sininho (hoje fixa).
- **T6c — Push real (🗄️ INFRA):** notificação fora do app — service worker + Web Push +
  tabela de `subscriptions`. Bloco pesado, independente do feed.
- **T6d — Avisos livres da loja (🗄️ BANCO):** comunicados escritos à mão precisam de
  tabela própria.

### Outras pendências registradas (ver CLAUDE.md)

- Admin não distingue visualmente os itens-brinde na lista da lojinha (aparecem com
  `custo_pts: 0`). Funcional; badge/filtro é melhoria futura.
- Auditar o `seed.sql` ponta a ponta antes do go-live (pegar colunas defasadas num reset).
- SMTP p/ recuperação de senha; troca de telefone do pintor; real-time de estoque (Hiper).
