"use client";

import { useEffect } from "react";

// ──────────────────────────────────────────────────────────────────────────
// [FIX iOS] "Empurrãozinho" de viewport no launch do PWA standalone.
//
// Bug (WebKit): na abertura fria do standalone (black-translucent +
// viewport-fit=cover), o iOS entrega o viewport SEM a altura da status bar
// (medido no aparelho: innerHeight 793 numa tela de 852) — o app inteiro
// nasce num palco mais curto e a bottom-nav (fixed) fica "empurrada", com
// faixa de fundo embaixo. Qualquer gesto que force o WebKit a reconciliar
// o viewport (rubber-band, abrir/fechar teclado) corrige em definitivo.
//
// Este componente faz isso programaticamente: enquanto innerHeight <
// screen.height, cria 1px de overflow real no documento e dá um scroll de
// ida-e-volta invisível (scrollTo 1 → 0), repetindo por alguns segundos até
// o viewport reconciliar; aí se desliga de vez. Fora do standalone (Safari,
// Android, desktop) e em launch são, é um no-op imediato. Não roda em uso
// normal: só o burst inicial da montagem (teclado aberto reduz innerHeight,
// mas o burst já morreu muito antes de existir teclado na tela).
// ──────────────────────────────────────────────────────────────────────────
export default function ViewportKick() {
  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error — só existe no iOS
      window.navigator.standalone === true;
    if (!standalone) return;

    const stale = () => window.innerHeight < screen.height - 1;
    if (!stale()) return; // nasceu são — não faz nada

    let tries = 0;
    let timer: number | undefined;

    const cleanup = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
      window.visualViewport?.removeEventListener("resize", onResize);
    };

    const kick = () => {
      if (!stale() || tries++ > 15) {
        cleanup();
        return;
      }
      const html = document.documentElement;
      const prev = html.style.minHeight;
      // 1px além da tela = overflow real → o scroll vira um gesto "de verdade"
      html.style.minHeight = `${screen.height + 1}px`;
      window.scrollTo(0, 1);
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        html.style.minHeight = prev;
      });
    };

    const onResize = () => {
      if (!stale()) cleanup(); // reconciliou — missão cumprida
    };

    window.visualViewport?.addEventListener("resize", onResize);
    kick();
    timer = window.setInterval(kick, 400);
    return cleanup;
  }, []);

  return null;
}
