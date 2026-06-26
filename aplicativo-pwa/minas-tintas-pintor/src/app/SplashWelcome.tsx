"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MockStatusBar from "@/components/MockStatusBar"; // [MOCKUP DESKTOP] remover ao publicar

// Marca a splash como vista (cookie, pra que o Server Component de "/" pule
// direto pro /login nas próximas aberturas, sem renderizar a splash → sem flash).
function markSplashSeen() {
  const maxAge = 60 * 60 * 24 * 365; // 1 ano
  document.cookie = `mt_splash_seen=1; path=/; max-age=${maxAge}; samesite=lax`;
}

export default function SplashWelcome() {
  useEffect(() => {
    markSplashSeen();
  }, []);

  return (
    <div
      className="pintor-app"
      style={{ background: "#373131", minHeight: "100dvh", height: "100dvh" }}
    >
      <MockStatusBar overlay />
      {/* [MOCKUP DESKTOP] some no mobile via CSS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          backgroundImage:
            "linear-gradient(rgba(55,49,49,.32), rgba(55,49,49,.32)), url('/assets/bg-login.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center top",
          backgroundSize: "auto 520px",
        }}
      >
        {/* Hero com padrão topográfico */}
        <div
          style={{
            flex: "0 0 52%",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" style={{ height: 80 }} alt="Minas Tintas" />
          </div>
        </div>

        {/* Wave */}
        <svg
          viewBox="0 0 390 70"
          preserveAspectRatio="none"
          style={{
            display: "block",
            width: "100%",
            flexShrink: 0,
            position: "relative",
            zIndex: 2,
            background: "transparent",
          }}
        >
          <path
            fill="#FAF7F2"
            d="M0,70 L0,40 Q72,8 148,30 Q224,52 298,18 Q348,2 390,26 L390,70 Z"
          />
        </svg>

        {/* Conteúdo */}
        <div
          style={{
            background: "#FAF7F2",
            padding: "10px 28px 48px",
            flex: 1,
            position: "relative",
            zIndex: 2,
            marginTop: -1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="page-title"
            style={{ fontSize: 32, lineHeight: 1.18, marginBottom: 10 }}
          >
            Bem-vindo.
          </div>
          <p
            style={{
              color: "var(--muted)",
              fontSize: 14.5,
              lineHeight: 1.6,
              marginBottom: 32,
            }}
          >
            Seu programa de pontos e
            <br />
            recompensas Minas Tintas.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              marginTop: "auto",
            }}
          >
            <Link
              href="/login"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                fontSize: 15,
                fontWeight: 600,
                color: "var(--brand)",
              }}
            >
              Continuar
              <span
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--brand)",
                  border: "1.5px solid rgba(255,255,255,.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 12px rgba(204,0,0,.35)",
                }}
              >
                <ArrowRight size={20} strokeWidth={2} color="white" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
