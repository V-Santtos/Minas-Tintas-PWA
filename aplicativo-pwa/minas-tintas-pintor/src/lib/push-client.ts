// Assinatura de Web Push no navegador (lado do aparelho).
// iOS exige: 16.4+, PWA instalado na tela inicial e permissão pedida em GESTO
// do usuário — por isso ativarPush() só é chamado pelo clique do botão em
// Configurações, nunca automático.

import {
  removerPushSubscription,
  salvarPushSubscription,
} from "./push-actions";

export type EstadoPush =
  | "unsupported" // navegador sem Push API (ex.: iOS fora do PWA instalado)
  | "denied" // permissão negada — só reverte nos ajustes do sistema
  | "ativo" // permissão ok + subscription registrada
  | "inativo"; // dá pra ativar (permissão default, ou granted sem subscription)

function suportaPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

// Chave VAPID pública (base64url) → Uint8Array exigido pelo PushManager.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export async function estadoPush(): Promise<EstadoPush> {
  if (!suportaPush()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  if (Notification.permission === "default") return "inativo";
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return sub ? "ativo" : "inativo";
}

export async function ativarPush(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!suportaPush())
    return {
      ok: false,
      error:
        "Este navegador não suporta notificações. No iPhone, instale o app na tela inicial.",
    };

  const permission = await Notification.requestPermission();
  if (permission !== "granted")
    return { ok: false, error: "Permissão de notificação não concedida." };

  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) return { ok: false, error: "Chave de notificação ausente." };

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
      }));

    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth)
      return { ok: false, error: "Inscrição inválida." };

    return await salvarPushSubscription({
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    });
  } catch {
    return { ok: false, error: "Não foi possível ativar as notificações." };
  }
}

export async function desativarPush(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!suportaPush()) return { ok: true };
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return { ok: true };
    const endpoint = sub.endpoint;
    await sub.unsubscribe();
    await removerPushSubscription(endpoint);
    return { ok: true };
  } catch {
    return { ok: false, error: "Não foi possível desativar." };
  }
}
