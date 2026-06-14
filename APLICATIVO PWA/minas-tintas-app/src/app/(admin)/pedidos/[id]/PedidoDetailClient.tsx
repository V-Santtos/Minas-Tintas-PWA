"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  X,
  Check,
  RotateCcw,
  CreditCard,
  NotebookPen,
} from "lucide-react";
import { brl, type Order } from "@/lib/mock";

const STATUS_CFG: Record<string, { bg: string; fg: string }> = {
  pendente: { bg: "#F6ECDB", fg: "#E07A10" },
  aprovado: { bg: "#E8EFE3", fg: "#4F7A4A" },
  recusado: { bg: "#FCEAEA", fg: "#CC0000" },
  estornado: { bg: "#F2EDE4", fg: "#8A817A" },
  rascunho: { bg: "#F2EDE4", fg: "#8A817A" },
  cancelado: { bg: "#F2EDE4", fg: "#8A817A" },
};

const MANUAL_ORDERS_KEY = "minas-tintas:manual-orders";

function getTimeline(o: Order) {
  const base = [
    {
      t: "12 mar · 14:32",
      l: "Orçamento criado pelo pintor",
      done: true,
      dot: "#4F7A4A",
    },
    {
      t: "12 mar · 16:08",
      l: "Orçamento em análise",
      done: true,
      dot: "#4F7A4A",
    },
  ];
  if (o.status === "pendente") {
    return [
      ...base,
      { t: "agora", l: "Aguardando aprovação", done: false, dot: "#E07A10" },
    ];
  }
  if (o.status === "aprovado") {
    return [
      ...base,
      {
        t: `${o.date} · 18:45`,
        l: "Pedido aprovado · bônus creditado",
        done: true,
        dot: "#4F7A4A",
      },
    ];
  }
  if (o.status === "recusado") {
    return [
      ...base,
      {
        t: `${o.date} · 09:30`,
        l: "Pedido recusado",
        done: true,
        dot: "var(--brand)",
      },
    ];
  }
  // estornado
  return [
    ...base,
    {
      t: `${o.date} · 18:45`,
      l: "Pedido aprovado · bônus creditado",
      done: true,
      dot: "#4F7A4A",
    },
    {
      t: `${o.date} · 20:12`,
      l: "Pedido estornado · bônus revertido",
      done: true,
      dot: "var(--muted)",
    },
  ];
}

export default function PedidoDetailClient({
  order: serverOrder,
  id,
}: {
  order: Order | null;
  id: string;
}) {
  const [manualOrders, setManualOrders] = useState<Order[]>([]);
  const [estornoOpen, setEstornoOpen] = useState(false);
  const [estornoMotivo, setEstornoMotivo] = useState("");
  const [estornoError, setEstornoError] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(MANUAL_ORDERS_KEY);
      setManualOrders(stored ? (JSON.parse(stored) as Order[]) : []);
    } catch {
      setManualOrders([]);
    }
  }, []);

  const o = serverOrder ?? manualOrders.find((x) => x.id === id) ?? null;
  if (!o) {
    return (
      <div style={{ padding: "48px 32px", color: "var(--muted)" }}>
        <Link
          href="/pedidos"
          style={{
            color: "var(--muted)",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          ← Pedidos
        </Link>
        <p style={{ marginTop: 16, fontSize: 15 }}>
          Pedido #{id} não encontrado. Pedidos criados na pré-visualização ainda
          não são salvos no sistema.
        </p>
      </div>
    );
  }
  const items = o.items ?? [];
  const bonusPts = o.bonusPts ?? 0;
  const s = STATUS_CFG[o.status] || STATUS_CFG.estornado;
  const timeline = getTimeline(o);

  function openEstorno() {
    setEstornoMotivo("");
    setEstornoError(false);
    setEstornoOpen(true);
  }

  function confirmEstorno() {
    if (!estornoMotivo.trim()) {
      setEstornoError(true);
      return;
    }
    setEstornoOpen(false);
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          padding: "24px 32px 18px",
          borderBottom: "1px solid var(--line)",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <Link
            href="/pedidos"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--muted)",
              marginBottom: 12,
              textDecoration: "none",
              transition: "color .12s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "var(--ink)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "var(--muted)")}
          >
            <ArrowLeft size={14} strokeWidth={2} /> Pedidos
          </Link>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 8,
            }}
          >
            PEDIDO #{o.id} · {o.date}
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 28,
              letterSpacing: "-0.03em",
              color: "var(--ink)",
              lineHeight: 1.05,
            }}
          >
            {o.title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 10,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--success)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: ".1em",
                color: "var(--muted)",
              }}
            >
              Pintor vinculado
            </span>
            <strong
              style={{ color: "var(--ink)", fontWeight: 700, fontSize: 14.5 }}
            >
              {o.painter}
            </strong>
            <span style={{ color: "var(--muted)" }}>· {o.location}</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => window.print()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 14px",
              borderRadius: 10,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
              background: "var(--card)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
              cursor: "pointer",
            }}
          >
            <Printer size={14} strokeWidth={2} /> Imprimir
          </button>
          {o.status === "pendente" ? (
            <>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 13,
                  background: "var(--card)",
                  color: "var(--ink-2)",
                  border: "1px solid var(--line)",
                  cursor: "pointer",
                }}
              >
                <X size={14} strokeWidth={2.5} /> Recusar
              </button>
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 14px",
                  borderRadius: 10,
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 13,
                  background: "#4F7A4A",
                  color: "#fff",
                  border: "1px solid transparent",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(79,122,74,.28)",
                }}
              >
                <Check size={14} strokeWidth={2.5} /> Aprovar pedido
              </button>
            </>
          ) : o.status === "aprovado" ? (
            <button
              onClick={openEstorno}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 14px",
                borderRadius: 10,
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 13,
                background: "var(--card)",
                color: "var(--brand)",
                border: "1px solid rgba(204,0,0,.28)",
                cursor: "pointer",
              }}
            >
              <RotateCcw size={14} strokeWidth={2} color="var(--muted)" />{" "}
              Estornar
            </button>
          ) : null}
        </div>
      </div>

      {/* Modal de estorno */}
      {estornoOpen && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEstornoOpen(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(28,26,23,.38)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              boxShadow: "0 18px 50px rgba(28,26,23,.22)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "18px 22px 14px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--ink)",
                }}
              >
                Confirmar estorno
              </span>
              <button
                onClick={() => setEstornoOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
            <div style={{ padding: "18px 22px", display: "grid", gap: 14 }}>
              <p
                style={{
                  fontSize: 13.5,
                  color: "var(--muted)",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                O estorno cancela o pedido e reverte o bônus creditado ao
                pintor. Essa ação não pode ser desfeita.
              </p>
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                }}
              >
                Motivo do estorno{" "}
                <span style={{ color: "var(--brand)" }}>*</span>
                <textarea
                  value={estornoMotivo}
                  onChange={(e) => {
                    setEstornoMotivo(e.target.value);
                    setEstornoError(false);
                  }}
                  placeholder="Descreva o motivo: pagamento recusado, produto devolvido, erro no pedido…"
                  rows={3}
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${estornoError ? "var(--brand)" : "var(--line)"}`,
                    background: "var(--card)",
                    padding: 12,
                    resize: "vertical",
                    fontFamily: "var(--font-body)",
                    color: "var(--ink)",
                    outline: "none",
                    minHeight: 80,
                    lineHeight: 1.5,
                  }}
                />
                {estornoError && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--brand)",
                      fontWeight: 500,
                    }}
                  >
                    Informe o motivo antes de confirmar.
                  </span>
                )}
              </label>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                padding: "14px 22px 18px",
                borderTop: "1px solid var(--line)",
                background: "var(--paper)",
              }}
            >
              <button
                onClick={() => setEstornoOpen(false)}
                style={{
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  color: "var(--ink-2)",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmEstorno}
                style={{
                  height: 38,
                  padding: "0 15px",
                  borderRadius: 10,
                  border: "1px solid var(--brand)",
                  background: "var(--brand)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                }}
              >
                <RotateCcw size={14} strokeWidth={2} /> Confirmar estorno
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 18,
          padding: "20px 32px 32px",
        }}
      >
        {/* Receipt card */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 18,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              Itens do orçamento
            </h2>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "3px 9px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                background: s.bg,
                color: s.fg,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: s.fg,
                }}
              />
              {o.status}
            </span>
          </div>

          {items.map((it, i) => (
            <div
              key={it.name}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 72px 110px 120px",
                gap: 16,
                alignItems: "center",
                padding: "12px 0",
                borderBottom:
                  i === items.length - 1
                    ? "none"
                    : "1px dashed var(--line-strong)",
                fontSize: 13.5,
                color: "var(--ink-2)",
              }}
            >
              <div style={{ color: "var(--ink)" }}>{it.name}</div>
              <div
                style={{
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {it.qty} un.
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                R$ {brl(it.unit)}
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                R$ {brl(it.qty * it.unit)}
              </div>
            </div>
          ))}

          {/* Total */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid var(--line)",
            }}
          >
            <span
              style={{
                fontSize: 13,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                fontWeight: 600,
              }}
            >
              TOTAL
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 34,
                color: "var(--ink)",
                letterSpacing: "-0.03em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              R$ {brl(o.total)}
            </span>
          </div>

          {/* Pagamento */}
          {o.payment && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                marginTop: 12,
                paddingTop: 12,
                borderTop: "1px solid var(--line)",
                fontSize: 12.5,
                color: "var(--muted)",
              }}
            >
              <CreditCard size={14} strokeWidth={1.75} />
              Pagamento informado:{" "}
              <strong style={{ color: "var(--ink-2)" }}>{o.payment}</strong>
            </div>
          )}

          {/* Anotação interna */}
          {o.notes && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 7,
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid var(--line)",
                fontSize: 12.5,
                color: "var(--muted)",
              }}
            >
              <NotebookPen
                size={14}
                strokeWidth={1.75}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <span>
                <span style={{ fontWeight: 600, color: "var(--ink-2)" }}>
                  Anotação interna
                </span>
                <br />
                <span style={{ lineHeight: 1.55 }}>{o.notes}</span>
              </span>
            </div>
          )}

          {/* Motivo do estorno */}
          {o.estornoMotivo && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 7,
                marginTop: 8,
                paddingTop: 8,
                borderTop: "1px solid var(--line)",
                fontSize: 12.5,
                color: "var(--brand)",
              }}
            >
              <RotateCcw
                size={14}
                strokeWidth={1.75}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <span>
                <span style={{ fontWeight: 600 }}>Motivo do estorno</span>
                <br />
                <span style={{ lineHeight: 1.55, color: "var(--muted)" }}>
                  {o.estornoMotivo}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Side column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Bônus */}
          {(() => {
            const bonusCfg = {
              rascunho: {
                label: "BÔNUS A CREDITAR",
                color: "var(--muted)",
                valueColor: "var(--ink)",
                desc: "Orçamento ainda em rascunho.",
              },
              pendente: {
                label: "BÔNUS A CREDITAR",
                color: "var(--muted)",
                valueColor: "var(--ink)",
                desc: "Creditado ao pintor na aprovação.",
              },
              aprovado: {
                label: "BÔNUS CREDITADO ✓",
                color: "#4F7A4A",
                valueColor: "#4F7A4A",
                desc: null,
              },
              recusado: {
                label: "BÔNUS NÃO CREDITADO",
                color: "var(--muted)",
                valueColor: "var(--muted)",
                desc: "Pedido recusado — nenhum bônus foi gerado.",
              },
              cancelado: {
                label: "BÔNUS NÃO CREDITADO",
                color: "var(--muted)",
                valueColor: "var(--muted)",
                desc: "Pedido cancelado — nenhum bônus em vigor.",
              },
              estornado: {
                label: "BÔNUS REVERTIDO",
                color: "var(--muted)",
                valueColor: "var(--muted)",
                desc: "Bônus creditado e revertido no estorno.",
              },
            };
            const cfg = bonusCfg[o.status] || bonusCfg.estornado;
            return (
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 16,
                  padding: "20px 24px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                  }}
                >
                  {cfg.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 44,
                    color: cfg.color,
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    marginTop: 6,
                  }}
                >
                  {bonusPts.toLocaleString("pt-BR")}
                  <small
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--muted)",
                      marginLeft: 4,
                      letterSpacing: 0,
                    }}
                  >
                    pts
                  </small>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 6,
                    flexWrap: "wrap",
                  }}
                >
                  <span>R$ {brl(o.total)}</span>
                  <span>×</span>
                  <span>10%</span>
                  <span>=</span>
                  <span style={{ fontWeight: 600, color: cfg.valueColor }}>
                    {bonusPts.toLocaleString("pt-BR")} pts
                  </span>
                </div>
                {cfg.desc && (
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--muted)",
                      lineHeight: 1.5,
                      marginTop: 10,
                    }}
                  >
                    {cfg.desc}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Timeline */}
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 10,
              }}
            >
              LINHA DO TEMPO
            </div>
            {timeline.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "22px 1fr",
                  gap: 12,
                  paddingBottom: i < timeline.length - 1 ? 12 : 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    paddingTop: 4,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: step.dot,
                    }}
                  />
                  {i < timeline.length - 1 && (
                    <span
                      style={{
                        width: 1,
                        flex: 1,
                        background: "var(--line-strong)",
                        marginTop: 2,
                      }}
                    />
                  )}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--ink)",
                      fontWeight: step.done ? 500 : 600,
                    }}
                  >
                    {step.l}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    {step.t}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
