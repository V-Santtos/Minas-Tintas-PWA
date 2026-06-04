"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { usePintor } from "@/lib/pintor-store";
import {
  ORDERS_BY_ID,
  STATUS_CFG,
  DEFAULT_DETAIL_ITEMS,
  brl,
  ptsFmt,
  bonusPts,
  type Order,
} from "@/lib/pintor-data";

export default function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { lastSubmitted } = usePintor();

  let o: Order | undefined = ORDERS_BY_ID[id];
  if (!o && lastSubmitted && lastSubmitted.id === id) {
    o = {
      id: lastSubmitted.id,
      name: lastSubmitted.clientName,
      date: "18 mai 2026",
      status: "pendente",
      amount: lastSubmitted.total,
      items: lastSubmitted.items,
      payment: lastSubmitted.payment,
    };
  }

  if (!o) {
    return (
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}>
          <ChevronLeft size={22} strokeWidth={2} /> Voltar
        </button>
        <div className="page-title" style={{ fontSize: 22 }}>Pedido não encontrado</div>
      </div>
    );
  }

  const st = STATUS_CFG[o.status];
  const pts = bonusPts(o.amount);
  const items = o.items ?? DEFAULT_DETAIL_ITEMS;
  const isDraft = o.status === "rascunho";

  return (
    <>
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}>
          <ChevronLeft size={22} strokeWidth={2} /> Voltar
        </button>
        <div className="eyebrow-label">PEDIDO #{o.id}</div>
        <div className="page-title" style={{ fontSize: 22 }}>{o.name}</div>
      </div>

      <div style={{ padding: "0 20px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <span className="status-pill" style={{ background: st.bg, color: st.color }}>
          <span className="status-dot" style={{ background: st.color }} />
          {st.label}
        </span>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>Criado em {o.date}</span>
      </div>

      {/* Itens */}
      <div className="card" style={{ margin: "0 16px 14px", padding: "14px 16px" }}>
        {items.map((item, i) => {
          const lineTotal = item.qty * item.price;
          return (
            <div key={i} className="receipt-item">
              <div>
                <div style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500 }}>{item.name}</div>
                <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                  {item.qty} × R$ {brl(item.price)}
                </div>
              </div>
              <div style={{ fontWeight: 600, fontSize: 13.5, fontVariantNumeric: "tabular-nums" }}>
                R$ {brl(lineTotal)}
              </div>
            </div>
          );
        })}
        <div className="receipt-total">
          <span style={{ fontSize: 13, color: "var(--muted)" }}>Total</span>
          <span className="pf-num" style={{ fontSize: 22, color: "var(--ink)" }}>R$ {brl(o.amount)}</span>
        </div>
      </div>

      {/* Pagamento informado */}
      {o.payment && (
        <div className="card" style={{ margin: "0 16px 14px", padding: "14px 16px" }}>
          <div className="eyebrow-label" style={{ marginBottom: 5 }}>PAGAMENTO INFORMADO</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{o.payment}</div>
          {o.paymentNote && (
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 7, lineHeight: 1.5 }}>{o.paymentNote}</div>
          )}
        </div>
      )}

      {/* Bônus */}
      <div className="card" style={{ margin: "0 16px 14px", padding: "14px 16px" }}>
        <div className="eyebrow-label" style={{ marginBottom: 6 }}>{st.bonusLabel}</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div className="pf-num" style={{ fontSize: 32 }}>
            <span style={{ color: st.bonusColor }}>{ptsFmt(pts)}</span>
            <small style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "var(--muted)", marginLeft: 4, letterSpacing: 0 }}>pts</small>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10, lineHeight: 1.5 }}>{st.bonusText}</div>
      </div>

      {/* Ações de rascunho */}
      {isDraft && (
        <div style={{ padding: "0 16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          <button className="btn btn-full" style={{ background: "var(--ink)", color: "var(--paper)" }} onClick={() => router.push("/orcamento")}>
            <Pencil size={16} strokeWidth={2} color="var(--paper)" />
            Editar orçamento
          </button>
          <button
            onClick={() => { if (confirm("Excluir este rascunho? Esta ação não pode ser desfeita.")) router.back(); }}
            style={{ background: "transparent", border: 0, padding: 12, fontSize: 14, fontWeight: 600, color: "var(--brand)", cursor: "pointer", textAlign: "center" }}
          >
            Excluir rascunho
          </button>
        </div>
      )}
    </>
  );
}


