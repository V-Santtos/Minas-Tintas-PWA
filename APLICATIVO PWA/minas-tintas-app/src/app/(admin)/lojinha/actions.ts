"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type LojaItemInput = {
  id?: string;
  name: string;
  valorBase: number;
  mod: number; // delta relativo ao multiplicador_padrao (0 = herda → null)
  stock: number;
  descricao?: string;
};

export type SaveLojaResult = { ok: true } | { ok: false; error: string };

// Escrita simples escopada ao admin → policy is_admin() + server action.
// multiplicador é derivado do delta com o padrão LIDO NO SERVIDOR (autoritativo):
// mod 0 = herda (null); mod ≠ 0 = padrão + mod. Imagem fica de fora (bloco futuro).
export async function saveLojaItem(
  input: LojaItemInput,
): Promise<SaveLojaResult> {
  const supabase = await createClient();

  const { data: cfg } = await supabase
    .from("settings")
    .select("multiplicador_padrao")
    .single();
  const padrao = Number(cfg?.multiplicador_padrao ?? 3);
  const multiplicador = input.mod === 0 ? null : padrao + input.mod;

  const row = {
    name: input.name.trim(),
    valor_base: input.valorBase,
    multiplicador,
    stock: Math.max(0, Math.floor(input.stock)),
    descricao: input.descricao?.trim() || null,
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
