"use client";

import { useRouter } from "next/navigation";
import { User, BarChart2, UserPlus, Settings, ChevronRight } from "lucide-react";
import { PAINTER_PROFILE } from "@/lib/pintor-data";

const ROWS = [
  { icon: User, title: "Meus dados", sub: `${PAINTER_PROFILE.name} · ${PAINTER_PROFILE.phone}`, href: "/perfil/meus-dados" },
  { icon: BarChart2, title: "Minha atividade", sub: "Pedidos, pontos e clientes", href: "/perfil/atividade" },
  { icon: UserPlus, title: "Clientes", sub: "Cadastrar e consultar clientes", href: "/perfil/clientes" },
  { icon: Settings, title: "Configurações", sub: "Notificações e programa", href: "/perfil/configuracoes" },
] as const;

export default function PerfilPage() {
  const router = useRouter();

  return (
    <>
      <div className="topbar" style={{ paddingBottom: 20 }}>
        <div className="eyebrow-label">PINTOR PARCEIRO DESDE {PAINTER_PROFILE.parceiroDesde}</div>
        <div className="page-title" style={{ marginTop: 4 }}>{PAINTER_PROFILE.name}</div>
      </div>

      <div className="card" style={{ margin: "0 16px 12px", overflow: "hidden" }}>
        {ROWS.map((r) => {
          const Ico = r.icon;
          return (
            <div
              key={r.title}
              className="profile-row"
              onClick={() => r.href && router.push(r.href)}
              style={{ cursor: r.href ? "pointer" : "default" }}
            >
              <div className="profile-icon"><Ico size={18} strokeWidth={1.75} color="var(--ink)" /></div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{r.title}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{r.sub}</div>
              </div>
              <ChevronRight size={16} color="var(--muted)" />
            </div>
          );
        })}
      </div>

      <div style={{ padding: "4px 16px 100px", textAlign: "center" }}>
        <button
          onClick={() => router.push("/login")}
          style={{ background: "transparent", border: 0, fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--brand)", cursor: "pointer", padding: 14 }}
        >
          Sair da conta
        </button>
      </div>
    </>
  );
}

