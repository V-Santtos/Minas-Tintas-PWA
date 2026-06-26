"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type LojaItemInput = {
  id?: string;
  name: string;
  valorBase: number;
  mod: number; // delta relativo ao multiplicador_padrao (0 = herda → null)
  stock: number;
  resgateUnico: boolean;
  descricao?: string;
};

export type SaveLojaResult = { ok: true } | { ok: false; error: string };

// Escrita simples escopada ao admin → policy is_admin() + server action.
// mult_delta é o ajuste relativo ao multiplicador_padrao, gravado CRU (não mais
// padrao + mod): mod 0 = herda (null). O efetivo é resolvido em leitura
// (view/RPC) como padrao + delta. Imagem fica de fora (bloco futuro).
export async function saveLojaItem(
  input: LojaItemInput,
): Promise<SaveLojaResult> {
  const supabase = await createClient();

  const mult_delta = input.mod === 0 ? null : input.mod;

  const row = {
    name: input.name.trim(),
    valor_base: input.valorBase,
    mult_delta,
    stock: Math.max(0, Math.floor(input.stock)),
    descricao: input.descricao?.trim() || null,
    resgate_unico: input.resgateUnico,
  };

  const { error } = input.id
    ? await supabase.from("loja_items").update(row).eq("id", input.id)
    : await supabase.from("loja_items").insert(row);

  if (error) return { ok: false, error: "Não foi possível salvar o item." };

  revalidatePath("/lojinha");
  return { ok: true };
}

export async function entregarResgate(
  resgateId: string,
): Promise<SaveLojaResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("entregar_resgate", {
    p_resgate_id: resgateId,
  });
  if (error)
    return { ok: false, error: error.message || "Não foi possível entregar." };
  revalidatePath("/lojinha");
  return { ok: true };
}

export async function recusarResgate(
  resgateId: string,
): Promise<SaveLojaResult> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancelar_resgate_admin", {
    p_resgate_id: resgateId,
  });
  if (error)
    return { ok: false, error: error.message || "Não foi possível recusar." };
  revalidatePath("/lojinha");
  return { ok: true };
}
