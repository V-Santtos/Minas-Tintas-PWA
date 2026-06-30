"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Check,
  Package,
  Briefcase,
  Shirt,
  PaintRoller,
  Paintbrush,
  Tag,
} from "lucide-react";
import { usePintor } from "@/lib/pintor-store";
import { ptsFmt } from "@/lib/pintor-data";
import { resgatarItem } from "@/lib/resgate-actions";

const ICONS: Record<string, typeof Package> = {
  package: Package,
  briefcase: Briefcase,
  shirt: Shirt,
  "paint-roller": PaintRoller,
  paintbrush: Paintbrush,
  tag: Tag,
  wrench: Package,
};

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function ResgatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { saldo, data } = usePintor();

  const [qtd, setQtd] = useState(1);
  const [toastOpen, setToastOpen] = useState(false);
  const [sheetIn, setSheetIn] = useState(false);
  const [displayNum, setDisplayNum] = useState(0);
  const [erro, setErro] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      timers.forEach(clearTimeout);
    };
  }, []);

  const p = data.loja.find((x) => x.id === id);

  if (!p) {
    return (
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}>
          <ChevronLeft size={22} strokeWidth={2} /> Voltar
        </button>
        <div className="page-title" style={{ fontSize: 21 }}>
          Produto não encontrado
        </div>
      </div>
    );
  }

  const Ico = ICONS[p.icon] ?? Package;
  const item = p;
  const unitPts = p.pts; // a view ja da o custo POR UNIDADE
  const affordableQtd = unitPts > 0 ? Math.floor(saldo / unitPts) : 0;
  const maxQtd = Math.min(p.stock, affordableQtd); // 0 se nao paga nem 1
  const showStepper = !p.unico && !p.locked && maxQtd > 1;
  const qtdEfetiva = p.unico
    ? 1
    : Math.min(Math.max(1, qtd), Math.max(1, maxQtd));
  const totalPts = unitPts * qtdEfetiva;
  const jaResgatado = p.unico && p.jaResgatado;
  const cantRedeem = p.locked || jaResgatado || totalPts > saldo;

  function animateCounter(from: number, to: number, duration: number) {
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const val = Math.round(from + (to - from) * easeOut(t));
      setDisplayNum(val);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }

  async function confirmarResgate() {
    if (submitting) return;
    setErro("");
    setSubmitting(true);

    const res = await resgatarItem(item.id, qtdEfetiva);
    if (!res.ok) {
      setSubmitting(false);
      setErro(res.error);
      return;
    }

    const oldBalance = saldo;
    const newBalance = Math.max(0, saldo - totalPts);
    setDisplayNum(oldBalance);
    setToastOpen(true);

    requestAnimationFrame(() => requestAnimationFrame(() => setSheetIn(true)));

    timersRef.current.push(
      setTimeout(() => {
        animateCounter(oldBalance, newBalance, 1100);
      }, 480),
    );

    timersRef.current.push(
      setTimeout(() => {
        setSheetIn(false);
        timersRef.current.push(
          setTimeout(() => {
            setToastOpen(false);
            router.refresh(); // reSemeia saldo/pendentes do servidor
            router.push("/loja");
          }, 430),
        );
      }, 3600),
    );
  }

  const stockLabel =
    p.stock <= 1
      ? { text: "Último disponível em estoque", color: "#B5751F", weight: 700 }
      : p.stock <= 2
        ? {
            text: `${p.stock} restantes em estoque`,
            color: "#B5751F",
            weight: 600,
          }
        : {
            text: `${p.stock} disponíveis em estoque`,
            color: "var(--muted)",
            weight: 500,
          };

  return (
    <>
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}>
          <ChevronLeft size={22} strokeWidth={2} /> Voltar
        </button>
        <div className="eyebrow-label">RESGATE</div>
        <div className="page-title" style={{ fontSize: 21 }}>
          {p.name}
        </div>
      </div>

      <div
        className="card"
        style={{
          margin: "0 16px 14px",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0,
          borderRadius: 20,
        }}
      >
        <div
          style={{
            width: 200,
            height: 170,
            borderRadius: 16,
            background: "var(--paper-deep)",
            border: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--muted)",
            overflow: "hidden",
            marginBottom: 18,
          }}
        >
          {p.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.img}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `${p.imgPos?.x ?? 50}% ${p.imgPos?.y ?? 50}%`,
              }}
              alt={p.name}
            />
          ) : (
            <Ico size={72} strokeWidth={1.1} color="var(--muted)" />
          )}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--muted)",
            lineHeight: 1.6,
            textAlign: "center",
            maxWidth: 260,
            marginBottom: 16,
          }}
        >
          {p.desc}
        </div>
        <div
          style={{
            width: "100%",
            height: 1,
            background: "var(--line)",
            marginBottom: 16,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Package
            size={15}
            strokeWidth={1.8}
            color="var(--muted)"
            style={{ flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: stockLabel.weight,
              color: stockLabel.color,
            }}
          >
            {stockLabel.text}
          </span>
        </div>
      </div>

      <div
        style={{
          padding: "0 16px 80px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {p.unico && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderRadius: 12,
              background: "var(--paper-deep)",
              border: "1px solid var(--line)",
              fontSize: 12.5,
              color: "var(--muted)",
              lineHeight: 1.5,
            }}
          >
            <Tag
              size={14}
              strokeWidth={1.8}
              color="var(--muted)"
              style={{ flexShrink: 0 }}
            />
            {jaResgatado
              ? "Você já resgatou este item — é de resgate único por pintor."
              : "Resgate único: cada pintor pode resgatar este item uma vez."}
          </div>
        )}
        {showStepper && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: 14,
              border: "1px solid var(--line)",
              background: "var(--card)",
            }}
          >
            <span
              style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}
            >
              Quantidade
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                onClick={() => setQtd((q) => Math.max(1, q - 1))}
                disabled={qtdEfetiva <= 1}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1.5px solid var(--line)",
                  background: "transparent",
                  fontSize: 20,
                  lineHeight: 1,
                  color: "var(--ink)",
                  opacity: qtdEfetiva <= 1 ? 0.4 : 1,
                  cursor: qtdEfetiva <= 1 ? "not-allowed" : "pointer",
                }}
              >
                −
              </button>
              <span
                style={{
                  fontFamily: "var(--font-jakarta)",
                  fontWeight: 800,
                  fontSize: 18,
                  minWidth: 24,
                  textAlign: "center",
                }}
              >
                {qtdEfetiva}
              </span>
              <button
                onClick={() => setQtd((q) => Math.min(maxQtd, q + 1))}
                disabled={qtdEfetiva >= maxQtd}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: "1.5px solid var(--line)",
                  background: "transparent",
                  fontSize: 20,
                  lineHeight: 1,
                  color: "var(--ink)",
                  opacity: qtdEfetiva >= maxQtd ? 0.4 : 1,
                  cursor: qtdEfetiva >= maxQtd ? "not-allowed" : "pointer",
                }}
              >
                +
              </button>
            </div>
          </div>
        )}
        <button
          className="btn btn-primary btn-full"
          onClick={confirmarResgate}
          disabled={cantRedeem || submitting}
          style={
            cantRedeem || submitting
              ? { opacity: 0.55, cursor: "not-allowed" }
              : undefined
          }
        >
          <Check size={16} strokeWidth={2.5} color="#fff" />
          <span>
            {p.locked
              ? "Indisponível"
              : jaResgatado
                ? "Já resgatado"
                : totalPts > saldo
                  ? `Faltam ${ptsFmt(totalPts - saldo)} pts`
                  : `Resgatar por ${ptsFmt(totalPts)} pts`}
          </span>
        </button>
        {erro && (
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#CC0000",
              textAlign: "center",
            }}
          >
            {erro}
          </div>
        )}
        <button
          className="btn btn-ghost btn-full"
          onClick={() => router.push("/loja")}
        >
          Voltar à lojinha
        </button>
      </div>

      {/* Toast de sucesso */}
      {toastOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            maxWidth: 480,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(28,26,23,0.45)",
              opacity: sheetIn ? 1 : 0,
              transition: "opacity 380ms",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "var(--card)",
              borderRadius: "28px 28px 0 0",
              padding: "24px 24px 44px",
              transform: sheetIn ? "translateY(0)" : "translateY(100%)",
              transition: "transform 420ms cubic-bezier(0.2,0.7,0.2,1)",
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: "var(--line)",
                margin: "0 auto 22px",
              }}
            />
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "#E8F5E9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <Check size={28} strokeWidth={2.5} color="#4F7A4A" />
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 20,
                color: "var(--ink)",
                textAlign: "center",
                marginBottom: 6,
              }}
            >
              Solicitação enviada!
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--muted)",
                textAlign: "center",
                lineHeight: 1.6,
                marginBottom: 22,
              }}
            >
              A loja vai entrar em contato pelo WhatsApp, ou aguarde para
              retirar pessoalmente.
            </div>
            <div
              style={{
                background: "var(--paper)",
                borderRadius: 16,
                padding: "18px 20px",
                textAlign: "center",
              }}
            >
              <div className="eyebrow-label" style={{ marginBottom: 6 }}>
                SEU SALDO ATUALIZADO
              </div>
              <div
                className="pf-num"
                style={{ fontSize: 44, color: "var(--ink)", lineHeight: 1 }}
              >
                {ptsFmt(displayNum)}
                <small
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: 14,
                    color: "var(--muted)",
                    marginLeft: 5,
                    letterSpacing: 0,
                  }}
                >
                  pts
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
