"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  X,
  User,
  Building2,
  HardHat,
  Phone,
  UserPlus,
} from "lucide-react";
import { type Client } from "@/lib/mock";
import {
  CadastrarClienteModal,
  loadManualClients,
} from "@/components/CadastrarClienteModal";

export default function ClientesClient({
  clients: clientsProp,
}: {
  clients: Client[];
}) {
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [localClients, setLocalClients] = useState<Client[]>([]);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientPrefill, setClientPrefill] = useState("");
  const [editClient, setEditClient] = useState<Client | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalClients(loadManualClients());
  }, []);

  // Mock clients que ainda não foram editados localmente ficam visíveis
  const localNames = new Set(localClients.map((c) => c.name.toLowerCase()));
  const realClients = clientsProp.filter(
    (c) => !localNames.has(c.name.toLowerCase()),
  );
  const allClients = [...localClients, ...realClients];

  const q = query.toLowerCase().trim();
  const digits = q.replace(/\D/g, "");

  const results = q
    ? allClients
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (digits.length >= 4 && c.phone.replace(/\D/g, "").includes(digits)),
        )
        .slice(0, 8)
    : [];

  function clear() {
    setQuery("");
    inputRef.current?.focus();
  }

  function openNewClientModal(prefill = "") {
    setEditClient(null);
    setClientPrefill(prefill);
    setClientModalOpen(true);
  }

  function openEditClientModal(client: Client) {
    setEditClient(client);
    setClientPrefill("");
    setClientModalOpen(true);
  }

  function handleSaveClient(client: Client) {
    setLocalClients((prev) => {
      if (editClient?.id) {
        return prev.map((c) => (c.id === editClient.id ? client : c));
      }
      return [client, ...prev];
    });
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100%",
        padding: "30vh 32px 32px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 690 }}>
        <div
          style={{
            width: 54,
            height: 4,
            borderRadius: 999,
            background: "var(--brand)",
            margin: "0 auto 20px",
            boxShadow: "0 8px 22px rgba(204,0,0,.18)",
          }}
        />

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 42,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          Quem é esse cliente?
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 15,
            lineHeight: 1.6,
            marginBottom: 30,
          }}
        >
          Verifique se o cliente ou empresa já possui cadastro.
        </p>

        {/* Campo de busca */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--card)",
              border: `1.5px solid ${isSearchFocused ? "var(--brand)" : "var(--line)"}`,
              borderRadius: 16,
              padding: "0 18px 0 14px",
              height: 60,
              transition: "border-color .15s, box-shadow .15s, transform .15s",
              boxShadow: isSearchFocused
                ? "0 18px 42px rgba(28,26,23,.10), 0 0 0 4px rgba(204,0,0,.07)"
                : "0 12px 32px rgba(28,26,23,.08), 0 2px 6px rgba(28,26,23,.04)",
            }}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--brand-tint)",
                color: "var(--brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Search size={17} strokeWidth={2} />
            </div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Nome completo ou telefone…"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                background: "transparent",
                fontFamily: "var(--font-body)",
                fontSize: 15,
                color: "var(--ink)",
                outline: "none",
              }}
            />
            {query && (
              <button
                onClick={clear}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  padding: 4,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          {!q && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
                marginTop: 16,
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: "Nome", icon: User },
                  { label: "Telefone", icon: Phone },
                  { label: "Empresa", icon: Building2 },
                ].map(({ label, icon: Icon }) => (
                  <span
                    key={label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      height: 30,
                      padding: "0 11px",
                      borderRadius: 999,
                      background: "rgba(255,255,255,.58)",
                      border: "1px solid var(--line)",
                      color: "var(--ink-2)",
                      fontSize: 12,
                      fontWeight: 600,
                      boxShadow: "0 1px 2px rgba(28,26,23,.04)",
                    }}
                  >
                    <Icon size={13} strokeWidth={1.8} />
                    {label}
                  </span>
                ))}
              </div>
              <button
                onClick={() => openNewClientModal()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  height: 30,
                  padding: "0 12px",
                  borderRadius: 999,
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  color: "var(--ink-2)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  flexShrink: 0,
                  boxShadow: "0 1px 2px rgba(28,26,23,.04)",
                }}
              >
                <UserPlus size={13} strokeWidth={1.8} />
                Cadastrar cliente
              </button>
            </div>
          )}

          {/* Resultados */}
          {q && (
            <div style={{ marginTop: 10 }}>
              {results.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "32px 0 28px",
                    gap: 12,
                  }}
                >
                  <p
                    style={{
                      color: "var(--muted)",
                      fontSize: 13.5,
                      textAlign: "center",
                    }}
                  >
                    Nenhum cliente encontrado para{" "}
                    <strong style={{ color: "var(--ink)" }}>
                      &quot;{query}&quot;
                    </strong>
                  </p>
                  <button
                    onClick={() => openNewClientModal(query)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 16px",
                      borderRadius: 10,
                      background: "var(--ink)",
                      color: "var(--paper)",
                      border: "1px solid transparent",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      boxShadow: "0 2px 6px rgba(28,26,23,.10)",
                    }}
                  >
                    <UserPlus size={14} strokeWidth={2} />
                    Cadastrar &quot;{query}&quot;
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--line)",
                    borderRadius: 14,
                    overflow: "hidden",
                    boxShadow: "var(--shadow-2)",
                  }}
                >
                  {results.map((c, i) => {
                    const painter = c.painter
                      ? { name: c.painter, city: "—" }
                      : null;
                    const isLast = i === results.length - 1;
                    return (
                      <div
                        key={(c.id ?? c.name) + c.phone}
                        onClick={() => openEditClientModal(c)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "16px 20px",
                          borderBottom: isLast
                            ? "none"
                            : "1px solid var(--line)",
                          cursor: "pointer",
                          transition: "background .1s",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background =
                            "var(--paper-deep)")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            background: "var(--paper-deep)",
                            border: "1px solid var(--line)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--muted)",
                            flexShrink: 0,
                          }}
                        >
                          {c.type === "empresa" ? (
                            <Building2 size={17} strokeWidth={1.75} />
                          ) : (
                            <User size={17} strokeWidth={1.75} />
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: "var(--ink)",
                            }}
                          >
                            {c.name}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "var(--muted)",
                              marginTop: 2,
                            }}
                          >
                            {c.type === "empresa" ? "Empresa" : "Pessoa física"}
                            {c.phone ? ` · ${c.phone}` : ""}
                          </div>
                        </div>

                        {/* Pintor vinculado */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          {painter ? (
                            <>
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  background: "rgba(79,122,74,.1)",
                                  color: "#4F7A4A",
                                  borderRadius: 999,
                                  padding: "4px 10px",
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                <HardHat size={13} strokeWidth={1.75} />
                                {painter.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: "var(--muted)",
                                  marginTop: 4,
                                }}
                              >
                                {painter.city}
                                <span
                                  style={{
                                    cursor: "pointer",
                                    color: "var(--brand)",
                                    fontWeight: 600,
                                    marginLeft: 6,
                                  }}
                                >
                                  Ver perfil →
                                </span>
                              </div>
                            </>
                          ) : (
                            <span
                              style={{
                                fontSize: 12,
                                color: "var(--muted)",
                                fontStyle: "italic",
                              }}
                            >
                              Sem pintor vinculado
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CadastrarClienteModal
        open={clientModalOpen}
        prefillName={clientPrefill}
        editClient={editClient}
        onClose={() => setClientModalOpen(false)}
        onSave={handleSaveClient}
      />
    </div>
  );
}
