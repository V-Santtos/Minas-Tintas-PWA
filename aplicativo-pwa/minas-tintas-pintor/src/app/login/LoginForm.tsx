"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import MockStatusBar from "@/components/MockStatusBar"; // [MOCKUP DESKTOP] remover ao publicar
import { createClient } from "@/utils/supabase/client";

function fmtPhone(raw: string): string {
  const v = raw.replace(/\D/g, "").slice(0, 11);
  if (v.length === 0) return "";
  if (v.length <= 2) return "(" + v;
  if (v.length <= 6) return "(" + v.slice(0, 2) + ") " + v.slice(2);
  if (v.length <= 10)
    return "(" + v.slice(0, 2) + ") " + v.slice(2, 6) + "-" + v.slice(6);
  return (
    "(" +
    v.slice(0, 2) +
    ") " +
    v.slice(2, 3) +
    " " +
    v.slice(3, 7) +
    "-" +
    v.slice(7)
  );
}

// Preferência "Lembrar-me" gravada em cookie (não localStorage) pra que o
// Server Component de /login consiga lê-la e decidir o auto-encaminhamento.
function setRememberCookie(value: boolean) {
  const maxAge = 60 * 60 * 24 * 365; // 1 ano
  document.cookie = `mt_remember=${value ? "true" : "false"}; path=/; max-age=${maxAge}; samesite=lax`;
}

export default function LoginForm({ staleSession }: { staleSession: boolean }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Chegou no login com sessão válida mas SEM "Lembrar-me" → encerra a sessão
  // pendente. É o que faz o desmarcado pedir login de novo no próximo acesso.
  useEffect(() => {
    if (!staleSession) return;
    createClient().auth.signOut();
  }, [staleSession]);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // evita duplo envio
    setError("");
    setLoading(true);

    const tel = phone.replace(/\D/g, "");
    const emailLogin = `${tel}@pintor.local`;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: emailLogin,
      password: senha,
    });
    if (error) {
      setError("Telefone ou senha inválidos.");
      setLoading(false);
      return;
    }

    setRememberCookie(remember);
    // Mantém o loading ligado durante o redirect (o botão segue girando até
    // a próxima tela pintar) — não reseta aqui.
    router.push("/home");
  }

  return (
    <div
      className="pintor-app"
      style={{ background: "#373131", minHeight: "100dvh" }}
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
          backgroundSize: "auto 360px",
        }}
      >
        {/* Hero menor */}
        <div
          style={{
            flex: "0 0 34%",
            minHeight: 240,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            style={{
              height: 48,
              position: "relative",
              zIndex: 1,
              marginTop: 14,
            }}
            alt="Minas Tintas"
          />
        </div>

        {/* Wave */}
        <svg
          viewBox="0 0 390 70"
          preserveAspectRatio="none"
          style={{
            display: "block",
            width: "100%",
            flexShrink: 0,
            background: "transparent",
            position: "relative",
            zIndex: 2,
          }}
        >
          <path
            fill="#FAF7F2"
            d="M0,0 Q72,62 148,40 Q224,18 298,52 Q348,68 390,44 L390,70 L0,70 Z"
          />
        </svg>

        {/* Formulário */}
        <form
          onSubmit={doLogin}
          style={{
            background: "#FAF7F2",
            flex: 1,
            padding: "10px 28px 40px",
            marginTop: -1, // cobre a fresta de subpixel entre a onda e o form (igual à splash)
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            className="page-title"
            style={{ fontSize: 32, lineHeight: 1.15, marginBottom: 6 }}
          >
            Entrar
          </div>
          <div
            style={{
              width: 36,
              height: 3,
              background: "#373131",
              borderRadius: 2,
              marginBottom: 28,
            }}
          />

          {/* Telefone */}
          <div style={{ marginBottom: 20 }}>
            <div className="eyebrow-label" style={{ marginBottom: 8 }}>
              Telefone
            </div>
            <div className="auth-field">
              <Phone size={16} strokeWidth={1.75} />
              <input
                type="tel"
                inputMode="tel"
                placeholder="(00) 00000-0000"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(fmtPhone(e.target.value))}
              />
            </div>
          </div>

          {/* Senha */}
          <div style={{ marginBottom: 10 }}>
            <div className="eyebrow-label" style={{ marginBottom: 8 }}>
              Senha
            </div>
            <div className="auth-field">
              <Lock size={16} strokeWidth={1.75} />
              <input
                type={showSenha ? "text" : "password"}
                placeholder={"•".repeat(8)}
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <button
                type="button"
                className="tap"
                onClick={() => setShowSenha((s) => !s)}
                style={{
                  background: "transparent",
                  border: 0,
                  padding: 2,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
                aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {showSenha ? (
                  <EyeOff size={16} strokeWidth={1.75} color="var(--muted)" />
                ) : (
                  <Eye size={16} strokeWidth={1.75} color="var(--muted)" />
                )}
              </button>
            </div>
          </div>

          {/* Lembrar-me */}
          <label
            style={{
              minHeight: 34,
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              margin: "2px 0 26px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 5,
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
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#373131" }}>
              Lembrar-me
            </span>
          </label>

          {/* CTA */}
          {error && (
            <div
              style={{ color: "var(--brand)", fontSize: 13, marginBottom: 16 }}
            >
              {error}
            </div>
          )}
          <button
            type="submit"
            className="btn btn-full"
            disabled={loading}
            aria-busy={loading}
            style={{
              fontSize: 16,
              padding: 16,
              borderRadius: 14,
              background: "var(--brand)",
              color: "#fff",
              border: 0,
              boxShadow: "0 4px 14px rgba(204,0,0,.3)",
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? (
              <Loader2
                size={20}
                strokeWidth={2.5}
                style={{ animation: "spin 1s linear infinite" }}
                aria-label="Entrando…"
              />
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
