"use client";

import { useState, useEffect, type FormEvent } from "react";
import { X, User, Building2, Loader2 } from "lucide-react";
import { type Client } from "@/lib/mock";
import { saveClient } from "@/app/(admin)/dashboard/actions";

function maskCPF(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskCNPJ(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function maskCEP(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

type Props = {
  open: boolean;
  prefillName?: string;
  editClient?: Client | null;
  onClose: () => void;
  onCreated?: (client: { id: string; nome: string }) => void;
};

const EMPTY = {
  name: "",
  documento: "",
  phone: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
};

export function CadastrarClienteModal({
  open,
  prefillName = "",
  editClient,
  onClose,
  onCreated,
}: Props) {
  const [type, setType] = useState<"pessoa" | "empresa">("pessoa");
  const [fields, setFields] = useState({ ...EMPTY, name: prefillName });
  const [cepLoading, setCepLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!editClient;

  const set = (key: keyof typeof EMPTY, value: string) =>
    setFields((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (open) {
      setCepLoading(false);
      setSubmitting(false);
      setError("");
      if (editClient) {
        setType(editClient.type);
        setFields({
          name: editClient.name,
          documento: editClient.cpf ?? "", // Client.cpf carrega o documento
          phone: editClient.phone ?? "",
          cep: editClient.cep ?? "",
          rua: editClient.rua ?? "",
          numero: editClient.numero ?? "",
          complemento: editClient.complemento ?? "",
          bairro: editClient.bairro ?? "",
          cidade: editClient.cidade ?? "",
        });
      } else {
        setType("pessoa");
        setFields({ ...EMPTY, name: prefillName });
      }
    }
  }, [open, prefillName, editClient]);

  async function fetchCEP(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFields((f) => ({
          ...f,
          rua: data.logradouro || f.rua,
          bairro: data.bairro || f.bairro,
          cidade: data.localidade || f.cidade,
        }));
      }
    } catch {
      /* silencia falha de rede */
    } finally {
      setCepLoading(false);
    }
  }

  if (!open) return null;

  const docLabel = type === "empresa" ? "CNPJ" : "CPF";

  function changeType(next: "pessoa" | "empresa") {
    setType(next);
    set("documento", ""); // máscara muda; zera p/ não misturar formato
  }

  function changeDoc(raw: string) {
    set("documento", type === "empresa" ? maskCNPJ(raw) : maskCPF(raw));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const docDigits = fields.documento.replace(/\D/g, "");
    const docLen = type === "empresa" ? 14 : 11;
    if (
      !fields.name.trim() ||
      !fields.phone.trim() ||
      docDigits.length !== docLen
    ) {
      setError(`Preencha nome, telefone e ${docLabel} corretamente.`);
      return;
    }

    setSubmitting(true);
    setError("");
    const res = await saveClient({
      id: editClient?.id,
      nome: fields.name,
      type,
      documento: fields.documento,
      telefone: fields.phone,
      cep: fields.cep,
      rua: fields.rua,
      numero: fields.numero,
      complemento: fields.complemento,
      bairro: fields.bairro,
      cidade: fields.cidade,
    });
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (res.client) onCreated?.(res.client);
    onClose();
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: 40,
    borderRadius: 10,
    border: "1px solid var(--line)",
    background: "var(--card)",
    padding: "0 12px",
    fontFamily: "var(--font-body)",
    fontSize: 13,
    color: "var(--ink)",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    display: "grid",
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: "var(--ink-2)",
  };

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,26,23,.38)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 60,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--card)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          boxShadow: "0 18px 50px rgba(28,26,23,.22)",
          overflow: "hidden",
        }}
      >
        {/* Cabeçalho */}
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
              {isEdit ? "Editar cliente" : "Cadastrar cliente"}
            </h2>
            <p
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "var(--muted)",
                lineHeight: 1.45,
              }}
            >
              {isEdit
                ? "Atualize os dados do cliente."
                : "Preencha os dados do novo cliente."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
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
              flexShrink: 0,
            }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Corpo */}
        <div
          style={{
            padding: "20px 22px 6px",
            display: "grid",
            gap: 14,
            maxHeight: "68vh",
            overflowY: "auto",
          }}
        >
          {/* Tipo */}
          <label style={labelStyle}>
            Tipo
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
              }}
            >
              {(
                [
                  { value: "pessoa", label: "Pessoa física", Icon: User },
                  { value: "empresa", label: "Empresa", Icon: Building2 },
                ] as const
              ).map(({ value, label, Icon }) => {
                const active = type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => changeType(value)}
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
                      cursor: "pointer",
                    }}
                  >
                    <Icon size={14} strokeWidth={1.75} />
                    {label}
                  </button>
                );
              })}
            </div>
          </label>

          {/* Nome */}
          <label style={labelStyle}>
            Nome *
            <input
              value={fields.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={
                type === "empresa"
                  ? "Razão social ou nome fantasia..."
                  : "Nome completo..."
              }
              required
              autoFocus
              style={inputStyle}
            />
          </label>

          {/* Documento + Telefone */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <label style={labelStyle}>
              {docLabel} *
              <input
                value={fields.documento}
                onChange={(e) => changeDoc(e.target.value)}
                placeholder={
                  type === "empresa" ? "00.000.000/0000-00" : "000.000.000-00"
                }
                inputMode="numeric"
                required
                style={inputStyle}
                aria-label={docLabel}
              />
            </label>
            <label style={labelStyle}>
              Telefone *
              <input
                value={fields.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="(32) 99999-0000"
                type="tel"
                required
                style={inputStyle}
              />
            </label>
          </div>

          {/* Divisor endereço */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              margin: "2px 0",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
                whiteSpace: "nowrap",
              }}
            >
              Endereço
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          </div>

          {/* CEP */}
          <label style={labelStyle}>
            CEP
            <div style={{ position: "relative" }}>
              <input
                value={fields.cep}
                onChange={(e) => {
                  const masked = maskCEP(e.target.value);
                  set("cep", masked);
                  fetchCEP(masked);
                }}
                placeholder="00000-000"
                style={{ ...inputStyle, paddingRight: cepLoading ? 36 : 12 }}
              />
              {cepLoading && (
                <div
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                  }}
                >
                  <Loader2
                    size={14}
                    strokeWidth={2}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                </div>
              )}
            </div>
          </label>

          {/* Rua + Número */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px",
              gap: 10,
            }}
          >
            <label style={labelStyle}>
              Rua
              <input
                value={fields.rua}
                onChange={(e) => set("rua", e.target.value)}
                placeholder="Nome da rua..."
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Número
              <input
                value={fields.numero}
                onChange={(e) => set("numero", e.target.value)}
                placeholder="123"
                style={inputStyle}
              />
            </label>
          </div>

          {/* Complemento */}
          <label style={labelStyle}>
            Complemento
            <input
              value={fields.complemento}
              onChange={(e) => set("complemento", e.target.value)}
              placeholder="Apto, bloco, sala..."
              style={inputStyle}
            />
          </label>

          {/* Bairro + Cidade */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            <label style={labelStyle}>
              Bairro
              <input
                value={fields.bairro}
                onChange={(e) => set("bairro", e.target.value)}
                placeholder="Nome do bairro..."
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Cidade
              <input
                value={fields.cidade}
                onChange={(e) => set("cidade", e.target.value)}
                placeholder="Simonésia"
                style={inputStyle}
              />
            </label>
          </div>

          {error && (
            <div
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: "var(--brand)",
                lineHeight: 1.4,
              }}
            >
              {error}
            </div>
          )}
        </div>

        {/* Rodapé */}
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
            onClick={onClose}
            disabled={submitting}
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--card)",
              color: "var(--ink-2)",
              fontSize: 13,
              fontWeight: 600,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              height: 38,
              padding: "0 15px",
              borderRadius: 10,
              border: "1px solid transparent",
              background: "var(--ink)",
              color: "var(--paper)",
              fontSize: 13,
              fontWeight: 600,
              cursor: submitting ? "default" : "pointer",
              opacity: submitting ? 0.7 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 2px 6px rgba(28,26,23,.10)",
            }}
          >
            {submitting && (
              <Loader2
                size={14}
                strokeWidth={2}
                style={{ animation: "spin 1s linear infinite" }}
              />
            )}
            {submitting
              ? "Salvando..."
              : isEdit
                ? "Salvar alterações"
                : "Cadastrar cliente"}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
