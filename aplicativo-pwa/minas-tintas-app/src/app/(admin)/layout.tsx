import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import AdminShell from "./AdminShell";

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
    .select("auth_user_id, nome")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!admin) redirect("/login");

  const { count: pendingOrders } = await supabase
    .from("pedidos_admin")
    .select("*", { count: "exact", head: true })
    .eq("status", "pendente");

  return (
    <AdminShell
      adminName={admin.nome ?? "Admin"}
      pendingOrders={pendingOrders ?? 0}
    >
      {children}
    </AdminShell>
  );
}
