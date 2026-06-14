import { createClient } from "@/utils/supabase/server";
import { bonusPoints } from "@/lib/rules";
import type { Order } from "@/lib/mock";
import PedidoDetailClient from "./PedidoDetailClient";

const fmtDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numero = Number(id);
  const supabase = await createClient();

  const [{ data: r }, { data: cfg }] = await Promise.all([
    supabase
      .from("pedidos_admin")
      .select(
        "id, numero, titulo, status, valor_bruto, desconto, pagamento, observacao, created_at, painter_nome, client_cidade, bonus_creditado, estorno_motivo",
      )
      .eq("numero", numero)
      .maybeSingle(),
    supabase.from("settings").select("bonus_percent").single(),
  ]);

  if (!r) return <PedidoDetailClient order={null} id={id} />;

  const { data: itemRows } = await supabase
    .from("order_items")
    .select("name, qty, unit_price")
    .eq("order_id", r.id);

  const percent = Number(cfg?.bonus_percent ?? 0.01);
  const total = Number(r.valor_bruto);
  const credited = Number(r.bonus_creditado);
  const bonusPts =
    credited > 0
      ? credited
      : r.status === "pendente"
        ? bonusPoints(total, percent)
        : 0;

  const order: Order = {
    id: String(r.numero).padStart(4, "0"),
    painter: r.painter_nome,
    location: r.client_cidade ?? "—",
    title: r.titulo ?? "—",
    date: fmtDate(r.created_at),
    createdAtISO: r.created_at.slice(0, 10),
    total,
    discount: Number(r.desconto),
    status: r.status,
    payment: r.pagamento ?? "",
    notes: r.observacao ?? undefined,
    estornoMotivo: r.estorno_motivo ?? undefined,
    items: (itemRows ?? []).map((it) => ({
      name: it.name,
      qty: it.qty,
      unit: Number(it.unit_price),
    })),
    bonusPts,
  };

  return <PedidoDetailClient order={order} id={id} />;
}
