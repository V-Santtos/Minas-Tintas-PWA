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

export type CriarPedidoResult =
  | { ok: true; numero: number }
  | { ok: false; error: string };

export async function criarPedido(input: {
  painterId: string;
  clientId: string;
  items: { product_id: string; qty: number }[];
  titulo?: string;
  desconto?: number;
  pagamento?: string;
  observacao?: string;
}): Promise<CriarPedidoResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("criar_pedido_admin", {
    p_painter_id: input.painterId,
    p_client_id: input.clientId,
    p_items: input.items,
    p_titulo: input.titulo ?? null,
    p_desconto: input.desconto ?? 0,
    p_pagamento: input.pagamento ?? null,
    p_observacao: input.observacao ?? null,
  });
  if (error)
    return {
      ok: false,
      error: error.message || "Não foi possível criar o pedido.",
    };
  revalidatePath("/pedidos");
  return { ok: true, numero: (data as { numero: number })?.numero };
}
