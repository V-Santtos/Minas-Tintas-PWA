"use client";

import { useEffect, useState } from "react";

// ──────────────────────────────────────────────────────────────────────────
// [DEBUG TEMPORÁRIO] Painel de diagnóstico do viewport no iPhone.
// Liga só com ?debug=1 na URL (ex.: /home?debug=1). Inerte em produção.
// Mostra, ao vivo (atualiza no scroll/resize), os números que revelam a causa
// do "nav pra cima + faixa branca": modo (PWA/Safari), altura real vs 100dvh,
// safe-area de baixo, e o "buraco" entre o fundo da nav e o fundo da tela.
// >>> APAGAR quando o bug estiver resolvido. <<<
// ──────────────────────────────────────────────────────────────────────────
export default function ViewportDebug() {
  const [on, setOn] = useState(false);
  const [txt, setTxt] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    // [TEMPORÁRIO] sempre ligado p/ capturar a abertura fria no iPhone —
    // o standalone não tem barra de URL, então ?debug=1 nunca chega aqui.
    // if (new URLSearchParams(window.location.search).get("debug") !== "1") return;
    setOn(true);

    const read = () => {
      const vv = window.visualViewport;
      const app = document
        .querySelector(".pintor-app")
        ?.getBoundingClientRect();
      const nav = document
        .querySelector(".bottom-nav")
        ?.getBoundingClientRect();

      // safe-area-inset-bottom em px (via probe fixo)
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;bottom:0;left:0;width:0;height:env(safe-area-inset-bottom);";
      document.body.appendChild(probe);
      const sab = probe.offsetHeight;
      probe.remove();

      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        // @ts-expect-error — só existe no iOS
        window.navigator.standalone === true;

      const r = (n?: number) => (n == null ? "?" : Math.round(n));
      const gap = nav ? Math.round(window.innerHeight - nav.bottom) : NaN;

      setTxt(
        [
          `modo: ${standalone ? "PWA-standalone" : "navegador"}`,
          `innerH:${window.innerHeight}  screenH:${screen.height}  scrollY:${Math.round(window.scrollY)}`,
          `visualVP: h=${r(vv?.height)} top=${r(vv?.offsetTop)}`,
          `docClientH:${document.documentElement.clientHeight}`,
          `safe-bottom:${sab}`,
          `app: top=${r(app?.top)} bot=${r(app?.bottom)} h=${r(app?.height)}`,
          `NAV: top=${r(nav?.top)} bot=${r(nav?.bottom)}`,
          `>> BURACO nav->fundo: ${gap}px <<`,
        ].join("\n"),
      );
    };

    read();
    const id = window.setInterval(read, 250);
    window.addEventListener("scroll", read, true);
    window.visualViewport?.addEventListener("resize", read);
    window.visualViewport?.addEventListener("scroll", read);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("scroll", read, true);
      window.visualViewport?.removeEventListener("resize", read);
      window.visualViewport?.removeEventListener("scroll", read);
    };
  }, []);

  if (!on) return null;

  return (
    <pre
      style={{
        position: "fixed",
        top: 58,
        left: 8,
        zIndex: 9999,
        margin: 0,
        padding: "8px 10px",
        background: "rgba(0,0,0,0.82)",
        color: "#39FF14",
        font: "11px/1.4 ui-monospace, SFMono-Regular, monospace",
        borderRadius: 8,
        pointerEvents: "none",
        whiteSpace: "pre",
      }}
    >
      {txt}
    </pre>
  );
}
