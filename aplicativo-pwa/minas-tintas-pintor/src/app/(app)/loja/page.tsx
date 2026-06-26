"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ArrowUpDown,
  Lock,
  Package,
  Briefcase,
  Shirt,
  PaintRoller,
  Paintbrush,
  Tag,
  Clock3,
  X,
} from "lucide-react";
import { usePintor } from "@/lib/pintor-store";
import { ptsFmt, type LojaProduct } from "@/lib/pintor-data";
import { cancelarResgate } from "@/lib/resgate-actions";

type Cat = "tudo" | "ferramentas" | "epi" | "brindes" | "camisetas";
type Sort = "available" | "promo" | "pts-asc" | "pts-desc";

const CAT_LABELS: Record<Cat, string> = {
  tudo: "Tudo",
  ferramentas: "Ferramentas",
  epi: "EPI",
  brindes: "Brindes",
  camisetas: "Camisetas",
};
const SORT_LABELS: Record<Sort, string> = {
  available: "Disponíveis",
  promo: "Promoções",
  "pts-asc": "Menor pts",
  "pts-desc": "Maior pts",
};
const ICONS: Record<string, typeof Package> = {
  package: Package,
  briefcase: Briefcase,
  shirt: Shirt,
  "paint-roller": PaintRoller,
  paintbrush: Paintbrush,
  tag: Tag,
  wrench: Package,
};

function sortProducts(
  list: LojaProduct[],
  sort: Sort,
  balance: number,
): LojaProduct[] {
  if (sort === "available") {
    return [
      ...list
        .filter((p) => !p.locked && !p.jaResgatado && p.pts <= balance)
        .sort((a, b) => a.pts - b.pts),
      ...list
        .filter((p) => !p.locked && (p.jaResgatado || p.pts > balance))
        .sort((a, b) => a.pts - b.pts),
      ...list.filter((p) => p.locked),
    ];
  }
  if (sort === "pts-asc") return [...list].sort((a, b) => a.pts - b.pts);
  if (sort === "pts-desc") return [...list].sort((a, b) => b.pts - a.pts);
  // promo
  return [
    ...list.filter((p) => p.promo),
    ...list.filter((p) => !p.promo && !p.locked),
    ...list.filter((p) => p.locked),
  ];
}

export default function LojaPage() {
  const router = useRouter();

  async function handleCancelar(resgateId: string) {
    const res = await cancelarResgate(resgateId);
    if (res.ok) router.refresh();
  }

  const { saldo, pendingRedemptions, data } = usePintor();
  const [cat, setCat] = useState<Cat>("tudo");
  const [sort, setSort] = useState<Sort>("available");
  const [openMenu, setOpenMenu] = useState<"cat" | "sort" | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpenMenu(null);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const filtered = data.loja.filter((p) => cat === "tudo" || p.cat === cat);
  const products = sortProducts(filtered, sort, saldo);

  const catActive = cat !== "tudo";
  const sortActive = sort !== "available";

  return (
    <div ref={rootRef}>
      <div className="topbar">
        <div className="eyebrow-label">LOJINHA · MARÇO</div>
        <div className="page-title">Troque seus pontos.</div>
      </div>

      {/* Saldo */}
      <div
        className="card"
        style={{
          margin: "0 16px 14px",
          padding: "12px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div className="eyebrow-label" style={{ marginBottom: 2 }}>
            SALDO DISPONÍVEL
          </div>
          <div className="pf-num" style={{ fontSize: 22, color: "var(--ink)" }}>
            {ptsFmt(saldo)}
            <small
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 12,
                fontWeight: 500,
                color: "var(--muted)",
                marginLeft: 4,
              }}
            >
              pts
            </small>
          </div>
        </div>
        <div
          style={{
            width: 30,
            height: 30,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/dollar-coin.svg"
            style={{ width: 26, height: 26 }}
            alt="pontos"
          />
        </div>
      </div>

      {pendingRedemptions.length > 0 && (
        <div
          className="card"
          style={{
            margin: "0 16px 14px",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div>
              <div className="eyebrow-label" style={{ marginBottom: 3 }}>
                RESGATES PENDENTES
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--muted)",
                  lineHeight: 1.35,
                }}
              >
                Aguardando retirada na loja.
              </div>
            </div>
            <span
              style={{
                minWidth: 22,
                height: 22,
                padding: "0 7px",
                borderRadius: 999,
                background: "var(--warning-tint)",
                color: "var(--warning)",
                fontSize: 11,
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {pendingRedemptions.length}
            </span>
          </div>
          {pendingRedemptions.map((item) => (
            <div
              key={item.id}
              style={{
                borderTop: "1px solid var(--line)",
                paddingTop: 10,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "var(--ink)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.itemName}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 4,
                    fontSize: 11.5,
                    color: "var(--muted)",
                  }}
                >
                  <Clock3 size={12} strokeWidth={1.8} color="var(--warning)" />
                  <span>{item.requestedAt}</span>
                  <span
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: 999,
                      background: "var(--muted)",
                    }}
                  />
                  <strong style={{ color: "var(--ink)", fontWeight: 700 }}>
                    {ptsFmt(item.pts)} pts
                  </strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCancelar(item.id)}
                style={{
                  border: "1px solid var(--line-strong)",
                  background: "transparent",
                  color: "var(--ink-2)",
                  borderRadius: 999,
                  padding: "7px 10px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                <X size={12} strokeWidth={2.2} />
                Cancelar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div style={{ padding: "0 16px 14px", display: "flex", gap: 8 }}>
        {/* Categoria */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setOpenMenu((m) => (m === "cat" ? null : "cat"))}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 13px",
              border: `1px solid ${catActive ? "var(--ink)" : "var(--line)"}`,
              borderRadius: 999,
              background: catActive ? "var(--ink)" : "var(--card)",
              fontSize: 12.5,
              fontWeight: 600,
              color: catActive ? "var(--paper)" : "var(--ink)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <span>{CAT_LABELS[cat]}</span>
            <ChevronDown
              size={12}
              color={catActive ? "rgba(255,255,255,.6)" : "var(--muted)"}
            />
          </button>
          {openMenu === "cat" && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                minWidth: 170,
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(28,26,23,.12)",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              {(Object.keys(CAT_LABELS) as Cat[]).map((c) => (
                <div
                  key={c}
                  className={`dd-option${cat === c ? " active" : ""}`}
                  onClick={() => {
                    setCat(c);
                    setOpenMenu(null);
                  }}
                >
                  {CAT_LABELS[c]}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ordenação */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            onClick={() => setOpenMenu((m) => (m === "sort" ? null : "sort"))}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 13px",
              border: `1px solid ${sortActive ? "var(--ink)" : "var(--line)"}`,
              borderRadius: 999,
              background: sortActive ? "var(--ink)" : "var(--card)",
              fontSize: 12.5,
              fontWeight: 600,
              color: sortActive ? "var(--paper)" : "var(--ink)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <ArrowUpDown
              size={12}
              color={sortActive ? "rgba(255,255,255,.6)" : "var(--muted)"}
            />
            <span>{SORT_LABELS[sort]}</span>
            <ChevronDown
              size={12}
              color={sortActive ? "rgba(255,255,255,.6)" : "var(--muted)"}
            />
          </button>
          {openMenu === "sort" && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                minWidth: 195,
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                boxShadow: "0 4px 16px rgba(28,26,23,.12)",
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              {(
                [
                  ["available", "Disponíveis primeiro"],
                  ["promo", "Promoções primeiro"],
                  ["pts-asc", "Menor pts"],
                  ["pts-desc", "Maior pts"],
                ] as [Sort, string][]
              ).map(([s, label]) => (
                <div
                  key={s}
                  className={`dd-option${sort === s ? " active" : ""}`}
                  onClick={() => {
                    setSort(s);
                    setOpenMenu(null);
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="rewards-grid">
        {products.map((p) => {
          const Ico = ICONS[p.icon] ?? Package;
          const cantAfford = p.locked || p.pts > saldo || p.jaResgatado;
          return (
            <button
              key={p.id}
              className={`reward-card${cantAfford ? " locked" : ""}`}
              onClick={() => router.push(`/loja/${p.id}`)}
              style={{ position: "relative" }}
            >
              {p.promo && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    background: "var(--brand)",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    letterSpacing: ".04em",
                  }}
                >
                  PROMO
                </div>
              )}
              {p.unico && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    background: p.jaResgatado ? "var(--success)" : "var(--ink)",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 4,
                    letterSpacing: ".04em",
                  }}
                >
                  {p.jaResgatado ? "RESGATADO" : "ÚNICO"}
                </div>
              )}
              <div className="reward-thumb">
                {p.img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.img}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: 9,
                    }}
                    alt={p.name}
                  />
                ) : (
                  <Ico size={30} strokeWidth={1.4} color="var(--muted)" />
                )}
              </div>
              <div className="reward-name">{p.name}</div>
              <div className="reward-footer">
                <span className="pts-val">
                  {p.promo && p.originalPts && (
                    <span
                      style={{
                        textDecoration: "line-through",
                        color: "var(--muted)",
                        fontFamily: "var(--font-jakarta)",
                        fontSize: 13,
                        marginRight: 3,
                      }}
                    >
                      {ptsFmt(p.originalPts)}
                    </span>
                  )}
                  {ptsFmt(p.pts)}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                      marginLeft: 2,
                      verticalAlign: "middle",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/dollar-coin.svg"
                      style={{ width: 16, height: 16 }}
                      alt="pts"
                    />
                    <span className="pts-unit">pts</span>
                  </span>
                </span>
                {cantAfford && (
                  <Lock
                    size={12}
                    color="var(--muted)"
                    style={{ flexShrink: 0 }}
                  />
                )}
              </div>
              <div style={{ fontSize: 10.5, marginTop: -2 }}>
                {p.stock <= 1 ? (
                  <span style={{ color: "#B5751F", fontWeight: 700 }}>
                    Último!
                  </span>
                ) : p.stock <= 2 ? (
                  <span style={{ color: "#B5751F", fontWeight: 600 }}>
                    {p.stock} restantes
                  </span>
                ) : (
                  <span style={{ color: "var(--muted)" }}>
                    {p.stock} disponíveis
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
