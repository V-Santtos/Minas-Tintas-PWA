import "server-only";
import webpush from "web-push";
import { createAdminClient } from "@/utils/supabase/admin";

// Envio de Web Push pro pintor (T6c). Chamado pelas server actions do admin
// APÓS a RPC ter sucesso — best-effort: falha de push nunca quebra a action
// (mesmo contrato do brinde de boas-vindas). service_role porque
// push_subscriptions/painter_settings têm RLS self (o admin não tem policy).

export type PushMsg = {
  title: string;
  body: string;
  url?: string; // rota do pintor aberta no toque (default /notificacoes)
  tag?: string; // mesmo tag substitui a notificação anterior
};

// Toggle de painter_settings que silencia o aviso; null = crítico, sempre envia
// (decisão travada: estorno/cancelamento pela loja não são silenciáveis).
export type PushToggle = "notif_pedidos" | "notif_resgates" | null;

export async function enviarPushPintor(
  painterId: string,
  msg: PushMsg,
  toggle: PushToggle = null,
): Promise<void> {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;
    if (!publicKey || !privateKey || !subject) return; // sem envs → no-op

    const admin = createAdminClient();

    if (toggle) {
      const { data: prefs } = await admin
        .from("painter_settings")
        .select("notif_pedidos, notif_resgates")
        .eq("painter_id", painterId)
        .maybeSingle();
      if (prefs && prefs[toggle] === false) return;
    }

    const { data: subs } = await admin
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("painter_id", painterId);
    if (!subs?.length) return;

    webpush.setVapidDetails(subject, publicKey, privateKey);
    const payload = JSON.stringify(msg);

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload,
          );
        } catch (err) {
          // 404/410 = subscription morta (permissão revogada/expirada) → limpa
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await admin
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint);
          }
        }
      }),
    );
  } catch {
    // best-effort: push nunca derruba a action que o chamou
  }
}
