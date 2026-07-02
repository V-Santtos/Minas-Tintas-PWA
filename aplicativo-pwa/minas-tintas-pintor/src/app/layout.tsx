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
import ViewportDebug from "@/components/ViewportDebug"; // [DEBUG] liga com ?debug=1

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
    // Launch screen do iOS (mata a tela PRETA da abertura fria — sem imagem,
    // o black-translucent deixa o fundo do launch preto). Uma imagem por
    // resolução física, casada por media query; fundo #FAF7F2 = 1ª tela do
    // app, então a transição splash→app é invisível. iOS CACHEIA a splash na
    // instalação: pra ver mudança, apagar e reinstalar o PWA.
    startupImage: [
      { url: "/splash/splash-750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      { url: "/splash/splash-1242x2208.png", media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/splash-1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/splash-828x1792.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      { url: "/splash/splash-1242x2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/splash-1284x2778.png", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/splash-1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/splash-1206x2622.png", media: "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/splash/splash-1320x2868.png", media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
    ],
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
        {/* Versão síncrona do IosVh, ANTES do 1º paint: o useEffect só roda
            pós-hidratação e o frame inicial ficava no 100dvh defasado (nav
            793 + faixa creme) até o JS chegar — o "flick" do launch frio.
            O IosVh segue cuidando do orientationchange (idempotente). */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              // Além do --app-vh: no boot o env(safe-area-inset-top) chega 0
              // (viewport defasado ainda fora da status bar) e reconcilia pra
              // ~59 depois → o conteúdo pulava pra baixo. A diferença
              // screen.height − innerHeight NO BOOT é exatamente a status bar;
              // vira --safe-top-boot e o CSS usa max(env, var) — depois que o
              // env reconcilia, os dois empatam e nada se move.
              // Também captura o beforeinstallprompt (Android/Chrome) ANTES de
              // o React montar: o preventDefault segura a mini-infobar do
              // Chrome e o evento fica em window.__mtBip pro botão "Instalar
              // o aplicativo" do login disparar a folha nativa (InstalarPwa).
              '(function(){try{window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__mtBip=e;try{window.dispatchEvent(new Event("mt-bip"))}catch(_){}});if(navigator.standalone===true){var d=document.documentElement;d.classList.add("ios-standalone");var p=matchMedia("(orientation: portrait)").matches;var h=p?Math.max(screen.width,screen.height):Math.min(screen.width,screen.height);d.style.setProperty("--app-vh",h+"px");var g=h-window.innerHeight;if(g>0&&g<120){d.style.setProperty("--safe-top-boot",g+"px");}}}catch(e){}})();',
          }}
        />
        <IosVh />
        <ViewportDebug />
        {/* [DEBUG] painel ?debug=1 também no login/splash (fora do (app)) —
            inerte sem o param; remover junto com o do (app)/layout */}
        {children}
      </body>
    </html>
  );
}
