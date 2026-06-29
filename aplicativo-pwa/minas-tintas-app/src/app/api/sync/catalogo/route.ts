import { NextResponse } from "next/server";
import { sincronizarCatalogo } from "@/lib/hiper/sync";

// 1a carga (1658 produtos) pode ser longa; o cursor persiste por pagina, entao
// um timeout no meio retoma. maxDuration 60 = teto do Hobby (Pro vai a 300).
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // A Vercel Cron envia Authorization: Bearer ${CRON_SECRET}.
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  try {
    const result = await sincronizarCatalogo();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro desconhecido";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
