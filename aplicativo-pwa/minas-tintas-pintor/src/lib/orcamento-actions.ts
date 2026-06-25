"use server";

import { createClient } from "@/utils/supabase/server";

export type EnviarOrcamentoInput = {
  clientId?: string | null;
  newClient?: {
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
  } | null;
  items: { product_id: string; qty: number }[];
  titulo?: string | null;
  desconto?: number;
  pagamento?: string | null;
  observacao?: string | null;
};

export type EnviarResult =
  | { ok: true; id: string; numero: number }
  | { ok: false; error: string };

// Enviar orçamento via RPC atômica. O servidor resolve o pintor pelo JWT,
// busca os preços em products e cria pedido + itens numa transação.
export async function enviarOrcamento(
  input: EnviarOrcamentoInput,
): Promise<EnviarResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("enviar_orcamento", {
    p_client_id: input.clientId ?? null,
    p_new_client: input.newClient ?? null,
    p_items: input.items,
    p_titulo: input.titulo ?? null,
    p_desconto: input.desconto ?? 0,
    p_pagamento: input.pagamento ?? null,
    p_observacao: input.observacao ?? null,
  });
  if (error)
    return {
      ok: false,
      error: error.message || "Não foi possível enviar o orçamento.",
    };
  const r = data as { id: string; numero: number };
  return { ok: true, id: r.id, numero: r.numero };
}
