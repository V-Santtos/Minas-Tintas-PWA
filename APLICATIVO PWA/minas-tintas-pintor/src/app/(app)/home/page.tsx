"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ArrowUpRight, FilePlus2, Store, ChevronRight, Layers, Box, Shield, Package } from "lucide-react";
import { usePintor } from "@/lib/pintor-store";

const QUICK_ICONS: Record<string, typeof Package> = { layers: Layers, box: Box, shield: Shield };
import {
  PAINTER_PROFILE,
  ORDERS,
  RESGATE_PRODUCTS,
  ptsFmt,
  brl,
} from "@/lib/pintor-data";

const RECENT_IDS = ["0481", "0480", "0479"];

export default function HomePage() {
  const router = useRouter();
  const { saldo } = usePintor();
  const resgateState: "low" | "high" = saldo >= 1200 ? "high" : "low";

  const recent = RECENT_IDS.map((id) => ORDERS.find((o) => o.id === id)!).filter(Boolean);
  const quickRewards = RESGATE_PRODUCTS[resgateState];

  return (
    <>
      {/* Topbar */}
      <div className="topbar" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div className="eyebrow-label">OLÁ, {PAINTER_PROFILE.firstName.toUpperCase()}</div>
          <div className="page-title">Bom trabalho hoje.</div>
        </div>
        <Link
          href="/notificacoes"
          style={{
            position: "relative",
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 999,
            width: 40,
            height: 40,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            marginTop: 18,
          }}
        >
          <Bell size={18} strokeWidth={1.75} color="var(--ink)" />
          <span style={{ position: "absolute", right: 9, top: 9, width: 7, height: 7, borderRadius: "50%", background: "var(--brand)", boxShadow: "0 0 0 2px var(--card)" }} />
        </Link>
      </div>

      {/* Balance hero */}
      <div style={{ margin: "0 16px 14px", background: "var(--card)", border: "1px solid var(--line)", borderRadius: 24, padding: "20px 22px 18px", boxShadow: "0 2px 6px rgba(28,26,23,.05)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span className="eyebrow-label" style={{ margin: 0 }}>SALDO MINAS TINTAS</span>
          <div style={{ width: 30, height: 30, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/dollar-coin.svg" style={{ width: 26, height: 26 }} alt="pontos" />
          </div>
        </div>
        <div className="pf-num" style={{ fontSize: 54, lineHeight: 0.95, color: "var(--ink)", marginTop: 6 }}>
          {ptsFmt(saldo)}
          <small style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15, color: "var(--muted)", marginLeft: 6, letterSpacing: 0 }}>pts</small>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, fontSize: 12.5, fontWeight: 600, color: "var(--success)" }}>
          <ArrowUpRight size={13} strokeWidth={2.5} color="var(--success)" />
          +184 pts nas últimas 24 h
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--line-strong)", display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
          <span style={{ color: "var(--muted)" }}>A liberar</span>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--ink)", fontWeight: 700, fontVariantNumeric: "tabular-nums", fontSize: 15 }}>~42 pts</div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ padding: "0 16px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Link href="/orcamento" style={{ background: "var(--ink)", color: "var(--paper)", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, fontSize: 13.5, fontWeight: 600 }}>
          <FilePlus2 size={20} strokeWidth={1.75} color="var(--paper)" />
          Criar orçamento
        </Link>
        <Link href="/loja" style={{ background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)", borderRadius: 14, padding: 14, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, fontSize: 13.5, fontWeight: 600 }}>
          <Store size={20} strokeWidth={1.75} color="var(--ink)" />
          Ir à lojinha
        </Link>
      </div>

      {/* Pedidos recentes */}
      <div className="section-head">
        <h2>Pedidos recentes</h2>
        <Link href="/pedidos" className="see-all">
          Ver todos <ChevronRight size={13} strokeWidth={2} />
        </Link>
      </div>
      <div className="card" style={{ margin: "0 16px 16px", overflow: "hidden" }}>
        {recent.map((o) => (
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
                  <span className="status-pill" style={{ background: "var(--success-tint)", color: "var(--success)" }}>
                    <span className="status-dot" style={{ background: "var(--success)" }} />
                    aprovado
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "var(--success)" }}>✓ {o.pts} pts</span>
                </div>
              ) : (
                <span className="status-pill" style={{ marginTop: 5, background: "var(--warning-tint)", color: "var(--warning)" }}>
                  <span className="status-dot" style={{ background: "var(--warning)" }} />
                  pendente
                </span>
              )}
            </div>
            <div className="order-amount">R$ {brl(o.amount)}</div>
            <ChevronRight size={16} strokeWidth={1.75} color="var(--muted)" style={{ marginTop: 2 }} />
          </button>
        ))}
      </div>

      {/* Disponíveis para resgate */}
      <div className="section-head">
        <h2>{resgateState === "low" ? "Perto do próximo resgate" : "Disponível para resgatar"}</h2>
      </div>
      <div style={{ display: "flex", overflowX: "auto", gap: 10, padding: "0 16px 24px", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
        {quickRewards.map((p, i) => (
          <Link key={i} href="/loja" className="reward-card" style={{ minWidth: 148, maxWidth: 148, flexShrink: 0 }}>
            {p.promo ? (
              <div style={{ position: "absolute", top: 8, right: 8, background: "var(--brand)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: ".04em" }}>PROMO</div>
            ) : p.near ? (
              <div style={{ position: "absolute", top: 8, right: 8, background: "var(--warning-tint)", color: "var(--warning)", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, letterSpacing: ".04em" }}>QUASE LÁ</div>
            ) : null}
            <div className="reward-thumb">
              {p.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.img} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 9 }} alt={p.name} />
              ) : (
                (() => {
                  const Ico = QUICK_ICONS[p.icon] ?? Package;
                  return <Ico size={28} strokeWidth={1.4} color="var(--muted)" />;
                })()
              )}
            </div>
            <div className="reward-name">{p.name}</div>
            <div className="reward-footer">
              <span className="pts-val">
                {ptsFmt(p.pts)}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 3, marginLeft: 2, verticalAlign: "middle" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/dollar-coin.svg" style={{ width: 14, height: 14 }} alt="pts" />
                  <span className="pts-unit">pts</span>
                </span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}


