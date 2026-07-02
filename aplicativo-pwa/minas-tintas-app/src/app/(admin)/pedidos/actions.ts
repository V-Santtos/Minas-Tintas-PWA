"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { enviarPushPintor } from "@/lib/push";

export type RpcResult = { ok: true } | { ok: false; error: string };

// Dados do pedido pro push (painter + numero). Falha aqui não bloqueia nada —
// o push é best-effort; sem a linha, simplesmente não notifica.
async function pedidoParaPush(orderId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("painter_id, numero")
    .eq("id", orderId)
    .maybeSingle();
  return data;
}

// Decisão de pedido pelo admin via RPCs atômicas. O servidor confere is_admin()
// e o status atual; daqui só vai o uuid do pedido (e o motivo, no estorno).
export async function aprovarPedido(orderId: string): Promise<RpcResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("aprovar_pedido", {
    p_order_id: orderId,
  });
  if (error)
    return { ok: false, error: error.message || "Não foi possível aprovar." };
  const o = await pedidoParaPush(orderId);
  if (o)
    await enviarPushPintor(
      o.painter_id,
      {
        title: `Pedido #${o.numero} aprovado`,
        body: "Seus pontos foram creditados no saldo.",
        url: `/pedidos/${orderId}`,
        tag: `pedido-${orderId}`,
      },
      "notif_pedidos",
    );
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
  const o = await pedidoParaPush(orderId);
  if (o)
    await enviarPushPintor(
      o.painter_id,
      {
        title: `Pedido #${o.numero} recusado`,
        body: "Fale com a Minas Tintas para entender o motivo.",
        url: `/pedidos/${orderId}`,
        tag: `pedido-${orderId}`,
      },
      "notif_pedidos",
    );
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
  const o = await pedidoParaPush(orderId);
  if (o)
    // Crítico: sem toggle (decisão travada — estorno não é silenciável).
    await enviarPushPintor(o.painter_id, {
      title: `Pedido #${o.numero} estornado`,
      body: "A aprovação foi revertida e os pontos removidos do saldo.",
      url: `/pedidos/${orderId}`,
      tag: `pedido-${orderId}`,
    });
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
  const numero = (data as { numero: number })?.numero;
  await enviarPushPintor(
    input.painterId,
    {
      title: `Pedido #${numero} aprovado`,
      body: "A loja registrou um pedido pra você. Pontos creditados no saldo.",
      url: "/pedidos",
      tag: `pedido-${numero}`,
    },
    "notif_pedidos",
  );
  revalidatePath("/pedidos");
  return { ok: true, numero };
}
