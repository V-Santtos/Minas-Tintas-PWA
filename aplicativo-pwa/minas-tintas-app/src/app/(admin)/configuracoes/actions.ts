"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { sincronizarCatalogo, type SyncResult } from "@/lib/hiper/sync";

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

export type SyncCatalogoResult =
  | { ok: true; result: SyncResult }
  | { ok: false; error: string };

// Gatilho manual da sync do catálogo. Verifica admin via getUser + lookup em
// admins (mesma checagem da rota POST /api/pintores) — a rota de cron usa
// CRON_SECRET porque não tem sessão; aqui temos, então gateamos por papel.
export async function sincronizarCatalogoAction(): Promise<SyncCatalogoResult> {
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
    const result = await sincronizarCatalogo();
    // telas do admin que leem products: lojinha (busca de catálogo no add-item)
    // e pedidos (busca de produto no novo pedido manual).
    revalidatePath("/lojinha");
    revalidatePath("/pedidos");
    return { ok: true, result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao sincronizar.";
    return { ok: false, error: msg };
  }
}
export async function saveAdminAvatar(
  url: string | null,
): Promise<SaveAdminResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado." };

  const { error } = await supabase
    .from("admins")
    .update({ avatar_url: url })
    .eq("auth_user_id", user.id);
  if (error) return { ok: false, error: "Não foi possível salvar a foto." };

  revalidatePath("/configuracoes");
  return { ok: true };
}
