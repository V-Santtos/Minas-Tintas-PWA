"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Gift, Store, X } from "lucide-react";

// ──────────────────────────────────────────────────────────────────────────
// Pop-up de brinde de boas-vindas (PASSO 1 — só front-end).
//
// Cada pintor recebe UM brinde (boné OU pincel, sorteado). Por enquanto o
// "tem brinde?" e o "qual brinde?" são STUB no cliente (localStorage), pra a
// gente ver/validar o comportamento no localhost sem tocar no banco.
//
// Quando as regras forem pro Supabase, troca-se este stub pela leitura real
// do payload (resgate de boas-vindas pendente + flag "já viu") — o resto da UI
// fica igual.
//
// Preview no localhost (não consome o "já viu"):
//   /home?brinde=bone     → força mostrar o boné
//   /home?brinde=pincel   → força mostrar o pincel
//   /home?brinde=reset    → limpa o "já viu" e recarrega o sorteio
// ──────────────────────────────────────────────────────────────────────────

const SEEN_KEY = "mt_brinde_visto"; // stub do flag "já viu" (vira coluna no banco)
const PICK_KEY = "mt_brinde_sorteio"; // stub do sorteio (vira o resgate concedido)
const BADGE_KEY = "mt_brinde_loja_badge"; // stub: aviso de brinde pendente na Lojinha
const BADGE_EVENT = "mt-brinde-badge"; // sincroniza a bolinha com o BottomNav sem reload

type BrindeKey = "bone" | "pincel";

const BRINDES: Record<
  BrindeKey,
  { img: string; name: string; tag: string; bg: string }
> = {
  bone: {
    img: "/assets/brinde-bone.png",
    name: "Boné Minas Tintas",
    tag: "Boné exclusivo da parceria",
    bg: "#FCF4E7", // = fundo da própria imagem (sem emenda)
  },
  pincel: {
    img: "/assets/brinde-pincel.png",
    name: 'Pincel Condor 2"',
    tag: "Pincel profissional Condor",
    bg: "#F8F0E8", // = fundo da própria imagem (sem emenda)
  },
};

export default function BrindeModal() {
  const router = useRouter();
  const params = useSearchParams();

  const [pick, setPick] = useState<BrindeKey | null>(null);
  const [open, setOpen] = useState(false); // controla o mount
  const [shown, setShown] = useState(false); // controla a animação de entrada
  const persistOnClose = useRef(true); // preview não grava "já viu"

  // Decide na montagem: mostra ou não, e qual brinde.
  useEffect(() => {
    const override = params.get("brinde"); // atalho de preview

    if (override === "reset") {
      localStorage.removeItem(SEEN_KEY);
      localStorage.removeItem(PICK_KEY);
    }

    // Preview forçado: mostra o brinde pedido, sem consumir o "já viu".
    if (override === "bone" || override === "pincel") {
      persistOnClose.current = false;
      setPick(override);
      setOpen(true);
      return;
    }

    // Fluxo normal: só mostra se ainda não viu.
    if (localStorage.getItem(SEEN_KEY)) return;

    // Sorteio do brinde (persistido pra reabrir igual durante o stub).
    let chosen = localStorage.getItem(PICK_KEY) as BrindeKey | null;
    if (chosen !== "bone" && chosen !== "pincel") {
      chosen = Math.random() < 0.5 ? "bone" : "pincel";
      localStorage.setItem(PICK_KEY, chosen);
    }
    setPick(chosen);
    setOpen(true);
  }, [params]);

  // Entrada animada (deixa a home pintar antes).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setShown(true), 450);
    return () => clearTimeout(t);
  }, [open]);

  function close() {
    if (persistOnClose.current) {
      localStorage.setItem(SEEN_KEY, "1");
      localStorage.setItem(BADGE_KEY, "1"); // saiu sem ver → bolinha na Lojinha
      window.dispatchEvent(new Event(BADGE_EVENT));
    }
    setShown(false);
    setTimeout(() => setOpen(false), 380); // espera a saída animar
  }

  function irParaLoja() {
    if (persistOnClose.current) {
      localStorage.setItem(SEEN_KEY, "1");
      localStorage.removeItem(BADGE_KEY); // foi ver → sem bolinha
      window.dispatchEvent(new Event(BADGE_EVENT));
    }
    router.push("/loja");
  }

  if (!open || !pick) return null;
  const brinde = BRINDES[pick];

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={close}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(28,26,23,0.55)",
          opacity: shown ? 1 : 0,
          transition: "opacity 380ms",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 360,
          background: "var(--card)",
          borderRadius: 28,
          padding: "30px 24px 24px",
          boxShadow: "0 18px 48px rgba(28,26,23,.28)",
          textAlign: "center",
          opacity: shown ? 1 : 0,
          transform: shown ? "scale(1)" : "scale(0.92)",
          transition:
            "opacity 360ms, transform 420ms cubic-bezier(0.2,0.7,0.2,1)",
        }}
      >
        {/* Fechar */}
        <button
          onClick={close}
          aria-label="Fechar"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "none",
            background: "var(--paper-deep)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <X size={16} strokeWidth={2} color="var(--muted)" />
        </button>

        {/* Selo do brinde */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "var(--brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 6px 16px rgba(204,0,0,.30)",
          }}
        >
          <Gift size={28} strokeWidth={2} color="#fff" />
        </div>

        <div className="eyebrow-label" style={{ marginBottom: 4 }}>
          BRINDE DE BOAS-VINDAS
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 23,
            lineHeight: 1.18,
            color: "var(--ink)",
            marginBottom: 16,
          }}
        >
          Você ganhou um brinde!
        </div>

        {/* Imagem do brinde sorteado */}
        <div
          style={{
            width: "100%",
            height: 184,
            borderRadius: 18,
            background: brinde.bg,
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            marginBottom: 14,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={brinde.img}
            alt={brinde.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              padding: 12,
            }}
          />
        </div>

        <div
          style={{
            fontFamily: "var(--font-jakarta)",
            fontWeight: 800,
            fontSize: 17,
            color: "var(--ink)",
            marginBottom: 2,
          }}
        >
          {brinde.name}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 18 }}>
          {brinde.tag}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "var(--muted)",
            lineHeight: 1.6,
            marginBottom: 22,
            padding: "0 4px",
          }}
        >
          Ele já está reservado na sua lojinha. Passe na loja Minas Tintas para
          retirar — a equipe confirma a entrega.
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={irParaLoja}
          style={{ marginBottom: 8 }}
        >
          <Store size={16} strokeWidth={2} color="#fff" />
          <span>Ver na lojinha</span>
        </button>
        <button className="btn btn-ghost btn-full" onClick={close}>
          Agora não
        </button>
      </div>
    </div>
  );
}
