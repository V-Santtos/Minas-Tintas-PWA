// ============================================================
// [MOCKUP DE VALIDAÇÃO — SOMENTE DESKTOP]
// Barra de status falsa do iPhone (hora · Dynamic Island · ícones).
// No mobile real fica escondida via CSS (.mock-statusbar { display:none }),
// porque quem desenha a status bar de verdade é o próprio iOS.
//
// Use `overlay` nas telas de fundo escuro (splash/login): a barra fica
// sobreposta ao hero, transparente e com ícones brancos.
//
// >>> PARA PUBLICAR O PWA: apague este arquivo, remova os imports/usos
//     em (app)/layout.tsx, page.tsx (splash) e login/page.tsx, e o
//     bloco CSS correspondente em globals.css. <<<
// ============================================================
export default function MockStatusBar({ overlay = false }: { overlay?: boolean }) {
  return (
    <div className={`mock-statusbar${overlay ? " is-overlay" : ""}`} aria-hidden="true">
      <span className="mock-time">9:41</span>

      {/* Dynamic Island */}
      <span className="mock-island" />

      <span className="mock-status-icons">
        {/* Sinal de celular — 4 barras crescentes */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>

        {/* Wi-Fi — dois arcos + ponto */}
        <svg
          width="18"
          height="13"
          viewBox="0 0 18 13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M2 5.2C4 3.5 6.4 2.5 9 2.5s5 1 7 2.7" />
          <path d="M4.4 7.9C5.7 6.8 7.3 6.2 9 6.2s3.3.6 4.6 1.7" />
          <circle cx="9" cy="10.5" r="1.05" fill="currentColor" stroke="none" />
        </svg>

        {/* Bateria — contorno + nível + ponta */}
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity="0.4" strokeWidth="1" />
          <rect x="2.5" y="2.5" width="18" height="8" rx="1.8" fill="currentColor" />
          <rect x="23.6" y="4.6" width="1.6" height="3.8" rx="0.8" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </span>
    </div>
  );
}


