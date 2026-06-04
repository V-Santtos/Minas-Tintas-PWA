# Admin — Desktop UI kit

The back-office side of Minas Tintas. Designed for ≥1280px viewport, sidebar + content layout, table-heavy.

## Files
- `index.html` — single interactive instance. Sidebar nav switches between Pedidos / Pintores / Lojinha / (Relatórios + Config stubbed). Clicking an order row opens its detail screen.
- `components.jsx` — `Sidebar`, `PageHeader`, `StatTile`, `AdmPill`, `AdmButton`, `Table`, `AdmSearch`, `AdmIcon`.
- `screens.jsx` — `AdmScreenPedidos`, `AdmScreenPedido` (detail), `AdmScreenPintores`, `AdmScreenLojinha`.
- `browser-window.jsx` — Chrome window chrome (starter, unused in current layout; available if you want to wrap the kit in a window frame).

## Screens
1. **Pedidos** — table of orders for approval. Four stat tiles, filter chips, full-width sortable table with status pills.
2. **Pedido (detalhe)** — receipt left, bonus & timeline right. Primary action is `Confirmar pagamento` (red).
3. **Pintores** — painter directory with avatars (initials), status pill, points balance.
4. **Lojinha** — reward catalog as cards with stock and inline edit/hide actions.

## Design notes
- Layout: sidebar (232px) + main with chrome bar at top.
- Section headers use Playfair 32px, body uses Inter 13.5 for tables.
- One red per page (e.g. Pedidos page → `Confirmar pagamento`; Pedido detail page → bonus number).
- Tables: zebra-less, dashed dividers on receipts, solid on data rows.

## Cutting corners
- No real filtering, sorting, exports.
- "Liberar bônus" and "Confirmar pagamento" are decorative.
- Single store ("Centro · São João del-Rei"); no multi-store view.
