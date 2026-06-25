"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FilePlus2, Receipt, Store, User } from "lucide-react";

const ITEMS = [
  { href: "/home", label: "Início", icon: Home, match: ["/home", "/notificacoes"] },
  { href: "/orcamento", label: "Novo", icon: FilePlus2, match: ["/orcamento"] },
  { href: "/pedidos", label: "Pedidos", icon: Receipt, match: ["/pedidos"] },
  { href: "/loja", label: "Lojinha", icon: Store, match: ["/loja"] },
  { href: "/perfil", label: "Perfil", icon: User, match: ["/perfil"] },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ href, label, icon: Icon, match }) => {
        const active = match.some((m) => pathname.startsWith(m));
        return (
          <Link key={href} href={href} className={`nav-item${active ? " active" : ""}`}>
            <Icon size={22} strokeWidth={1.75} />
            <span>{label}</span>
            <span className="nav-dot" />
          </Link>
        );
      })}
    </nav>
  );
}

