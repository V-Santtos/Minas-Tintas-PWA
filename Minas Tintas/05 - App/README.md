# Minas Tintas — Design System

A design system for **Minas Tintas**, a PWA that runs a benefits/loyalty program for painters who buy from a paint store chain in Minas Gerais, Brazil. The aesthetic is **Warm Editorial adapted** — a cream paper backdrop, a serif (Playfair Display) for display copy, Inter for everything else, and a single, deliberate use of the brand red (`#CC0000`) per section.

---

## The product

Two distinct surfaces, one shared brand:

### 1. Pintor — mobile PWA
For painters in the field.
- Build a quote (orçamento) by picking products from the store catalog.
- Track order status (created → paid → bonus released).
- Spend earned points in the **Lojinha** (rewards store) on products and brindes (giveaways).
- Bônus formula: **1% of approved quote value → points** (1 BRL paid ≈ 1 ponto). Point cost of a reward item is `price × multiplier`.

### 2. Admin — desktop web
For the store back-office.
- Approve orders, confirm payments, trigger bonus payouts.
- Register and manage painters.
- Curate the Lojinha (add/remove items, set multipliers, manage stock).
- Run reports (orders, points liability, top painters).

---

## Sources

This system was built from a brief and a small asset drop — there is no Figma or codebase to mirror against. Sources used:

| Source | What it gave us |
|---|---|
| Brand brief (prompt) | Product description, two-user model, points mechanic, color palette, type stack, hard rules (no gradients, no pure black/white, radius 8–24, single red per section). |
| `uploads/Tintas_logo.png` | Wordmark — handwritten red "Minas" over outlined "TINTAS", set inside a faint outline of the state of Minas Gerais. Copied to `assets/minas-tintas-logo.png`. |
| `uploads/playfair-*.woff2`, `uploads/inter-*.woff2` | The full type stack for the system. Copied to `fonts/`. |

> **No Figma, no GitHub.** All component recreations in `ui_kits/` are first-pass interpretations of the brief, not reproductions of an existing app. Treat them as a starting visual contract, not pixel-fidelity copies.

---

## Brand essence

> *Mineiro, oficio, papel.* The store has a regional identity (Minas Gerais), serves a trade audience (painters — practical, time-poor, paid by the job), and rewards loyalty. The visual language treats the program like a **little black book of receipts** — warm paper, serif headers, generous numbers, ledger-style lists — instead of the usual neon points-and-badges loyalty UI.

Tone is direct, respectful, and Brazilian Portuguese. We say *você*, not *tu*. We celebrate work, not gamification.

---

## Content fundamentals

**Voice.** Direct, plain Portuguese (PT-BR). Short sentences. We never patronize the painter. We never use jargon the painter wouldn't say on a job site.

**Address.** Second-person singular *você*. Never *tu*, never the formal *senhor/senhora* in-app. The admin surface uses the same *você* — admins are still humans on a back-office tool.

**Casing.**
- Titles and section headers: **Sentence case** ("Meus pedidos", not "Meus Pedidos" or "MEUS PEDIDOS").
- Buttons and primary actions: **Sentence case, imperative verb first** ("Criar orçamento", "Resgatar agora", "Confirmar pagamento").
- Tabs / nav items: Single word when possible ("Pedidos", "Lojinha", "Perfil").
- Status pills: **Lowercase** ("aprovado", "aguardando pagamento", "pontos liberados").
- The eyebrow label (Inter 11px, +0.16em tracking): **UPPERCASE** — the only place we use all-caps. Reserved for category labels and section openers.

**Numbers and currency.**
- Currency: `R$ 1.234,56` — Brazilian formatting, BRL, two decimals.
- Points: `1.234 pts` or `1.234 pontos` — period as thousands separator, never comma. Tabular figures on every numeric block.
- Dates: `12 mar 2026` (lowercase month abbrev), or `12/03/2026` in dense table cells.
- Quantity ranges: `2 a 4 demãos`, `18L`, `1/4 galão`.

**Examples — Pintor app**
- Tab labels: `Início` · `Orçamento` · `Pedidos` · `Lojinha` · `Perfil`
- Empty state (no orders yet): *"Nenhum pedido ainda. Comece criando um orçamento na obra."*
- Order status pills: `rascunho` · `aguardando pagamento` · `pago` · `bônus liberado`
- Reward CTA: `Resgatar por 4.200 pts`
- Success toast: *"Pontos creditados. Bom trabalho."*

**Examples — Admin desktop**
- Page title: *"Pedidos para aprovação"*
- Row action: `Confirmar pagamento` · `Liberar bônus` · `Estornar`
- Empty state: *"Sem pedidos pendentes. Tudo em dia."*
- Confirmation modal: *"Liberar R$ 184,50 em bônus para Carlos H. Almeida?"*

**Emoji.** Never. Not in copy, not in toasts, not in category labels. Use icons (Lucide, see `Iconography`) when a glyph is needed.

**Numbers as story.** Big numbers (totals, points balance, bônus do mês) are the visual anchors. Set them in **Playfair Display 700**, tabular figures, often with a small Inter eyebrow above. Treat them like editorial pull-quotes — they're the headline, not a sidebar.

---

## Visual foundations

### Color
A warm-neutral surface with one structural accent (red), and three quiet semantic colors. Pure white and pure black are **banned** — `#FFFFFF` only appears on raised cards, and `#000000` never appears at all.

| Token | Hex | Where |
|---|---|---|
| `--paper` | `#FAF7F2` | Page background, full-bleed sections, app shell. |
| `--paper-deep` | `#F2EDE4` | Recessed surface (search bar fill, table zebra). |
| `--card` | `#FFFFFF` | Raised cards, modal sheets — must always sit on cream. |
| `--ink` | `#1C1A17` | Primary text, icon strokes. |
| `--ink-2` | `#3D3833` | Body copy, secondary text. |
| `--muted` | `#8A817A` | Captions, helper text, disabled. |
| `--line` | `#E7E0D4` | Hairline dividers, card borders. |
| `--line-strong` | `#D5CCBC` | Heavier borders, dashed receipt rules. |
| `--brand` | `#CC0000` | Single accent per section: primary CTA, brand mark, points figure, or status pill — pick one. |
| `--brand-ink` | `#A30000` | Press state for red. |
| `--success / --warning / --info` | olive / amber / slate | Status pills only. Always paired with their `-tint` background. |

**The one-red rule.** Inside any visual section, only one element may carry brand red. If the primary CTA is red, the points number stays ink. If the points number is red, the CTA becomes ghost. Never both.

### Type
- **Playfair Display 700** — display, h1, h2, big numeric figures, hero pull-quotes. Italic 400 for h3 / quiet section labels.
- **Inter** — everything else. Weights in use: 300 (almost never, only for very large display alongside Playfair), 400, 500, 600, 700.
- Default body line-height **1.5**, display line-height **1.1**, small caption **1.25**.
- Numbers always use tabular-nums (`font-variant-numeric: tabular-nums`).

### Backgrounds
- 99% of surfaces are flat `--paper` or `--card`. No gradients, ever.
- One subtle paper-texture motif allowed: a **dashed `--line-strong` divider** between rows in receipts/orders (mimics a tear-off receipt). Use sparingly.
- Full-bleed photography (a painter's hand, a wall, a roller) appears only in marketing/onboarding contexts and is **warmed** — slight orange cast, paper-grade contrast, never high-saturation.

### Animation
- **Easing:** `cubic-bezier(0.2, 0.7, 0.2, 1)` for entrances, `cubic-bezier(0.65, 0, 0.35, 1)` for in/outs.
- **Durations:** 140ms (state changes), 220ms (default), 360ms (sheet slide-up).
- **Use:** Fades, soft slides (8–12px), opacity dips on press. **No** bounces, no spring overshoots, no Lottie confetti.
- Toast slides in from bottom, 220ms ease-out. Modal sheet slides up from bottom on mobile, 360ms.
- Number tickers ARE allowed when a points balance changes — count up over 600ms, tabular figures.

### Hover & press
- Quiet items hover to `--paper-deep`.
- Primary red button hovers to `--brand-ink` (darker red, not lighter).
- Cards do **not** lift on hover. They are paper, not buttons.
- Press: 1px translateY for buttons, no scale.

### Borders, dividers, shadows
- Hairline 1px `--line` everywhere a divider is needed. On cards, the border is the primary edge; shadow is supplemental.
- **Shadows are warm**, never blue — `rgba(28, 26, 23, …)`. Four levels (`--shadow-1` through `--shadow-4`); 1–2 carry most surfaces.
- No inner shadows on inputs. Inputs use a 1px `--line` border that thickens to `--ink` on focus, no glow.

### Corner radii
- Strict range **8–24 px**.
- 8 — chips, small buttons, tags.
- 12 — inputs, list rows, secondary buttons.
- 16 — default cards.
- 20 — prominent cards, bottom-sheet handles.
- 24 — hero panels, onboarding cards, modal sheets.
- 999 (pill) only for status pills and the FAB. Nothing else is a pill.

### Transparency & blur
- The bottom nav uses a `backdrop-filter: blur(12px)` over a 92% `--paper` fill — the one place blur is used.
- Modal scrims: `rgba(28, 26, 23, 0.45)`, no blur.
- Otherwise: no glass.

### Layout
- Mobile: 16px gutter, content column flush.
- Desktop admin: 12-column grid, 24px gutter, 80px sidebar, content max-width 1440px.
- Sticky elements: top app bar, bottom tab bar, FAB.

### Imagery
- Warm-leaning. Painters working, hands, walls, paint cans on a worktable. Slight grain acceptable.
- Never stock-photo-clean. Never cold/blue tones.
- Avoid hero illustrations of cartoon characters — this is a trade product.

---

## Iconography

We do **not** use emoji and do **not** invent SVG icons. The system relies on:

- **Lucide** (CDN: `https://unpkg.com/lucide@latest`) — used for all UI iconography. Stroke 1.75, ink color, 20px or 24px. Reasons: free, well-shaped, neutral, plays well with editorial type. Same stroke weight as the Inter x-height feels right against Playfair.
- The **Minas Tintas wordmark** at `assets/minas-tintas-logo.png` — the only proprietary brand mark.
- **Unicode characters** are allowed only for: the bullet `·`, the em-dash `—`, and the multiplication sign `×` in `R$ × pts` context. No other unicode glyphs as icons.
- **No emoji.** Anywhere.

Icon usage rules:
- 20px in dense lists, 24px in tab bar / top bar, 16px inline in buttons.
- Color matches the text it sits next to (`--ink` or `--muted`). Never colored fills.
- Status icons may carry their semantic color (`--success`, `--warning`) — and only those.
- Buttons get an icon-then-label pattern with 8px gap.

---

## File index

```
README.md                       ← this file
SKILL.md                        ← Agent Skill front-matter for Claude Code
colors_and_type.css             ← tokens (CSS vars) + base type + base components
fonts/                          ← Inter + Playfair Display .woff2 files
assets/
  minas-tintas-logo.png         ← brand wordmark
preview/                        ← cards rendered into the Design System tab
  colors-*.html
  type-*.html
  spacing-*.html
  radii.html
  shadow.html
  buttons.html
  inputs.html
  card.html
  status-pills.html
  list-row.html
  bottom-nav.html
  points-figure.html
  logo.html
  iconography.html
ui_kits/
  pintor/                       ← mobile PWA — painter
    index.html                  (interactive prototype)
    *.jsx                       (factored React components)
    README.md
  admin/                        ← desktop web — back-office
    index.html
    *.jsx
    README.md
```

---

## Caveats

- **No source app or Figma was provided.** Visual decisions are first-pass interpretations of the brief. Treat as a contract proposal, not a recreation.
- **The supplied logo PNG is a scanned/photographed sticker** with edge artifacts. Cleaned visually inside our cards (placed on cream, no white halo). A vector wordmark would be a meaningful upgrade.
- **Lucide is used as the icon system** because no proprietary set was provided. Swap if the brand has its own.
- **Photography is referenced but not provided.** Imagery slots in UI kits use the `image-slot` placeholder convention — drop real photos in.

---

## Iterate with us

Please flag any decisions to revisit:
1. Is one-red-per-section too strict?
2. Should the points figure be Playfair (editorial) or Inter (functional/tabular)? Current call: Playfair for *display* points, Inter for *table* points.
3. Comfort with **Lucide** as the icon system, or do you want a custom set?
4. Tone calibration on Portuguese copy — currently friendly-direct *você*. Want more formal?
