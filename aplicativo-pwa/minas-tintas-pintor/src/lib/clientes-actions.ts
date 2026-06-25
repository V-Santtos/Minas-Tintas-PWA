"use server";

import { createClient } from "@/utils/supabase/server";

export type VincularClienteInput = {
  nome: string;
  type: "pessoa" | "empresa";
  documento: string;
  telefone?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
};

export type VincularResult =
  | { ok: true; clientId: string; clientCreated: boolean; linkCreated: boolean }
  | { ok: false; error: string };

// Vincula um cliente ao pintor via RPC (identidade pelo JWT). O RPC faz find-or-create
// por documento e registra o vínculo na junção; não sobrescreve cadastro existente.
export async function vincularCliente(
  input: VincularClienteInput,
): Promise<VincularResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("vincular_cliente_pintor", {
    p_new_client: input,
  });
  if (error)
    return {
      ok: false,
      error: error.message || "Não foi possível vincular o cliente.",
    };
  const r = data as {
    client_id: string;
    client_created: boolean;
    link_created: boolean;
  };
  return {
    ok: true,
    clientId: r.client_id,
    clientCreated: r.client_created,
    linkCreated: r.link_created,
  };
}
