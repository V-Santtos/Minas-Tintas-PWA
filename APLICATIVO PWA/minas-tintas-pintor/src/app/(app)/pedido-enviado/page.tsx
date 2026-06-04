"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import { usePintor } from "@/lib/pintor-store";
import { brl } from "@/lib/pintor-data";

export default function PedidoEnviadoPage() {
  const router = useRouter();
  const { lastSubmitted, clearCart } = usePintor();

  useEffect(() => {
    if (!lastSubmitted) router.replace("/orcamento");
  }, [lastSubmitted, router]);

  if (!lastSubmitted) return null;

  const o = lastSubmitted;
  const qty = o.items.reduce((s, it) => s + it.qty, 0);
  const visible = o.items.slice(0, 3);
  const hidden = Math.max(o.items.length - visible.length, 0);

  function novoOrcamento() {
    clearCart();
    router.push("/orcamento");
  }

  return (
    <div style={{ padding: "34px 20px 90px", display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 78px)" }}>
      <div style={{ marginTop: 18, width: 58, height: 58, borderRadius: 18, background: "var(--success-tint)", border: "1px solid #C6DCC0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Check size={30} strokeWidth={2.4} color="var(--success)" />
      </div>
      <div className="eyebrow-label" style={{ marginTop: 22 }}>PEDIDO ENVIADO</div>
      <div className="page-title" style={{ fontSize: 30 }}>Orçamento enviado para a loja.</div>
      <div style={{ fontSize: 13.5, color: "var(--muted)", lineHeight: 1.55, marginTop: 10 }}>Agora ele fica disponível para a administração validar o pagamento.</div>

      <div className="card" style={{ marginTop: 22, padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
          <div>
            <div className="eyebrow-label" style={{ marginBottom: 3 }}>PEDIDO #{o.id}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{o.clientName}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>Pagamento informado: {o.payment}</div>
          </div>
          <span className="status-pill" style={{ background: "var(--warning-tint)", color: "var(--warning)", flexShrink: 0 }}>
            <span className="status-dot" style={{ background: "var(--warning)" }} />pendente
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 14, alignItems: "start", borderTop: "1px dashed var(--line-strong)", marginTop: 14, paddingTop: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{qty} {qty === 1 ? "item" : "itens"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 7 }}>
              {visible.map((it, i) => (
                <div key={i} style={{ fontSize: 12.5, color: "var(--ink)", fontWeight: 600, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <span style={{ fontVariantNumeric: "tabular-nums", color: "var(--muted)", fontWeight: 700 }}>{it.qty}×</span> {it.name}
                </div>
              ))}
              {hidden > 0 && (
                <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>+{hidden} {hidden === 1 ? "item" : "itens"} no pedido</div>
              )}
            </div>
          </div>
          <span className="pf-num" style={{ fontSize: 24, color: "var(--ink)", whiteSpace: "nowrap" }}>R$ {brl(o.total)}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: "auto" }}>
        <button className="btn btn-full" style={{ background: "var(--ink)", color: "var(--paper)" }} onClick={() => router.push(`/pedidos/${o.id}`)}>
          Ver pedido
          <ArrowRight size={16} strokeWidth={2} color="var(--paper)" />
        </button>
        <button className="btn btn-ghost btn-full" onClick={novoOrcamento}>Criar novo orçamento</button>
      </div>
    </div>
  );
}


