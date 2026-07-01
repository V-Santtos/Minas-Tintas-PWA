import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  PintorProvider,
  type PintorReadData,
  type PendingRedemption,
} from "@/lib/pintor-store";
import type { Order, OrderItem, LojaProduct } from "@/lib/pintor-data";
import { BONUS_PERCENT } from "@/lib/rules";
import BottomNav from "@/components/BottomNav";
import MockStatusBar from "@/components/MockStatusBar"; // [MOCKUP DESKTOP] remover ao publicar
import RealtimeRefresh from "@/components/RealtimeRefresh";

const MES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];
const fmtData = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d} ${MES[+m - 1]} ${y}`;
};
const LOJA_CATS = ["ferramentas", "epi", "brindes", "camisetas"] as const;

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: painter } = await supabase
    .from("painters")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!painter) redirect("/login");

  // ── Ponto único de leitura do app do pintor ──
  // RLS (security_invoker) escopa tudo ao próprio pintor; loja_items/settings são
  // legíveis por autenticado. Offline (Fase 2) troca este fetch por cache AQUI.
  const [
    { data: ps },
    { data: orderRows },
    { data: itemRows },
    { data: lojaRows },
    { data: cfg },
    { data: resgateRows },
    { data: clientRows },
    { data: txRows },
    { data: prodRows },
    { data: prefsRow },
  ] = await Promise.all([
    supabase
      .from("painter_stats")
      .select(
        "saldo, nome, telefone, documento, created_at, cep, rua, numero, complemento, bairro, cidade",
      )
      .eq("id", painter.id)
      .maybeSingle(),
    supabase
      .from("pedidos_admin")
      .select(
        "id, numero, client_id, client_nome, status, valor_bruto, pagamento, created_at, bonus_creditado",
      )
      .order("created_at", { ascending: false }),
    supabase.from("order_items").select("order_id, name, unit_price, qty"),
    supabase
      .from("loja_items_admin")
      .select(
        "id, name, valor_base, stock, categoria, imagem, imagem_pos_x, imagem_pos_y, descricao, custo_pts, promo, resgate_unico",
      )
      .eq("active", true)
      .eq("is_brinde", false)
      .order("custo_pts"),
    supabase
      .from("settings")
      .select("multiplicador_padrao, bonus_percent")
      .single(),
    supabase
      .from("resgates_admin")
      .select(
        "id, loja_item_id, item_nome, pontos_congelados, status, created_at",
      )
      .in("status", ["pendente_retirada", "entregue"])
      .order("created_at", { ascending: false }),
    supabase
      .from("clients")
      .select(
        "id, nome, type, telefone, documento, cep, rua, numero, complemento, bairro, cidade",
      )
      .order("nome"),
    supabase
      .from("point_transactions")
      .select("id, valor, tipo, order_id, motivo, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("products_public")
      .select("id, code, name, brand, price")
      .order("name"),
    supabase
      .from("painter_settings")
      .select(
        "notif_pedidos, notif_pontos, notif_resgates, notif_promocoes, brinde_visto_em",
      )
      .eq("painter_id", painter.id)
      .maybeSingle(),
  ]);

  const padrao = Number(cfg?.multiplicador_padrao ?? 3);

  // itens por pedido (uuid)
  const itemsByOrder = new Map<string, OrderItem[]>();
  for (const it of itemRows ?? []) {
    const arr = itemsByOrder.get(it.order_id) ?? [];
    arr.push({ name: it.name, qty: it.qty, price: Number(it.unit_price) });
    itemsByOrder.set(it.order_id, arr);
  }

  const nome = ps?.nome ?? "";
  const orders: Order[] = (orderRows ?? []).map((r) => ({
    id: String(r.numero).padStart(4, "0"),
    name: r.client_nome,
    date: fmtData(r.created_at),
    status: r.status,
    amount: Number(r.valor_bruto),
    pts: Number(r.bonus_creditado) || undefined,
    items: itemsByOrder.get(r.id),
    payment: r.pagamento ?? undefined,
  }));

  // locked = sem estoque (afford-ability é checada nas telas via saldo)
  const resgatados = new Set((resgateRows ?? []).map((r) => r.loja_item_id));
  const loja: LojaProduct[] = (lojaRows ?? []).map((r) => ({
    id: r.id,
    cat: (LOJA_CATS.includes(r.categoria)
      ? r.categoria
      : "brindes") as LojaProduct["cat"],
    pts: Number(r.custo_pts),
    originalPts: r.promo ? Math.round(Number(r.valor_base) * padrao) : null,
    promo: r.promo,
    locked: r.stock <= 0,
    stock: r.stock,
    icon: "",
    img: r.imagem ?? "",
    imgPos:
      r.imagem_pos_x != null
        ? { x: r.imagem_pos_x, y: r.imagem_pos_y }
        : undefined,
    name: r.name,
    desc: r.descricao ?? "",
    unico: r.resgate_unico,
    jaResgatado: r.resgate_unico && resgatados.has(r.id),
  }));

  const pendingRedemptions: PendingRedemption[] = (resgateRows ?? [])
    .filter((r) => r.status === "pendente_retirada")
    .map((r) => ({
      id: r.id,
      itemId: r.loja_item_id ?? "",
      itemName: r.item_nome ?? "Item",
      pts: r.pontos_congelados,
      requestedAt: fmtData(r.created_at),
      status: "pendente",
    }));

  // Brinde de boas-vindas: o resgate cujo item é um dos dois itens-brinde.
  // is_brinde fica no banco; aqui reconhecemos pelos IDs fixos da migration.
  const BRINDE_ITEM_IDS: Record<string, "bone" | "pincel"> = {
    "00000000-0000-0000-0000-0000000000c1": "bone",
    "00000000-0000-0000-0000-0000000000c2": "pincel",
  };
  const brindeRow = (resgateRows ?? []).find(
    (r) => r.loja_item_id && BRINDE_ITEM_IDS[r.loja_item_id],
  );
  const brinde = brindeRow
    ? {
        tipo: BRINDE_ITEM_IDS[brindeRow.loja_item_id!],
        pendente: brindeRow.status === "pendente_retirada",
        visto: prefsRow?.brinde_visto_em != null,
      }
    : null;

  const catalog = (prodRows ?? []).map((pr) => ({
    id: pr.id,
    code: pr.code,
    name: pr.name,
    brand: pr.brand,
    price: Number(pr.price),
    icon: "",
  }));

  const numeroByOrder = new Map((orderRows ?? []).map((r) => [r.id, r.numero]));
  const TIPO_LABEL: Record<string, string> = {
    bonus: "Bônus",
    resgate: "Resgate",
    estorno: "Estorno",
    devolucao: "Devolução",
    ajuste: "Ajuste",
  };
  const atividade = (txRows ?? []).map((t) => {
    const numero = t.order_id ? numeroByOrder.get(t.order_id) : null;
    const base = TIPO_LABEL[t.tipo] ?? t.tipo;
    const label = numero
      ? `${base} · pedido #${String(numero).padStart(4, "0")}`
      : t.motivo
        ? `${base} · ${t.motivo}`
        : base;
    return {
      id: t.id,
      date: fmtData(t.created_at),
      label,
      pts: t.valor,
      kind: (t.valor > 0 ? "in" : "out") as "in" | "out",
    };
  });

  // vínculo é derivado: cliente está vinculado se o pintor tem ao menos um pedido
  // APROVADO com ele. Sem isso (só cadastro/agenda ou pedido pendente) = pendente.
  const approvedClientIds = new Set(
    (orderRows ?? [])
      .filter((r) => r.status === "aprovado" && r.client_id)
      .map((r) => r.client_id as string),
  );
  const clientes = (clientRows ?? []).map((c) => ({
    id: c.id,
    type: c.type as "pessoa" | "empresa",
    name: c.nome,
    phone: c.telefone ?? "",
    document: c.documento ?? "",
    cep: c.cep ?? "",
    address: c.rua ?? "",
    number: c.numero ?? "",
    city: c.cidade ?? "",
    neighborhood: c.bairro ?? "",
    note: c.complemento ?? "",
    linked: approvedClientIds.has(c.id),
  }));

  const data: PintorReadData = {
    saldo: Number(ps?.saldo ?? 0),
    bonusPercent: Number(cfg?.bonus_percent ?? BONUS_PERCENT),
    profile: {
      name: nome,
      firstName: nome.split(" ")[0] ?? "",
      phone: ps?.telefone ?? "",
      cpf: ps?.documento ?? "",
      parceiroDesde: ps?.created_at
        ? String(new Date(ps.created_at).getFullYear())
        : "",
      cep: ps?.cep ?? "",
      rua: ps?.rua ?? "",
      numero: ps?.numero ?? "",
      complemento: ps?.complemento ?? "",
      bairro: ps?.bairro ?? "",
      cidade: ps?.cidade ?? "",
    },
    orders,
    loja,
    pendingRedemptions,
    clientes,
    atividade,
    catalog,
    notifPrefs: {
      pedidos: prefsRow?.notif_pedidos ?? true,
      pontos: prefsRow?.notif_pontos ?? true,
      resgates: prefsRow?.notif_resgates ?? true,
      promocoes: prefsRow?.notif_promocoes ?? false,
    },
    brinde,
  };

  return (
    <PintorProvider data={data}>
      <RealtimeRefresh />
      <div className="pintor-app">
        <MockStatusBar />
        <div className="pintor-scroll">{children}</div>
        <BottomNav />
      </div>
    </PintorProvider>
  );
}
