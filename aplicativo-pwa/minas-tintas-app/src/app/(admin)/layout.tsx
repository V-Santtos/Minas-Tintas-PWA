import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminShell from "./AdminShell";
import RealtimeRefresh from "@/components/RealtimeRefresh";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("auth_user_id, nome, avatar_url")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!admin) redirect("/login");

  const { count: pendingOrders } = await supabase
    .from("pedidos_admin")
    .select("*", { count: "exact", head: true })
    .eq("status", "pendente");

  return (
    <>
      <RealtimeRefresh />
      <AdminShell
        adminName={admin.nome ?? "Admin"}
        adminAvatar={admin.avatar_url ?? null}
        pendingOrders={pendingOrders ?? 0}
      >
        {children}
      </AdminShell>
    </>
  );
}
