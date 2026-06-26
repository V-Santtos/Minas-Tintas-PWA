import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SplashWelcome from "./SplashWelcome";

export default async function SplashPage() {
  // Se a splash já foi vista (cookie), redireciona no servidor ANTES de enviar
  // qualquer HTML da splash → /login aparece direto, sem o flash de ~1s.
  const seen = (await cookies()).get("mt_splash_seen")?.value;
  if (seen) redirect("/login");

  // Primeira vez: renderiza a boas-vindas (que grava o cookie ao montar).
  return <SplashWelcome />;
}
