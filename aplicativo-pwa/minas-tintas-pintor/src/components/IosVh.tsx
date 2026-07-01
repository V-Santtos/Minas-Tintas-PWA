"use client";

import { useEffect } from "react";

// ──────────────────────────────────────────────────────────────────────────
// [FIX iOS] Publica a altura FÍSICA da tela pra moldura do app.
//
// No launch frio do PWA standalone, o iOS entrega o viewport (e o 100dvh)
// DEFASADOS — medido no aparelho: 793 numa tela de 852 (a altura da status
// bar some). A moldura .pintor-app (min-height:100dvh) nasce curta e a
// bottom-nav, ancorada nela pelo transform, nasce "empurrada" com faixa
// embaixo, até um gesto real (rubber-band/teclado) reconciliar. Scroll
// programático NÃO reconcilia (testado no aparelho).
//
// Aqui a moldura ganha uma régua que nunca mente: --app-vh = screen.height
// (px físico, disponível correto desde o 1º frame). O CSS usa
// min-height: var(--app-vh, 100dvh) SÓ sob html.ios-standalone — fora do
// iOS standalone nada muda (Android/Safari/desktop seguem no 100dvh).
//
// Gate: navigator.standalone === true só existe no iOS.
// screen.width/height no iOS são fixos no retrato → deriva pela orientação.
// ──────────────────────────────────────────────────────────────────────────
export default function IosVh() {
  useEffect(() => {
    // @ts-expect-error — só existe no iOS
    if (window.navigator.standalone !== true) return;

    const html = document.documentElement;
    html.classList.add("ios-standalone");

    const apply = () => {
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      const h = portrait
        ? Math.max(screen.width, screen.height)
        : Math.min(screen.width, screen.height);
      html.style.setProperty("--app-vh", `${h}px`);
    };
    apply();
    window.addEventListener("orientationchange", apply);
    return () => window.removeEventListener("orientationchange", apply);
  }, []);

  return null;
}
