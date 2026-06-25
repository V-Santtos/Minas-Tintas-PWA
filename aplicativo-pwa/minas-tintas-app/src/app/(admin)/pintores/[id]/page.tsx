import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import type { Painter, Order } from "@/lib/mock";
import PintorDetailClient from "./PintorDetailClient";

const sinceFmt = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", "");
const fmtDate = (iso: string) =>
  new Date(iso)
    .toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
    .replace(".", "");

export default async function PintorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: p } = await supabase
    .from("painter_stats")
    .select(
      "id, nome, documento, telefone, active, created_at, pedidos, aprovados, volume, saldo, cep, rua, numero, complemento, bairro, cidade",
    )
    .eq("id", id)
    .maybeSingle();
  if (!p) notFound();

  const { data: orderRows } = await supabase
    .from("pedidos_admin")
    .select(
      "numero, titulo, status, valor_bruto, created_at, painter_nome, client_cidade, bonus_creditado",
    )
    .eq("painter_id", id)
    .neq("status", "rascunho") // draft é WIP do pintor; admin não lista
    .order("numero", { ascending: false });

  const painter: Painter = {
    name: p.nome,
    cpf: p.documento ?? "",
    city: p.cidade ?? "—",
    cep: p.cep ?? "",
    rua: p.rua ?? "",
    numero: p.numero ?? "",
    complemento: p.complemento ?? "",
    bairro: p.bairro ?? "",
    cidade: p.cidade ?? "",
    since: sinceFmt(p.created_at),
    orders: Number(p.pedidos),
    approved: Number(p.aprovados),
    points: Number(p.saldo),
    volume: Number(p.volume),
    active: p.active,
    phone: p.telefone ?? "",
  };

  const orders: Order[] = (orderRows ?? []).map((r) => ({
    id: String(r.numero).padStart(4, "0"),
    painter: r.painter_nome,
    location: r.client_cidade ?? "—",
    title: r.titulo ?? "—",
    date: fmtDate(r.created_at),
    total: Number(r.valor_bruto),
    status: r.status,
    payment: "", // não exibido no detalhe
    bonusPts: Number(r.bonus_creditado),
  }));

  return (
    <PintorDetailClient painter={painter} orders={orders} painterId={id} />
  );
}
