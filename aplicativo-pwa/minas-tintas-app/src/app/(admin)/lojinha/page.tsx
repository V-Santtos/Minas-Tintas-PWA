import { createClient } from "@/utils/supabase/server";
import type { Reward, Resgate, CatalogItem } from "@/lib/mock";
import LojinhaClient from "./LojinhaClient";

const fmtData = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");

// status do banco → rótulos da tela (UI intacta)
const STATUS_MAP: Record<string, Resgate["status"]> = {
  pendente_retirada: "pendente",
  entregue: "entregue",
  cancelado: "recusado",
};

export default async function LojinhaPage() {
  const supabase = await createClient();

  const [
    { data: itemRows },
    { data: resgateRows },
    { data: cfg },
    { data: productRows },
  ] = await Promise.all([
    supabase
      .from("loja_items_admin")
      .select("id, name, valor_base, mult_delta, stock, imagem, descricao")
      .order("custo_pts"),
    supabase
      .from("resgates_admin")
      .select(
        "id, painter_nome, loja_item_id, pontos_congelados, status, created_at",
      )
      .order("created_at", { ascending: false }),
    supabase.from("settings").select("multiplicador_padrao").single(),
    supabase
      .from("products")
      .select("id, code, name, brand, price, cost, stock")
      .eq("active", true)
      .order("name"),
  ]);

  const padrao = Number(cfg?.multiplicador_padrao ?? 3);

  // itemMod = mult_delta (já é o delta; 0 quando herda). O calcPts do client,
  // com globalMult = padrao, faz valor_base × (padrao + delta).
  const rewards: Reward[] = (itemRows ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    custo: Number(r.valor_base),
    venda: Number(r.valor_base),
    itemMod: r.mult_delta != null ? Number(r.mult_delta) : 0,
    stock: r.stock,
    icon: "",
    img: r.imagem ?? "",
    desc: r.descricao ?? "",
  }));

  const resgates: Resgate[] = (resgateRows ?? []).map((r) => ({
    id: r.id,
    pintorName: r.painter_nome,
    itemId: r.loja_item_id ?? "",
    pts: r.pontos_congelados,
    data: fmtData(r.created_at),
    status: STATUS_MAP[r.status] ?? "pendente",
  }));

  const catalog: CatalogItem[] = (productRows ?? []).map((p) => ({
    id: p.id,
    code: p.code ?? "",
    name: p.name,
    brand: p.brand ?? "",
    price: Number(p.price),
    cost: Number(p.cost ?? 0),
    stock: p.stock,
  }));

  return (
    <LojinhaClient
      rewards={rewards}
      resgates={resgates}
      globalMult={padrao}
      catalog={catalog}
    />
  );
}
