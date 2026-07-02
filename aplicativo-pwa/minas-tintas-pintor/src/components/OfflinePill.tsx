"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

// Pílula "sem conexão" (Fase 2 — adiantamento seguro): só sinaliza o estado,
// não muda comportamento. Renderizada direto na moldura `.pintor-app` (nunca
// dentro do `.pintor-scroll` — o fixed ficaria preso pelo overflow-scrolling
// no iOS, lição dos overlays). Estado inicial "online" pra bater com o SSR;
// o valor real entra no mount.
export default function OfflinePill() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "var(--ink)",
        color: "var(--paper)",
        borderRadius: 999,
        padding: "6px 12px",
        fontSize: 11.5,
        fontWeight: 700,
        boxShadow: "0 2px 10px rgba(28,26,23,.25)",
        pointerEvents: "none",
      }}
    >
      <WifiOff size={12} strokeWidth={2} />
      Sem conexão
    </div>
  );
}
