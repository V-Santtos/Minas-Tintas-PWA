// Minas Tintas — Pintor (mobile PWA) — atoms & molecules.
// All components consume CSS variables from colors_and_type.css.

const { useState, useEffect, useMemo, useRef } = React;

// Tiny inline icon helper — wraps Lucide so we can size/color consistently.
function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.75, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current || !window.lucide) return;
    ref.current.innerHTML = `<i data-lucide="${name}"></i>`;
    window.lucide.createIcons({
      attrs: { width: size, height: size, 'stroke-width': strokeWidth },
      nameAttr: 'data-lucide',
    });
  }, [name, size, strokeWidth]);
  return <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color, width: size, height: size, lineHeight: 0, ...style }} />;
}

// ---------- Buttons ----------
function MTButton({ kind = 'primary', icon, children, onClick, full, style = {} }) {
  const base = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 600,
    fontSize: 15,
    lineHeight: 1,
    padding: '14px 18px',
    borderRadius: 12,
    border: '1px solid transparent',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: full ? '100%' : undefined,
    transition: 'background 140ms cubic-bezier(0.2,0.7,0.2,1)',
  };
  const kinds = {
    primary: { background: 'var(--brand)', color: '#fff' },
    ghost: { background: 'transparent', color: 'var(--ink)', borderColor: 'var(--line-strong)' },
    quiet: { background: 'transparent', color: 'var(--ink-2)' },
    dark: { background: 'var(--ink)', color: 'var(--paper)' },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...kinds[kind], ...style }}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
}

// ---------- Top bar (per-screen header) ----------
function TopBar({ title, back, right, eyebrow }) {
  return (
    <div style={{
      padding: '8px 20px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {back && (
          <button onClick={back} style={{
            background: 'transparent', border: 0, padding: 0, marginBottom: 6,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'Inter', fontSize: 13, color: 'var(--muted)', cursor: 'pointer',
          }}>
            <Icon name="chevron-left" size={16} /> Voltar
          </button>
        )}
        {eyebrow && <div style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4,
        }}>{eyebrow}</div>}
        <h1 style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontWeight: 700, fontSize: 26, lineHeight: 1.1,
          letterSpacing: '-0.02em', color: 'var(--ink)', margin: 0,
        }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

// ---------- Status pill ----------
const STATUS_STYLES = {
  rascunho:       { bg: '#E5E8EE', fg: '#4A5A7A' },
  aguardando:     { bg: '#F6ECDB', fg: '#B5751F' },
  'aguardando pagamento': { bg: '#F6ECDB', fg: '#B5751F' },
  pago:           { bg: '#E8EFE3', fg: '#4F7A4A' },
  'bônus liberado': { bg: '#FBE9E9', fg: '#CC0000' },
  cancelado:      { bg: 'var(--paper-deep)', fg: 'var(--ink-2)' },
  'em separação': { bg: '#F6ECDB', fg: '#B5751F' },
  'retirar na loja': { bg: '#E8EFE3', fg: '#4F7A4A' },
  retirado:       { bg: 'var(--paper-deep)', fg: 'var(--ink-2)' },
};
function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.rascunho;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.fg,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.fg }} />
      {status}
    </span>
  );
}

// ---------- Bottom nav ----------
function BottomNav({ active, onChange }) {
  const items = [
    { id: 'home', label: 'Início', icon: 'home' },
    { id: 'orc', label: 'Orçamento', icon: 'file-plus-2' },
    { id: 'ped', label: 'Pedidos', icon: 'receipt' },
    { id: 'loja', label: 'Lojinha', icon: 'store' },
    { id: 'perfil', label: 'Perfil', icon: 'user' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 12, right: 12, bottom: 12,
      background: 'rgba(250, 247, 242, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid var(--line)',
      borderRadius: 20,
      padding: '10px 6px 12px',
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 2,
      boxShadow: '0 8px 24px rgba(28,26,23,0.08)',
      zIndex: 30,
    }}>
      {items.map(it => {
        const isActive = active === it.id;
        return (
          <div key={it.id} onClick={() => onChange(it.id)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '4px 2px', borderRadius: 12, cursor: 'pointer',
            color: isActive ? 'var(--ink)' : 'var(--muted)',
            fontSize: 10.5, fontWeight: 500, fontFamily: 'Inter',
          }}>
            <Icon name={it.icon} size={22} />
            <span>{it.label}</span>
            <span style={{
              width: 4, height: 4, borderRadius: '50%',
              background: isActive ? 'var(--brand)' : 'transparent',
            }} />
          </div>
        );
      })}
    </div>
  );
}

// ---------- Hero balance card (Início) ----------
function BalanceHero({ pts, delta, toRelease }) {
  return (
    <div style={{
      margin: '0 16px 14px',
      background: 'var(--card)',
      border: '1px solid var(--line)',
      borderRadius: 24,
      padding: '20px 22px 18px',
      boxShadow: '0 2px 6px rgba(28,26,23,0.05)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          SALDO MINAS TINTAS
        </div>
        <Icon name="circle-dot" size={16} color="var(--brand)" />
      </div>
      <div style={{
        fontFamily: 'Playfair Display, Georgia, serif',
        fontWeight: 700, fontSize: 56, lineHeight: 0.95,
        letterSpacing: '-0.03em', color: 'var(--ink)',
        fontVariantNumeric: 'tabular-nums', marginTop: 6,
      }}>
        {pts.toLocaleString('pt-BR')}
        <small style={{
          fontFamily: 'Inter', fontWeight: 500, fontSize: 16,
          color: 'var(--muted)', marginLeft: 6, letterSpacing: 0,
        }}>pts</small>
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        marginTop: 8, fontSize: 13, fontWeight: 600, color: '#4F7A4A',
      }}>
        <Icon name="arrow-up-right" size={13} />
        +{delta} pts nas últimas 24 h
      </div>
      <div style={{
        marginTop: 14, paddingTop: 12,
        borderTop: '1px dashed var(--line-strong)',
        display: 'flex', justifyContent: 'space-between',
        fontSize: 12.5,
      }}>
        <span style={{ color: 'var(--muted)' }}>A liberar</span>
        <span style={{ color: 'var(--ink)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          R$ {toRelease.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

// ---------- Section heading ----------
function SectionHead({ title, action }) {
  return (
    <div style={{
      padding: '4px 20px 10px',
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
    }}>
      <h2 style={{
        fontFamily: 'Playfair Display, Georgia, serif',
        fontWeight: 700, fontSize: 18, color: 'var(--ink)',
        letterSpacing: '-0.02em', margin: 0,
      }}>{title}</h2>
      {action}
    </div>
  );
}

// ---------- Order list row ----------
function OrderRow({ order, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: '12px 16px',
      display: 'grid',
      gridTemplateColumns: '1fr auto auto',
      gap: 12,
      alignItems: 'center',
      borderBottom: '1px solid var(--line)',
      cursor: 'pointer',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {order.title}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
          <span>#{order.id}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--muted)' }} />
          <span>{order.date}</span>
          <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--muted)' }} />
          <StatusPill status={order.status} />
        </div>
      </div>
      <div style={{
        fontWeight: 700, fontSize: 14, color: 'var(--ink)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </div>
      <Icon name="chevron-right" size={16} color="var(--muted)" />
    </div>
  );
}

// ---------- Product / catalog row ----------
function ProductRow({ p, qty, onAdd, onRem }) {
  return (
    <div style={{
      padding: '12px 16px',
      display: 'grid',
      gridTemplateColumns: '56px 1fr auto',
      gap: 12,
      alignItems: 'center',
      borderBottom: '1px solid var(--line)',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 10,
        background: 'var(--paper-deep)', border: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--muted)',
      }}>
        <Icon name={p.icon || 'paint-roller'} size={22} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.2 }}>
          {p.name}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>
          {p.brand} · R$ {p.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
      {qty > 0 ? (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--paper-deep)', borderRadius: 10, padding: '4px 6px',
        }}>
          <button onClick={onRem} style={{ background: 'transparent', border: 0, padding: 4, cursor: 'pointer', color: 'var(--ink)' }}>
            <Icon name="minus" size={14} />
          </button>
          <span style={{ minWidth: 16, textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontWeight: 600, fontSize: 13 }}>{qty}</span>
          <button onClick={onAdd} style={{ background: 'transparent', border: 0, padding: 4, cursor: 'pointer', color: 'var(--ink)' }}>
            <Icon name="plus" size={14} />
          </button>
        </div>
      ) : (
        <button onClick={onAdd} style={{
          background: 'var(--ink)', color: 'var(--paper)',
          border: 0, borderRadius: 10, padding: '8px 12px',
          fontFamily: 'Inter', fontWeight: 600, fontSize: 12.5, cursor: 'pointer',
        }}>
          Adicionar
        </button>
      )}
    </div>
  );
}

// ---------- Reward card (Lojinha tile) ----------
function RewardCard({ r, onPick, affordable }) {
  return (
    <div onClick={onPick} style={{
      background: 'var(--card)', border: '1px solid var(--line)',
      borderRadius: 16, padding: 12, cursor: 'pointer',
      display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: '0 1px 2px rgba(28,26,23,0.04)',
      opacity: affordable ? 1 : 0.6,
    }}>
      <div style={{
        aspectRatio: '1 / 0.9', borderRadius: 10,
        background: 'var(--paper-deep)', border: '1px solid var(--line)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--muted)',
      }}>
        <Icon name={r.icon || 'gift'} size={36} strokeWidth={1.4} />
      </div>
      <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--ink)', lineHeight: 1.25, minHeight: 32 }}>
        {r.name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontWeight: 700, fontSize: 18, color: 'var(--ink)',
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
        }}>
          {r.points.toLocaleString('pt-BR')}
          <small style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 11, color: 'var(--muted)', marginLeft: 3 }}>pts</small>
        </div>
        {affordable
          ? <Icon name="circle-dot" size={14} color="var(--brand)" />
          : <Icon name="lock" size={12} color="var(--muted)" />}
      </div>
    </div>
  );
}

// ---------- FAB ----------
function FAB({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: 22, bottom: 102,
      background: 'var(--brand)', color: '#fff',
      border: 0, borderRadius: 999,
      padding: '14px 18px',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      fontFamily: 'Inter', fontWeight: 600, fontSize: 14,
      boxShadow: '0 8px 20px rgba(204,0,0,0.32), 0 2px 6px rgba(204,0,0,0.18)',
      cursor: 'pointer', zIndex: 25,
    }}>
      <Icon name={icon} size={18} color="#fff" />
      {label}
    </button>
  );
}

Object.assign(window, {
  Icon, MTButton, TopBar, StatusPill, BottomNav,
  BalanceHero, SectionHead, OrderRow, ProductRow, RewardCard, FAB,
});
