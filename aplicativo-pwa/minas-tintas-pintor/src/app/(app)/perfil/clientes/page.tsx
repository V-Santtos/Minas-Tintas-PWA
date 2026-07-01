"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
  Search,
  User,
} from "lucide-react";
import { ADDRESS_TYPES } from "@/lib/pintor-data";
import { usePintor } from "@/lib/pintor-store";
import { vincularCliente } from "@/lib/clientes-actions";
import { fmtCpf, fmtCnpj, isValidDocumento } from "@/lib/documento";

type ClientKind = "pessoa" | "empresa";
type ViewMode = "form" | "list";
type MyClient = {
  id: string;
  type: ClientKind;
  name: string;
  phone: string;
  document: string;
  cep?: string;
  address?: string;
  number?: string;
  city: string;
  neighborhood?: string;
  note?: string;
};

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

const segmentButton = (active: boolean): React.CSSProperties => ({
  height: 40,
  borderRadius: 10,
  border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
  background: active ? "var(--ink)" : "var(--card)",
  color: active ? "var(--paper)" : "var(--ink)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  fontFamily: "var(--font-body)",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
});

export default function ClientesPage() {
  const router = useRouter();
  const [view, setView] = useState<ViewMode>("form");
  const [type, setType] = useState<ClientKind>("pessoa");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [documentValue, setDocumentValue] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [errFields, setErrFields] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const { data } = usePintor();

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.clientes;
    return data.clientes.filter(
      (client) =>
        client.name.toLowerCase().includes(q) ||
        client.phone.includes(q) ||
        client.document.includes(q) ||
        client.city.toLowerCase().includes(q),
    );
  }, [data.clientes, query]);

  const docLabel = type === "empresa" ? "CNPJ" : "CPF";
  const docPlaceholder =
    type === "empresa" ? "CNPJ 00.000.000/0000-00" : "CPF 000.000.000-00";
  const isEditing = editingId !== null;

  function border(field: string) {
    return errFields.includes(field) ? "var(--brand)" : "var(--line)";
  }

  function clearForm() {
    setType("pessoa");
    setName("");
    setPhone("");
    setDocumentValue("");
    setCep("");
    setAddress("");
    setNumber("");
    setNeighborhood("");
    setCity("");
    setNote("");
    setErrFields([]);
    setError("");
    setEditingId(null);
  }

  function openCreateForm() {
    clearForm();
    setView("form");
  }

  function changeType(next: ClientKind) {
    setType(next);
    setDocumentValue("");
    setErrFields((fields) => fields.filter((field) => field !== "document"));
  }

  function changeDocument(raw: string) {
    setDocumentValue(type === "empresa" ? fmtCnpj(raw) : fmtCpf(raw));
  }

  async function submit() {
    const missing: string[] = [];
    if (!name.trim()) missing.push("name");
    if (!phone.trim()) missing.push("phone");
    if (!isValidDocumento(documentValue, type)) missing.push("document");
    if (!isEditing && cep.replace(/\D/g, "").length !== 8) missing.push("cep");
    if (!isEditing && !address.trim()) missing.push("address");
    if (!isEditing && !neighborhood.trim()) missing.push("neighborhood");
    if (!city.trim()) missing.push("city");
    if (missing.length) {
      setErrFields(missing);
      setError(
        "Preencha corretamente os campos obrigatórios para cadastrar o cliente.",
      );
      setSuccess("");
      return;
    }

    const payload = {
      nome: name.trim(),
      type,
      documento: documentValue,
      telefone: phone.trim(),
      cep: cep.trim(),
      rua: address.trim(),
      numero: number.trim(),
      complemento: note.trim(),
      bairro: neighborhood.trim(),
      cidade: city.trim(),
    };

    const res = await vincularCliente(payload);
    if (!res.ok) {
      setErrFields([]);
      setSuccess("");
      setError(res.error);
      return;
    }

    setErrFields([]);
    setError("");
    setSuccess(
      res.clientCreated
        ? `${payload.nome} foi cadastrado. O vínculo será efetivado quando um orçamento com ele for aprovado.`
        : res.linkCreated
          ? "Cliente adicionado à sua agenda. O vínculo será efetivado quando um orçamento com ele for aprovado."
          : "Esse cliente já está na sua agenda.",
    );
    clearForm();
    setView("list");
    router.refresh();
  }

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
        <div>
          <div className="eyebrow-label" style={{ marginBottom: 3 }}>
            CLIENTES
          </div>
          <div className="page-title" style={{ fontSize: 20 }}>
            {view === "form"
              ? isEditing
                ? "Editar cliente"
                : "Cadastrar cliente"
              : "Meus clientes"}
          </div>
        </div>
      </div>

      <div
        style={{
          margin: "0 16px 12px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        <button
          type="button"
          className="tap"
          onClick={openCreateForm}
          style={segmentButton(view === "form")}
        >
          Cadastrar
        </button>
        <button
          type="button"
          className="tap"
          onClick={() => setView("list")}
          style={segmentButton(view === "list")}
        >
          Meus clientes
        </button>
      </div>

      {success && (
        <div
          className="card"
          style={{
            margin: "0 16px 12px",
            padding: "12px 14px",
            background: "var(--paper-deep)",
            borderColor: "var(--line)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Clock
            size={18}
            strokeWidth={1.75}
            color="var(--muted)"
            style={{ flexShrink: 0 }}
          />
          <div>
            <div
              style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}
            >
              Cliente cadastrado · vínculo pendente
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>
              {success}
            </div>
          </div>
        </div>
      )}

      {view === "form" && (
        <div
          className="card"
          style={{
            margin: "0 16px 100px",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div className="eyebrow-label" style={{ marginBottom: 2 }}>
            {isEditing ? "EDITAR CLIENTE" : "NOVO CLIENTE"}
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <button
              type="button"
              className="tap"
              onClick={() => changeType("pessoa")}
              style={segmentButton(type === "pessoa")}
            >
              <User size={14} strokeWidth={1.75} /> Pessoa física
            </button>
            <button
              type="button"
              className="tap"
              onClick={() => changeType("empresa")}
              style={segmentButton(type === "empresa")}
            >
              <Building2 size={14} strokeWidth={1.75} /> Empresa
            </button>
          </div>
          <input
            type="text"
            placeholder={
              type === "empresa"
                ? "Razão social ou nome fantasia"
                : "Nome completo"
            }
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ ...inputStyle, borderColor: border("name") }}
          />
          <input
            type="tel"
            placeholder="Telefone"
            value={phone}
            onChange={(e) => setPhone(fmtPhone(e.target.value))}
            style={{ ...inputStyle, borderColor: border("phone") }}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder={`${docPlaceholder} (obrigatório)`}
            value={documentValue}
            onChange={(e) => changeDocument(e.target.value)}
            style={{ ...inputStyle, borderColor: border("document") }}
            aria-label={docLabel}
          />
          <input
            type="text"
            placeholder="Rua, avenida, córrego..."
            list="address-type-suggestions"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ ...inputStyle, borderColor: border("address") }}
          />
          <input
            type="text"
            inputMode="numeric"
            placeholder="CEP 00000-000"
            value={cep}
            onChange={(e) => setCep(fmtCep(e.target.value))}
            style={{ ...inputStyle, borderColor: border("cep") }}
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
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Bairro"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              style={{ ...inputStyle, borderColor: border("neighborhood") }}
            />
          </div>
          <input
            type="text"
            placeholder="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ ...inputStyle, borderColor: border("city") }}
          />
          {error && (
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--brand)",
                lineHeight: 1.35,
              }}
            >
              {error}
            </div>
          )}
          <textarea
            placeholder="Anotação interna (opcional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{
              ...inputStyle,
              minHeight: 82,
              resize: "none",
              lineHeight: 1.4,
            }}
          />
          {isEditing && (
            <button
              type="button"
              className="tap"
              onClick={() => {
                clearForm();
                setView("list");
              }}
              style={{
                background: "transparent",
                border: 0,
                color: "var(--muted)",
                fontFamily: "var(--font-body)",
                fontSize: 13,
                fontWeight: 700,
                padding: "4px 0",
                cursor: "pointer",
              }}
            >
              Cancelar edição
            </button>
          )}
          <button
            onClick={submit}
            className="btn btn-full"
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              marginTop: 2,
            }}
          >
            {isEditing ? "Salvar alterações" : "Cadastrar cliente"}
          </button>
        </div>
      )}

      {view === "list" && (
        <div style={{ padding: "0 16px 100px" }}>
          <div
            style={{
              ...inputStyle,
              height: 44,
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              gap: 9,
              marginBottom: 12,
            }}
          >
            <Search
              size={17}
              strokeWidth={1.75}
              color="var(--muted)"
              style={{ flexShrink: 0 }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome, cidade ou documento"
              style={{
                border: 0,
                outline: "none",
                background: "transparent",
                width: "100%",
                minWidth: 0,
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                color: "var(--ink)",
              }}
            />
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            {filteredClients.length === 0 && (
              <div
                style={{
                  padding: 16,
                  fontSize: 13,
                  color: "var(--muted)",
                  textAlign: "center",
                }}
              >
                Nenhum cliente encontrado.
              </div>
            )}
            {filteredClients.map((client, index) => (
              <button
                key={client.id}
                type="button"
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: 0,
                  padding: "13px 14px",
                  borderBottom:
                    index < filteredClients.length - 1
                      ? "1px solid var(--line)"
                      : undefined,
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "var(--ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {client.name}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {client.phone}
                    </div>
                    <span
                      style={{
                        marginTop: 7,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        borderRadius: 999,
                        padding: "3px 8px",
                        fontSize: 10.5,
                        fontWeight: 700,
                        background: client.linked
                          ? "var(--success-tint)"
                          : "var(--paper-deep)",
                        border: `1px solid ${client.linked ? "#C6DCC0" : "var(--line)"}`,
                        color: client.linked
                          ? "var(--success)"
                          : "var(--muted)",
                      }}
                    >
                      {client.linked ? (
                        <CheckCircle size={11} strokeWidth={2} />
                      ) : (
                        <Clock size={11} strokeWidth={2} />
                      )}
                      {client.linked ? "Vinculado" : "Pendente"}
                    </span>
                  </div>
                  <span
                    style={{
                      flexShrink: 0,
                      border: "1px solid var(--line)",
                      borderRadius: 999,
                      padding: "4px 8px",
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: "var(--ink)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {client.type === "empresa" ? "Empresa" : "Pessoa física"}
                  </span>
                </div>
                <div
                  style={{
                    marginTop: 9,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    fontSize: 11.5,
                    color: "var(--muted)",
                  }}
                >
                  <span>{client.document}</span>
                  <span
                    style={{
                      textAlign: "right",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {client.city}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
