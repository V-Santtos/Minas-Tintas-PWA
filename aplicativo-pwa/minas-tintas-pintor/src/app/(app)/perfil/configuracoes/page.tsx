"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Gift,
  HelpCircle,
  Info,
  MessageCircle,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { usePintor } from "@/lib/pintor-store";
import { salvarNotifPrefs } from "@/lib/configuracoes-actions";

type ToggleKey = "pedidos" | "pontos" | "resgates" | "promocoes";

const notificationOptions: {
  key: ToggleKey;
  title: string;
  sub: string;
  icon: typeof Bell;
}[] = [
  {
    key: "pedidos",
    title: "Pedidos",
    sub: "Aprovações, pendências e mudanças de status",
    icon: Bell,
  },
  {
    key: "pontos",
    title: "Pontos creditados",
    sub: "Avisos quando os pontos entram no saldo",
    icon: Gift,
  },
  {
    key: "resgates",
    title: "Resgates",
    sub: "Produto pronto para retirada na loja",
    icon: Check,
  },
  {
    key: "promocoes",
    title: "Promoções",
    sub: "Ofertas e campanhas da lojinha",
    icon: Tag,
  },
];

const programRules = [
  {
    title: "Como ganhar pontos",
    sub: "Pedidos aprovados pela loja geram pontos automaticamente.",
  },
  {
    title: "Quando os pontos entram",
    sub: "O crédito acontece após a validação do pagamento pela administração.",
  },
  {
    title: "Como resgatar",
    sub: "Escolha um produto na lojinha e aguarde a confirmação de retirada.",
  },
  {
    title: "Cancelamento",
    sub: "Resgates pendentes podem ser cancelados antes da retirada.",
  },
];

export default function ConfiguracoesPage() {
  const router = useRouter();
  const { data } = usePintor();
  const [toggles, setToggles] = useState<Record<ToggleKey, boolean>>(
    data.notifPrefs,
  );

  async function toggle(key: ToggleKey) {
    const next = { ...toggles, [key]: !toggles[key] };
    setToggles(next);
    const res = await salvarNotifPrefs(next);
    if (!res.ok) setToggles(toggles); // reverte se a gravação falhar
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
            PERFIL
          </div>
          <div className="page-title" style={{ fontSize: 20 }}>
            Configurações
          </div>
        </div>
      </div>

      <div style={{ padding: "0 16px 100px", display: "grid", gap: 14 }}>
        <section className="card" style={{ padding: 14 }}>
          <div className="eyebrow-label" style={{ marginBottom: 10 }}>
            NOTIFICAÇÕES
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {notificationOptions.map((item) => {
              const Icon = item.icon;
              const active = toggles[item.key];
              return (
                <button
                  key={item.key}
                  type="button"
                  className="tap"
                  onClick={() => toggle(item.key)}
                  style={{
                    border: "1px solid var(--line)",
                    background: active ? "var(--paper-deep)" : "var(--card)",
                    borderRadius: 12,
                    padding: "11px 12px",
                    display: "grid",
                    gridTemplateColumns: "30px 1fr auto",
                    alignItems: "center",
                    gap: 10,
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      background: active ? "var(--ink)" : "var(--paper)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon
                      size={15}
                      strokeWidth={1.8}
                      color={active ? "var(--paper)" : "var(--muted)"}
                    />
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span
                      style={{
                        display: "block",
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "var(--ink)",
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      style={{
                        display: "block",
                        fontSize: 11.5,
                        color: "var(--muted)",
                        marginTop: 1,
                        lineHeight: 1.35,
                      }}
                    >
                      {item.sub}
                    </span>
                  </span>
                  <span
                    style={{
                      width: 38,
                      height: 22,
                      borderRadius: 999,
                      padding: 2,
                      background: active
                        ? "var(--brand)"
                        : "var(--line-strong)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: active ? "flex-end" : "flex-start",
                      transition: "all 160ms",
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        background: "#fff",
                        boxShadow: "0 1px 3px rgba(28,26,23,.18)",
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card" style={{ padding: 14 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <div>
              <div className="eyebrow-label" style={{ marginBottom: 3 }}>
                PROGRAMA DE PONTOS
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--muted)",
                  lineHeight: 1.35,
                }}
              >
                Regras principais para consulta rápida.
              </div>
            </div>
            <ShieldCheck
              size={20}
              strokeWidth={1.7}
              color="var(--success)"
              style={{ flexShrink: 0 }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gap: 0,
              borderTop: "1px solid var(--line)",
            }}
          >
            {programRules.map((rule, index) => (
              <div
                key={rule.title}
                style={{
                  padding: "11px 0",
                  borderBottom:
                    index < programRules.length - 1
                      ? "1px solid var(--line)"
                      : undefined,
                }}
              >
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "var(--ink)",
                  }}
                >
                  {rule.title}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "var(--muted)",
                    marginTop: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {rule.sub}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ overflow: "hidden" }}>
          <button
            type="button"
            className="profile-row"
            style={{ gridTemplateColumns: "36px 1fr auto" }}
            disabled
          >
            <div className="profile-icon">
              <MessageCircle size={18} strokeWidth={1.75} color="var(--ink)" />
            </div>
            <div>
              <div
                style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}
              >
                Falar com a Minas Tintas
              </div>
              <div
                style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}
              >
                Abrir atendimento pelo WhatsApp
              </div>
            </div>
            <ChevronRight size={16} color="var(--muted)" />
          </button>
          <button
            type="button"
            className="profile-row"
            style={{ gridTemplateColumns: "36px 1fr auto" }}
            disabled
          >
            <div className="profile-icon">
              <HelpCircle size={18} strokeWidth={1.75} color="var(--ink)" />
            </div>
            <div>
              <div
                style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}
              >
                Reportar problema
              </div>
              <div
                style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}
              >
                Enviar uma dúvida ou falha do app
              </div>
            </div>
            <ChevronRight size={16} color="var(--muted)" />
          </button>
        </section>

        <section
          className="card"
          style={{
            padding: "13px 14px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "var(--paper)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Info size={17} strokeWidth={1.75} color="var(--muted)" />
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}
            >
              Minas Tintas Pintor
            </div>
            <div
              style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 1 }}
            >
              Versão 1.0 · Termos do programa e privacidade
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
