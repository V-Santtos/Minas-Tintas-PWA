"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export type SaveAdminResult = { ok: true } | { ok: false; error: string };

// Edita o nome do próprio admin (policy de self-update em admins:
// auth_user_id = auth.uid()). Identidade vem da sessão, nunca por parâmetro.
export async function saveAdminNome(nome: string): Promise<SaveAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado." };

  const { error } = await supabase
    .from("admins")
    .update({ nome: nome.trim() })
    .eq("auth_user_id", user.id);
  if (error) return { ok: false, error: "Não foi possível salvar o nome." };

  revalidatePath("/configuracoes");
  return { ok: true };
}
