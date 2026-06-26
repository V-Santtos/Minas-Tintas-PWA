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
  const [
    { data: rows },
    { data: cfg },
    { data: painterRows },
    { data: clientRows },
    { data: productRows },
  ] = await Promise.all([
    supabase
      .from("pedidos_admin")
      .select(
        "numero, titulo, status, valor_bruto, desconto, pagamento, observacao, created_at, painter_nome, client_nome, client_cidade, bonus_creditado, estorno_motivo",
      )
      .neq("status", "rascunho") // draft é WIP do pintor; admin não lista
      .order("numero", { ascending: false }),
    supabase.from("settings").select("bonus_percent").single(),
    supabase
      .from("painters")
      .select("id, nome, telefone")
      .eq("active", true)
      .order("nome"),
    supabase.from("clients").select("id, nome, type").order("nome"),
    supabase
      .from("products")
      .select("id, code, name, brand, price, cost, stock")
      .eq("active", true)
      .order("name"),
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
      clientName: r.client_nome ?? undefined,
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

  const painters = (painterRows ?? []).map((p) => ({
    id: p.id,
    name: p.nome,
    phone: p.telefone ?? "",
  }));
  const clients = (clientRows ?? []).map((c) => ({
    id: c.id,
    name: c.nome,
    type: c.type as "pessoa" | "empresa",
  }));
  const products = (productRows ?? []).map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    brand: p.brand,
    price: Number(p.price),
    cost: Number(p.cost),
    stock: p.stock,
  }));

  return (
    <PedidosClient
      orders={orders}
      bonusPercent={percent}
      painters={painters}
      clients={clients}
      products={products}
    />
  );
}
