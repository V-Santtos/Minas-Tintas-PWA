import { createClient } from "@/utils/supabase/server";
import type { Order } from "@/lib/mock";
import RelatoriosClient from "./Relatoriosclient";

const fmtDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");

export default async function RelatoriosPage() {
  const supabase = await createClient();

  const [{ data: orderRows }, { data: painterRows }] = await Promise.all([
    supabase
      .from("pedidos_admin")
      .select(
        "numero, status, valor_bruto, created_at, painter_nome, bonus_creditado",
      )
      .neq("status", "rascunho"),
    supabase.from("painter_stats").select("nome").order("nome"),
  ]);

  const orders: Order[] = (orderRows ?? []).map((r) => ({
    id: String(r.numero).padStart(4, "0"),
    painter: r.painter_nome,
    location: "",
    title: "",
    date: fmtDate(r.created_at),
    createdAtISO: r.created_at.slice(0, 10),
    total: Number(r.valor_bruto),
    status: r.status,
    payment: "",
    bonusPts: Number(r.bonus_creditado),
  }));

  const painters = (painterRows ?? []).map((p) => ({
    name: p.nome,
    city: "—",
  }));

  return <RelatoriosClient orders={orders} painters={painters} />;
}
