"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ChevronRight,
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Clock,
  CheckCircle2,
  Gift,
  TrendingUp,
  X,
  HardHat,
  Building2,
  User,
  Package,
  Minus,
  Banknote,
  QrCode,
  CreditCard,
  Receipt,
  UserPlus,
} from "lucide-react";
import { brl, type Order } from "@/lib/mock";
import { criarPedido } from "./actions";
import { bonusPoints } from "@/lib/rules";
import { CadastrarClienteModal } from "@/components/CadastrarClienteModal";

type Status = "todos" | Order["status"];
type DateSort = null | "asc" | "desc";
type ManualDraft = {
  painter: string;
  title: string;
  payment: string;
  notes: string;
  productSearch: string;
  discount: string;
};
type ManualCart = Record<string, number>;
type PainterOpt = { id: string; name: string; phone: string };
type ClientOpt = { id: string; name: string; type: "pessoa" | "empresa" };
type ProductOpt = {
  id: string;
  code: string;
  name: string;
  brand: string;
  price: number;
  cost: number;
  stock: number;
};

const STATUS_CFG: Record<
  string,
  { bg: string; fg: string; border: string; dot: string; weight: number }
> = {
  pendente: {
    bg: "#FFF0DC",
    fg: "#C86408",
    border: "#F3C884",
    dot: "#E07A10",
    weight: 700,
  },
  aprovado: {
    bg: "#EDF3E9",
    fg: "#4F7A4A",
    border: "#DCE7D5",
    dot: "#6D9168",
    weight: 600,
  },
  recusado: {
    bg: "#FBEAEA",
    fg: "#A30000",
    border: "#F2CFCF",
    dot: "#CC0000",
    weight: 650,
  },
  estornado: {
    bg: "#F2EDE4",
    fg: "#766D66",
    border: "#E2D9CC",
    dot: "#8A817A",
    weight: 600,
  },
  cancelado: {
    bg: "#F2EDE4",
    fg: "#766D66",
    border: "#E2D9CC",
    dot: "#8A817A",
    weight: 600,
  },
};

const EMPTY_MANUAL_DRAFT: ManualDraft = {
  painter: "",
  title: "",
  payment: "",
  notes: "",
  productSearch: "",
  discount: "",
};

function calcStats(orders: Order[]) {
  const approved = orders.filter((o) => o.status === "aprovado");
  const pending = orders.filter((o) => o.status === "pendente");
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayApproved = orders.filter(
    (o) => o.createdAtISO === todayISO && o.status === "aprovado",
  );
  const todayAll = orders.filter((o) => o.createdAtISO === todayISO);
  return {
    pendingCount: pending.length,
    todayTotal: todayApproved.reduce((acc, o) => acc + o.total, 0),
    todayCount: todayApproved.length,
    bonusTotal: approved.reduce((acc, o) => acc + (o.bonusPts ?? 0), 0),
    todayVolume: todayAll.reduce((acc, o) => acc + o.total, 0),
    todayAllCount: todayAll.length,
  };
}

function centsToDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits || digits === "0") return "";
  const num = parseInt(digits, 10);
  return (num / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function parseCents(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) / 100 : 0;
}

function paymentGroup(payment: string) {
  if (payment === "Pix da loja") return "Pix";
  if (payment === "Maquininha") return "Cartão";
  if (payment === "Vai pagar na loja") return "Notinha";
  return payment;
}

const FILTERS: { key: Status; label: string; dot?: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendente", label: "Pendente", dot: "#E07A10" },
  { key: "aprovado", label: "Aprovado", dot: "#4F7A4A" },
  { key: "recusado", label: "Recusado", dot: "#CC0000" },
  { key: "estornado", label: "Estornado", dot: "#8A817A" },
  { key: "cancelado", label: "Cancelado", dot: "#8A817A" },
];

export default function PedidosClient({
  orders: realOrders,
  bonusPercent,
  painters,
  clients,
  products,
}: {
  orders: Order[];
  bonusPercent: number;
  painters: PainterOpt[];
  clients: ClientOpt[];
  products: ProductOpt[];
}) {
  const router = useRouter();
  const hojeLabel = new Date()
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");
  const tableOrders = realOrders;
  const [statusFilter, setStatusFilter] = useState<Status>("todos");
  const [search, setSearch] = useState("");
  const [dateSort, setDateSort] = useState<DateSort>(null);
  const [hoveredOrderId, setHoveredOrderId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [painterFilter, setPainterFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("todos");
  const [manualOpen, setManualOpen] = useState(false);
  const [manualDraft, setManualDraft] =
    useState<ManualDraft>(EMPTY_MANUAL_DRAFT);
  const [manualCart, setManualCart] = useState<ManualCart>({});
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientModalPrefill, setClientModalPrefill] = useState("");
  const [manualPainterId, setManualPainterId] = useState<string | null>(null);
  const [manualClientId, setManualClientId] = useState<string | null>(null);
  const [manualClientName, setManualClientName] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [clientFocused, setClientFocused] = useState(false);

  const allClients = clients;

  const stats = calcStats(realOrders);
  const painterOptions = Array.from(
    new Set(realOrders.map((o) => o.painter)),
  ).sort();
  const activeAdvancedFilters = [
    painterFilter,
    paymentFilter !== "todos",
  ].filter(Boolean).length;
  const painterMatches = manualDraft.painter.trim()
    ? painters
        .filter((p) =>
          p.name
            .toLowerCase()
            .includes(manualDraft.painter.toLowerCase().trim()),
        )
        .slice(0, 5)
    : [];
  const clientQuery = manualClientName.toLowerCase().trim();
  const clientMatches = clientQuery
    ? allClients
        .filter((c) => c.name.toLowerCase().includes(clientQuery))
        .slice(0, 6)
    : allClients.slice(0, 3); // foco vazio = 3 primeiros (allClients já vem alfabético)
  const productMatches = manualDraft.productSearch.trim()
    ? products
        .filter(
          (p) =>
            p.name
              .toLowerCase()
              .includes(manualDraft.productSearch.toLowerCase().trim()) ||
            p.brand
              .toLowerCase()
              .includes(manualDraft.productSearch.toLowerCase().trim()) ||
            p.code
              .toLowerCase()
              .includes(manualDraft.productSearch.toLowerCase().trim()),
        )
        .slice(0, 5)
    : [];
  const cartEntries = Object.entries(manualCart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
    .filter(
      (entry): entry is { product: ProductOpt; qty: number } =>
        Boolean(entry.product) && entry.qty > 0,
    );
  const manualTotal = cartEntries.reduce(
    (sum, { product, qty }) => sum + product.price * qty,
    0,
  );

  const q = search.toLowerCase();
  let filtered =
    statusFilter === "todos"
      ? [...tableOrders]
      : tableOrders.filter((o) => o.status === statusFilter);
  if (q)
    filtered = filtered.filter(
      (o) =>
        o.painter.toLowerCase().includes(q) ||
        o.title.toLowerCase().includes(q) ||
        o.id.includes(q) ||
        o.date.toLowerCase().includes(q) ||
        o.payment.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q),
    );
  if (painterFilter)
    filtered = filtered.filter((o) => o.painter === painterFilter);
  if (paymentFilter !== "todos")
    filtered = filtered.filter(
      (o) => paymentGroup(o.payment) === paymentFilter,
    );
  if (dateSort === "asc") filtered.sort((a, b) => a.id.localeCompare(b.id));
  if (dateSort === "desc") filtered.sort((a, b) => b.id.localeCompare(a.id));

  function toggleDateSort() {
    setDateSort((s) => (s === "desc" ? "asc" : "desc"));
  }

  const filterCount = (key: Status) =>
    key === "todos"
      ? tableOrders.length
      : tableOrders.filter((o) => o.status === key).length;

  function clearAdvancedFilters() {
    setPainterFilter("");
    setPaymentFilter("todos");
  }

  async function submitManualOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderError("");
    if (!manualPainterId) {
      setOrderError("Selecione o pintor responsável.");
      return;
    }
    if (!manualClientId) {
      setOrderError("Selecione o cliente.");
      return;
    }
    if (cartEntries.length === 0) {
      setOrderError("Adicione ao menos um produto.");
      return;
    }
    if (!manualDraft.payment) {
      setOrderError("Escolha a forma de pagamento.");
      return;
    }
    if (submittingOrder) return;
    setSubmittingOrder(true);
    const res = await criarPedido({
      painterId: manualPainterId,
      clientId: manualClientId,
      items: cartEntries.map(({ product, qty }) => ({
        product_id: product.id,
        qty,
      })),
      titulo: manualDraft.title.trim() || undefined,
      desconto: parseCents(manualDraft.discount) || 0,
      pagamento: manualDraft.payment,
      observacao: manualDraft.notes.trim() || undefined,
    });
    setSubmittingOrder(false);
    if (!res.ok) {
      setOrderError(res.error);
      return;
    }
    closeManualModal();
    setStatusFilter("todos");
    router.refresh();
  }

  function addManualProduct(id: string) {
    setManualCart((cart) => ({ ...cart, [id]: (cart[id] || 0) + 1 }));
    setManualDraft((d) => ({ ...d, productSearch: "" }));
  }

  function changeManualProductQty(id: string, delta: number) {
    setManualCart((cart) => {
      const nextQty = (cart[id] || 0) + delta;
      const next = { ...cart };
      if (nextQty <= 0) delete next[id];
      else next[id] = nextQty;
      return next;
    });
  }

  function closeManualModal() {
    setManualDraft(EMPTY_MANUAL_DRAFT);
    setManualCart({});
    setManualPainterId(null);
    setManualClientId(null);
    setManualClientName("");
    setOrderError("");
    setManualOpen(false);
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
            Pedidos para aprovação
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 6 }}>
            Confirme pagamentos e libere bônus.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* Busca */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--card)",
              border: `1px solid ${searchFocused ? "var(--brand)" : "var(--line)"}`,
              borderRadius: 10,
              padding: "0 13px",
              height: 38,
              fontSize: 13,
              color: searchFocused ? "var(--brand)" : "var(--muted)",
              width: 320,
              boxShadow: searchFocused ? "0 0 0 3px rgba(204,0,0,.07)" : "none",
              transition: "border-color .14s, box-shadow .14s, color .14s",
            }}
          >
            <Search size={15} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Pintor, obra ou pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--ink)",
                width: "100%",
              }}
            />
          </div>
          {/* Filtros */}
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 13px",
              borderRadius: 10,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
              background: filtersOpen ? "var(--card)" : "rgba(255,255,255,.62)",
              color: "var(--ink-2)",
              border: `1px solid ${filtersOpen ? "var(--line-strong)" : "var(--line)"}`,
              cursor: "pointer",
              transition: "background .14s, border-color .14s, transform .14s",
            }}
          >
            <SlidersHorizontal size={14} strokeWidth={2} />
            Filtros
            {activeAdvancedFilters > 0 && (
              <span
                style={{
                  minWidth: 18,
                  height: 18,
                  borderRadius: 999,
                  background: "var(--brand)",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {activeAdvancedFilters}
              </span>
            )}
          </button>
          {/* Novo manual */}
          <button
            onClick={() => setManualOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 15px",
              borderRadius: 10,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
              background: "var(--ink)",
              color: "var(--paper)",
              border: "1px solid transparent",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(28,26,23,.10)",
              transition: "background .14s, transform .14s, box-shadow .14s",
            }}
          >
            <Plus size={14} strokeWidth={2.5} />
            Novo manual
          </button>
        </div>
      </div>

      {filtersOpen && (
        <div style={{ padding: "14px 32px 0" }}>
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 14,
              padding: 16,
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: 12,
              alignItems: "end",
              boxShadow: "0 2px 8px rgba(28,26,23,.045)",
            }}
          >
            <label
              style={{
                display: "grid",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--ink-2)",
              }}
            >
              Pintor
              <select
                value={painterFilter}
                onChange={(e) => setPainterFilter(e.target.value)}
                style={{
                  height: 38,
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  padding: "0 10px",
                  fontFamily: "var(--font-body)",
                  color: "var(--ink)",
                  outline: "none",
                }}
              >
                <option value="">Todos os pintores</option>
                {painterOptions.map((painter) => (
                  <option key={painter} value={painter}>
                    {painter}
                  </option>
                ))}
              </select>
            </label>
            <label
              style={{
                display: "grid",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--ink-2)",
              }}
            >
              Forma de pagamento
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                style={{
                  height: 38,
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  padding: "0 10px",
                  fontFamily: "var(--font-body)",
                  color: "var(--ink)",
                  outline: "none",
                }}
              >
                <option value="todos">Todas</option>
                {["Dinheiro", "Pix", "Cartão", "Notinha"].map((payment) => (
                  <option key={payment} value={payment}>
                    {payment}
                  </option>
                ))}
              </select>
            </label>
            <button
              onClick={clearAdvancedFilters}
              style={{
                height: 38,
                padding: "0 14px",
                borderRadius: 10,
                border: "1px solid var(--line)",
                background: "var(--paper)",
                color: "var(--ink-2)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          padding: "20px 32px 20px",
        }}
      >
        {/* Pendentes */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            display: "flex",
            overflow: "hidden",
            boxShadow:
              "0 2px 6px rgba(28,26,23,.06), 0 1px 2px rgba(28,26,23,.04)",
          }}
        >
          <div
            style={{
              width: 52,
              flexShrink: 0,
              background: "#E07A10",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Clock size={22} strokeWidth={1.75} style={{ color: "#fff" }} />
          </div>
          <div
            style={{
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 5,
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
              PENDENTES
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 30,
                color: "#E07A10",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {stats.pendingCount}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              aguardando pagamento
            </div>
          </div>
        </div>
        {/* Hoje aprovado */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            display: "flex",
            overflow: "hidden",
            boxShadow:
              "0 2px 6px rgba(28,26,23,.06), 0 1px 2px rgba(28,26,23,.04)",
          }}
        >
          <div
            style={{
              width: 52,
              flexShrink: 0,
              background: "#4F7A4A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2
              size={22}
              strokeWidth={1.75}
              style={{ color: "#fff" }}
            />
          </div>
          <div
            style={{
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 5,
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
              HOJE · {hojeLabel.toUpperCase()}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 30,
                color: "#4F7A4A",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              R${" "}
              {stats.todayTotal.toLocaleString("pt-BR", {
                minimumFractionDigits: 0,
              })}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {stats.todayCount} pedido{stats.todayCount !== 1 ? "s" : ""}{" "}
              aprovado{stats.todayCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>
        {/* Bônus */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            display: "flex",
            overflow: "hidden",
            boxShadow:
              "0 2px 6px rgba(28,26,23,.06), 0 1px 2px rgba(28,26,23,.04)",
          }}
        >
          <div
            style={{
              width: 52,
              flexShrink: 0,
              background: "#6B46C1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Gift size={22} strokeWidth={1.75} style={{ color: "#fff" }} />
          </div>
          <div
            style={{
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 5,
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
              BÔNUS LIBERADO · TOTAL
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 30,
                color: "#6B46C1",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stats.bonusTotal.toLocaleString("pt-BR")}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              pts creditados aos pintores
            </div>
          </div>
        </div>
        {/* Volume do dia */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            display: "flex",
            overflow: "hidden",
            boxShadow:
              "0 2px 6px rgba(28,26,23,.06), 0 1px 2px rgba(28,26,23,.04)",
          }}
        >
          <div
            style={{
              width: 52,
              flexShrink: 0,
              background: "rgba(28,26,23,.72)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp
              size={22}
              strokeWidth={1.75}
              style={{ color: "#fff" }}
            />
          </div>
          <div
            style={{
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 5,
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
              HOJE · VOLUME
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 30,
                color: "var(--ink)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              R${" "}
              {stats.todayVolume.toLocaleString("pt-BR", {
                minimumFractionDigits: 0,
              })}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {stats.todayAllCount} pedido{stats.todayAllCount !== 1 ? "s" : ""}{" "}
              no dia
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div style={{ padding: "0 32px 32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 8,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  background:
                    statusFilter === f.key ? "var(--ink)" : "var(--card)",
                  color:
                    statusFilter === f.key ? "var(--paper)" : "var(--ink-2)",
                  border: `1px solid ${statusFilter === f.key ? "var(--ink)" : "var(--line)"}`,
                  cursor: "pointer",
                  transition: "background .12s, color .12s",
                }}
              >
                {f.dot && (
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        statusFilter === f.key ? "var(--paper)" : f.dot,
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                )}
                {f.label}
                <span style={{ opacity: 0.6, fontWeight: 500 }}>
                  {filterCount(f.key)}
                </span>
              </button>
            ))}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(138,129,122,.82)",
              fontVariantNumeric: "tabular-nums",
              paddingRight: 2,
            }}
          >
            {filtered.length} pedido{filtered.length !== 1 ? "s" : ""}{" "}
            encontrado{filtered.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(28,26,23,.045)",
          }}
        >
          {/* Cabeçalho */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "70px 1fr 1fr 90px 130px 185px 100px",
              padding: "12px 18px",
              gap: 16,
              background: "#F7F2EA",
              borderBottom: "1px solid var(--line)",
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            <div>#</div>
            <div>Pintor</div>
            <div>Obra</div>
            <div
              onClick={toggleDateSort}
              style={{
                cursor: "pointer",
                userSelect: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Data
              {dateSort === "desc" ? (
                <ArrowDown size={11} strokeWidth={2} />
              ) : dateSort === "asc" ? (
                <ArrowUp size={11} strokeWidth={2} />
              ) : (
                <ChevronsUpDown size={11} strokeWidth={2} />
              )}
            </div>
            <div style={{ textAlign: "right" }}>Total</div>
            <div>Status</div>
            <div />
          </div>

          {/* Linhas */}
          {filtered.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              Nenhum pedido neste filtro.
            </div>
          ) : (
            filtered.map((o) => {
              const s = STATUS_CFG[o.status] || STATUS_CFG.estornado;
              const isHovered = hoveredOrderId === o.id;
              const isPending = o.status === "pendente";
              return (
                <div
                  key={o.id}
                  onClick={() => router.push(`/pedidos/${o.id}`)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr 1fr 90px 130px 185px 100px",
                    padding: "14px 18px 14px 15px",
                    gap: 16,
                    alignItems: "center",
                    borderBottom: "1px solid var(--line)",
                    borderLeft: `3px solid ${isPending ? "#E07A10" : "transparent"}`,
                    cursor: "pointer",
                    fontSize: 13,
                    color: "var(--ink-2)",
                    background: isHovered
                      ? isPending
                        ? "#FFF7ED"
                        : "var(--paper-deep)"
                      : isPending
                        ? "rgba(253,235,208,.18)"
                        : "transparent",
                    transition: "background .14s, border-color .14s",
                  }}
                  onMouseEnter={() => setHoveredOrderId(o.id)}
                  onMouseLeave={() => setHoveredOrderId(null)}
                >
                  <div
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      color: "var(--muted)",
                    }}
                  >
                    {o.id}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--ink)" }}>
                      {o.painter}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {o.location}
                    </div>
                  </div>
                  <div style={{ color: "var(--ink-2)" }}>{o.title}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12.5 }}>
                    {o.date}
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    <strong style={{ color: "var(--ink)" }}>
                      R$ {brl(o.total)}
                    </strong>
                  </div>
                  <div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding:
                          o.status === "pendente" ? "4px 10px" : "3px 9px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: s.weight,
                        whiteSpace: "nowrap",
                        background: s.bg,
                        color: s.fg,
                        border: `1px solid ${s.border}`,
                        boxShadow:
                          o.status === "pendente"
                            ? "0 1px 2px rgba(224,122,16,.08)"
                            : "none",
                      }}
                    >
                      <span
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: s.dot,
                          flexShrink: 0,
                        }}
                      />
                      {o.status}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <button
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "7px 10px",
                        borderRadius: 10,
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: 12,
                        background: "var(--card)",
                        color: "var(--ink)",
                        border: `1px solid ${isHovered ? "var(--line-strong)" : "var(--line)"}`,
                        cursor: "pointer",
                        opacity: isHovered ? 1 : 0.72,
                        transform: isHovered
                          ? "translateX(0)"
                          : "translateX(2px)",
                        transition:
                          "opacity .14s, transform .14s, border-color .14s",
                      }}
                    >
                      Abrir <ChevronRight size={13} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {manualOpen && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeManualModal();
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
          <form
            onSubmit={submitManualOrder}
            style={{
              width: "100%",
              maxWidth: 640,
              maxHeight: "calc(100vh - 48px)",
              display: "flex",
              flexDirection: "column",
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
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                padding: "20px 22px 16px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 22,
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "var(--ink)",
                    lineHeight: 1.1,
                  }}
                >
                  Novo pedido manual
                </h2>
                <p
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: "#C86408",
                    lineHeight: 1.45,
                  }}
                >
                  Cria um pedido já aprovado e credita o bônus ao pintor na
                  hora.
                </p>
              </div>
              <button
                type="button"
                onClick={closeManualModal}
                aria-label="Fechar"
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
                }}
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            <div
              style={{
                padding: 22,
                display: "grid",
                gap: 14,
                overflowY: "auto",
                minHeight: 0,
                flex: "1 1 auto",
              }}
            >
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                }}
              >
                Cliente
                <div style={{ position: "relative" }}>
                  <input
                    value={manualClientName}
                    onChange={(e) => {
                      setManualClientName(e.target.value);
                      setManualClientId(null);
                    }}
                    onFocus={() => setClientFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setClientFocused(false), 120)
                    }
                    placeholder="Buscar cliente ou empresa..."
                    required
                    autoComplete="off"
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 10,
                      border: "1px solid var(--line)",
                      background: "var(--card)",
                      padding: "0 12px",
                      fontFamily: "var(--font-body)",
                      color: "var(--ink)",
                      outline: "none",
                    }}
                  />
                  {clientFocused && (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: 4,
                        left: 0,
                        right: 0,
                        top: 46,
                        background: "var(--card)",
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "var(--shadow-3)",
                      }}
                    >
                      {clientQuery && clientMatches.length === 0 && (
                        <div
                          style={{
                            padding: "12px 14px",
                            fontSize: 13,
                            color: "var(--muted)",
                          }}
                        >
                          Nenhum cliente encontrado.
                        </div>
                      )}
                      {clientMatches.map((c) => {
                        const Icon = c.type === "empresa" ? Building2 : User;
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setManualClientId(c.id);
                              setManualClientName(c.name);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              border: "none",
                              background: "var(--card)",
                              borderBottom: "1px solid var(--line)",
                              textAlign: "left",
                            }}
                          >
                            <Icon
                              size={15}
                              strokeWidth={1.75}
                              color="var(--muted)"
                            />
                            <span style={{ flex: 1 }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "var(--ink)",
                                }}
                              >
                                {c.name}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 11.5,
                                  color: "var(--muted)",
                                }}
                              >
                                {c.type === "empresa"
                                  ? "Empresa"
                                  : "Pessoa física"}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          setClientModalPrefill(manualClientName);
                          setClientModalOpen(true);
                        }}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          border: "none",
                          borderTop: "1px solid var(--line)",
                          background: "var(--card)",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <UserPlus
                          size={15}
                          strokeWidth={1.75}
                          color="var(--brand)"
                        />
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--brand)",
                          }}
                        >
                          Cadastrar novo cliente
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </label>
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                }}
              >
                Obra / título
                <input
                  value={manualDraft.title}
                  onChange={(e) =>
                    setManualDraft((d) => ({ ...d, title: e.target.value }))
                  }
                  placeholder="Ex.: Reforma fachada — Rua das Flores"
                  autoComplete="off"
                  style={{
                    width: "100%",
                    height: 40,
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    background: "var(--card)",
                    padding: "0 12px",
                    fontFamily: "var(--font-body)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </label>
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                }}
              >
                Pintor
                <div style={{ position: "relative" }}>
                  <input
                    value={manualDraft.painter}
                    onChange={(e) => {
                      setManualDraft((d) => ({
                        ...d,
                        painter: e.target.value,
                      }));
                      setManualPainterId(null);
                    }}
                    placeholder="Buscar pintor responsável..."
                    autoComplete="off"
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 10,
                      border: "1px solid var(--line)",
                      background: "var(--card)",
                      padding: "0 12px",
                      fontFamily: "var(--font-body)",
                      color: "var(--ink)",
                      outline: "none",
                    }}
                  />
                  {painterMatches.length > 0 &&
                    manualDraft.painter !== painterMatches[0]?.name && (
                      <div
                        style={{
                          position: "absolute",
                          zIndex: 5,
                          left: 0,
                          right: 0,
                          top: 46,
                          background: "var(--card)",
                          border: "1px solid var(--line)",
                          borderRadius: 12,
                          overflow: "hidden",
                          boxShadow: "var(--shadow-3)",
                        }}
                      >
                        {painterMatches.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => {
                              setManualDraft((d) => ({
                                ...d,
                                painter: p.name,
                              }));
                              setManualPainterId(p.id);
                            }}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              border: "none",
                              background: "var(--card)",
                              borderBottom: "1px solid var(--line)",
                              textAlign: "left",
                            }}
                          >
                            <HardHat
                              size={16}
                              strokeWidth={1.75}
                              color="var(--muted)"
                            />
                            <span style={{ flex: 1 }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "var(--ink)",
                                }}
                              >
                                {p.name}
                              </span>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 11.5,
                                  color: "var(--muted)",
                                }}
                              >
                                {p.phone}
                              </span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              </label>
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                }}
              >
                Produtos
                <div style={{ position: "relative" }}>
                  <input
                    value={manualDraft.productSearch}
                    onChange={(e) =>
                      setManualDraft((d) => ({
                        ...d,
                        productSearch: e.target.value,
                      }))
                    }
                    placeholder="Buscar produto, marca ou código..."
                    autoComplete="off"
                    style={{
                      width: "100%",
                      height: 40,
                      borderRadius: 10,
                      border: "1px solid var(--line)",
                      background: "var(--card)",
                      padding: "0 12px",
                      fontFamily: "var(--font-body)",
                      color: "var(--ink)",
                      outline: "none",
                    }}
                  />
                  {productMatches.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: 3,
                        left: 0,
                        right: 0,
                        top: 46,
                        background: "var(--card)",
                        border: "1px solid var(--line)",
                        borderRadius: 12,
                        overflow: "hidden",
                        boxShadow: "var(--shadow-3)",
                      }}
                    >
                      {productMatches.map((p) => {
                        const margin = Math.round((1 - p.cost / p.price) * 100);
                        const stockWarn = p.stock <= 6;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => addManualProduct(p.id)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              padding: "10px 12px",
                              border: "none",
                              background: "var(--card)",
                              borderBottom: "1px solid var(--line)",
                              textAlign: "left",
                            }}
                          >
                            <Package
                              size={15}
                              strokeWidth={1.75}
                              color="var(--muted)"
                            />
                            <span style={{ flex: 1, minWidth: 0 }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "var(--ink)",
                                }}
                              >
                                {p.name}
                              </span>
                              <span
                                style={{
                                  display: "flex",
                                  gap: 6,
                                  flexWrap: "wrap",
                                  fontSize: 11.5,
                                  color: "var(--muted)",
                                }}
                              >
                                <span>{p.brand}</span>
                                <span>R$ {brl(p.price)}</span>
                                <span
                                  style={{
                                    color:
                                      margin >= 30
                                        ? "var(--success)"
                                        : margin >= 15
                                          ? "var(--warning)"
                                          : "var(--brand)",
                                    fontWeight: 600,
                                  }}
                                >
                                  Margem {margin}%
                                </span>
                                <span
                                  style={{
                                    color: stockWarn
                                      ? "var(--brand)"
                                      : "var(--muted)",
                                    fontWeight: stockWarn ? 600 : 400,
                                  }}
                                >
                                  {p.stock === 0
                                    ? "sem estoque"
                                    : `${p.stock} un.`}
                                </span>
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {cartEntries.length > 0 && (
                  <div
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: 10,
                      overflow: "hidden",
                    }}
                  >
                    {cartEntries.map(({ product, qty }) => (
                      <div
                        key={product.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 12px",
                          borderBottom: "1px solid var(--line)",
                        }}
                      >
                        <Package
                          size={14}
                          strokeWidth={1.75}
                          color="var(--muted)"
                        />
                        <span
                          style={{
                            flex: 1,
                            fontSize: 12,
                            color: "var(--ink)",
                            lineHeight: 1.35,
                          }}
                        >
                          {product.name}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              changeManualProductQty(product.id, -1)
                            }
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 7,
                              border: "1px solid var(--line)",
                              background: "var(--card)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Minus size={12} strokeWidth={2} />
                          </button>
                          <span
                            style={{
                              minWidth: 16,
                              textAlign: "center",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              changeManualProductQty(product.id, 1)
                            }
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 7,
                              border: "1px solid var(--line)",
                              background: "var(--card)",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Plus size={12} strokeWidth={2} />
                          </button>
                          <span
                            style={{
                              minWidth: 78,
                              textAlign: "right",
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--ink)",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            R$ {brl(product.price * qty)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {/* Desconto + resumo */}
                    <div
                      style={{
                        background: "var(--paper-deep)",
                        borderTop: "1px solid var(--line)",
                      }}
                    >
                      {/* Linha de desconto */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "9px 12px",
                          borderBottom: "1px solid var(--line)",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--muted)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Desconto para o cliente
                        </span>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>
                            - R$
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={centsToDisplay(manualDraft.discount)}
                            onChange={(e) =>
                              setManualDraft((d) => ({
                                ...d,
                                discount: e.target.value.replace(/\D/g, ""),
                              }))
                            }
                            placeholder="0,00"
                            style={{
                              width: 80,
                              height: 28,
                              borderRadius: 7,
                              border: "1px solid var(--line)",
                              background: "var(--card)",
                              padding: "0 8px",
                              textAlign: "right",
                              fontFamily: "var(--font-body)",
                              fontSize: 12,
                              color: "var(--ink)",
                              outline: "none",
                              fontVariantNumeric: "tabular-nums",
                            }}
                          />
                        </div>
                      </div>
                      {/* Total cobrado */}
                      {(() => {
                        const disc = parseCents(manualDraft.discount);
                        const clientTotal = Math.max(0, manualTotal - disc);
                        return (
                          <div
                            style={{
                              padding: "9px 12px",
                              display: "flex",
                              flexDirection: "column",
                              gap: 4,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: 13,
                              }}
                            >
                              <span style={{ color: "var(--muted)" }}>
                                Total cobrado
                              </span>
                              <strong
                                style={{ fontVariantNumeric: "tabular-nums" }}
                              >
                                R$ {brl(clientTotal)}
                              </strong>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontSize: 11.5,
                              }}
                            >
                              <span style={{ color: "var(--muted)" }}>
                                Bônus do pintor{" "}
                                {disc > 0 ? "(sobre subtotal)" : ""}
                              </span>
                              <span
                                style={{
                                  color: "var(--success)",
                                  fontWeight: 700,
                                  fontVariantNumeric: "tabular-nums",
                                }}
                              >
                                {bonusPoints(
                                  manualTotal,
                                  bonusPercent,
                                ).toLocaleString("pt-BR")}{" "}
                                pts
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </label>
              <label
                style={{
                  display: "grid",
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                }}
              >
                Pagamento informado
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    { label: "Dinheiro", icon: Banknote },
                    { label: "Pix", icon: QrCode },
                    { label: "Cartão", icon: CreditCard },
                    { label: "Notinha", icon: Receipt },
                  ].map(({ label, icon: Icon }) => {
                    const active = manualDraft.payment === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() =>
                          setManualDraft((d) => ({ ...d, payment: label }))
                        }
                        style={{
                          height: 40,
                          borderRadius: 10,
                          border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
                          background: active ? "var(--ink)" : "var(--card)",
                          color: active ? "var(--paper)" : "var(--ink-2)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 7,
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        <Icon size={15} strokeWidth={1.75} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </label>
              <label
                style={{
                  display: "grid",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--ink-2)",
                }}
              >
                Anotação interna
                <textarea
                  value={manualDraft.notes}
                  onChange={(e) =>
                    setManualDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                  placeholder="Observações visíveis apenas para a equipe da loja..."
                  rows={3}
                  style={{
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    background: "var(--card)",
                    padding: 12,
                    resize: "vertical",
                    fontFamily: "var(--font-body)",
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                padding: "14px 22px 20px",
                borderTop: "1px solid var(--line)",
                background: "var(--paper)",
              }}
            >
              <button
                type="button"
                onClick={closeManualModal}
                style={{
                  height: 38,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1px solid var(--line)",
                  background: "var(--card)",
                  color: "var(--ink-2)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              {orderError && (
                <span
                  style={{
                    fontSize: 12.5,
                    color: "#CC0000",
                    fontWeight: 600,
                    alignSelf: "center",
                    marginRight: "auto",
                  }}
                >
                  {orderError}
                </span>
              )}
              <button
                type="submit"
                disabled={submittingOrder}
                style={{
                  height: 38,
                  padding: "0 15px",
                  borderRadius: 10,
                  border: "1px solid transparent",
                  background: "var(--ink)",
                  color: "var(--paper)",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: "0 2px 6px rgba(28,26,23,.10)",
                }}
              >
                {submittingOrder ? "Criando..." : "Criar pedido"}
              </button>
            </div>
          </form>
        </div>
      )}

      <CadastrarClienteModal
        open={clientModalOpen}
        prefillName={clientModalPrefill}
        onClose={() => setClientModalOpen(false)}
        onCreated={(c) => {
          setManualClientId(c.id);
          setManualClientName(c.nome);
        }}
      />
    </div>
  );
}
