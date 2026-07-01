"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  CircleCheck,
  CircleX,
  Gift,
  Store,
  PackageCheck,
  PackageX,
  RotateCcw,
  Tag,
  ChevronRight,
} from "lucide-react";
import { usePintor, type NotifItem } from "@/lib/pintor-store";
import { createClient } from "@/utils/supabase/client";

// Aparência por tipo de notificação (o conteúdo vem derivado do payload).
const LOOK: Record<
  NotifItem["kind"],
  { iconBg: string; icon: typeof CircleCheck; iconColor: string }
> = {
  pedido_aprovado: {
    iconBg: "#E8F5E9",
    icon: CircleCheck,
    iconColor: "#4F7A4A",
  },
  pedido_recusado: { iconBg: "#FDECEC", icon: CircleX, iconColor: "#CC0000" },
  pedido_estornado: { iconBg: "#FDECEC", icon: RotateCcw, iconColor: "#CC0000" },
  resgate: { iconBg: "#FFF8E1", icon: Store, iconColor: "#B5751F" },
  resgate_entregue: {
    iconBg: "#E8F5E9",
    icon: PackageCheck,
    iconColor: "#4F7A4A",
  },
  resgate_cancelado: { iconBg: "#FDECEC", icon: PackageX, iconColor: "#CC0000" },
  promo: { iconBg: "#FEF0E7", icon: Tag, iconColor: "#CC0000" },
  brinde: { iconBg: "#FDECEC", icon: Gift, iconColor: "#CC0000" },
};

// Rótulo de tempo relativo, curto. Base é o "hoje" do cliente.
function tempoRelativo(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMin = Math.round((Date.now() - then) / 60000);
  if (diffMin < 1) return "agora";
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `há ${diffH} h`;
  const d = new Date(iso);
  return d
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");
}

// Agrupa por Hoje / Ontem / Antes, mantendo a ordem (feed já vem do mais novo).
function agrupar(feed: NotifItem[]) {
  const hoje: NotifItem[] = [];
  const ontem: NotifItem[] = [];
  const antes: NotifItem[] = [];
  const now = new Date();
  const startHoje = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startOntem = startHoje - 86400000;
  for (const n of feed) {
    if (n.ts >= startHoje) hoje.push(n);
    else if (n.ts >= startOntem) ontem.push(n);
    else antes.push(n);
  }
  return { hoje, ontem, antes };
}

function Group({
  items,
  router,
}: {
  items: NotifItem[];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <div className="card" style={{ overflow: "hidden", marginBottom: 16 }}>
      {items.map((n, i) => {
        const look = LOOK[n.kind];
        const Ico = look.icon;
        return (
          <div
            key={n.id}
            onClick={() => router.push(n.href)}
            style={{
              display: "grid",
              gridTemplateColumns: "36px 1fr auto",
              gap: 12,
              padding: "14px 16px",
              borderBottom:
                i < items.length - 1 ? "1px solid var(--line)" : "none",
              alignItems: "start",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: look.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ico size={18} strokeWidth={1.8} color={look.iconColor} />
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 13.5, color: "var(--ink)" }}
              >
                {n.title}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  lineHeight: 1.45,
                  marginTop: 2,
                }}
              >
                {n.text}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}
              >
                {tempoRelativo(n.at)}
              </div>
            </div>
            <ChevronRight
              size={16}
              color="var(--muted)"
              style={{ marginTop: 2 }}
            />
          </div>
        );
      })}
    </div>
  );
}

// Preview (?preview): UMA notificação de cada tipo, pra visualizar todas de uma vez
// (design). Não vai pro banco nem pro feed real — só renderiza quando o param existe.
function buildSampleFeed(): NotifItem[] {
  const now = Date.now();
  const mk = (min: number) => ({
    at: new Date(now - min * 60000).toISOString(),
    ts: now - min * 60000,
  });
  return [
    { id: "s-promo", kind: "promo", title: "Promoção na lojinha", text: "Fita crepe 48mm x 50m com menos pontos por tempo limitado.", href: "/loja", ...mk(1) },
    { id: "s-resgate", kind: "resgate", title: "Resgate pendente", text: "Kit pincéis profissionais (3 peças) reservado para retirada na loja.", href: "/loja", ...mk(4) },
    { id: "s-resgate-cancelado", kind: "resgate_cancelado", title: "Resgate cancelado pela loja", text: "Esmalte sintético acetinado 900ml – Preto: a loja cancelou seu resgate e os pontos voltaram ao saldo.", href: "/loja", ...mk(25) },
    { id: "s-resgate-entregue", kind: "resgate_entregue", title: "Resgate entregue", text: "Rolo de lã antigota 23cm foi entregue. Aproveite!", href: "/loja", ...mk(120) },
    { id: "s-brinde", kind: "brinde", title: "Brinde de boas-vindas", text: "Seu Boné Minas Tintas está reservado na lojinha para retirada na loja.", href: "/loja", ...mk(200) },
    { id: "s-pedido-aprovado", kind: "pedido_aprovado", title: "Pedido aprovado", text: "Pedido #0056 de Tatiane Cardoso aprovado. 2042 pts adicionados ao seu saldo.", href: "/pedidos/0056", ...mk(300) },
    { id: "s-pedido-recusado", kind: "pedido_recusado", title: "Pedido recusado", text: "Pedido #0057 de Fernando Souza não foi aprovado.", href: "/pedidos/0057", ...mk(360) },
    { id: "s-pedido-estornado", kind: "pedido_estornado", title: "Pedido estornado", text: "Pedido #0055 de Tatiane Cardoso foi estornado. 2042 pts removidos do saldo (pagamento cancelado).", href: "/pedidos/0055", ...mk(420) },
  ];
}

export default function NotificacoesPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { feed } = usePintor();

  // ?preview → mostra uma de cada notificação (design), sem tocar no feed real.
  const isPreview = params.get("preview") !== null;
  const feedShown = isPreview ? buildSampleFeed() : feed;

  // Ao abrir, carimba "visto até agora" no banco (apaga a bolinha do sininho).
  // void: não trava a UI esperando a rede; o refresh seguinte reflete o novo marco.
  useEffect(() => {
    if (isPreview) return; // preview não carimba visto
    const supabase = createClient();
    void supabase.rpc("marcar_notif_visto");
  }, [isPreview]);

  const { hoje, ontem, antes } = agrupar(feedShown);

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
        {feedShown.length === 0 && (
          <div
            className="card"
            style={{
              padding: "28px 20px",
              textAlign: "center",
              color: "var(--muted)",
              fontSize: 13,
            }}
          >
            Nenhuma novidade por aqui ainda.
          </div>
        )}
        {hoje.length > 0 && (
          <>
            <div className="eyebrow-label" style={{ margin: "4px 0 10px" }}>
              HOJE
            </div>
            <Group items={hoje} router={router} />
          </>
        )}
        {ontem.length > 0 && (
          <>
            <div className="eyebrow-label" style={{ margin: "4px 0 10px" }}>
              ONTEM
            </div>
            <Group items={ontem} router={router} />
          </>
        )}
        {antes.length > 0 && (
          <>
            <div className="eyebrow-label" style={{ margin: "4px 0 10px" }}>
              ANTERIORES
            </div>
            <Group items={antes} router={router} />
          </>
        )}
      </div>
    </>
  );
}
