# Pintor — Mobile PWA UI kit

The painter's side of Minas Tintas. Designed mobile-first (iPhone-class viewport), warm editorial system, single-red accent per screen.

## Files
- `index.html` — interactive demo. Seven screens in iOS device frames, side-scrollable. Each frame is independently navigable via the bottom tab bar.
- `components.jsx` — atoms/molecules: `MTButton`, `TopBar`, `StatusPill`, `BottomNav`, `BalanceHero`, `SectionHead`, `OrderRow`, `ProductRow`, `RewardCard`, `FAB`, `Icon`.
- `screens.jsx` — full screen compositions: Home, Pedidos, Pedido detail, Orçamento, Lojinha, Resgate, Perfil.
- `ios-frame.jsx` — iOS bezel (starter component, untouched).

## Screens (1-indexed)
1. **Início** — hero balance figure, two quick actions, recent orders, upcoming rewards.
2. **Novo orçamento** — product catalog with quantity steppers; persistent dark summary bar with the bonus preview.
3. **Meus pedidos** — filterable ledger of all orders.
4. **Pedido (detalhe)** — receipt-style itemization with dashed dividers, large Playfair total, bonus preview card.
5. **Lojinha** — balance card + reward grid; locked items dimmed.
6. **Resgate** — confirm screen with hero figure.
7. **Perfil** — stat tiles, settings list.

## Design notes
- Bottom nav uses `backdrop-filter: blur(12px)` over 92% paper — the only place glass is used.
- Each screen places brand red exactly once (status pill, points figure, FAB, or bonus number — never two).
- Hero numerals are Playfair 700 with `font-variant-numeric: tabular-nums`. Tables use Inter tabular.
- All icons via Lucide CDN, stroke 1.75.

## Cutting corners (acknowledged)
- No real auth, search, or filter logic — chips are decorative.
- No backend; data is static `DATA` in `index.html`.
- One painter persona, no permissions matrix.
