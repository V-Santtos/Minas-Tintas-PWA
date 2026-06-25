"use client";

import { useRef, useState, useEffect } from "react";
import {
  Save,
  Eye,
  EyeOff,
  Lock,
  User,
  ImagePlus,
  Trash2,
  Percent,
} from "lucide-react";
import { useAdmin } from "@/lib/admin-context";
import { createClient } from "@/utils/supabase/client";
import { saveSettings } from "@/lib/settings-actions";
import { saveAdminNome } from "./actions";

function PasswordInput({
  value,
  onChange,
  show,
  onToggle,
  inputSt,
}: {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  inputSt: React.CSSProperties;
}) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputSt, paddingRight: 40 }}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--muted)",
          display: "flex",
          padding: 2,
        }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export default function ConfiguracoesPage() {
  const { profile, setProfile } = useAdmin();

  const [nome, setNome] = useState(profile.name);
  const [email, setEmail] = useState("");
  const [savedDados, setSavedDados] = useState(false);
  const [dadosErro, setDadosErro] = useState("");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showAtual, setShowAtual] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [savedSenha, setSavedSenha] = useState(false);
  const [senhaErro, setSenhaErro] = useState("");

  const [bonusPct, setBonusPct] = useState(""); // em %, ex. "1.0"
  const [bonusSaving, setBonusSaving] = useState(false);
  const [bonusSaved, setBonusSaved] = useState(false);
  const [bonusErro, setBonusErro] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("settings")
      .select("bonus_percent")
      .single()
      .then(({ data }) => {
        if (data) setBonusPct(String(Number(data.bonus_percent) * 100));
      });
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  const fileRef = useRef<HTMLInputElement>(null);
  const initial = nome.trim().charAt(0).toUpperCase() || "A";

  const inputSt: React.CSSProperties = {
    height: "40px",
    padding: "0 12px",
    borderRadius: 10,
    fontSize: 13,
    border: "1px solid var(--line)",
    background: "var(--card)",
    color: "var(--ink)",
    fontFamily: "var(--font-body)",
    outline: "none",
    width: "100%",
  };
  const labelSt: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: "var(--ink-2)",
  };
  const cardSt: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--line)",
    borderRadius: 16,
    overflow: "hidden",
  };
  const cardHeadSt: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 22px",
    borderBottom: "1px solid var(--line)",
  };
  const cardBodySt: React.CSSProperties = {
    padding: "22px 22px 6px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  };
  const cardFootSt: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
    padding: "14px 22px 20px",
    background: "var(--paper)",
    borderTop: "1px solid var(--line)",
  };

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) =>
      setProfile({ ...profile, photo: ev.target?.result as string });
    rd.readAsDataURL(f);
  }

  async function saveDados() {
    setDadosErro("");
    const res = await saveAdminNome(nome);
    if (!res.ok) {
      setDadosErro(res.error);
      return;
    }
    setProfile({ ...profile, name: nome.trim() || profile.name });
    setSavedDados(true);
    setTimeout(() => setSavedDados(false), 2500);
  }

  async function saveSenha() {
    setSenhaErro("");
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setSenhaErro("Preencha todos os campos.");
      return;
    }
    if (novaSenha.length < 6) {
      setSenhaErro("A nova senha precisa de ao menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaErro("Nova senha e confirmação não coincidem.");
      return;
    }
    const supabase = createClient();
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password: senhaAtual,
    });
    if (signErr) {
      setSenhaErro("Senha atual incorreta.");
      return;
    }
    const { error: updErr } = await supabase.auth.updateUser({
      password: novaSenha,
    });
    if (updErr) {
      setSenhaErro("Não foi possível alterar a senha.");
      return;
    }
    setSavedSenha(true);
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarSenha("");
    setTimeout(() => setSavedSenha(false), 2500);
  }
  async function saveBonus() {
    setBonusErro("");
    const pct = parseFloat(bonusPct.replace(",", "."));
    if (isNaN(pct) || pct < 0 || pct > 100) {
      setBonusErro("Informe um percentual válido (0 a 100).");
      return;
    }
    setBonusSaving(true);
    const res = await saveSettings({ bonusPercent: pct / 100 });
    setBonusSaving(false);
    if (!res.ok) {
      setBonusErro(res.error);
      return;
    }
    setBonusSaved(true);
    setTimeout(() => setBonusSaved(false), 2500);
  }

  return (
    <div style={{ background: "var(--paper)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ padding: "24px 32px 18px" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: 6,
          }}
        >
          CONTA
        </div>
        <h1
          style={{
            fontFamily: "var(--font-jakarta)",
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "var(--ink)",
          }}
        >
          Configurações
        </h1>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          Gerencie seus dados de acesso ao painel.
        </p>
      </div>

      <div
        style={{
          padding: "6px 32px 40px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          maxWidth: 560,
        }}
      >
        {/* Perfil */}
        <div style={cardSt}>
          <div style={cardHeadSt}>
            <User size={15} strokeWidth={1.75} color="var(--ink-2)" />
            <span
              style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}
            >
              Perfil
            </span>
          </div>
          <div style={cardBodySt}>
            {/* Avatar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                paddingBottom: 6,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: profile.photo ? "transparent" : "var(--brand)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 26,
                  border: "2px solid var(--line)",
                }}
              >
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  initial
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  onClick={() => fileRef.current?.click()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    background: "var(--card)",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--ink)",
                    cursor: "pointer",
                  }}
                >
                  <ImagePlus size={13} />{" "}
                  {profile.photo ? "Trocar foto" : "Adicionar foto"}
                </button>
                {profile.photo && (
                  <button
                    onClick={() => setProfile({ ...profile, photo: null })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "7px 14px",
                      borderRadius: 10,
                      border: "none",
                      background: "transparent",
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "var(--muted)",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={13} /> Remover foto
                  </button>
                )}
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--muted)",
                    lineHeight: 1.5,
                  }}
                >
                  {profile.photo
                    ? "Aparece no menu lateral."
                    : "Opcional — sem foto, exibe a inicial do nome."}
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handlePhotoUpload}
              />
            </div>

            <div style={{ height: 1, background: "var(--line)" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelSt}>Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                style={inputSt}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelSt}>E-mail</label>
              <input
                type="email"
                value={email}
                readOnly
                disabled
                style={{
                  ...inputSt,
                  background: "var(--paper)",
                  color: "var(--muted)",
                  cursor: "not-allowed",
                }}
              />
            </div>
          </div>
          <div style={cardFootSt}>
            {dadosErro && (
              <span
                style={{
                  fontSize: 12.5,
                  color: "var(--brand)",
                  fontWeight: 600,
                }}
              >
                {dadosErro}
              </span>
            )}
            {savedDados && (
              <span
                style={{
                  fontSize: 12.5,
                  color: "var(--success)",
                  fontWeight: 600,
                }}
              >
                Salvo!
              </span>
            )}
            <button
              onClick={saveDados}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: "var(--brand)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>

        {/* Segurança */}
        <div style={cardSt}>
          <div style={cardHeadSt}>
            <Lock size={15} strokeWidth={1.75} color="var(--ink-2)" />
            <span
              style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}
            >
              Segurança
            </span>
          </div>
          <div style={cardBodySt}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelSt}>Senha atual</label>
              <PasswordInput
                value={senhaAtual}
                onChange={setSenhaAtual}
                show={showAtual}
                onToggle={() => setShowAtual((v) => !v)}
                inputSt={inputSt}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelSt}>Nova senha</label>
              <PasswordInput
                value={novaSenha}
                onChange={setNovaSenha}
                show={showNova}
                onToggle={() => setShowNova((v) => !v)}
                inputSt={inputSt}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelSt}>Confirmar nova senha</label>
              <PasswordInput
                value={confirmarSenha}
                onChange={setConfirmarSenha}
                show={showConfirmar}
                onToggle={() => setShowConfirmar((v) => !v)}
                inputSt={inputSt}
              />
            </div>
          </div>
          <div style={cardFootSt}>
            {senhaErro && (
              <span
                style={{
                  fontSize: 12.5,
                  color: "var(--brand)",
                  fontWeight: 600,
                }}
              >
                {senhaErro}
              </span>
            )}
            {savedSenha && (
              <span
                style={{
                  fontSize: 12.5,
                  color: "var(--success)",
                  fontWeight: 600,
                }}
              >
                Senha alterada!
              </span>
            )}
            <button
              onClick={saveSenha}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: "var(--ink)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Lock size={14} /> Alterar senha
            </button>
          </div>
        </div>

        {/* Bônus por orçamento */}
        <div style={cardSt}>
          <div style={cardHeadSt}>
            <Percent size={15} strokeWidth={1.75} color="var(--ink-2)" />
            <span
              style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}
            >
              Bônus por orçamento
            </span>
          </div>
          <div style={cardBodySt}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelSt}>
                Percentual sobre o valor bruto aprovado
              </label>
              <div style={{ position: "relative", maxWidth: 160 }}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={bonusPct}
                  onChange={(e) => {
                    setBonusPct(e.target.value);
                    setBonusErro("");
                  }}
                  style={{ ...inputSt, paddingRight: 28 }}
                />
                <span
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 11,
                    fontSize: 13,
                    color: "var(--muted)",
                  }}
                >
                  %
                </span>
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                Vale para orçamentos aprovados a partir de agora. O acordado é
                1%.
              </span>
            </div>
          </div>
          <div style={cardFootSt}>
            {bonusErro && (
              <span
                style={{
                  fontSize: 12.5,
                  color: "var(--brand)",
                  fontWeight: 600,
                }}
              >
                {bonusErro}
              </span>
            )}
            {bonusSaved && (
              <span
                style={{
                  fontSize: 12.5,
                  color: "var(--success)",
                  fontWeight: 600,
                }}
              >
                Bônus atualizado!
              </span>
            )}
            <button
              onClick={saveBonus}
              disabled={bonusSaving}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: "var(--ink)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Save size={14} /> {bonusSaving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
