import { createClient } from "@/utils/supabase/server";
import { bonusPoints } from "@/lib/rules";
import type { Order } from "@/lib/mock";
import PedidosClient from "./PedidosClient";

const fmtDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");

export default async function PedidosPage() {
  const supabase = await createClient();
  const [{ data: rows }, { data: cfg }] = await Promise.all([
    supabase
      .from("pedidos_admin")
      .select(
        "numero, titulo, status, valor_bruto, desconto, pagamento, observacao, created_at, painter_nome, client_cidade, bonus_creditado, estorno_motivo",
      )
      .neq("status", "rascunho") // draft é WIP do pintor; admin não lista
      .order("numero", { ascending: false }),
    supabase.from("settings").select("bonus_percent").single(),
  ]);
  const percent = Number(cfg?.bonus_percent ?? 0.01);

  const orders: Order[] = (rows ?? []).map((r) => {
    const total = Number(r.valor_bruto);
    const credited = Number(r.bonus_creditado);
    // creditado = verdade do ledger; senão projeta SÓ enquanto pendente; recusado/cancelado = 0
    const bonusPts =
      credited > 0
        ? credited
        : r.status === "pendente"
          ? bonusPoints(total, percent)
          : 0;
    return {
      id: String(r.numero).padStart(4, "0"),
      painter: r.painter_nome,
      location: r.client_cidade ?? "—", // sem coluna em orders; cidade do cliente
      title: r.titulo ?? "—",
      date: fmtDate(r.created_at),
      createdAtISO: r.created_at.slice(0, 10),
      total,
      discount: Number(r.desconto),
      status: r.status,
      payment: r.pagamento ?? "",
      notes: r.observacao ?? undefined,
      estornoMotivo: r.estorno_motivo ?? undefined,
      bonusPts,
    };
  });

  return <PedidosClient orders={orders} bonusPercent={percent} />;
}
