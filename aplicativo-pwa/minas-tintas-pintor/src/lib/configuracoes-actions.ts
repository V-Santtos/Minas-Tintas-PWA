"use server";

import { createClient } from "@/utils/supabase/server";

export type NotifPrefs = {
  pedidos: boolean;
  pontos: boolean;
  resgates: boolean;
  promocoes: boolean;
};

// Persiste as preferencias de notificacao do proprio pintor via RPC (upsert, identidade
// pelo JWT). Sem router.refresh: o toggle e estado local; o reload reSemeia pelo layout.
export async function salvarNotifPrefs(
  prefs: NotifPrefs,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("salvar_notif_prefs", {
    p_prefs: prefs,
  });
  if (error)
    return { ok: false, error: error.message || "Não foi possível salvar." };
  return { ok: true };
}
