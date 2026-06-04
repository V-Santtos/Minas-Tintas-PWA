// Minas Tintas — Pintor app screens.
// Each screen is a stateless content block; index.html owns navigation state.

const { useMemo: useMemoScr } = React;

// ============================================================
// HOME
// ============================================================
function ScreenHome({ data, go }) {
  return (
    <>
      <div style={{ paddingTop: 56 }}>
        <TopBar
          eyebrow={`OLÁ, ${data.painter.firstName.toUpperCase()}`}
          title="Bom trabalho hoje."
          right={
            <button style={{
              background: 'var(--card)', border: '1px solid var(--line)',
              borderRadius: 999, width: 40, height: 40, padding: 0, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name="bell" size={18} color="var(--ink)" />
            </button>
          }
        />
      </div>

      <BalanceHero pts={data.points} delta={184} toRelease={4200} />

      <div style={{ padding: '0 16px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={() => go('orc')} style={{
          background: 'var(--ink)', color: 'var(--paper)',
          border: 0, borderRadius: 14, padding: '14px 14px',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
          fontFamily: 'Inter', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
          textAlign: 'left',
        }}>
          <Icon name="file-plus-2" size={20} color="var(--paper)" />
          Criar orçamento
        </button>
        <button onClick={() => go('loja')} style={{
          background: 'var(--card)', color: 'var(--ink)',
          border: '1px solid var(--line)', borderRadius: 14, padding: '14px 14px',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
          fontFamily: 'Inter', fontWeight: 600, fontSize: 13.5, cursor: 'pointer',
          textAlign: 'left',
        }}>
          <Icon name="store" size={20} color="var(--ink)" />
          Ir à lojinha
        </button>
      </div>

      <SectionHead title="Pedidos recentes" action={
        <button onClick={() => go('ped')} style={{
          background: 'transparent', border: 0, padding: 0, cursor: 'pointer',
          fontFamily: 'Inter', fontSize: 12.5, color: 'var(--muted)',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>Ver todos <Icon name="chevron-right" size={12} /></button>
      } />
      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 16, margin: '0 16px 16px', overflow: 'hidden',
      }}>
        {data.orders.slice(0, 3).map((o, i, arr) => (
          <div key={o.id} style={{ borderBottom: i === arr.length - 1 ? 0 : undefined }}>
            <OrderRow order={o} onClick={() => go('ped', o.id)} />
          </div>
        ))}
      </div>

      <SectionHead title="Resgates próximos" />
      <div style={{ padding: '0 16px 120px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {data.rewards.slice(0, 2).map(r => (
          <RewardCard key={r.id} r={r} affordable={r.points <= data.points} onPick={() => go('loja', r.id)} />
        ))}
      </div>
    </>
  );
}

// ============================================================
// PEDIDOS (list)
// ============================================================
function ScreenPedidos({ data, go }) {
  return (
    <>
      <div style={{ paddingTop: 56 }}>
        <TopBar eyebrow={`${data.orders.length} PEDIDOS · MAR 2026`} title="Meus pedidos" />
      </div>
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {['Todos', 'Pago', 'Aguardando', 'Rascunho'].map((f, i) => (
          <span key={f} style={{
            padding: '6px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, fontFamily: 'Inter',
            background: i === 0 ? 'var(--ink)' : 'var(--card)',
            color: i === 0 ? 'var(--paper)' : 'var(--ink-2)',
            border: i === 0 ? '1px solid var(--ink)' : '1px solid var(--line)',
            whiteSpace: 'nowrap', cursor: 'pointer',
          }}>{f}</span>
        ))}
      </div>
      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 16, margin: '12px 16px 120px', overflow: 'hidden',
      }}>
        {data.orders.map((o, i, arr) => (
          <div key={o.id} style={i === arr.length - 1 ? { borderBottom: 0 } : undefined}>
            <OrderRow order={o} onClick={() => go('ped-detail', o.id)} />
          </div>
        ))}
      </div>
    </>
  );
}

// ============================================================
// PEDIDO DETAIL
// ============================================================
function ScreenPedidoDetail({ data, orderId, go }) {
  const order = data.orders.find(o => o.id === orderId) || data.orders[0];
  return (
    <>
      <div style={{ paddingTop: 56 }}>
        <TopBar
          back={() => go('ped')}
          eyebrow={`PEDIDO #${order.id}`}
          title={order.title}
        />
      </div>
      <div style={{ padding: '0 20px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <StatusPill status={order.status} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Criado em {order.date}</span>
      </div>

      {/* receipt */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 16, margin: '0 16px 14px', padding: '14px 16px',
      }}>
        {order.items.map((it, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '1fr auto', gap: 12,
            padding: '10px 0',
            borderBottom: i === order.items.length - 1 ? 0 : '1px dashed var(--line-strong)',
          }}>
            <div>
              <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500 }}>{it.name}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
                {it.qty} × R$ {it.unit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>
              R$ {(it.qty * it.unit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          paddingTop: 12, marginTop: 4, borderTop: '1px solid var(--line)',
        }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total</span>
          <span style={{ fontFamily: 'Playfair Display', fontWeight: 700, fontSize: 22, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
            R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* bonus card */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 16, margin: '0 16px 120px', padding: '14px 16px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          BÔNUS PREVISTO
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6 }}>
          <span style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontWeight: 700, fontSize: 32, color: 'var(--brand)',
            letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.round(order.total).toLocaleString('pt-BR')}
            <small style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 13, color: 'var(--muted)', marginLeft: 4 }}>pts</small>
          </span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>1% do orçamento</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.5 }}>
          Pontos creditados em até 24 h após a loja confirmar o pagamento.
        </div>
      </div>
    </>
  );
}

// ============================================================
// ORÇAMENTO (catalog + cart)
// ============================================================
function ScreenOrcamento({ data, cart, setCart, go }) {
  const total = useMemoScr(() => Object.entries(cart).reduce((s, [pid, q]) => {
    const p = data.catalog.find(x => x.id === pid);
    return p ? s + p.price * q : s;
  }, 0), [cart, data.catalog]);
  const itemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <>
      <div style={{ paddingTop: 56 }}>
        <TopBar
          back={() => go('home')}
          title="Novo orçamento"
          eyebrow="OBRA · VILA ESPERANÇA"
        />
      </div>
      <div style={{ padding: '0 16px 10px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--card)', border: '1px solid var(--line)',
          borderRadius: 12, padding: '0 14px', height: 44,
        }}>
          <Icon name="search" size={18} color="var(--muted)" />
          <span style={{ fontSize: 14, color: 'var(--muted)' }}>Buscar produto, marca, código…</span>
        </div>
      </div>

      <div style={{ padding: '4px 16px 10px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {['Tintas', 'Texturas', 'Massas', 'Ferramentas', 'Acessórios'].map((c, i) => (
          <span key={c} style={{
            padding: '6px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, fontFamily: 'Inter',
            background: i === 0 ? 'var(--ink)' : 'var(--card)',
            color: i === 0 ? 'var(--paper)' : 'var(--ink-2)',
            border: i === 0 ? '1px solid var(--ink)' : '1px solid var(--line)',
            whiteSpace: 'nowrap', cursor: 'pointer',
          }}>{c}</span>
        ))}
      </div>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 16, margin: '8px 16px 200px', overflow: 'hidden',
      }}>
        {data.catalog.map((p, i, arr) => (
          <div key={p.id} style={i === arr.length - 1 ? { borderBottom: 0 } : undefined}>
            <ProductRow
              p={p}
              qty={cart[p.id] || 0}
              onAdd={() => setCart({ ...cart, [p.id]: (cart[p.id] || 0) + 1 })}
              onRem={() => {
                const next = { ...cart };
                if (next[p.id] > 1) next[p.id]--; else delete next[p.id];
                setCart(next);
              }}
            />
          </div>
        ))}
      </div>

      {/* sticky cart summary */}
      {itemCount > 0 && (
        <div style={{
          position: 'absolute', left: 12, right: 12, bottom: 90,
          background: 'var(--ink)', color: 'var(--paper)',
          borderRadius: 16, padding: '12px 16px',
          display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'center',
          boxShadow: '0 12px 28px rgba(28,26,23,0.22)',
          zIndex: 25,
        }}>
          <div>
            <div style={{ fontSize: 11, color: '#8A817A', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {itemCount} {itemCount === 1 ? 'ITEM' : 'ITENS'} · BÔNUS {Math.round(total)} pts
            </div>
            <div style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums', marginTop: 2,
            }}>
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <button style={{
            background: 'var(--brand)', color: '#fff', border: 0,
            borderRadius: 12, padding: '12px 16px',
            fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            Enviar à loja <Icon name="arrow-right" size={16} color="#fff" />
          </button>
        </div>
      )}
    </>
  );
}

// ============================================================
// LOJINHA (rewards grid)
// ============================================================
function ScreenLojinha({ data, go }) {
  return (
    <>
      <div style={{ paddingTop: 56 }}>
        <TopBar
          eyebrow="LOJINHA · MARÇO"
          title="Resgate o que merece."
        />
      </div>
      <div style={{
        margin: '0 16px 14px',
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 14, padding: '12px 14px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            SALDO DISPONÍVEL
          </div>
          <div style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontWeight: 700, fontSize: 22, color: 'var(--ink)',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', marginTop: 2,
          }}>{data.points.toLocaleString('pt-BR')}<small style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: 'var(--muted)', marginLeft: 4 }}>pts</small></div>
        </div>
        <Icon name="circle-dot" size={20} color="var(--brand)" />
      </div>

      <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {['Tudo', 'Ferramentas', 'EPI', 'Brindes', 'Camisetas'].map((c, i) => (
          <span key={c} style={{
            padding: '6px 12px', borderRadius: 999,
            fontSize: 12, fontWeight: 600, fontFamily: 'Inter',
            background: i === 0 ? 'var(--ink)' : 'var(--card)',
            color: i === 0 ? 'var(--paper)' : 'var(--ink-2)',
            border: i === 0 ? '1px solid var(--ink)' : '1px solid var(--line)',
            whiteSpace: 'nowrap', cursor: 'pointer',
          }}>{c}</span>
        ))}
      </div>

      <div style={{ padding: '12px 16px 120px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {data.rewards.map(r => (
          <RewardCard key={r.id} r={r} affordable={r.points <= data.points} onPick={() => go('resgate', r.id)} />
        ))}
      </div>
    </>
  );
}

// ============================================================
// RESGATE detail / confirm
// ============================================================
function ScreenResgate({ data, rewardId, go }) {
  const r = data.rewards.find(x => x.id === rewardId) || data.rewards[0];
  const afford = r.points <= data.points;
  return (
    <>
      <div style={{ paddingTop: 56 }}>
        <TopBar back={() => go('loja')} eyebrow="RESGATE" title={r.name} />
      </div>
      <div style={{
        margin: '0 16px 14px', borderRadius: 20,
        background: 'var(--card)', border: '1px solid var(--line)',
        padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 160, height: 160, borderRadius: 16,
          background: 'var(--paper-deep)', border: '1px solid var(--line)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
        }}>
          <Icon name={r.icon || 'gift'} size={80} strokeWidth={1.1} />
        </div>
        <div style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontWeight: 700, fontSize: 48, color: 'var(--ink)',
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', lineHeight: 1,
        }}>
          {r.points.toLocaleString('pt-BR')}<small style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 16, color: 'var(--muted)', marginLeft: 6, letterSpacing: 0 }}>pts</small>
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', textAlign: 'center', maxWidth: 280 }}>
          Após o resgate, retire o item na loja de origem em até 7 dias.
        </div>
      </div>

      <div style={{ padding: '0 16px 120px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <MTButton kind="primary" full icon="check" onClick={() => go('loja')}>
          {afford ? `Resgatar por ${r.points.toLocaleString('pt-BR')} pts` : 'Pontos insuficientes'}
        </MTButton>
        <MTButton kind="ghost" full onClick={() => go('loja')}>Voltar à lojinha</MTButton>
      </div>
    </>
  );
}

// ============================================================
// PERFIL
// ============================================================
function ScreenPerfil({ data, go }) {
  const rows = [
    { icon: 'qr-code', label: 'Meu QR de pintor', sub: 'Mostre na loja para registrar pedidos' },
    { icon: 'banknote', label: 'Histórico de bônus', sub: 'R$ 1.248,00 este ano' },
    { icon: 'map-pin', label: 'Loja preferida', sub: 'Minas Tintas — Centro, São João del-Rei' },
    { icon: 'settings', label: 'Configurações', sub: 'Notificações e dados' },
    { icon: 'help-circle', label: 'Ajuda', sub: 'Fale com a loja' },
  ];
  return (
    <>
      <div style={{ paddingTop: 56 }}>
        <TopBar eyebrow="PINTOR PARCEIRO DESDE 2024" title={data.painter.name} />
      </div>
      <div style={{
        margin: '0 16px 14px',
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 16, padding: '16px 18px',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, textAlign: 'center',
      }}>
        {[
          { v: data.orders.length, l: 'pedidos' },
          { v: data.points.toLocaleString('pt-BR'), l: 'pontos' },
          { v: '4', l: 'resgates' },
        ].map(s => (
          <div key={s.l}>
            <div style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: 700, fontSize: 22, color: 'var(--ink)',
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em', lineHeight: 1,
            }}>{s.v}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginTop: 6, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--line)',
        borderRadius: 16, margin: '0 16px 120px', overflow: 'hidden',
      }}>
        {rows.map((r, i) => (
          <div key={r.label} style={{
            display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12,
            padding: '14px 16px', alignItems: 'center',
            borderBottom: i === rows.length - 1 ? 0 : '1px solid var(--line)',
            cursor: 'pointer',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'var(--paper-deep)', border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon name={r.icon} size={18} color="var(--ink)" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{r.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{r.sub}</div>
            </div>
            <Icon name="chevron-right" size={16} color="var(--muted)" />
          </div>
        ))}
      </div>
    </>
  );
}

Object.assign(window, {
  ScreenHome, ScreenPedidos, ScreenPedidoDetail,
  ScreenOrcamento, ScreenLojinha, ScreenResgate, ScreenPerfil,
});
