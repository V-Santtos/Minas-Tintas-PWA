import { createClient } from "@/utils/supabase/server";
import PintoresClient, { type PainterRow } from "./PintoresClient";

function since(createdAt: string) {
  return new Date(createdAt)
    .toLocaleDateString("pt-BR", { month: "short", year: "numeric" })
    .replace(".", ""); // "jun de 2026"
}

export default async function PintoresPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("painter_stats")
    .select("nome, documento, active, created_at, pedidos, saldo")
    .order("nome");

  const painters: PainterRow[] = (data ?? []).map((p) => ({
    name: p.nome,
    cpf: p.documento ?? "", // documento pode ser null → string vazia
    city: "—", // sem origem no schema (ver pendência)
    since: since(p.created_at),
    orders: Number(p.pedidos), // PostgREST serializa bigint como string às vezes
    points: Number(p.saldo),
    active: p.active,
  }));

  return <PintoresClient painters={painters} />;
}
