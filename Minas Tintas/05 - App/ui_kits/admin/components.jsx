// Minas Tintas — Admin desktop — atoms.
// Same Lucide-based icon helper, but more table-/sidebar-oriented components.

const { useState: useStateAdm, useEffect: useEffectAdm, useMemo: useMemoAdm, useRef: useRefAdm } = React;

function AdmIcon({ name, size = 18, color = 'currentColor', strokeWidth = 1.75, style = {} }) {
  const ref = useRefAdm(null);
  useEffectAdm(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = `<i data-lucide="${name}"></i>`;
    window.lucide.createIcons({
      attrs: { width: size, height: size, 'stroke-width': strokeWidth },
      nameAttr: 'data-lucide',
    });
  }, [name, size, strokeWidth]);
  return <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color, width: size, height: size, lineHeight: 0, ...style }} />;
}

// ---------- Sidebar ----------
function Sidebar({ active, onChange }) {
  const items = [
    { id: 'pedidos', label: 'Pedidos', icon: 'receipt' },
    { id: 'pintores', label: 'Pintores', icon: 'users' },
    { id: 'lojinha', label: 'Lojinha', icon: 'store' },
    { id: 'relatorios', label: 'Relatórios', icon: 'trending-up' },
    { id: 'config', label: 'Configurações', icon: 'settings' },
  ];
  return (
    <aside style={{
      width: 232,
      background: 'var(--paper-deep)',
      borderRight: '1px solid var(--line)',
      padding: '20px 14px',
      display: 'flex', flexDirection: 'column', gap: 18,
      flexShrink: 0,
    }}>
      <div style={{ padding: '4px 10px 8px' }}>
        <img src="../../assets/minas-tintas-logo.png" alt="Minas Tintas" style={{ height: 26, display: 'block' }}/>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 6 }}>
          ADMIN · CENTRO
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => {
          const isActive = active === it.id;
          return (
            <div key={it.id} onClick={() => onChange(it.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
              background: isActive ? 'var(--card)' : 'transparent',
              color: isActive ? 'var(--ink)' : 'var(--ink-2)',
              fontFamily: 'Inter', fontWeight: isActive ? 600 : 500, fontSize: 13.5,
              border: isActive ? '1px solid var(--line)' : '1px solid transparent',
              boxShadow: isActive ? '0 1px 2px rgba(28,26,23,0.04)' : 'none',
            }}>
              <AdmIcon name={it.icon} size={17} color={isActive ? 'var(--ink)' : 'var(--muted)'} />
              <span>{it.label}</span>
              {it.id === 'pedidos' && <span style={{ marginLeft: 'auto', background: 'var(--brand)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999 }}>4</span>}
            </div>
          );
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--ink)', color: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13 }}>R</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)' }}>Renato Aguiar</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>gerente · centro</div>
        </div>
      </div>
    </aside>
  );
}

// ---------- Page header ----------
function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      padding: '24px 32px 18px', borderBottom: '1px solid var(--line)',
      gap: 24,
    }}>
      <div style={{ minWidth: 0 }}>
        {eyebrow && <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>{eyebrow}</div>}
        <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: 32, letterSpacing: '-0.02em', lineHeight: 1.05, color: 'var(--ink)', margin: 0 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13.5, color: 'var(--ink-2)', marginTop: 6 }}>{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

// ---------- Stat tile ----------
function StatTile({ label, value, foot, accent }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--line)',
      borderRadius: 14, padding: '16px 18px',
      display: 'flex', flexDirection: 'column', gap: 6,
      boxShadow: '0 1px 2px rgba(28,26,23,0.04)',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</div>
      <div style={{
        fontFamily: 'Playfair Display, Georgia, serif',
        fontWeight: 700, fontSize: 30, color: accent ? 'var(--brand)' : 'var(--ink)',
        letterSpacing: '-0.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums',
        marginTop: 2,
      }}>{value}</div>
      {foot && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{foot}</div>}
    </div>
  );
}

// ---------- Status pill ----------
const ADM_STATUS = {
  rascunho: { bg: '#E5E8EE', fg: '#4A5A7A' },
  'aguardando pagamento': { bg: '#F6ECDB', fg: '#B5751F' },
  pago: { bg: '#E8EFE3', fg: '#4F7A4A' },
  'bônus liberado': { bg: '#FBE9E9', fg: '#CC0000' },
  estornado: { bg: 'var(--paper-deep)', fg: 'var(--ink-2)' },
};
function AdmPill({ status }) {
  const s = ADM_STATUS[status] || ADM_STATUS.rascunho;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 9px', borderRadius: 999,
      fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.fg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.fg }} />
      {status}
    </span>
  );
}

// ---------- Button ----------
function AdmButton({ kind = 'ghost', icon, children, onClick, style = {} }) {
  const base = {
    fontFamily: 'Inter', fontWeight: 600, fontSize: 13, lineHeight: 1,
    padding: '9px 14px', borderRadius: 10,
    border: '1px solid transparent', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 7,
  };
  const kinds = {
    primary: { background: 'var(--brand)', color: '#fff' },
    dark:    { background: 'var(--ink)',   color: 'var(--paper)' },
    ghost:   { background: 'var(--card)',  color: 'var(--ink)', borderColor: 'var(--line)' },
    quiet:   { background: 'transparent',  color: 'var(--ink-2)' },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...kinds[kind], ...style }}>
      {icon && <AdmIcon name={icon} size={14} color={kind === 'primary' || kind === 'dark' ? '#fff' : 'currentColor'} />}
      {children}
    </button>
  );
}

// ---------- Table ----------
function Table({ columns, rows, onRow }) {
  return (
    <div style={{
      background: 'var(--card)', border: '1px solid var(--line)',
      borderRadius: 14, overflow: 'hidden',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: columns.map(c => c.w || '1fr').join(' '),
        padding: '12px 18px', gap: 16,
        background: 'var(--paper-deep)', borderBottom: '1px solid var(--line)',
        fontSize: 10.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)',
      }}>
        {columns.map((c, i) => <div key={i} style={{ textAlign: c.align || 'left' }}>{c.label}</div>)}
      </div>
      {rows.map((r, ri) => (
        <div key={ri} onClick={() => onRow && onRow(r)} style={{
          display: 'grid', gridTemplateColumns: columns.map(c => c.w || '1fr').join(' '),
          padding: '14px 18px', gap: 16, alignItems: 'center',
          borderBottom: ri === rows.length - 1 ? 0 : '1px solid var(--line)',
          cursor: onRow ? 'pointer' : 'default',
          fontSize: 13, color: 'var(--ink-2)',
        }}>
          {columns.map((c, ci) => (
            <div key={ci} style={{ textAlign: c.align || 'left', fontVariantNumeric: c.num ? 'tabular-nums' : undefined }}>
              {c.render ? c.render(r) : r[c.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------- Inline search ----------
function AdmSearch({ placeholder = 'Buscar…' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'var(--card)', border: '1px solid var(--line)',
      borderRadius: 10, padding: '0 12px', height: 36,
      fontSize: 13, color: 'var(--muted)', width: 280,
    }}>
      <AdmIcon name="search" size={15} color="var(--muted)" />
      {placeholder}
    </div>
  );
}

Object.assign(window, {
  AdmIcon, Sidebar, PageHeader, StatTile, AdmPill, AdmButton, Table, AdmSearch,
});
