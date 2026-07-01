"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  User,
  Phone,
  Search,
  CheckCircle,
  Info,
  UserPlus,
  UserCheck,
  Building2,
  ChevronRight,
  PlusCircle,
  Minus,
  Plus,
  X,
  PackageOpen,
  MessageSquarePlus,
  ArrowRight,
  Store,
  QrCode,
  CreditCard,
  Banknote,
  Receipt,
} from "lucide-react";
import { usePintor } from "@/lib/pintor-store";
import { ADDRESS_TYPES, brl } from "@/lib/pintor-data";
import { enviarOrcamento } from "@/lib/orcamento-actions";
import { fmtCpf, fmtCnpj, isValidDocumento } from "@/lib/documento";

const PAYMENT_OPTS = [
  { value: "Vai pagar na loja", icon: Store },
  { value: "Pix da loja", icon: QrCode },
  { value: "Cartão", icon: CreditCard },
  { value: "Dinheiro", icon: Banknote },
  { value: "Notinha", icon: Receipt },
];

function fmtPhone(raw: string): string {
  const v = raw.replace(/\D/g, "").slice(0, 11);
  if (v.length === 0) return "";
  if (v.length <= 2) return "(" + v;
  if (v.length <= 6) return "(" + v.slice(0, 2) + ") " + v.slice(2);
  if (v.length <= 10)
    return "(" + v.slice(0, 2) + ") " + v.slice(2, 6) + "-" + v.slice(6);
  return (
    "(" +
    v.slice(0, 2) +
    ") " +
    v.slice(2, 3) +
    " " +
    v.slice(3, 7) +
    "-" +
    v.slice(7)
  );
}

function fmtCep(raw: string): string {
  const v = raw.replace(/\D/g, "").slice(0, 8);
  if (v.length <= 5) return v;
  return v.slice(0, 5) + "-" + v.slice(5);
}

const inputStyle: React.CSSProperties = {
  border: "1px solid var(--line)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  color: "var(--ink)",
  background: "var(--paper)",
  outline: "none",
  width: "100%",
  minWidth: 0,
};
const searchBox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "var(--card)",
  border: "1px solid var(--line)",
  borderRadius: 12,
  padding: "0 14px",
  height: 44,
};
const bareInput: React.CSSProperties = {
  border: 0,
  outline: "none",
  fontSize: 14,
  color: "var(--ink)",
  background: "transparent",
  width: "100%",
  fontFamily: "var(--font-body)",
};

type Selected =
  | {
      kind: "existing";
      id: string;
      name: string;
      phone: string;
      linked: boolean;
    }
  | {
      kind: "new";
      name: string;
      phone: string;
      linked: boolean;
      type: ClientKind;
      document: string;
      cep: string;
      address: string;
      number: string;
      neighborhood: string;
      city: string;
      note: string;
    };
type ClientKind = "pessoa" | "empresa";

export default function OrcamentoPage() {
  const router = useRouter();
  const {
    cart,
    addCart,
    clearCart,
    cartQty,
    cartTotal,
    cartBonus,
    selectedPayment,
    setSelectedPayment,
    setSelectedClient,
    setLastSubmitted,
    data,
  } = usePintor();

  const [selected, setSelected] = useState<Selected | null>(null);
  const [mode, setMode] = useState<"search" | "newclient">("search");
  const [nameQ, setNameQ] = useState("");
  const [phoneQ, setPhoneQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSearchFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current);
    setSearchFocused(true);
  };
  const onSearchBlur = () => {
    blurTimer.current = setTimeout(() => setSearchFocused(false), 150);
  };

  // novo cliente
  const [nc, setNc] = useState({
    type: "pessoa" as ClientKind,
    name: "",
    phone: "",
    cpf: "",
    cep: "",
    address: "",
    number: "",
    neighborhood: "",
    city: "",
    note: "",
  });
  const [ncErr, setNcErr] = useState<string[]>([]);
  const [ncMsg, setNcMsg] = useState("");

  // produto
  const [prodQ, setProdQ] = useState("");

  // pagamento
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [obra, setObra] = useState("");
  const [needsAttention, setNeedsAttention] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const eyebrow = selected ? selected.name.toUpperCase() : "NOVO ORÇAMENTO";

  const clientResults = useMemo(() => {
    const n = nameQ.trim().toLowerCase();
    const p = phoneQ.trim();
    const sorted = [...data.clientes].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR"),
    );
    // nada digitado → 3 primeiros (alfabético), igual ao admin
    if (!n && !p) return sorted.slice(0, 3);
    return sorted.filter(
      (c) =>
        (n.length >= 1 && c.name.toLowerCase().includes(n)) ||
        (p.length >= 1 && c.phone.includes(p)),
    );
  }, [nameQ, phoneQ, data.clientes]);

  const prodResults = useMemo(() => {
    const q = prodQ.trim().toLowerCase();
    if (!q) return null;
    return data.catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q),
    );
  }, [prodQ]);

  function pickClient(c: (typeof data.clientes)[number]) {
    setSelected({
      kind: "existing",
      id: c.id,
      name: c.name,
      phone: c.phone,
      linked: c.linked,
    });
    setSelectedClient({ name: c.name, phone: c.phone });
    setNameQ("");
    setPhoneQ("");
    setMode("search");
  }

  function clearClient() {
    setSelected(null);
    setSelectedClient(null);
    setNameQ("");
    setPhoneQ("");
    setNc({
      type: "pessoa",
      name: "",
      phone: "",
      cpf: "",
      cep: "",
      address: "",
      number: "",
      neighborhood: "",
      city: "",
      note: "",
    });
    setNcErr([]);
    setNcMsg("");
    setMode("search");
  }

  function registerNewClient() {
    const missing: string[] = [];
    if (!nc.name.trim()) missing.push("name");
    if (!nc.phone.trim()) missing.push("phone");
    if (!isValidDocumento(nc.cpf, nc.type)) missing.push("cpf");
    if (nc.cep.replace(/\D/g, "").length !== 8) missing.push("cep");
    if (!nc.address.trim()) missing.push("address");
    if (!nc.neighborhood.trim()) missing.push("neighborhood");
    if (!nc.city.trim()) missing.push("city");
    if (missing.length) {
      setNcErr(missing);
      setNcMsg(
        "Preencha corretamente os campos obrigatórios para cadastrar o cliente.",
      );
      return;
    }
    setNcErr([]);
    setNcMsg("");
    setSelected({
      kind: "new",
      name: nc.name.trim(),
      phone: nc.phone.trim(),
      linked: false, // cliente recém-cadastrado nasce pendente até a aprovação
      type: nc.type,
      document: nc.cpf,
      cep: nc.cep,
      address: nc.address,
      number: nc.number,
      neighborhood: nc.neighborhood,
      city: nc.city,
      note: nc.note,
    });
    setSelectedClient({ name: nc.name.trim(), phone: nc.phone.trim() });
    setMode("search");
  }

  function openNewClientForm() {
    setNc((s) => ({
      ...s,
      name: nameQ.trim() || s.name,
      phone: phoneQ.trim() || s.phone,
    }));
    setNcErr([]);
    setNcMsg("");
    setMode("newclient");
  }

  function ncBorder(f: string) {
    return ncErr.includes(f) ? "var(--brand)" : "var(--line)";
  }

  function selectPayment(v: string) {
    setSelectedPayment(v);
    setNeedsAttention(false);
  }

  async function submitOrder() {
    if (submitting) return;
    if (!selectedPayment) {
      setNeedsAttention(true);
      document
        .getElementById("payment-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!selected) {
      setSubmitError("Selecione um cliente antes de enviar.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    const items = Object.entries(cart).map(([product_id, qty]) => ({
      product_id,
      qty,
    }));

    const res = await enviarOrcamento({
      clientId: selected.kind === "existing" ? selected.id : null,
      newClient:
        selected.kind === "new"
          ? {
              nome: selected.name,
              type: selected.type,
              documento: selected.document,
              telefone: selected.phone,
              cep: selected.cep,
              rua: selected.address,
              numero: selected.number,
              complemento: selected.note,
              bairro: selected.neighborhood,
              cidade: selected.city,
            }
          : null,
      items,
      pagamento: selectedPayment,
      observacao: note || null,
      titulo: obra.trim() || null,
    });

    if (!res.ok) {
      setSubmitting(false);
      setSubmitError(res.error);
      return;
    }

    const summaryItems = Object.keys(cart).map((id) => {
      const p = data.catalog.find((x) => x.id === id)!;
      return { name: p.name, qty: cart[id], price: p.price };
    });
    setLastSubmitted({
      id: String(res.numero).padStart(4, "0"),
      clientName: selected.name,
      payment: selectedPayment,
      items: summaryItems,
      total: cartTotal,
    });
    clearCart();
    router.refresh();
    router.push("/pedido-enviado");
  }

  const cartIds = Object.keys(cart);

  return (
    <>
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}>
          <ChevronLeft size={22} strokeWidth={2} /> Voltar
        </button>
        <div className="eyebrow-label">{eyebrow}</div>
        <div className="page-title">Novo orçamento</div>
      </div>

      {/* ── CLIENTE ── */}
      <div style={{ padding: "0 16px 20px" }}>
        <div className="eyebrow-label" style={{ marginBottom: 10 }}>
          CLIENTE
        </div>

        {!selected && mode === "search" && (
          <>
            <div style={{ position: "relative" }}>
              <div style={searchBox}>
                <User
                  size={18}
                  strokeWidth={1.75}
                  color="var(--muted)"
                  style={{ flexShrink: 0 }}
                />
                <input
                  type="text"
                  placeholder="Nome do cliente…"
                  value={nameQ}
                  onChange={(e) => {
                    setNameQ(e.target.value);
                    setPhoneQ("");
                  }}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
                  style={bareInput}
                />
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "6px 0",
                  fontSize: 11,
                  color: "var(--muted)",
                  letterSpacing: ".04em",
                }}
              >
                ou
              </div>
              <div style={searchBox}>
                <Phone
                  size={18}
                  strokeWidth={1.75}
                  color="var(--muted)"
                  style={{ flexShrink: 0 }}
                />
                <input
                  type="tel"
                  placeholder="(31) 9 XXXX-XXXX"
                  value={phoneQ}
                  onChange={(e) => {
                    setPhoneQ(fmtPhone(e.target.value));
                    setNameQ("");
                  }}
                  onFocus={onSearchFocus}
                  onBlur={onSearchBlur}
                  style={bareInput}
                />
              </div>
            </div>

            {searchFocused && clientResults && (
              <div
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  boxShadow: "0 8px 24px rgba(28,26,23,.14)",
                  overflow: "hidden",
                  marginTop: 6,
                }}
              >
                {clientResults.length === 0 && (
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
                {clientResults.map((c, i) => {
                  const isLinked = c.linked; // vinculado = tem pedido aprovado
                  return (
                    <div
                      key={c.id}
                      onClick={() => pickClient(c)}
                      style={{
                        padding: "12px 14px",
                        cursor: "pointer",
                        borderBottom:
                          i < clientResults.length - 1
                            ? "1px solid var(--line)"
                            : undefined,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "var(--ink)",
                          }}
                        >
                          {c.name}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "var(--muted)",
                            marginTop: 1,
                          }}
                        >
                          {c.phone}
                        </div>
                        {isLinked ? (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: "var(--success)",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <UserCheck size={11} strokeWidth={2.5} /> Você já
                            está vinculado
                          </div>
                        ) : (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: "var(--muted)",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <Info size={11} strokeWidth={2.5} /> Vínculo
                            pendente — efetiva após a aprovação
                          </div>
                        )}
                      </div>
                      <ChevronRight
                        size={16}
                        color="var(--muted)"
                        style={{ flexShrink: 0 }}
                      />
                    </div>
                  );
                })}
                <div
                  onClick={openNewClientForm}
                  style={{
                    padding: "12px 14px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--brand)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    borderTop: "1px solid var(--line)",
                  }}
                >
                  <UserPlus size={15} strokeWidth={1.75} /> Cadastrar novo
                  cliente
                </div>
              </div>
            )}
          </>
        )}

        {selected && (
          <>
            <div
              style={{
                marginTop: 0,
                background: selected.linked
                  ? "var(--success-tint)"
                  : "var(--paper-deep)",
                border: selected.linked
                  ? "1px solid #C6DCC0"
                  : "1px solid var(--line)",
                borderRadius: 12,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {selected.linked ? (
                  <CheckCircle
                    size={18}
                    strokeWidth={1.75}
                    color="var(--success)"
                    style={{ flexShrink: 0 }}
                  />
                ) : (
                  <User
                    size={18}
                    strokeWidth={1.75}
                    color="var(--muted)"
                    style={{ flexShrink: 0 }}
                  />
                )}
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--ink)",
                    }}
                  >
                    {selected.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 1,
                    }}
                  >
                    {selected.phone}
                  </div>
                </div>
              </div>
              <button
                className="tap"
                onClick={clearClient}
                style={{
                  background: "transparent",
                  border: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  padding: "4px 8px",
                }}
              >
                trocar
              </button>
            </div>
            {!selected.linked && (
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Info
                  size={13}
                  strokeWidth={2}
                  color="var(--muted)"
                  style={{ flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--muted)",
                    lineHeight: 1.4,
                  }}
                >
                  Vínculo pendente — será criado automaticamente após a
                  aprovação do primeiro pedido.
                </span>
              </div>
            )}
            <div style={{ marginTop: 14 }}>
              <div className="eyebrow-label" style={{ marginBottom: 8 }}>
                OBRA
              </div>
              <input
                type="text"
                value={obra}
                onChange={(e) => setObra(e.target.value)}
                placeholder="Ex.: Reforma fachada — Rua das Flores"
                autoComplete="off"
                style={{
                  width: "100%",
                  height: 44,
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  padding: "0 12px",
                  fontSize: 14,
                  fontFamily: "var(--font-body)",
                  color: "var(--ink)",
                  background: "var(--paper)",
                  outline: "none",
                }}
              />
            </div>
          </>
        )}

        {!selected && mode === "newclient" && (
          <div
            style={{
              marginTop: 10,
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: 14,
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
                marginBottom: 2,
              }}
            >
              <div className="eyebrow-label" style={{ marginBottom: 0 }}>
                NOVO CLIENTE
              </div>
              <button
                className="tap"
                onClick={() => setMode("search")}
                style={{
                  background: "transparent",
                  border: 0,
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--muted)",
                  cursor: "pointer",
                  padding: "2px 0",
                }}
              >
                voltar à busca
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              <button
                type="button"
                className="tap"
                onClick={() => setNc({ ...nc, type: "pessoa", cpf: "" })}
                style={{
                  height: 40,
                  borderRadius: 10,
                  border: `1px solid ${nc.type === "pessoa" ? "var(--ink)" : "var(--line)"}`,
                  background:
                    nc.type === "pessoa" ? "var(--ink)" : "var(--card)",
                  color: nc.type === "pessoa" ? "var(--paper)" : "var(--ink)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <User size={14} strokeWidth={1.75} /> Pessoa física
              </button>
              <button
                type="button"
                className="tap"
                onClick={() => setNc({ ...nc, type: "empresa", cpf: "" })}
                style={{
                  height: 40,
                  borderRadius: 10,
                  border: `1px solid ${nc.type === "empresa" ? "var(--ink)" : "var(--line)"}`,
                  background:
                    nc.type === "empresa" ? "var(--ink)" : "var(--card)",
                  color: nc.type === "empresa" ? "var(--paper)" : "var(--ink)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  fontFamily: "var(--font-body)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Building2 size={14} strokeWidth={1.75} /> Empresa
              </button>
            </div>
            <input
              type="text"
              placeholder={
                nc.type === "empresa"
                  ? "Razão social ou nome fantasia"
                  : "Nome completo"
              }
              value={nc.name}
              onChange={(e) => setNc({ ...nc, name: e.target.value })}
              style={{ ...inputStyle, borderColor: ncBorder("name") }}
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={nc.phone}
              onChange={(e) =>
                setNc({ ...nc, phone: fmtPhone(e.target.value) })
              }
              style={{ ...inputStyle, borderColor: ncBorder("phone") }}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder={
                nc.type === "empresa"
                  ? "CNPJ 00.000.000/0000-00 (obrigatório)"
                  : "CPF 000.000.000-00 (obrigatório)"
              }
              value={nc.cpf}
              onChange={(e) =>
                setNc({
                  ...nc,
                  cpf:
                    nc.type === "empresa"
                      ? fmtCnpj(e.target.value)
                      : fmtCpf(e.target.value),
                })
              }
              style={{ ...inputStyle, borderColor: ncBorder("cpf") }}
            />
            <input
              type="text"
              placeholder="Rua, avenida, córrego..."
              list="address-type-suggestions"
              value={nc.address}
              onChange={(e) => setNc({ ...nc, address: e.target.value })}
              style={{ ...inputStyle, borderColor: ncBorder("address") }}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="CEP 00000-000"
              value={nc.cep}
              onChange={(e) => setNc({ ...nc, cep: fmtCep(e.target.value) })}
              style={{ ...inputStyle, borderColor: ncBorder("cep") }}
            />
            <datalist id="address-type-suggestions">
              {ADDRESS_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: ".85fr 1.15fr",
                gap: 8,
              }}
            >
              <input
                type="text"
                inputMode="numeric"
                placeholder="Número"
                value={nc.number}
                onChange={(e) => setNc({ ...nc, number: e.target.value })}
                style={inputStyle}
              />
              <input
                type="text"
                placeholder="Bairro"
                value={nc.neighborhood}
                onChange={(e) => setNc({ ...nc, neighborhood: e.target.value })}
                style={{ ...inputStyle, borderColor: ncBorder("neighborhood") }}
              />
            </div>
            <input
              type="text"
              placeholder="Cidade"
              value={nc.city}
              onChange={(e) => setNc({ ...nc, city: e.target.value })}
              style={{ ...inputStyle, borderColor: ncBorder("city") }}
            />
            {ncMsg && (
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--brand)",
                  lineHeight: 1.35,
                }}
              >
                {ncMsg}
              </div>
            )}
            <textarea
              placeholder="Anotação interna (opcional)"
              value={nc.note}
              onChange={(e) => setNc({ ...nc, note: e.target.value })}
              style={{
                ...inputStyle,
                minHeight: 70,
                resize: "none",
                lineHeight: 1.4,
              }}
            />
            <button
              onClick={registerNewClient}
              className="btn btn-full"
              style={{
                background: "var(--ink)",
                color: "var(--paper)",
                marginTop: 2,
              }}
            >
              Cadastrar cliente
            </button>
          </div>
        )}
      </div>

      {/* Divisor */}
      <div
        style={{ height: 1, background: "var(--line)", margin: "0 16px 20px" }}
      />

      {/* ── PRODUTOS ── */}
      <div style={{ padding: "0 16px 190px" }}>
        <div className="eyebrow-label" style={{ marginBottom: 10 }}>
          PRODUTOS
        </div>
        <div style={{ position: "relative" }}>
          <div style={searchBox}>
            <Search
              size={18}
              strokeWidth={1.75}
              color="var(--muted)"
              style={{ flexShrink: 0 }}
            />
            <input
              type="text"
              placeholder="Buscar produto, marca ou código…"
              value={prodQ}
              onChange={(e) => setProdQ(e.target.value)}
              style={bareInput}
            />
          </div>
          {prodResults && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                right: 0,
                background: "var(--card)",
                border: "1px solid var(--line)",
                borderRadius: 12,
                zIndex: 100,
                boxShadow: "0 8px 24px rgba(28,26,23,.14)",
                overflow: "hidden",
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {prodResults.length === 0 && (
                <div
                  style={{
                    padding: "12px 14px",
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  Nenhum produto encontrado.
                </div>
              )}
              {prodResults.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => {
                    addCart(p.id, 1);
                    setProdQ("");
                  }}
                  style={{
                    padding: "12px 14px",
                    cursor: "pointer",
                    borderBottom:
                      i < prodResults.length - 1
                        ? "1px solid var(--line)"
                        : undefined,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 10 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: "var(--ink)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--muted)",
                        marginTop: 1,
                      }}
                    >
                      {p.code} · {p.brand} · R$ {brl(p.price)}
                    </div>
                  </div>
                  <PlusCircle
                    size={20}
                    strokeWidth={1.75}
                    color="var(--ink)"
                    style={{ flexShrink: 0 }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Itens adicionados */}
        {cartIds.length > 0 ? (
          <div style={{ marginTop: 14 }}>
            <div className="card" style={{ overflow: "hidden" }}>
              {cartIds.map((id, i) => {
                const p = data.catalog.find((x) => x.id === id)!;
                const qty = cart[id];
                return (
                  <div
                    key={id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: 8,
                      padding: "12px 14px",
                      borderBottom:
                        i < cartIds.length - 1
                          ? "1px dashed var(--line-strong)"
                          : undefined,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          color: "var(--ink)",
                          lineHeight: 1.3,
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--muted)",
                          marginTop: 3,
                        }}
                      >
                        {p.brand} · R$ {brl(p.price)}
                      </div>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: "var(--paper-deep)",
                          borderRadius: 8,
                          padding: "3px 6px",
                          marginTop: 7,
                        }}
                      >
                        <button
                          className="qty-btn"
                          onClick={() => addCart(id, -1)}
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <span
                          style={{
                            minWidth: 18,
                            textAlign: "center",
                            fontVariantNumeric: "tabular-nums",
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          {qty}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() => addCart(id, 1)}
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 13.5,
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        R$ {brl(p.price * qty)}
                      </span>
                      <button
                        className="tap"
                        onClick={() => addCart(id, -qty)}
                        style={{
                          background: "transparent",
                          border: 0,
                          padding: 4,
                          cursor: "pointer",
                          color: "var(--muted)",
                        }}
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 32, textAlign: "center" }}>
            <PackageOpen
              size={36}
              strokeWidth={1.2}
              color="var(--line-strong)"
              style={{ display: "block", margin: "0 auto 10px" }}
            />
            <div
              style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}
            >
              Pesquise um produto acima
              <br />
              para adicioná-lo ao orçamento.
            </div>
          </div>
        )}

        {/* Pagamento */}
        {cartIds.length > 0 && (
          <div
            id="payment-section"
            className={`payment-section card${needsAttention ? " needs-attention" : ""}`}
            style={{ marginTop: 14, padding: 14 }}
          >
            <div className="eyebrow-label" style={{ marginBottom: 4 }}>
              PAGAMENTO
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--ink)",
                marginBottom: 10,
              }}
            >
              Informe a situação do pagamento
            </div>
            <div className="payment-options">
              {PAYMENT_OPTS.map((opt) => {
                const Ico = opt.icon;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`payment-option${selectedPayment === opt.value ? " active" : ""}`}
                    onClick={() => selectPayment(opt.value)}
                  >
                    <Ico size={16} strokeWidth={1.85} />
                    {opt.value}
                  </button>
                );
              })}
            </div>
            <button
              className="payment-note-toggle"
              type="button"
              onClick={() => setShowNote((s) => !s)}
              style={{ marginTop: 12 }}
            >
              <MessageSquarePlus size={14} strokeWidth={2} /> adicionar
              observação
            </button>
            {showNote && (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: comprovante enviado para a loja, cliente retira amanhã."
                style={{
                  marginTop: 10,
                  width: "100%",
                  minHeight: 74,
                  resize: "none",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontFamily: "var(--font-body)",
                  color: "var(--ink)",
                  background: "var(--paper)",
                  outline: "none",
                  lineHeight: 1.45,
                }}
              />
            )}
          </div>
        )}
      </div>

      {submitError && (
        <div
          style={{
            position: "fixed",
            bottom: "calc(88px + env(safe-area-inset-bottom))",
            left: 16,
            right: 16,
            background: "#FCEAEA",
            color: "#CC0000",
            border: "1px solid rgba(204,0,0,.28)",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
            zIndex: 50,
          }}
        >
          {submitError}
        </div>
      )}

      {/* Cart bar */}
      {cartQty > 0 && (
        <div className="cart-bar">
          <div>
            <div className="cart-meta">
              {cartQty} {cartQty === 1 ? "ITEM" : "ITENS"} · BÔNUS{" "}
              {cartBonus.toLocaleString("pt-BR")} pts
            </div>
            <div className="cart-total">R$ {brl(cartTotal)}</div>
          </div>
          <button
            className={`cart-send${!selectedPayment ? " needs-payment" : ""}`}
            onClick={submitOrder}
            disabled={submitting}
          >
            <span>
              {submitting
                ? "Enviando..."
                : selectedPayment
                  ? "Enviar à loja"
                  : "Escolha pagamento"}
            </span>
            <ArrowRight size={15} strokeWidth={2} />
          </button>
        </div>
      )}
    </>
  );
}
