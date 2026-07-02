import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Minas Tintas — Pintor",
    short_name: "Minas Pintor",
    description:
      "Monte orçamentos no campo e acompanhe seus pontos de bônus como pintor parceiro da Minas Tintas.",
    // Direto no /home: a raiz "/" só respondia 307 → /home|/login (uma ida ao
    // servidor jogada fora em todo launch). Não-logado segue caindo no /login
    // pelo guard. start_url é gravado na INSTALAÇÃO — instalações antigas só
    // pegam reinstalando (inócuo; apenas não ganham o atalho).
    start_url: "/home",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FAF7F2",
    theme_color: "#FAF7F2",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
