import type { Metadata, Viewport } from "next";
import {
  Inter,
  Plus_Jakarta_Sans,
  Playfair_Display,
  Bebas_Neue,
  Leckerli_One,
} from "next/font/google";
import "./globals.css";
import IosVh from "@/components/IosVh";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: ["400"],
  display: "swap",
});

const leckerli = Leckerli_One({
  subsets: ["latin"],
  variable: "--font-leckerli",
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Minas Tintas — Pintor",
  description: "Programa de benefícios para pintores",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  // iOS só honra o `black-translucent` quando a meta legada com prefixo `apple-`
  // está presente. Esta versão do Next só emite a nova `mobile-web-app-capable`
  // (basta pra instalar/standalone, mas NÃO ativa a status bar translúcida),
  // então adicionamos a legada manualmente. Sem ela, fica a faixa creme no topo.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FAF7F2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfair.variable} ${jakarta.variable} ${bebas.variable} ${leckerli.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <IosVh />
        {children}
      </body>
    </html>
  );
}
