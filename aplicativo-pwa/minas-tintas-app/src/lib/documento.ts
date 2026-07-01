// Máscara (formatação) e validação (dígito verificador) de CPF/CNPJ.
// Duplicado de propósito no app Admin — mesmo padrão do rules.ts.

export function fmtCpf(raw: string): string {
  const v = raw.replace(/\D/g, "").slice(0, 11);
  if (v.length <= 3) return v;
  if (v.length <= 6) return v.slice(0, 3) + "." + v.slice(3);
  if (v.length <= 9)
    return v.slice(0, 3) + "." + v.slice(3, 6) + "." + v.slice(6);
  return (
    v.slice(0, 3) + "." + v.slice(3, 6) + "." + v.slice(6, 9) + "-" + v.slice(9)
  );
}

export function fmtCnpj(raw: string): string {
  const v = raw.replace(/\D/g, "").slice(0, 14);
  if (v.length <= 2) return v;
  if (v.length <= 5) return v.slice(0, 2) + "." + v.slice(2);
  if (v.length <= 8)
    return v.slice(0, 2) + "." + v.slice(2, 5) + "." + v.slice(5);
  if (v.length <= 12)
    return (
      v.slice(0, 2) +
      "." +
      v.slice(2, 5) +
      "." +
      v.slice(5, 8) +
      "/" +
      v.slice(8)
    );
  return (
    v.slice(0, 2) +
    "." +
    v.slice(2, 5) +
    "." +
    v.slice(5, 8) +
    "/" +
    v.slice(8, 12) +
    "-" +
    v.slice(12)
  );
}

// Dígito verificador mod 11 (comum a CPF e CNPJ): soma ponderada dos dígitos,
// resto da divisão por 11 vira o DV (0 se resto < 2, senão 11 - resto).
function dv(digits: number[], weights: number[]): number {
  const sum = digits.reduce((acc, d, i) => acc + d * weights[i], 0);
  const rest = sum % 11;
  return rest < 2 ? 0 : 11 - rest;
}

// 11 dígitos, não é sequência repetida (111.111.111-11 passa na conta mas não
// é documento real), e os 2 DVs batem.
export function isValidCpf(raw: string): boolean {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const n = d.split("").map(Number);
  const dv1 = dv(n.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const dv2 = dv(n.slice(0, 9).concat(dv1), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return dv1 === n[9] && dv2 === n[10];
}

// Mesmo princípio, 14 dígitos, pesos diferentes.
export function isValidCnpj(raw: string): boolean {
  const d = raw.replace(/\D/g, "");
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const n = d.split("").map(Number);
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const dv1 = dv(n.slice(0, 12), w1);
  const dv2 = dv(n.slice(0, 12).concat(dv1), w2);
  return dv1 === n[12] && dv2 === n[13];
}

// Valida pelo tipo do cliente (pessoa → CPF, empresa → CNPJ).
export function isValidDocumento(
  raw: string,
  type: "pessoa" | "empresa",
): boolean {
  return type === "empresa" ? isValidCnpj(raw) : isValidCpf(raw);
}
