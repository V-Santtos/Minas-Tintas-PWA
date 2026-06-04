# CONTEXTO — Fase de Telas · Minas Tintas App

> Ler no início de cada sessão. Atualizar quando validar ou mudar algo relevante.

---

## Onde estamos

**Fase:** 3 — Produção do app real em Next.js
**Foco atual:** app **PINTOR** em `APLICATIVO PWA/minas-tintas-pintor/` (mobile-first, PWA)
**Pintor (real):** ✅ todas as telas construídas fiéis ao protótipo + setup de validação desktop (mockup de iPhone removível) concluído e aprovado. **Próximo:** passada de refinamentos visuais.
**Admin (real):** `APLICATIVO PWA/minas-tintas-app/` — todas as telas construídas.

> 📌 Para o estado detalhado da sessão atual (rotas, mockup de validação,
> como remover, decisões em aberto), ler **`sessao-atual.md`** na raiz do projeto.

### Protótipos (Fase 2 — fonte de verdade visual, não alterar)
**Mobile:** ✅ 100% validado (`ui_kits/pintor/pintor-app.html`)
**Admin:** ✅ 100% validado (`ui_kits/admin/admin-app.html`)

> O conteúdo abaixo é a referência das telas/decisões do **Admin** (protótipo).

---

## Arquivos — onde buscar cada coisa

| Arquivo | O que tem |
|---|---|
| `../../../03 - Briefing/briefing.md` | Regras de negócio (bônus, lojinha, fluxos, status) |
| `../colors_and_type.css` | Tokens CSS canônicos |
| `ui_kits/pintor/pintor-app.html` | ✅ Mobile validado — 7 telas, frame iPhone |
| `ui_kits/admin/admin-app.html` | Admin em lapidação — sidebar + telas |

**Tokens rápidos** (para editar sem abrir o CSS):

| Token | Uso |
|---|---|
| `--paper` / `--card` | Fundo página / fundo card |
| `--ink` / `--muted` | Texto principal / secundário |
| `--brand` `#CC0000` | Vermelho Minas (único por seção) |
| `--success` `#4F7A4A` | Verde — aprovado, bônus |
| `--warning` `#B5751F` | Âmbar — pendente |
| `--line` | Bordas e divisores |
| `--font-display` | Plus Jakarta Sans 800 |
| `--font-body` | Inter |

---

## Status das telas — Admin

| # | Tela | Status |
|---|---|---|
| 0 | Home (consulta de clientes) | ✅ Validada |
| 1 | Pedidos (lista) | ✅ Validada |
| 2 | Pedido (detalhe) | ✅ Validada |
| 3 | Pintores | ✅ Validada |
| 4 | Lojinha admin | ✅ Validada |
| 5 | Relatórios | ✅ Validada |

---

## Decisões admin — o que está implementado

### Estrutura geral

| Elemento | Valor |
|---|---|
| Layout | Sidebar 232px escura `#1C1A17` + área principal clara, altura 820px |
| Display font | Plus Jakarta Sans 800, tracking −0.03em |
| Usuário logado | Renato Aguiar · gerente · centro |
| Bônus | 1% do total — `Math.round(total * 0.01)` — creditado automaticamente na aprovação |
| Sidebar toggle | Ícone `panel-left` fixo — colapsa para 56px, hover expande (peek mode) |
| Logo sidebar | Centralizada, `height:52px`, seção isolada com `border-bottom` — tela inicial é `home` |

### Status de pedidos

| Status | Cor | Dot |
|---|---|---|
| `pendente` | Âmbar | `#B5751F` |
| `aprovado` | Verde | `#4F7A4A` |
| `recusado` | Vermelho | `#CC0000` |
| `estornado` | Muted | `#8A817A` |

### Formas de pagamento (admin e mobile)

Dinheiro · Pix · Cartão · Notinha (grid 2×2 no admin, botões verticais no mobile)

---

### Tela 0 — Home (consulta de clientes)

- Tela de entrada do admin — `screen = 'home'` por padrão
- Campo de busca centralizado (largura 560px), sem ruído visual
- Pesquisa por **nome** ou **telefone** em tempo real contra `CLIENTS[]`
- Resultado mostra: nome, tipo (pessoa/empresa), telefone e pintor vinculado (pill verde) ou "Sem pintor vinculado"
- Link "Ver perfil →" navega direto para a tela Pintores
- `CLIENTS[]` enriquecido com campos `phone` e `painter` (nome do pintor vinculado)
- Botão `×` limpa a busca e retorna ao estado vazio

### Tela 1 — Pedidos (lista)

- Pills de filtro: Todos · Pendente · Aprovado · Recusado · Estornado (dots coloridos)
- Busca em tempo real por pintor, obra ou número
- Filtro avançado: Pintor + Forma de pagamento
- Stats dinâmicas: pendentes · hoje (R$) · bônus total (pts) · aprovados total (R$)
- **Novo pedido manual** (modal): Pintor autocomplete → Obra/cliente autocomplete → Produtos (busca + carrinho com margem % e estoque) → Pagamento (grid 2×2) → Anotação interna

### Tela 2 — Pedido (detalhe)

- Header: back → Pedidos · eyebrow #ID · título da obra · pintor com pulsing green dot
- Bônus card: equação visual `R$ X × 1% = Y pts`
- Timeline: 3 steps — Orçamento criado · Orçamento em análise · Pedido aprovado / Aguardando aprovação
- **Pendente:** botões Recusar + Aprovar pedido
- **Aprovado:** botão Estornar → modal com campo motivo obrigatório → registra em `o.estornoMotivo`, motivo exibido no recibo
- Anotação interna (`o.notes`) exibida no recibo quando preenchida

### Tela 3 — Pintores

- Tabela: Nome + CPF mascarado · Cidade · Desde · Pedidos · Saldo · Status
- Busca: filtra nome, CPF e cidade em tempo real
- Linha clicável → abre perfil do pintor (screen `'pintor'`)
- **Cadastrar pintor** (modal): Nome* · CPF* · Cidade* · Telefone · E-mail
- **Perfil do pintor:** 3 stat tiles (pedidos, pontos, volume total aprovado) + histórico de pedidos filtrado + toggle ativo/inativo + back → Pintores

### Tela 4 — Lojinha admin

**Estrutura geral:**
- Duas abas dentro da mesma tela: **Produtos** e **Resgates**
- Os botões "Multiplicadores" e "Adicionar item" aparecem **somente na aba Produtos** — somem na aba Resgates
- O eyebrow e o subtítulo do page-header mudam conforme a aba ativa
- `border-bottom` do page-header removido via inline style (as tabs já fazem a divisória)

**Aba Produtos:**
- Grid 4 colunas de cards de recompensas com foto, nome, descrição, pts, estoque e badge PROMO
- Modal "Multiplicadores" — multiplicador global com fórmula visual
- Modal "Editar item" — nome, custo, estoque, descrição, modificador individual + **seção de foto** (preview com drag para reposicionar, botões Trocar e Remover, ou quadrado tracejado "Adicionar foto" se sem imagem)
- Modal "Adicionar item" — busca no catálogo, foto (drag para reposicionar), modificador, preview de pts
- Imagem do Kit EPI salva em `05 - App/assets/kit-epi.png` e vinculada ao produto `id:'epi'`

**Aba Resgates:**
- Badge vermelho no tab com contagem de pendentes
- Pills filtro: **Pendentes** / **Todos**
- Lista de resgates como linhas com divisor único (sem card/borda dupla)
- Cada linha: thumbnail do item + nome, pintor, data, pts
- Ações para pendentes: botão **"Recusar"** (ghost danger, vermelho) + **"Confirmar entrega"** (btn-dark, preto)
- Status pós-ação: "Entregue" (verde) ou "Recusado" (vermelho)
- Estado vazio: mensagem "Nenhum resgate pendente"
- Dados mock em `RESGATES[]` com 4 entradas (2 pendentes, 2 entregues)

### Tela 5 — Relatórios

- Navegação temporal: toggle **Mês / Ano** + setas `‹ período ›` — posicionados no page-header ao lado do botão Imprimir
- Visão **Ano**: gráficos de linha por mês (meses com dados detectados dinamicamente); stats acumulam o ano inteiro
- Visão **Mês**: gráficos de linha por semana (Sem 1–4); stats filtram só o mês selecionado; navegar entre meses via setas
- 4 stat tiles: Pedidos gerados · Volume aprovado (verde) · Bônus distribuídos (roxo) · **Ticket médio** (substituiu "Pintores ativos")
- Donut de status dos pedidos — filtrado pelo período
- Card "Pintor do Mês" / "Pintor do Ano" — label muda conforme a visão
- Ranking de pintores — filtrado pelo período
- Gráficos tratam período sem dados: "Sem dados no período" em vez de erro

---

## Regras de trabalho

- Editar sempre o arquivo original — nunca criar cópias
- Registrar aqui quando o usuário validar uma tela (trocar 🟡 por ✅)
- Consultar `briefing.md` para dúvidas de regra de negócio
- Não avançar de tela sem confirmação explícita do usuário
