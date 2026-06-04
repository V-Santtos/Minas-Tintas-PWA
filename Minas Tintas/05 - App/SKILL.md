---
name: minas-tintas-design
description: Use this skill to generate well-branded interfaces and assets for Minas Tintas, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

# Minas Tintas design

This skill contains the design system for **Minas Tintas**, a PWA loyalty program for painters who buy from a paint store chain in Minas Gerais, Brazil. The product has two surfaces: a mobile Pintor app and a desktop Admin back-office.

## Where to start

1. Read `README.md` — full brand context, content fundamentals, visual foundations, iconography, file index.
2. Read `colors_and_type.css` — CSS variables for every color, type role, spacing step, radius, shadow, and motion token. Import this in any HTML you build.
3. Browse `preview/*.html` — small specimen cards you can crib from for layout patterns.
4. Browse `ui_kits/pintor/` and `ui_kits/admin/` — interactive demos of real screens, with factored React components in `*.jsx` you can copy.

## Defaults to honor unless explicitly overridden

- Background `#FAF7F2`; text `#1C1A17`; **no pure black or pure white**.
- Brand red `#CC0000` appears **once per visible section**. If the CTA is red, no other red on screen.
- Display type: **Playfair Display 700**. Body: **Inter** 400/500/600. No other typefaces.
- Border radii live in **8–24 px** — nothing else (pill `999px` reserved for status pills and the mobile FAB).
- No gradients, no glass anywhere except the mobile bottom nav, no emoji.
- Numbers use `font-variant-numeric: tabular-nums`. Big numbers go in Playfair; ledger numbers in Inter.
- Iconography: **Lucide** at stroke 1.75, ink-colored. No hand-rolled SVGs.

## If asked to build something new

- HTML mockup or prototype → make a static HTML file that links `colors_and_type.css`, drops in `fonts/`, and references `assets/minas-tintas-logo.png`. Use Lucide via CDN.
- Production code → copy the tokens from `colors_and_type.css` into the codebase's existing token format. Components in `ui_kits/*/components.jsx` are *cosmetic*, not production-ready — copy markup, not state logic.
- Always confirm: PT-BR copy is direct, *você*, sentence case for everything except eyebrows (UPPERCASE +0.16em).

When the user invokes this skill without other guidance, ask what they want to build, ask 5–10 questions (audience, surface, screens needed, variations), then act as an expert designer producing HTML artifacts or production code.

## Assets

- `assets/minas-tintas-logo.png` — wordmark (red script "Minas" + outlined "Tintas" + faint state-of-MG silhouette). Transparent PNG, 1134×353. Use over cream paper or dark ink, never on a busy photo.
- `fonts/inter-{300,400,500,600,700}.woff2` and `fonts/playfair-{400,400-italic,700}.woff2` — full webfont stack. Pre-wired in `colors_and_type.css`.
