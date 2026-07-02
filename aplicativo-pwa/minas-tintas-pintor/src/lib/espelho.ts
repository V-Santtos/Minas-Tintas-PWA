// Espelho offline (Fase 2 — adiantamento seguro; ver anexo-02-orcamento-offline.md).
// Grava no IndexedDB do aparelho uma cópia do payload de leitura a cada carga
// online (write-through). Hoje é SÓ escrita — invisível e desligável; a leitura
// (`lerEspelho`) já existe pra quando o bloco offline de verdade chegar, e o
// benefício de ir na frente é os aparelhos estrearem com o espelho populado.

import type { PintorReadData } from "./pintor-store";

const DB_NAME = "mt-pintor-offline";
const DB_VERSION = 1;
const STORE = "espelho";
const KEY = "payload";

export type EspelhoPayload = {
  data: PintorReadData;
  atualizadoEm: string; // ISO — idade do espelho ("catálogo de {hora}" na UI futura)
};

// Toda falha aqui é silenciosa (resolve null/void): espelho é best-effort,
// nunca pode quebrar o app — sem IndexedDB (SSR, navegador antigo) vira no-op.
function abrir(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") return resolve(null);
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function salvarEspelho(data: PintorReadData): Promise<void> {
  const db = await abrir();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      const payload: EspelhoPayload = {
        data,
        atualizadoEm: new Date().toISOString(),
      };
      tx.objectStore(STORE).put(payload, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
  db.close();
}

export async function lerEspelho(): Promise<EspelhoPayload | null> {
  const db = await abrir();
  if (!db) return null;
  const payload = await new Promise<EspelhoPayload | null>((resolve) => {
    try {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as EspelhoPayload) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  db.close();
  return payload;
}
