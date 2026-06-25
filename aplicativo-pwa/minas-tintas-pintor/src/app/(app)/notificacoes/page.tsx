"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, CircleCheck, Gift, Tag, ChevronRight } from "lucide-react";

type Notif = {
  iconBg: string;
  icon: typeof CircleCheck;
  iconColor: string;
  title: string;
  text: string;
  time: string;
  href: string;
};

const HOJE: Notif[] = [
  { iconBg: "#E8F5E9", icon: CircleCheck, iconColor: "#4F7A4A", title: "Pedido aprovado", text: "Pedido #0479 de Fernanda Costa aprovado. 23 pts adicionados ao seu saldo.", time: "há 18 min", href: "/pedidos/0479" },
  { iconBg: "#E8F5E9", icon: CircleCheck, iconColor: "#4F7A4A", title: "Pedido aprovado", text: "Pedido #0472 de Silvana Ramos aprovado. 31 pts adicionados ao seu saldo.", time: "há 1 h", href: "/pedidos/0472" },
];

const ONTEM: Notif[] = [
  { iconBg: "#FFF8E1", icon: Gift, iconColor: "#B5751F", title: "Resgate disponível", text: "Kit pincéis Atlas reservado para retirada na loja.", time: "ontem, 16:40", href: "/loja" },
  { iconBg: "#FEF0E7", icon: Tag, iconColor: "#CC0000", title: "Promoção na lojinha", text: "Rolo de lã Tigre com 20% a menos em pontos. Só até domingo.", time: "ontem, 09:00", href: "/loja" },
  { iconBg: "#E8F5E9", icon: CircleCheck, iconColor: "#4F7A4A", title: "Pedido aprovado", text: "Pedido #0475 aprovado. 8 pts adicionados ao seu saldo.", time: "ontem, 11:05", href: "/pedidos/0475" },
];

function Group({ items, router }: { items: Notif[]; router: ReturnType<typeof useRouter> }) {
  return (
    <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
      {items.map((n, i) => {
        const Ico = n.icon;
        return (
          <div
            key={n.title + i}
            onClick={() => router.push(n.href)}
            style={{ display: "grid", gridTemplateColumns: "36px 1fr auto", gap: 12, padding: "14px 16px", borderBottom: i < items.length - 1 ? "1px solid var(--line)" : "none", alignItems: "start", cursor: "pointer" }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: n.iconBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ico size={18} strokeWidth={1.8} color={n.iconColor} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}>{n.title}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45, marginTop: 2 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>{n.time}</div>
            </div>
            <ChevronRight size={16} color="var(--muted)" style={{ marginTop: 2 }} />
          </div>
        );
      })}
    </div>
  );
}

export default function NotificacoesPage() {
  const router = useRouter();
  return (
    <>
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}>
          <ChevronLeft size={22} strokeWidth={2} /> Voltar
        </button>
        <div className="eyebrow-label">ATUALIZAÇÕES DA LOJA</div>
        <div className="page-title">Notificações</div>
      </div>
      <div style={{ padding: "0 16px 88px" }}>
        <div className="eyebrow-label" style={{ margin: "4px 0 10px" }}>HOJE</div>
        <Group items={HOJE} router={router} />
        <div className="eyebrow-label" style={{ margin: "4px 0 10px" }}>ONTEM</div>
        <Group items={ONTEM} router={router} />
      </div>
    </>
  );
}


