"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { primeSom, tocarNotificacao } from "@/lib/som";

export default function RealtimeRefresh() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Destrava o áudio no 1º gesto da sessão (autoplay policy). `once` remove sozinho.
  useEffect(() => {
    const prime = () => primeSom();
    window.addEventListener("pointerdown", prime, { once: true });
    window.addEventListener("keydown", prime, { once: true });
    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const refresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 800);
    };

    // Som só pra novidade vinda da loja: decisão de pedido, crédito/estorno no
    // ledger, resgate entregue/cancelado. INSERTs do próprio pintor (enviar
    // orçamento, resgatar) e loja_items não tocam.
    const somPorEvento: Record<string, string[]> = {
      orders: ["UPDATE"],
      point_transactions: ["INSERT"],
      resgates: ["UPDATE"],
    };
    const onEvento = (payload: { table: string; eventType: string }) => {
      if (somPorEvento[payload.table]?.includes(payload.eventType)) tocarNotificacao();
      refresh();
    };

    // Espera a sessao inicializar e autentica o canal com o JWT ANTES de
    // assinar. Sem isso o subscribe pode entrar anonimo -> a RLS filtra tudo
    // -> nenhum evento chega (parece que "parou de atualizar").
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      const token = data.session?.access_token;
      if (!token) return;
      supabase.realtime.setAuth(token);
      channel = supabase
        .channel("pintor-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          onEvento,
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "point_transactions" },
          onEvento,
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "resgates" },
          onEvento,
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "loja_items" },
          onEvento,
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
