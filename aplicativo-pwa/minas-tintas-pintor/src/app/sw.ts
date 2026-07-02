import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

// Declara para o TypeScript que existe uma global __SW_MANIFEST.
// É um "placeholder": no build, o Serwist substitui isso pela lista
// real de arquivos do app a serem pré-cacheados (o app shell).
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

// Dentro de um service worker, `self` é o escopo global do worker
// (não é o `window` da página). Isto dá o tipo certo a ele.
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// --- Web Push (T6c) ---------------------------------------------------------
// Eventos que o Serwist não usa; coexistem com o precache/fallback acima.
// O som/vibração da notificação é o padrão do sistema operacional.

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json() as {
    title?: string;
    body?: string;
    tag?: string;
    url?: string;
  };
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Minas Tintas", {
      body: data.body ?? "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      // mesmo tag substitui a notificação anterior em vez de empilhar
      tag: data.tag ?? "minas-tintas",
      data: { url: data.url ?? "/notificacoes" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification.data as { url?: string } | undefined)?.url ??
    "/notificacoes";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          // app já aberto → foca e navega; senão abre janela nova
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url).catch(() => {});
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});
