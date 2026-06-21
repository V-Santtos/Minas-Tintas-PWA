"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type RpcResult = { ok: true } | { ok: false; error: string };

// Decisão de pedido pelo admin via RPCs atômicas. O servidor confere is_admin()
// e o status atual; daqui só vai o uuid do pedido (e o motivo, no estorno).
export async function aprovarPedido(orderId: string): Promise<RpcResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("aprovar_pedido", {
    p_order_id: orderId,
  });
  if (error)
    return { ok: false, error: error.message || "Não foi possível aprovar." };
  revalidatePath("/pedidos");
  return { ok: true };
}

export async function recusarPedido(orderId: string): Promise<RpcResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("recusar_pedido", {
    p_order_id: orderId,
  });
  if (error)
    return { ok: false, error: error.message || "Não foi possível recusar." };
  revalidatePath("/pedidos");
  return { ok: true };
}

export async function estornarPedido(
  orderId: string,
  motivo: string,
): Promise<RpcResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("estornar_pedido", {
    p_order_id: orderId,
    p_motivo: motivo,
  });
  if (error)
    return { ok: false, error: error.message || "Não foi possível estornar." };
  revalidatePath("/pedidos");
  return { ok: true };
}
