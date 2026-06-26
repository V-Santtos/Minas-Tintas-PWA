import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auto-encaminha só quando há sessão válida de pintor E o "Lembrar-me" estava
  // marcado (cookie). Sem isso, /login sempre mostrava o formulário — por isso a
  // flag antiga nunca surtia efeito.
  if (user) {
    const remember = (await cookies()).get("mt_remember")?.value;
    if (remember === "true") {
      const { data: painter } = await supabase
        .from("painters")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();
      if (painter) redirect("/home");
    }
  }

  // user existe mas não foi "lembrado" (ou não é pintor) → o form encerra a
  // sessão pendente no cliente (staleSession) e pede login.
  return <LoginForm staleSession={!!user} />;
}
