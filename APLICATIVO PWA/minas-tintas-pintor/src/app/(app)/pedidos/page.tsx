"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { ORDERS, brl, type OrderStatus } from "@/lib/pintor-data";

type Filter = "todos" | OrderStatus;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "aprovado", label: "Aprovados" },
  { key: "pendente", label: "Pendentes" },
  { key: "rascunho", label: "Rascunho" },
];

const STATUS_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  aprovado: { bg: "var(--success-tint)", color: "var(--success)" },
  pendente: { bg: "var(--warning-tint)", color: "var(--warning)" },
  rascunho: { bg: "var(--info-tint)", color: "var(--info)" },
};

export default function PedidosPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("todos");

  const visible = ORDERS.filter((o) => filter === "todos" || o.status === filter);
  const eyebrow =
    filter === "todos"
      ? "13 PEDIDOS · FEV–MAR 2026"
      : `${visible.length} PEDIDO${visible.length !== 1 ? "S" : ""} · ${FILTERS.find((f) => f.key === filter)!.label.toUpperCase()}`;

  return (
    <>
      <div className="topbar">
        <div className="eyebrow-label">{eyebrow}</div>
        <div className="page-title">Meus pedidos</div>
      </div>

      <div className="pill-row">
        {FILTERS.map((f) => (
          <span
            key={f.key}
            className={`pill${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </span>
        ))}
      </div>

      <div className="card" style={{ margin: "12px 16px 24px", overflow: "hidden" }}>
        {visible.map((o) => {
          const st = STATUS_STYLE[o.status];
          return (
            <button key={o.id} className="order-row" onClick={() => router.push(`/pedidos/${o.id}`)}>
              <div>
                <div className="order-name">{o.name}</div>
                <div className="order-meta">
                  <span>#{o.id}</span>
                  <span className="meta-sep" />
                  <span>{o.date.replace(" 2026", "")}</span>
                </div>
                {o.status === "aprovado" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                    <span className="status-pill" style={{ background: st.bg, color: st.color }}>
                      <span className="status-dot" style={{ background: st.color }} />
                      {o.status}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "var(--success)" }}>✓ {o.pts} pts</span>
                  </div>
                ) : (
                  <span className="status-pill" style={{ marginTop: 5, background: st.bg, color: st.color }}>
                    <span className="status-dot" style={{ background: st.color }} />
                    {o.status}
                  </span>
                )}
              </div>
              <div className="order-amount">R$ {brl(o.amount)}</div>
              <ChevronRight size={16} strokeWidth={1.75} color="var(--muted)" style={{ marginTop: 2 }} />
            </button>
          );
        })}
      </div>
    </>
  );
}


