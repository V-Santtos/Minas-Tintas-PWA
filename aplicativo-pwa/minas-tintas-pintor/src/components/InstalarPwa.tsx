"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────
// Botão "Instalar o aplicativo" da tela de login.
//
// Só aparece quando a instalação NATIVA de um toque está disponível — ou
// seja, quando o Android/Chrome disparou o beforeinstallprompt (capturado
// cedo pelo script inline do layout raiz em window.__mtBip, que também
// segura a mini-infobar do Chrome). iPhone não vê nada (Safari não tem
// instalação programática; a instrução vai por PDF da loja — decisão de
// 2026-07-02, sem guia no meio da tela). PWA instalado idem (appinstalled
// esconde na hora). Só funciona em produção (HTTPS + SW; em dev o evento
// não dispara e o botão simplesmente não existe).
// ──────────────────────────────────────────────────────────────────────────

type BipEvent = Event & { prompt: () => Promise<void> };

declare global {
  interface Window {
    __mtBip?: BipEvent;
  }
}

export default function InstalarPwa() {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const instalado =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error — só existe no iOS
      window.navigator.standalone === true;
    if (instalado) return;

    const sync = () => setPronto(!!window.__mtBip);
    sync();
    window.addEventListener("mt-bip", sync);
    const onInstalled = () => setPronto(false);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("mt-bip", sync);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!pronto) return null;

  async function instalar() {
    const bip = window.__mtBip;
    if (!bip) return;
    // O evento só serve uma vez: some o botão; se o usuário dispensar a
    // folha, o Chrome re-dispara o beforeinstallprompt e ele volta.
    window.__mtBip = undefined;
    setPronto(false);
    await bip.prompt();
  }

  return (
    <div className="install-pwa">
      <button
        type="button"
        className="tap"
        onClick={instalar}
        style={{
          width: "100%",
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: 13,
          borderRadius: 14,
          background: "transparent",
          border: "1.5px solid var(--line-strong)",
          color: "var(--ink)",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "var(--font-body)",
          cursor: "pointer",
        }}
      >
        <Smartphone size={17} strokeWidth={2} />
        Instalar o aplicativo
      </button>
    </div>
  );
}
