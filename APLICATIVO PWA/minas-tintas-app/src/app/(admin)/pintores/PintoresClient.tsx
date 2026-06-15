"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, X, Eye, EyeOff } from "lucide-react";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function pts(n: number) {
  return n.toLocaleString("pt-BR");
}

function slugify(name: string) {
  return encodeURIComponent(name.toLowerCase().replace(/\s+/g, "-"));
}

function maskCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function maskCep(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export type PainterRow = {
  id: string;
  name: string;
  cpf: string;
  city: string;
  since: string;
  orders: number;
  points: number;
  active: boolean;
};
export default function PintoresClient({
  painters,
}: {
  painters: PainterRow[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [formNome, setFormNome] = useState("");
  const [formCpf, setFormCpf] = useState("");
  const [formTelefone, setFormTelefone] = useState("");
  const [formCep, setFormCep] = useState("");
  const [formCidade, setFormCidade] = useState("");
  const [formEndereco, setFormEndereco] = useState("");
  const [formNumero, setFormNumero] = useState("");
  const [formComplemento, setFormComplemento] = useState("");
  const [formBairro, setFormBairro] = useState("");
  const [formSenha, setFormSenha] = useState("");
  const [formConfirmarSenha, setFormConfirmarSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [cepLoading, setCepLoading] = useState(false);

  const q = search.toLowerCase().trim();
  const filtered = q
    ? painters.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.cpf.includes(q) ||
          p.city.toLowerCase().includes(q),
      )
    : painters;

  const activeCount = painters.filter((p) => p.active).length;

  async function handleCepChange(raw: string) {
    const masked = maskCep(raw);
    setFormCep(masked);
    const digits = masked.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormEndereco(data.logradouro || "");
        setFormBairro(data.bairro || "");
        setFormCidade((prev) => prev || data.localidade || "");
      }
    } catch {}
    setCepLoading(false);
  }

  function openModal() {
    setFormNome("");
    setFormCpf("");
    setFormTelefone("");
    setFormCep("");
    setFormCidade("");
    setFormEndereco("");
    setFormNumero("");
    setFormComplemento("");
    setFormBairro("");
    setFormSenha("");
    setFormConfirmarSenha("");
    setShowSenha(false);
    setShowConfirmarSenha(false);
    setErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function submitForm() {
    const errs: Record<string, boolean> = {};
    if (!formNome.trim()) errs.nome = true;
    if (!formCpf.trim()) errs.cpf = true;
    if (!formCidade.trim()) errs.cidade = true;
    if (!formTelefone.trim()) errs.telefone = true;
    if (formSenha.length < 6) errs.senha = true;
    if (formConfirmarSenha !== formSenha) errs.confirmarSenha = true;
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setModalOpen(false);
  }

  const inputStyle = (hasError?: boolean): React.CSSProperties => ({
    width: "100%",
    height: 40,
    borderRadius: 10,
    fontSize: 13,
    border: `1px solid ${hasError ? "#CC0000" : "var(--line)"}`,
    background: "var(--card)",
    color: "var(--ink)",
    fontFamily: "var(--font-body)",
    outline: "none",
    padding: "0 12px",
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--ink-2)",
  };

  const fieldStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

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
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 4,
            }}
          >
            CADASTRO
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
            Pintores parceiros
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 6 }}>
            {activeCount} pintores ativos.
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
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: "0 12px",
              height: 36,
              fontSize: 13,
              color: "var(--muted)",
              width: 280,
            }}
          >
            <Search size={15} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Buscar por nome, CPF, cidade…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
          <button
            onClick={openModal}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "9px 14px",
              borderRadius: 10,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: 13,
              background: "var(--ink)",
              color: "var(--paper)",
              border: "1px solid transparent",
              cursor: "pointer",
            }}
          >
            <UserPlus size={14} strokeWidth={2} />
            Cadastrar pintor
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: "12px 32px 32px" }}>
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--line)",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px 110px 90px 150px 120px",
              padding: "12px 18px",
              gap: 16,
              background: "var(--paper-deep)",
              borderBottom: "1px solid var(--line)",
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            <div>Pintor</div>
            <div>Cidade</div>
            <div>Desde</div>
            <div style={{ textAlign: "right" }}>Pedidos</div>
            <div style={{ textAlign: "right" }}>Saldo</div>
            <div>Status</div>
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              Nenhum pintor encontrado.
            </div>
          ) : (
            filtered.map((p) => (
              <div
                key={p.name}
                onClick={() => router.push(`/pintores/${p.id}`)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 160px 110px 90px 150px 120px",
                  padding: "14px 18px",
                  gap: 16,
                  alignItems: "center",
                  borderBottom:
                    filtered.indexOf(p) < filtered.length - 1
                      ? "1px solid var(--line)"
                      : "none",
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--ink-2)",
                  transition: "background .1s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "var(--paper-deep)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "var(--paper-deep)",
                      color: "var(--ink)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      fontSize: 13,
                      border: "1px solid var(--line)",
                    }}
                  >
                    {initials(p.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--ink)" }}>
                      {p.name}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {p.cpf}
                    </div>
                  </div>
                </div>
                <div style={{ color: "var(--ink-2)", fontSize: 13 }}>
                  {p.city}
                </div>
                <div style={{ color: "var(--muted)", fontSize: 12.5 }}>
                  {p.since}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <strong style={{ color: "var(--ink)" }}>{p.orders}</strong>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <strong style={{ color: "var(--ink)" }}>
                    {pts(p.points)} pts
                  </strong>
                </div>
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "3px 9px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      background: p.active ? "#E8EFE3" : "var(--paper-deep)",
                      color: p.active ? "#4F7A4A" : "var(--muted)",
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: p.active ? "#4F7A4A" : "var(--muted)",
                      }}
                    />
                    {p.active ? "ativo" : "inativo"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal — Cadastrar pintor */}
      {modalOpen && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(28,26,23,.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--card)",
              borderRadius: 16,
              width: "100%",
              maxWidth: 520,
              boxShadow: "0 18px 50px rgba(28,26,23,.22)",
              border: "1px solid var(--line)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px 16px",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 20,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                }}
              >
                Cadastrar pintor
              </span>
              <button
                onClick={closeModal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  cursor: "pointer",
                  color: "var(--muted)",
                  flexShrink: 0,
                }}
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            <div
              style={{
                padding: "22px 22px 6px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
                maxHeight: "68vh",
                overflowY: "auto",
              }}
            >
              <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>
                  Nome completo <span style={{ color: "var(--brand)" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex.: João da Silva"
                  value={formNome}
                  onChange={(e) => {
                    setFormNome(e.target.value);
                    setErrors((v) => ({ ...v, nome: false }));
                  }}
                  style={inputStyle(errors.nome)}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  CPF <span style={{ color: "var(--brand)" }}>*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  value={formCpf}
                  onChange={(e) => {
                    setFormCpf(maskCpf(e.target.value));
                    setErrors((v) => ({ ...v, cpf: false }));
                  }}
                  style={inputStyle(errors.cpf)}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Telefone <span style={{ color: "var(--brand)" }}>*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="(32) 99999-9999"
                  value={formTelefone}
                  onChange={(e) => {
                    setFormTelefone(maskPhone(e.target.value));
                    setErrors((v) => ({ ...v, telefone: false }));
                  }}
                  style={inputStyle(errors.telefone)}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>CEP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="00000-000"
                  value={formCep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  style={{ ...inputStyle(), opacity: cepLoading ? 0.6 : 1 }}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Cidade <span style={{ color: "var(--brand)" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex.: São João del-Rei"
                  value={formCidade}
                  onChange={(e) => {
                    setFormCidade(e.target.value);
                    setErrors((v) => ({ ...v, cidade: false }));
                  }}
                  style={inputStyle(errors.cidade)}
                />
              </div>
              <div style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Endereço</label>
                <input
                  type="text"
                  placeholder="Ex.: Rua das Flores, Av. Brasil…"
                  value={formEndereco}
                  onChange={(e) => setFormEndereco(e.target.value)}
                  style={inputStyle()}
                />
              </div>
              <div style={{ ...fieldStyle, maxWidth: 140 }}>
                <label style={labelStyle}>Número</label>
                <input
                  type="text"
                  placeholder="Ex.: 142"
                  value={formNumero}
                  onChange={(e) => setFormNumero(e.target.value)}
                  style={inputStyle()}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Complemento</label>
                <input
                  type="text"
                  placeholder="Apto, sala, casa…"
                  value={formComplemento}
                  onChange={(e) => setFormComplemento(e.target.value)}
                  style={inputStyle()}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>Bairro</label>
                <input
                  type="text"
                  placeholder="Ex.: Centro"
                  value={formBairro}
                  onChange={(e) => setFormBairro(e.target.value)}
                  style={inputStyle()}
                />
              </div>

              {/* Divisor — Acesso ao app */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  borderTop: "1px solid var(--line)",
                  paddingTop: 16,
                  marginTop: 2,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink-2)",
                  }}
                >
                  Acesso ao app
                </div>
              </div>

              <div
                style={{
                  gridColumn: "1 / -1",
                  fontSize: 12.5,
                  color: "var(--muted)",
                  background: "var(--paper-deep)",
                  borderRadius: 8,
                  padding: "9px 12px",
                }}
              >
                O pintor fará login com o{" "}
                <strong style={{ color: "var(--ink-2)" }}>
                  número de telefone
                </strong>{" "}
                cadastrado acima.
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Senha <span style={{ color: "var(--brand)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showSenha ? "text" : "password"}
                    placeholder="Mín. 6 caracteres"
                    value={formSenha}
                    onChange={(e) => {
                      setFormSenha(e.target.value);
                      setErrors((v) => ({ ...v, senha: false }));
                    }}
                    style={{ ...inputStyle(errors.senha), paddingRight: 36 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                    }}
                  >
                    {showSenha ? (
                      <EyeOff size={14} strokeWidth={1.75} />
                    ) : (
                      <Eye size={14} strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle}>
                  Confirmar senha{" "}
                  <span style={{ color: "var(--brand)" }}>*</span>
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirmarSenha ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={formConfirmarSenha}
                    onChange={(e) => {
                      setFormConfirmarSenha(e.target.value);
                      setErrors((v) => ({ ...v, confirmarSenha: false }));
                    }}
                    style={{
                      ...inputStyle(errors.confirmarSenha),
                      paddingRight: 36,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmarSenha((v) => !v)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                    }}
                  >
                    {showConfirmarSenha ? (
                      <EyeOff size={14} strokeWidth={1.75} />
                    ) : (
                      <Eye size={14} strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "14px 22px 20px",
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                borderTop: "1px solid var(--line)",
                background: "var(--paper)",
              }}
            >
              <button
                onClick={closeModal}
                style={{
                  padding: "9px 16px",
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
                Cancelar
              </button>
              <button
                onClick={submitForm}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 16px",
                  borderRadius: 10,
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 13,
                  background: "var(--ink)",
                  color: "var(--paper)",
                  border: "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                <UserPlus size={14} strokeWidth={2} />
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
