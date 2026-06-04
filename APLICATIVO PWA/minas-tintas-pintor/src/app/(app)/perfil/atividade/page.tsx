"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { PERIOD_DATA, YEAR_DATA, ANOS_INICIO, CLIENTES_VINCULADOS, ptsFmt } from "@/lib/pintor-data";

type Period = "semana" | "mes" | "ano";

const YEARS = Object.keys(YEAR_DATA).map(Number).sort((a, b) => b - a);

export default function AtividadePage() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("semana");
  const [year, setYear] = useState<number>(YEARS[0] ?? ANOS_INICIO - 1);

  const series = period === "ano" ? YEAR_DATA[year] : PERIOD_DATA[period];
  const label = period === "ano" ? String(year) : PERIOD_DATA[period].label;
  const { delta, labels, pedidos, pontos, stats } = series;

  const pedidosData = labels.map((l, i) => ({ name: l, v: pedidos[i] }));
  const pontosData = labels.map((l, i) => ({ name: l, v: pontos[i] }));

  return (
    <>
      <div className="topbar" style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingBottom: 16 }}>
        <button className="icon-back-btn" onClick={() => router.push("/perfil")}>
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div className="page-title" style={{ fontSize: 18 }}>Minha atividade</div>
      </div>

      {/* Seletor de período */}
      <div style={{ padding: "0 16px 8px", display: "flex", gap: 6 }}>
        {(["semana", "mes", "ano"] as Period[]).map((p) => (
          <button key={p} className={`period-btn${period === p ? " active" : ""}`} onClick={() => setPeriod(p)}>
            {p === "semana" ? "Semana" : p === "mes" ? "Mês" : "Ano"}
          </button>
        ))}
      </div>

      {period === "ano" && (
        <div style={{ padding: "0 16px 10px", display: "flex", gap: 6, overflowX: "auto" }}>
          {YEARS.map((y) => (
            <button key={y} className={`period-btn${year === y ? " active" : ""}`} onClick={() => setYear(y)}>{y}</button>
          ))}
        </div>
      )}

      {/* Stat tiles */}
      <div className="card" style={{ margin: "0 16px 12px", padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="eyebrow-label">{label}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: delta.up ? "var(--success)" : "var(--warning)" }}>
            {(delta.up ? "↑ " : "↓ ") + delta.text}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{stats.pedidos}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>pedidos</div>
          </div>
          <div style={{ borderLeft: "1px solid var(--line)", borderRight: "1px solid var(--line)", padding: "0 14px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{ptsFmt(stats.pontosGanhos)}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/dollar-coin.svg" style={{ width: 13, height: 13, marginBottom: 2 }} alt="pts" />
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>pts ganhos</div>
          </div>
          <div style={{ paddingLeft: 14 }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1 }}>{CLIENTES_VINCULADOS}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>vinculados</div>
          </div>
        </div>
      </div>

      {/* Gráfico: Pedidos */}
      <div className="card" style={{ margin: "0 16px 12px", padding: "14px 16px" }}>
        <div className="eyebrow-label" style={{ marginBottom: 14 }}>PEDIDOS GERADOS</div>
        <div style={{ height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pedidosData} margin={{ top: 18, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E7E0D4" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontFamily: "Inter", fontSize: 10, fill: "#8A817A" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontFamily: "Inter", fontSize: 10, fill: "#8A817A" }} allowDecimals={false} width={28} />
              <Tooltip cursor={{ fill: "rgba(28,26,23,0.04)" }} contentStyle={{ background: "#1C1A17", border: "none", borderRadius: 6, padding: 8, fontSize: 11, fontFamily: "Inter", color: "#fff" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#fff" }} />
              <Bar dataKey="v" fill="#CC0000" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="v" position="top" formatter={(label) => (typeof label === "number" && label > 0 ? label : "")} style={{ fontFamily: "Inter", fontSize: 10, fontWeight: 600, fill: "#1C1A17" }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico: Pontos */}
      <div className="card" style={{ margin: "0 16px 12px", padding: "14px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="eyebrow-label">PONTOS GANHOS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500 }}>{ptsFmt(stats.resgatados)} resgatados</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/dollar-coin.svg" style={{ width: 11, height: 11 }} alt="pts" />
          </div>
        </div>
        <div style={{ height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pontosData} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#E7E0D4" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontFamily: "Inter", fontSize: 10, fill: "#8A817A" }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontFamily: "Inter", fontSize: 10, fill: "#8A817A" }} width={36} />
              <Tooltip cursor={{ fill: "rgba(28,26,23,0.04)" }} contentStyle={{ background: "#1C1A17", border: "none", borderRadius: 6, padding: 8, fontSize: 11, fontFamily: "Inter", color: "#fff" }} labelStyle={{ color: "#fff" }} itemStyle={{ color: "#fff" }} formatter={(value) => [`${ptsFmt(Number(value))} pts`, ""]} />
              <Bar dataKey="v" fill="#C49A28" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Clientes vinculados */}
      <div className="card" style={{ margin: "0 16px 100px", padding: "14px 16px", background: "var(--success-tint)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="eyebrow-label" style={{ marginBottom: 6, color: "var(--success)" }}>CLIENTES VINCULADOS</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--success)", lineHeight: 1 }}>{CLIENTES_VINCULADOS}</span>
            <span style={{ fontSize: 13, color: "var(--success)", fontWeight: 500 }}>clientes</span>
          </div>
        </div>
        <Users size={28} strokeWidth={1.5} color="var(--success)" style={{ flexShrink: 0 }} />
      </div>
    </>
  );
}


