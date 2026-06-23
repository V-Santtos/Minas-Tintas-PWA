"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { usePintor } from "@/lib/pintor-store";

export default function MeusDadosPage() {
  const router = useRouter();
  const { data } = usePintor();
  const pf = data.profile;

  const cepFmt = pf.cep.replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2");
  const endereco =
    [
      [pf.rua, pf.numero].filter(Boolean).join(", "),
      pf.complemento,
      [pf.bairro, pf.cidade].filter(Boolean).join(" · "),
      pf.cep ? `CEP ${cepFmt}` : "",
    ]
      .filter(Boolean)
      .join(" · ") || "Não informado";

  const FIELDS = [
    { label: "NOME", value: pf.name },
    { label: "TELEFONE", value: pf.phone },
    { label: "CPF", value: pf.cpf },
    { label: "ENDEREÇO", value: endereco },
    { label: "PINTOR PARCEIRO DESDE", value: pf.parceiroDesde },
  ];
  return (
    <>
      <div
        className="topbar"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingBottom: 20,
        }}
      >
        <button
          className="icon-back-btn"
          onClick={() => router.push("/perfil")}
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <div className="page-title" style={{ fontSize: 18 }}>
          Meus dados
        </div>
      </div>

      <div
        className="card"
        style={{ margin: "0 16px 12px", overflow: "hidden" }}
      >
        {FIELDS.map((f, i) => (
          <div
            key={f.label}
            style={{
              padding: "14px 16px",
              borderBottom:
                i < FIELDS.length - 1 ? "1px solid var(--line)" : "none",
            }}
          >
            <div className="eyebrow-label" style={{ marginBottom: 4 }}>
              {f.label}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          margin: "0 16px",
          padding: "12px 14px",
          background: "var(--warning-tint)",
          borderRadius: 10,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <Info
          size={16}
          strokeWidth={2}
          color="var(--warning)"
          style={{ flexShrink: 0, marginTop: 1 }}
        />
        <span
          style={{
            fontSize: 12,
            color: "var(--warning)",
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          Para alterar seus dados, entre em contato com a loja Minas Tintas.
        </span>
      </div>
    </>
  );
}
