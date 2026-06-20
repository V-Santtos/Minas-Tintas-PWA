"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type ClientInput = {
  id?: string;
  nome: string;
  type: "pessoa" | "empresa";
  documento: string; // mascarado (convenção atual; unique é sobre o texto cru)
  telefone?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
};

export type SaveClientResult = { ok: true } | { ok: false; error: string };

// Escrita simples escopada por papel → RLS (policy is_admin()), sem service_role.
export async function saveClient(
  input: ClientInput,
): Promise<SaveClientResult> {
  const supabase = await createClient();

  const row = {
    nome: input.nome.trim(),
    type: input.type,
    documento: input.documento.trim(),
    telefone: input.telefone?.trim() || null,
    cep: input.cep?.trim() || null,
    rua: input.rua?.trim() || null,
    numero: input.numero?.trim() || null,
    complemento: input.complemento?.trim() || null,
    bairro: input.bairro?.trim() || null,
    cidade: input.cidade?.trim() || null,
  };

  const { error } = input.id
    ? await supabase.from("clients").update(row).eq("id", input.id)
    : await supabase.from("clients").insert(row);

  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "Já existe um cliente com esse documento." };
    return { ok: false, error: "Não foi possível salvar o cliente." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
