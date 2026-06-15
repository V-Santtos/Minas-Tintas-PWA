"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  UserX,
  UserCheck,
  X,
  Check,
  ChevronRight,
  Package,
  Gift,
  TrendingUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { brl, type Painter, type Order } from "@/lib/mock";

const STATUS_CFG: Record<string, { bg: string; fg: string }> = {
  pendente: { bg: "#F6ECDB", fg: "#E07A10" },
  aprovado: { bg: "#E8EFE3", fg: "#4F7A4A" },
  recusado: { bg: "#FCEAEA", fg: "#CC0000" },
  estornado: { bg: "#F2EDE4", fg: "#8A817A" },
  cancelado: { bg: "#F2EDE4", fg: "#8A817A" },
};

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

export default function PintorDetailClient({
  painter,
  orders,
}: {
  painter: Painter;
  orders: Order[];
}) {
  const router = useRouter();

  const p = painter;
  const painterOrders = orders;

  const [editOpen, setEditOpen] = useState(false);
  const [formNome, setFormNome] = useState(p.name);
  const [formCpf, setFormCpf] = useState(p.cpf);
  const [formTelefone, setFormTelefone] = useState("");
  const [formCep, setFormCep] = useState("");
  const [formCidade, setFormCidade] = useState(p.city);
  const [formEndereco, setFormEndereco] = useState("");
  const [formNumero, setFormNumero] = useState("");
  const [formComplemento, setFormComplemento] = useState("");
  const [formBairro, setFormBairro] = useState("");
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [formNovaSenha, setFormNovaSenha] = useState("");
  const [formConfirmarNovaSenha, setFormConfirmarNovaSenha] = useState("");
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarNovaSenha, setShowConfirmarNovaSenha] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [cepLoading, setCepLoading] = useState(false);

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

  function openEdit() {
    setFormNome(p.name);
    setFormCpf(p.cpf);
    setFormCidade(p.city);
    setFormTelefone(p.phone);
    setFormCep("");
    setFormEndereco("");
    setFormNumero("");
    setFormComplemento("");
    setFormBairro("");
    setShowChangePwd(false);
    setFormNovaSenha("");
    setFormConfirmarNovaSenha("");
    setShowNovaSenha(false);
    setShowConfirmarNovaSenha(false);
    setErrors({});
    setEditOpen(true);
  }

  function submitEdit() {
    const errs: Record<string, boolean> = {};
    if (!formNome.trim()) errs.nome = true;
    if (!formCpf.trim()) errs.cpf = true;
    if (!formCidade.trim()) errs.cidade = true;
    if (showChangePwd) {
      if (formNovaSenha.length < 6) errs.novaSenha = true;
      if (formConfirmarNovaSenha !== formNovaSenha)
        errs.confirmarNovaSenha = true;
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setEditOpen(false);
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
          <button
            onClick={() => router.push("/pintores")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontFamily: "var(--font-body)",
            }}
          >
            <ArrowLeft size={14} strokeWidth={2} />
            Pintores
          </button>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginTop: 10,
              marginBottom: 10,
            }}
          >
            PERFIL DO PINTOR
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                flexShrink: 0,
                background: "var(--paper-deep)",
                color: "var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 19,
                border: "1px solid var(--line)",
              }}
            >
              {initials(p.name)}
            </div>
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 24,
                  letterSpacing: "-0.025em",
                  color: "var(--ink)",
                  lineHeight: 1.05,
                }}
              >
                {p.name}
              </h1>
              <p
                style={{ fontSize: 13.5, color: "var(--ink-2)", marginTop: 5 }}
              >
                {p.cpf}
                <span style={{ color: "var(--line-strong)", margin: "0 6px" }}>
                  ·
                </span>
                {p.city}
                <span style={{ color: "var(--line-strong)", margin: "0 6px" }}>
                  ·
                </span>
                parceiro desde {p.since}
              </p>
            </div>
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
            onClick={openEdit}
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
            <Pencil size={14} strokeWidth={2} />
            Editar cadastro
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
              background: p.active ? "rgba(204,0,0,.06)" : "var(--card)",
              color: p.active ? "#CC0000" : "var(--ink)",
              border: `1px solid ${p.active ? "rgba(204,0,0,.25)" : "var(--line)"}`,
              cursor: "pointer",
            }}
          >
            {p.active ? (
              <>
                <UserX size={14} strokeWidth={2} /> Inativar
              </>
            ) : (
              <>
                <UserCheck size={14} strokeWidth={2} /> Ativar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          padding: "20px 32px 16px",
        }}
      >
        {/* Pedidos */}
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
            <Package size={22} strokeWidth={1.75} style={{ color: "#fff" }} />
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
              PEDIDOS
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
              {p.orders}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {p.approved} aprovados
            </div>
          </div>
        </div>
        {/* Saldo em pontos */}
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
              SALDO EM PONTOS
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
              {pts(p.points)}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              pts disponíveis na lojinha
            </div>
          </div>
        </div>
        {/* Volume total */}
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
              VOLUME TOTAL
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 28,
                color: "#4F7A4A",
                letterSpacing: "-0.03em",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              R$ {brl(p.volume)}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              em pedidos aprovados
            </div>
          </div>
        </div>
      </div>

      {/* Orders history */}
      <div style={{ padding: "4px 32px 32px" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 12,
          }}
        >
          Histórico de pedidos
        </div>
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
              gridTemplateColumns: "70px 1fr 1fr 90px 130px 185px 100px",
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
            <div>#</div>
            <div>Pintor</div>
            <div>Obra</div>
            <div>Data</div>
            <div style={{ textAlign: "right" }}>Total</div>
            <div>Status</div>
            <div />
          </div>

          {painterOrders.length === 0 ? (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: "var(--muted)",
                fontSize: 13,
              }}
            >
              Nenhum pedido encontrado.
            </div>
          ) : (
            painterOrders.map((o) => {
              const s = STATUS_CFG[o.status] || STATUS_CFG.estornado;
              return (
                <div
                  key={o.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "70px 1fr 1fr 90px 130px 185px 100px",
                    padding: "14px 18px",
                    gap: 16,
                    alignItems: "center",
                    borderBottom: "1px solid var(--line)",
                    fontSize: 13,
                    color: "var(--ink-2)",
                  }}
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
                        padding: "3px 9px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
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
                          flexShrink: 0,
                        }}
                      />
                      {o.status}
                    </span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <button
                      onClick={() => router.push(`/pedidos/${o.id}`)}
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
                        border: "1px solid var(--line)",
                        cursor: "pointer",
                      }}
                    >
                      Ver <ChevronRight size={13} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal — Editar cadastro */}
      {editOpen && (
        <div
          onClick={() => setEditOpen(false)}
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
                Editar cadastro
              </span>
              <button
                onClick={() => setEditOpen(false)}
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
                <label style={labelStyle}>Telefone</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="(32) 99999-9999"
                  value={formTelefone}
                  onChange={(e) => setFormTelefone(maskPhone(e.target.value))}
                  style={inputStyle()}
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

              {!showChangePwd ? (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <div style={{ ...labelStyle }}>Senha</div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "var(--muted)",
                        letterSpacing: "0.12em",
                      }}
                    >
                      ••••••••
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowChangePwd(true)}
                    style={{
                      padding: "7px 12px",
                      borderRadius: 8,
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      fontSize: 12,
                      background: "var(--paper)",
                      color: "var(--ink)",
                      border: "1px solid var(--line)",
                      cursor: "pointer",
                    }}
                  >
                    Alterar senha
                  </button>
                </div>
              ) : (
                <>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Nova senha</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showNovaSenha ? "text" : "password"}
                        placeholder="Mín. 6 caracteres"
                        value={formNovaSenha}
                        onChange={(e) => {
                          setFormNovaSenha(e.target.value);
                          setErrors((v) => ({ ...v, novaSenha: false }));
                        }}
                        style={{
                          ...inputStyle(errors.novaSenha),
                          paddingRight: 36,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNovaSenha((v) => !v)}
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
                        {showNovaSenha ? (
                          <EyeOff size={14} strokeWidth={1.75} />
                        ) : (
                          <Eye size={14} strokeWidth={1.75} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div style={fieldStyle}>
                    <label style={labelStyle}>Confirmar nova senha</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showConfirmarNovaSenha ? "text" : "password"}
                        placeholder="Repita a senha"
                        value={formConfirmarNovaSenha}
                        onChange={(e) => {
                          setFormConfirmarNovaSenha(e.target.value);
                          setErrors((v) => ({
                            ...v,
                            confirmarNovaSenha: false,
                          }));
                        }}
                        style={{
                          ...inputStyle(errors.confirmarNovaSenha),
                          paddingRight: 36,
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmarNovaSenha((v) => !v)}
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
                        {showConfirmarNovaSenha ? (
                          <EyeOff size={14} strokeWidth={1.75} />
                        ) : (
                          <Eye size={14} strokeWidth={1.75} />
                        )}
                      </button>
                    </div>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowChangePwd(false);
                        setFormNovaSenha("");
                        setFormConfirmarNovaSenha("");
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 7,
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: 12,
                        background: "none",
                        color: "var(--muted)",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Cancelar alteração
                    </button>
                  </div>
                </>
              )}
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
                onClick={() => setEditOpen(false)}
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
                onClick={submitEdit}
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
                <Check size={14} strokeWidth={2.5} />
                Salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
