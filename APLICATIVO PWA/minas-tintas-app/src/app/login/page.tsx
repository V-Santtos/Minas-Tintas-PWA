"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError("E-mail ou senha inválidos.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Painel esquerdo — foto de fundo com onda paper dentro */}
      <div
        className="hidden md:flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          flex: "0 0 45%",
          backgroundImage:
            "linear-gradient(rgba(43,39,39,.55), rgba(43,39,39,.55)), url('/assets/bg-de-fundo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Logo + tag */}
        <div className="relative z-10 text-center">
          <Image
            src="/logo.png"
            alt="Minas Tintas"
            width={160}
            height={80}
            style={{
              height: 80,
              width: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />
          <div
            style={{
              marginTop: 14,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.4)",
            }}
          >
            ADMIN · CENTRO
          </div>
        </div>

        {/* Âncora inferior esquerda */}
        <div style={{ position: "absolute", bottom: 28, left: 28, zIndex: 10 }}>
          <div
            style={{
              width: 24,
              height: 1,
              background: "rgba(255,255,255,.18)",
              marginBottom: 8,
            }}
          />
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,.32)",
            }}
          >
            Simonésia · MG
          </div>
        </div>

        {/*
          Onda: cor paper pintada DENTRO do painel escuro, no canto direito.
          A foto cobre tudo até a curva; o paper dos dois lados se une em #FAF7F2.
        */}
        <svg
          viewBox="0 0 60 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 60,
            height: "100%",
            zIndex: 5,
            pointerEvents: "none",
            display: "block",
          }}
        >
          {/* Preenchimento paper — 3 ondas simétricas de 300/300/400px */}
          <path
            d="M60,0 L28,0 Q4,100 28,300 Q54,400 28,600 Q2,780 28,1000 L60,1000 Z"
            fill="#FAF7F2"
          />
          {/* Linha vermelha de acento sobre a curva */}
          <path
            d="M28,0 Q4,100 28,300 Q54,400 28,600 Q2,780 28,1000"
            fill="none"
            stroke="#CC0000"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Painel direito — formulário */}
      <div
        className="flex flex-1 items-center"
        style={{
          background: "var(--paper)",
          padding: "clamp(32px, 5vw, 80px) clamp(32px, 6vw, 96px)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: 10,
            }}
          >
            PAINEL ADMINISTRATIVO
          </div>

          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 40,
              lineHeight: 1.1,
              color: "var(--ink)",
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            Bem-vindo
            <br />
            de volta.
          </h1>

          <div
            style={{
              width: 40,
              height: 3,
              background: "#373131",
              borderRadius: 2,
              marginBottom: 10,
            }}
          />

          <p
            style={{
              color: "var(--muted)",
              fontSize: 14,
              lineHeight: 1.6,
              marginBottom: 36,
            }}
          >
            Acesse o painel de gestão
            <br />
            da Minas Tintas.
          </p>

          {/* E-mail */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              E-MAIL
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: "1.5px solid var(--line-strong)",
                padding: "10px 0",
              }}
            >
              <Mail
                size={16}
                color="var(--muted)"
                strokeWidth={1.75}
                style={{ flexShrink: 0 }}
              />
              <input
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  border: 0,
                  background: "transparent",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Senha */}
          <div style={{ marginBottom: 10 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              SENHA
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: "1.5px solid var(--line-strong)",
                padding: "10px 0",
              }}
            >
              <Lock
                size={16}
                color="var(--muted)"
                strokeWidth={1.75}
                style={{ flexShrink: 0 }}
              />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                style={{
                  flex: 1,
                  border: 0,
                  background: "transparent",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--ink)",
                  outline: "none",
                }}
              />
              <button
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 2,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPassword ? (
                  <EyeOff size={16} color="var(--muted)" strokeWidth={1.75} />
                ) : (
                  <Eye size={16} color="var(--muted)" strokeWidth={1.75} />
                )}
              </button>
            </div>
          </div>

          {/* Lembrar-me + Esqueci — mesma linha */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 6,
              marginBottom: 32,
            }}
          >
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  flexShrink: 0,
                  border: `1.5px solid ${remember ? "var(--brand)" : "var(--line-strong)"}`,
                  background: remember ? "var(--brand)" : "transparent",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1,
                }}
              >
                {remember ? "✓" : ""}
              </span>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                }}
              />
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#373131",
                  fontFamily: "var(--font-body)",
                }}
              >
                Lembrar-me
              </span>
            </label>

            <button
              style={{
                background: "transparent",
                border: 0,
                fontSize: 12.5,
                fontWeight: 600,
                color: "#373131",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Esqueci minha senha
            </button>
          </div>

          {/* CTA */}
          {error && (
            <div
              style={{ color: "var(--danger)", fontSize: 13, marginBottom: 16 }}
            >
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: 16,
              borderRadius: 14,
              background: "var(--brand)",
              color: "#fff",
              border: 0,
              fontFamily: "var(--font-body)",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(204,0,0,.28)",
              transition: "opacity .12s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = ".85")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Entrar
            <ArrowRight size={18} strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
