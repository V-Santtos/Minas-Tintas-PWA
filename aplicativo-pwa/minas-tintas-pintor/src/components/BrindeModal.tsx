"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { Gift, Store, X } from "lucide-react";
import { usePintor } from "@/lib/pintor-store";
import { createClient } from "@/utils/supabase/client";

// ──────────────────────────────────────────────────────────────────────────
// Pop-up de brinde de boas-vindas.
//
// Cada pintor recebe UM brinde (boné OU pincel), sorteado no BANCO na criação
// do pintor (RPC conceder_brinde_boas_vindas) — aqui só ANUNCIAMOS. O "tem
// brinde?" e o "qual brinde?" vêm do payload (brinde derivado do resgate de
// boas-vindas); o "já viu" é a coluna painter_settings.brinde_visto_em,
// carimbada pela RPC marcar_brinde_visto ao fechar.
//
// Preview no localhost (não marca visto):
//   /home?brinde=bone     → força mostrar o boné
//   /home?brinde=pincel   → força mostrar o pincel
// ──────────────────────────────────────────────────────────────────────────

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
  const { brinde } = usePintor();

  const [pick, setPick] = useState<BrindeKey | null>(null);
  const [open, setOpen] = useState(false); // controla o mount
  const [shown, setShown] = useState(false); // controla a animação de entrada
  const persistOnClose = useRef(true); // preview não marca "já viu"

  // Alvo do portal: .pintor-app (a "moldura"), mesma técnica do sheet de
  // resgate. Tira o modal de dentro do .pintor-scroll (evita clipping do
  // overlay atrás da nav e mantém a moldura no preview desktop).
  const [frameEl, setFrameEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setFrameEl(document.querySelector<HTMLElement>(".pintor-app"));
  }, []);

  // Decide na montagem: mostra ou não, e qual brinde.
  useEffect(() => {
    const override = params.get("brinde"); // atalho de preview

    // Preview forçado: mostra o brinde pedido, sem marcar visto.
    if (override === "bone" || override === "pincel") {
      persistOnClose.current = false;
      setPick(override);
      setOpen(true);
      return;
    }

    // Fluxo real: só mostra se há brinde e ainda não foi visto.
    if (!brinde || brinde.visto) return;
    persistOnClose.current = true;
    setPick(brinde.tipo);
    setOpen(true);
  }, [params, brinde]);

  // Entrada animada (deixa a home pintar antes).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => setShown(true), 450);
    return () => clearTimeout(t);
  }, [open]);

  // Trava o scroll de fundo enquanto o modal está aberto (belt-and-suspenders):
  // sem rolar/rubber-bandar o .pintor-scroll, nada desloca a bottom-nav no iPhone
  // e o fundo não rola atrás do modal. overflow:hidden no scroller interno não
  // zera o scrollTop → sem salto ao abrir/fechar. Restaura o valor ao fechar.
  useEffect(() => {
    if (!open) return;
    const scrollEl = document.querySelector<HTMLElement>(".pintor-scroll");
    if (!scrollEl) return;
    const prev = scrollEl.style.overflow;
    scrollEl.style.overflow = "hidden";
    return () => {
      scrollEl.style.overflow = prev;
    };
  }, [open]);

  // Carimba "já viu" no banco. void: não trava a animação esperando a rede;
  // se falhar, o pior caso é o modal reaparecer no próximo carregamento.
  async function marcarVisto() {
    const supabase = createClient();
    await supabase.rpc("marcar_brinde_visto");
    // reSemeia o payload do layout (ponto único de fetch) → brinde.visto vira
    // true na sessão. Sem isso o layout fica congelado e o modal reabre ao
    // remontar o /home na navegação interna. Mesmo padrão de marcar_notif_visto.
    router.refresh();
  }

  function close() {
    if (persistOnClose.current) void marcarVisto();
    setShown(false);
    setTimeout(() => setOpen(false), 380); // espera a saída animar
  }

  function irParaLoja() {
    if (persistOnClose.current) void marcarVisto();
    router.push("/loja");
  }

  if (!open || !pick || !frameEl) return null;
  const brindeInfo = BRINDES[pick];

  return createPortal(
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
          className="tap"
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
            background: brindeInfo.bg,
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
            src={brindeInfo.img}
            alt={brindeInfo.name}
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
          {brindeInfo.name}
        </div>
        <div
          style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 18 }}
        >
          {brindeInfo.tag}
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
    </div>,
    frameEl,
  );
}
