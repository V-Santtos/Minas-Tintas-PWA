"use server";

import { createClient } from "@/utils/supabase/server";

export type RpcResult = { ok: true } | { ok: false; error: string };

// Resgate atômico no banco (RPC SECURITY DEFINER). O servidor resolve o pintor
// pelo JWT e recalcula o custo; daqui só vai o id do item.
export async function resgatarItem(itemId: string): Promise<RpcResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("resgatar_item", { p_item_id: itemId });
  if (error)
    return { ok: false, error: error.message || "Não foi possível resgatar." };
  return { ok: true };
}

// Cancelar resgate (RPC SECURITY DEFINER). Só funciona se for do próprio pintor
// e ainda pendente_retirada; devolve pontos (snapshot) + estoque.
export async function cancelarResgate(resgateId: string): Promise<RpcResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancelar_resgate", {
    p_resgate_id: resgateId,
  });
  if (error)
    return { ok: false, error: error.message || "Não foi possível cancelar." };
  return { ok: true };
}
