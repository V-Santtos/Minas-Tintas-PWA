"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, FilePlus2, Receipt, Store, User } from "lucide-react";

const ITEMS = [
  { href: "/home", label: "Início", icon: Home, match: ["/home", "/notificacoes"] },
  { href: "/orcamento", label: "Novo", icon: FilePlus2, match: ["/orcamento"] },
  { href: "/pedidos", label: "Pedidos", icon: Receipt, match: ["/pedidos"] },
  { href: "/loja", label: "Lojinha", icon: Store, match: ["/loja"] },
  { href: "/perfil", label: "Perfil", icon: User, match: ["/perfil"] },
];

// Stub: a bolinha na Lojinha sinaliza "brinde pendente que o pintor ainda não foi
// ver". O BrindeModal liga/desliga este flag; entrar na /loja "consome" o aviso.
// Quando as regras forem pro banco, troca-se a fonte por "tem resgate pendente".
const BADGE_KEY = "mt_brinde_loja_badge";
const BADGE_EVENT = "mt-brinde-badge";

export default function BottomNav() {
  const pathname = usePathname();
  const [lojaBadge, setLojaBadge] = useState(false);

  // Lê o flag e mantém em sincronia com o modal (evento) e outras abas (storage).
  useEffect(() => {
    const read = () => setLojaBadge(!!localStorage.getItem(BADGE_KEY));
    read();
    window.addEventListener(BADGE_EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(BADGE_EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  // Entrar na lojinha apaga o aviso.
  useEffect(() => {
    if (pathname.startsWith("/loja")) {
      localStorage.removeItem(BADGE_KEY);
      setLojaBadge(false);
    }
  }, [pathname]);

  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ href, label, icon: Icon, match }) => {
        const active = match.some((m) => pathname.startsWith(m));
        const showBadge =
          href === "/loja" && lojaBadge && !pathname.startsWith("/loja");
        return (
          <Link key={href} href={href} className={`nav-item${active ? " active" : ""}`}>
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
