"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FilePlus2, Receipt, Store, User } from "lucide-react";
import { usePintor } from "@/lib/pintor-store";

const ITEMS = [
  {
    href: "/home",
    label: "Início",
    icon: Home,
    match: ["/home", "/notificacoes"],
  },
  { href: "/orcamento", label: "Novo", icon: FilePlus2, match: ["/orcamento"] },
  { href: "/pedidos", label: "Pedidos", icon: Receipt, match: ["/pedidos"] },
  { href: "/loja", label: "Lojinha", icon: Store, match: ["/loja"] },
  { href: "/perfil", label: "Perfil", icon: User, match: ["/perfil"] },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { brinde } = usePintor();

  // Bolinha na Lojinha: brinde pendente que o pintor ainda não anunciou (viu).
  // Some quando ele vê o modal (marcar_brinde_visto) e o payload atualiza — o
  // brinde continua pendente de retirada, mas o aviso já cumpriu o papel.
  const lojaBadge = !!brinde?.pendente && !brinde.visto;

  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ href, label, icon: Icon, match }) => {
        const active = match.some((m) => pathname.startsWith(m));
        const showBadge =
          href === "/loja" && lojaBadge && !pathname.startsWith("/loja");
        return (
          <Link
            key={href}
            href={href}
            className={`nav-item${active ? " active" : ""}`}
          >
            <span style={{ position: "relative", display: "inline-flex" }}>
              <Icon size={22} strokeWidth={1.75} />
              {showBadge && (
                <span
                  style={{
                    position: "absolute",
                    top: -2,
                    right: -4,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--brand)",
                    boxShadow: "0 0 0 2px var(--paper)",
                  }}
                />
              )}
            </span>
            <span>{label}</span>
            <span className="nav-dot" />
          </Link>
        );
      })}
    </nav>
  );
}
