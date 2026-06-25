"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { ptsFmt } from "@/lib/pintor-data";
import { usePintor } from "@/lib/pintor-store";

export default function AtividadePage() {
  const router = useRouter();
  const { saldo, data } = usePintor();
  const atividade = data.atividade;
  const vinculados = data.clientes.length;

  return (
    <>
      <div
        className="topbar"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingBottom: 16,
        }}
      >
        <button
          className="icon-back-btn"
          onClick={() => router.push("/perfil")}
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div className="page-title" style={{ fontSize: 18 }}>
          Minha atividade
        </div>
      </div>

      {/* Resumo: saldo + clientes vinculados */}
      <div
        className="card"
        style={{ margin: "0 16px 12px", padding: "14px 16px" }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}
        >
          <div>
            <div className="eyebrow-label" style={{ marginBottom: 6 }}>
              SALDO ATUAL
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--ink)",
                  lineHeight: 1,
                }}
              >
                {ptsFmt(saldo)}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/dollar-coin.svg"
                style={{ width: 13, height: 13 }}
                alt="pts"
              />
            </div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", paddingLeft: 14 }}>
            <div className="eyebrow-label" style={{ marginBottom: 6 }}>
              CLIENTES
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--ink)",
                  lineHeight: 1,
                }}
              >
                {vinculados}
              </span>
              <Users size={16} strokeWidth={1.75} color="var(--muted)" />
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de pontos (ledger) */}
      <div
        className="card"
        style={{
          margin: "0 16px 100px",
          padding: "4px 16px 6px",
          overflow: "hidden",
        }}
      >
        <div className="eyebrow-label" style={{ padding: "12px 0 4px" }}>
          HISTÓRICO DE PONTOS
        </div>

        {atividade.length === 0 ? (
          <div
            style={{
              padding: "18px 0 22px",
              fontSize: 13,
              color: "var(--muted)",
              textAlign: "center",
            }}
          >
            Nenhum lançamento de pontos ainda.
          </div>
        ) : (
          atividade.map((a, i) => (
            <div
              key={a.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "13px 0",
                borderBottom:
                  i < atividade.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "var(--ink)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {a.label}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--muted)",
                    marginTop: 2,
                  }}
                >
                  {a.date}
                </div>
              </div>
              <div
                style={{
                  flexShrink: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: 15,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: a.kind === "in" ? "var(--success)" : "#CC0000",
                }}
              >
                {a.kind === "in" ? "+" : "−"}
                {ptsFmt(Math.abs(a.pts))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
