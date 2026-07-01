"use client";

import { useEffect } from "react";

// ──────────────────────────────────────────────────────────────────────────
// [FIX iOS] Ancora o app na altura REAL da tela no PWA standalone do iOS.
//
// Bug (WebKit): na abertura fria do standalone (black-translucent +
// viewport-fit=cover), o iOS entrega o viewport SEM a altura da status bar
// (medido no aparelho: innerHeight 793 numa tela de 852). Tudo que é fixed
// ancorado no viewport nasce "empurrado", com faixa de fundo embaixo, até um
// GESTO REAL (rubber-band/teclado) reconciliar. Scroll programático NÃO cura
// — testado no aparelho (scrollTo + overflow de 1px, ignorado pelo WebKit).
//
// Solução: parar de depender do viewport. Este componente marca
// html.ios-standalone e publica --app-vh = altura física da tela
// (screen.height, que NUNCA nasce defasada). O CSS (globals.css) usa isso pra
// transformar o .pintor-app no containing block dos fixed com altura real:
// a bottom-nav cola no fundo físico desde o 1º paint, com o viewport certo
// ou errado. (Era a ideia do commit 91a1e44, que falhou porque a altura era
// 100dvh — que nasce defasada igual ao viewport. Em px medido, não nasce.)
//
// Gate: navigator.standalone === true só existe no iOS — Android standalone
// reporta innerHeight correto e continua no fluxo normal (100dvh).
// ──────────────────────────────────────────────────────────────────────────
export default function ViewportKick() {
  useEffect(() => {
    // @ts-expect-error — só existe no iOS
    if (window.navigator.standalone !== true) return;

    const html = document.documentElement;
    html.classList.add("ios-standalone");

    // screen.width/height no iOS são fixos no retrato; deriva pela orientação
    // (o app é retrato, mas o iOS ignora o orientation do manifest).
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
