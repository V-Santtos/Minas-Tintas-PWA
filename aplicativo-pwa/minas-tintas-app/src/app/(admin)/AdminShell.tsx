"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Home,
  ShoppingBag,
  Users,
  Gift,
  BarChart2,
  LogOut,
  Settings,
} from "lucide-react";
import { AdminProvider, useAdmin } from "@/lib/admin-context";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

const NAV = [
  { href: "/dashboard", icon: Home, label: "Início" },
  { href: "/pintores", icon: Users, label: "Pintores" },
  { href: "/pedidos", icon: ShoppingBag, label: "Pedidos" },
  { href: "/lojinha", icon: Gift, label: "Lojinha" },
  { href: "/relatorios", icon: BarChart2, label: "Relatórios" },
];

export default function AdminShell({
  children,
  adminName,
  adminAvatar,
  pendingOrders,
}: {
  children: React.ReactNode;
  adminName: string;
  adminAvatar: string | null;
  pendingOrders: number;
}) {
  return (
    <AdminProvider initialName={adminName} initialPhoto={adminAvatar}>
      <AdminLayoutInner pendingOrders={pendingOrders}>
        {children}
      </AdminLayoutInner>
    </AdminProvider>
  );
}

function AdminLayoutInner({
  children,
  pendingOrders,
}: {
  children: React.ReactNode;
  pendingOrders: number;
}) {
  const pathname = usePathname();
  const { profile } = useAdmin();
  const [hovered, setHovered] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const isExpanded = hovered;
  const initial = profile.name.trim().charAt(0).toUpperCase() || "A";

  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--paper-deep)",
      }}
    >
      {/* Sidebar wrapper */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          flexShrink: 0,
          width: isExpanded ? 232 : 56,
          transition: "width .22s cubic-bezier(.4,0,.2,1)",
        }}
      >
        <aside
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: "100%",
            height: "100%",
            background: "var(--sidebar)",
            borderRight: "1px solid rgba(255,255,255,.08)",
            padding: isExpanded ? "20px 14px" : "20px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            transition: "padding .22s cubic-bezier(.4,0,.2,1)",
            overflow: "hidden",
          }}
        >
          {/* Brand */}
          <div
            style={{
              padding: isExpanded ? "2px 14px 16px" : "2px 0 16px",
              borderBottom: "1px solid rgba(255,255,255,.08)",
              minHeight: 52,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isExpanded ? (
              <Image
                src="/logo.png"
                alt="Minas Tintas"
                width={140}
                height={52}
                style={{ height: 52, width: "auto" }}
              />
            ) : (
              <Image
                src="/assets/logo-m.png"
                alt="M"
                width={509}
                height={251}
                style={{ height: 28, width: "auto", maxWidth: "100%" }}
              />
            )}
          </div>

          {/* Nav */}
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href;
              const badge = href === "/pedidos" ? pendingOrders : 0;
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: isExpanded ? 10 : 0,
                    padding: isExpanded ? "10px 12px" : "10px 0",
                    justifyContent: isExpanded ? "flex-start" : "center",
                    borderRadius: 10,
                    fontWeight: active ? 600 : 500,
                    fontSize: 13.5,
                    color: active ? "#fff" : "rgba(255,255,255,.5)",
                    background: active
                      ? "rgba(255,255,255,.14)"
                      : "transparent",
                    boxShadow: active ? "inset 3px 0 0 var(--brand)" : "none",
                    border: "1px solid transparent",
                    textDecoration: "none",
                    transition: "background .12s",
                    userSelect: "none",
                  }}
                  onMouseOver={(e) => {
                    if (!active)
                      e.currentTarget.style.background =
                        "rgba(255,255,255,.06)";
                  }}
                  onMouseOut={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.75}
                    style={{
                      flexShrink: 0,
                      color: active ? "#fff" : "rgba(255,255,255,.5)",
                    }}
                  />
                  {isExpanded && (
                    <span
                      style={{
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {label}
                    </span>
                  )}
                  {isExpanded && badge > 0 && (
                    <span
                      style={{
                        marginLeft: "auto",
                        background: "#fff",
                        color: "var(--brand)",
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "2px 7px",
                        borderRadius: 999,
                        lineHeight: 1.4,
                        flexShrink: 0,
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User */}
          <div
            onClick={() => setPopoverOpen((v) => !v)}
            style={{
              marginTop: "auto",
              padding: 10,
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderTop: "1px solid rgba(255,255,255,.08)",
              justifyContent: isExpanded ? "flex-start" : "center",
              cursor: "pointer",
              borderRadius: 10,
              transition: "background .12s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,.06)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {/* Avatar */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                flexShrink: 0,
                background: "rgba(255,255,255,.15)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                initial
              )}
            </div>
            {isExpanded && (
              <div
                style={{ overflow: "hidden", whiteSpace: "nowrap", flex: 1 }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>
                  {profile.name}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>
                  Administrador
                </div>
              </div>
            )}
          </div>

          {/* Popover */}
          {popoverOpen && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 99 }}
                onClick={() => setPopoverOpen(false)}
              />
              <div
                style={{
                  position: "fixed",
                  bottom: 68,
                  left: isExpanded ? 14 : 8,
                  zIndex: 100,
                  background: "var(--card)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  boxShadow: "0 8px 30px rgba(28,26,23,.18)",
                  minWidth: 190,
                  overflow: "hidden",
                }}
              >
                <Link
                  href="/configuracoes"
                  onClick={() => setPopoverOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 16px",
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "var(--ink)",
                    textDecoration: "none",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "var(--paper-deep)")
                  }
                  onMouseOut={(e) => (e.currentTarget.style.background = "")}
                >
                  <Settings size={15} strokeWidth={1.75} color="var(--ink-2)" />
                  Configurações
                </Link>
                <div style={{ height: 1, background: "var(--line)" }} />
                <button
                  onClick={handleLogout}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 16px",
                    fontSize: 13.5,
                    fontWeight: 500,
                    color: "var(--brand)",
                    textDecoration: "none",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "var(--paper-deep)")
                  }
                  onMouseOut={(e) => (e.currentTarget.style.background = "")}
                >
                  <LogOut size={15} strokeWidth={1.75} />
                  Sair
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Conteúdo */}
      <main style={{ flex: 1, overflowY: "auto", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
