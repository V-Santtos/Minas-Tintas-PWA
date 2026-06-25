import { createClient } from "@/utils/supabase/server";
import type { Client } from "@/lib/mock";
import ClientesClient from "./Clientsclient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients_admin")
    .select(
      "id, nome, type, telefone, documento, cep, rua, numero, complemento, bairro, cidade, painter_nome",
    )
    .order("nome");

  const clients: Client[] = (data ?? []).map((c) => ({
    id: c.id,
    name: c.nome,
    type: c.type,
    phone: c.telefone ?? "",
    painter: c.painter_nome ?? null, // pintor mais recente (derivado de orders)
    cpf: c.documento ?? undefined,
    cep: c.cep ?? undefined,
    rua: c.rua ?? undefined,
    numero: c.numero ?? undefined,
    complemento: c.complemento ?? undefined,
    bairro: c.bairro ?? undefined,
    cidade: c.cidade ?? undefined,
  }));

  return <ClientesClient clients={clients} />;
}
