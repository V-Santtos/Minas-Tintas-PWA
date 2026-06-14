import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { PintorProvider } from "@/lib/pintor-store";
import BottomNav from "@/components/BottomNav";
import MockStatusBar from "@/components/MockStatusBar"; // [MOCKUP DESKTOP] remover ao publicar

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: painter } = await supabase
    .from("painters")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!painter) redirect("/login");

  return (
    <PintorProvider>
      <div className="pintor-app">
        <MockStatusBar />
        {/* [MOCKUP DESKTOP] some no mobile via CSS */}
        <div className="pintor-scroll">{children}</div>
        <BottomNav />
      </div>
    </PintorProvider>
  );
}
