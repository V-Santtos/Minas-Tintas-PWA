"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type SaveSettingsResult = { ok: true } | { ok: false; error: string };

// Escrita do singleton settings (id=1) pelo admin → policy is_admin + server action.
// Atualiza só os campos recebidos, para a configuracoes reusar (bonus_percent depois).
export async function saveSettings(input: {
  multiplicadorPadrao?: number;
  bonusPercent?: number;
}): Promise<SaveSettingsResult> {
  const row: Record<string, number> = {};
  if (input.multiplicadorPadrao != null)
    row.multiplicador_padrao = input.multiplicadorPadrao;
  if (input.bonusPercent != null) row.bonus_percent = input.bonusPercent;
  if (Object.keys(row).length === 0) return { ok: true };

  const supabase = await createClient();
  const { error } = await supabase.from("settings").update(row).eq("id", 1);
  if (error)
    return { ok: false, error: "Não foi possível salvar as configurações." };

  revalidatePath("/lojinha");
  revalidatePath("/configuracoes");
  return { ok: true };
}
