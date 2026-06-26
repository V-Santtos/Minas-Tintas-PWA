"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function RealtimeRefresh() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const refresh = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => router.refresh(), 800);
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
        .channel("admin-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          refresh,
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "resgates" },
          refresh,
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
