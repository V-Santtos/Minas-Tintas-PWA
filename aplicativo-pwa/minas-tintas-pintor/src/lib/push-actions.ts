"use server";

import { createClient } from "@/utils/supabase/server";

export type PushActionResult = { ok: true } | { ok: false; error: string };

// Escrita simples escopada ao papel → policy self de RLS + server action
// (roteamento travado). O painter sai do JWT, nunca de parâmetro.
async function painterIdDaSessao(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("painters")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  return data?.id ?? null;
}

// Upsert por endpoint: re-assinar no mesmo aparelho só renova a linha.
export async function salvarPushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
}): Promise<PushActionResult> {
  const painterId = await painterIdDaSessao();
  if (!painterId) return { ok: false, error: "Pintor não identificado." };

  const supabase = await createClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      endpoint: input.endpoint,
      painter_id: painterId,
      p256dh: input.p256dh,
      auth: input.auth,
    },
    { onConflict: "endpoint" },
  );
  if (error)
    return { ok: false, error: "Não foi possível salvar a inscrição." };
  return { ok: true };
}

export async function removerPushSubscription(
  endpoint: string,
): Promise<PushActionResult> {
  const supabase = await createClient();
  // RLS self garante que só a própria linha é apagável.
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);
  if (error)
    return { ok: false, error: "Não foi possível remover a inscrição." };
  return { ok: true };
}
