"use server";

import { createClient } from "@/utils/supabase/server";
import { subirImagemWebp, type Prefixo } from "@/lib/storage";

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

export async function uploadImagem(
  dataUrl: string,
  prefix: Prefixo,
): Promise<UploadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado." };
  const { data: admin } = await supabase
    .from("admins")
    .select("auth_user_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!admin) return { ok: false, error: "Sem permissão." };

  try {
    const url = await subirImagemWebp(dataUrl, prefix);
    return { ok: true, url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao subir a imagem.";
    return { ok: false, error: msg };
  }
}
