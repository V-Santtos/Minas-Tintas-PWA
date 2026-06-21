"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type SavePainterResult = { ok: true } | { ok: false; error: string };

// Edita o pintor pelo admin (policy is_admin): nome, documento, ativar/inativar.
// Atualiza só os campos recebidos. Telefone NÃO entra: é credencial (e-mail
// sintético do auth) — trocar é fluxo à parte. Senha é resetada via /api/pintores.
export async function savePainter(input: {
  id: string;
  nome?: string;
  documento?: string;
  active?: boolean;
}): Promise<SavePainterResult> {
  const row: Record<string, string | boolean | null> = {};
  if (input.nome != null) row.nome = input.nome.trim();
  if (input.documento != null) row.documento = input.documento.trim() || null;
  if (input.active != null) row.active = input.active;
  if (Object.keys(row).length === 0) return { ok: true };

  const supabase = await createClient();
  const { error } = await supabase
    .from("painters")
    .update(row)
    .eq("id", input.id);
  if (error) return { ok: false, error: "Não foi possível salvar o pintor." };

  revalidatePath(`/pintores/${input.id}`);
  revalidatePath("/pintores");
  return { ok: true };
}
