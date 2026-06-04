# Plano de Execução — Briefing Visual Minas Tintas

> Status: Em detalhamento — NÃO executar ainda
> Última atualização: 2026-05-17

---

## 1. Conceito do App (base do briefing)

O aplicativo é um **sistema de beneficiação voltado para o pintor**.
- Usuário final: o pintor (não o consumidor da loja)
- Mecânica central: compra → acúmulo de pontos → resgate de benefícios

---

## 2. Stack de Assets (já baixados)

| Asset | Arquivo | Status |
|---|---|---|
| Tailwind CSS | `briefing/assets/js/tailwind.js` | ✅ Baixado |
| AOS.js | `briefing/assets/js/aos.js` | ✅ Baixado |
| AOS CSS | `briefing/assets/css/aos.css` | ✅ Baixado |
| Lucide Icons | `briefing/assets/js/lucide.min.js` | ✅ Baixado |
| Inter (300–700) | `briefing/assets/fonts/inter/` | ✅ Baixado |
| Playfair Display (400, 400i, 700) | `briefing/assets/fonts/playfair/` | ✅ Baixado |
| fonts.css | `briefing/assets/css/fonts.css` | ✅ Criado |

---

## 3. Sistema Visual Escolhido

**Warm Editorial** (Open Design) — adaptado para Minas Tintas.

| Token | Valor |
|---|---|
| Fundo | `#FAF7F2` (off-white quente, papel) |
| Texto | `#1C1A17` (preto quente) |
| Accent | `#CC0000` (vermelho da marca) |
| Muted | `#8A817A` (cinza quente) |
| Surface (cards) | `#FFFFFF` |
| Borda | `rgba(28,26,23,0.10)` |
| Títulos | Playfair Display |
| Corpo | Inter |
| Line-height corpo | 1.6 |
| Line-height títulos | 1.2 |
| Letter-spacing display | -0.02em (acima de 40px) |

**Regras invioláveis:**
- Nunca preto puro nem branco puro em elementos visíveis
- Um único uso do vermelho por seção
- Sem gradientes
- Border-radius entre 8px e 24px

---

## 4. Estrutura de Seções do Briefing Visual

> DECISÃO: briefing de uso interno (equipe de desenvolvimento). Linguagem direta, sem enrolação.
> Foco 100% na solução contratada — sistema de benefícios para pintores com troca de pontos.
> Não explicar contexto de mercado, histórico da loja nem dores genéricas do pintor.

### Navegação
Sumário interativo fixo (sidebar ou top nav) com âncoras para cada seção.
O usuário clica e vai direto à seção desejada — sem precisar scrollar tudo.

### Seções (em ordem)

| # | Seção | Conteúdo | Tom |
|---|---|---|---|
| 0 | **Capa** | Logo Minas Tintas + nome do projeto + data | Só identidade |
| 1 | **O Sistema** | O que foi contratado em uma frase. Sistema de benefícios para pintores — troca de pontos por compras. | Direto |
| 2 | **O Mundo do Pintor** | Jornada do pintor no app: cadastro → compra → pontos → nível → resgate | Funcional |
| 3 | **O Mundo do ADM** | O que a Minas Tintas gerencia: pintores, pontos, resgates, métricas | Funcional |
| 4 | **A Mecânica** | Fluxo de ponta a ponta conectando pintor e ADM | Visual (diagrama) |
| 5 | **Funcionalidades** | Lista por perfil (Pintor / ADM) com feature cards | Referência técnica |
| 6 | **Próximos Passos** | Roadmap macro: design → dev → MVP → lançamento | Objetivo |

---

## 5. Recursos Visuais por Seção (sem telas reais)

> DECISÃO: frames de celular com placeholder ficam reservados para o **briefing final** (com telas reais). Este briefing inicial usa os recursos abaixo.

| Seção | Recurso visual |
|---|---|
| Como funciona | **Diagrama de ciclo** — SVG mostrando compra → pontos → resgate |
| Funcionalidades | **Feature cards** — ícone Lucide + nome + descrição |
| Proposta de valor | **Tipografia editorial em macro** — número/frase grande em Playfair |
| Problema × solução | **Infográfico comparativo** — dois lados lado a lado |
| Níveis do pintor | **Badges desenhados em CSS** — Iniciante / Profissional / Master |
| Mecânica de pontos | **UI Fragments flutuantes** — componentes isolados (card de pontos, barra de progresso, badge de nível) sem frame de celular |

**Por que UI Fragments e não frames de celular:**
Componentes isolados (card, barra, badge) flutuando com sombra suave são mais sofisticados e autorais. Frames de celular com placeholder ficam genéricos. Reservamos o frame para o briefing final com telas reais — aí fica impactante.

---

## 6. Referências de Estilo Internas (Open Design)

- Sistema base: `.claude/skills/open-design/design-systems/warm-editorial/DESIGN.md`
- CSS base: `.claude/skills/open-design/skills/html-ppt/assets/base.css`
- Tema: `.claude/skills/open-design/skills/html-ppt/assets/themes/minimal-white.css`

---

## 7. Estrutura de Arquivos a Criar

```
Minas Tintas/
└── 03 - Briefing/
    └── briefing-visual.html     ← arquivo final do briefing
briefing/
└── assets/                     ← todos os assets já prontos
```

---

## 8. Fonte de Verdade Funcional

**Arquivo:** `briefing.md` (raiz do projeto) — briefing funcional completo.

Principais pontos para o briefing visual:

**Mecânica de bônus:**
- 1% do valor bruto do orçamento aprovado → pintor responsável
- Liberado exclusivamente pelo admin após confirmação manual de pagamento
- Pagamento acontece fora do sistema (sem gateway)
- Desconto concedido ao cliente não reduz a base de cálculo do bônus

**Lojinha de pontos:**
- Multiplicador padrão: 3x (item de R$100 = 300 pontos)
- Admin pode reduzir o multiplicador por item para criar promoções
- Resgates são presenciais — pintor solicita, retira na loja, admin confirma entrega
- Cancelamento disponível antes da retirada (pontos e estoque devolvidos automaticamente)
- Pontos não expiram

**Dois cenários de compra:**
- Cenário A: pintor cria orçamento no campo → cliente paga na loja
- Cenário B: cliente chega na loja → admin cria o orçamento no painel

**Dois módulos de produto separados:**
- Catálogo da loja (para orçamentos) → sincronizado via API do sistema externo
- Lojinha de pontos (para resgates) → gerenciada exclusivamente pelo admin

**Funcionamento offline:** PWA com Service Workers — pintor monta orçamentos sem internet

**Tipo:** PWA instalável no celular

## 9. Campo de Anotações por Seção

Cada seção terá um campo de anotações para colaboradores adicionarem pontos de atenção.

- Elemento: `textarea` estilizado no tema Warm Editorial
- Ícone: lápis (Lucide)
- Label: "Anotações / Pontos de atenção"
- Posição: rodapé de cada seção
- Persistência: **localStorage** — salva automaticamente no navegador, sem servidor

## 10. Status Final

- ✅ Briefing funcional: `briefing.md`
- ✅ Sistema visual: Warm Editorial + tokens definidos
- ✅ Assets: fontes, ícones, Tailwind, AOS
- ✅ 7 seções estruturadas
- ✅ Recursos visuais por seção definidos
- ✅ Navegação interativa (sumário fixo com âncoras)
- ✅ Campo de anotações com localStorage em cada seção
- ⏳ Nome do app — usar placeholder "Sistema de Benefícios — Minas Tintas"

**PRONTO PARA EXECUTAR.**
