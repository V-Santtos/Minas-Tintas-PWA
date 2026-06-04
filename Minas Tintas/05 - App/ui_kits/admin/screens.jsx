// Minas Tintas — Admin desktop screens.
// Stateless content blocks; index.html owns navigation state.

// ============================================================
// PEDIDOS (table)
// ============================================================
function AdmScreenPedidos({ data, go }) {
  const columns = [
    { label: '#', key: 'id', w: '80px' },
    { label: 'Pintor', render: r => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.painter}</div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{r.location}</div>
      </div>
    ) },
    { label: 'Obra', key: 'title' },
    { label: 'Data', key: 'date', w: '90px' },
    { label: 'Total', w: '120px', align: 'right', num: true, render: r => (
      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>R$ {r.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
    )},
    { label: 'Status', w: '170px', render: r => <AdmPill status={r.status} /> },
    { label: '', w: '110px', align: 'right', render: r => (
      <AdmButton kind="ghost" icon="chevron-right" style={{ padding: '7px 10px' }}>Abrir</AdmButton>
    )},
  ];
  return (
    <>
      <PageHeader
        eyebrow="LOJA · CENTRO · SÃO JOÃO DEL-REI"
        title="Pedidos para aprovação"
        subtitle="Confirme pagamentos e libere bônus. O pintor recebe 1% em pontos automaticamente."
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <AdmSearch placeholder="Buscar por pintor, obra ou número…" />
            <AdmButton kind="ghost" icon="filter">Filtros</AdmButton>
            <AdmButton kind="dark" icon="plus">Novo manual</AdmButton>
          </div>
        }
      />
      <div style={{ padding: '20px 32px 16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatTile label="PENDENTES" value="4" foot="aguardando pagamento" />
        <StatTile label="HOJE" value="R$ 6.482" foot="12 pedidos aprovados" />
        <StatTile label="BÔNUS LIBERADO · MARÇO" value="R$ 2.184" foot="≈ 218.400 pts" accent />
        <StatTile label="PASSIVO EM PONTOS" value="84.260" foot="liquidez a resgatar" />
      </div>
      <div style={{ padding: '0 32px 8px', display: 'flex', gap: 8 }}>
        {[{ l: 'Todos', n: 28, a: true }, { l: 'Aguardando', n: 4 }, { l: 'Pago', n: 18 }, { l: 'Bônus liberado', n: 6 }, { l: 'Estornado', n: 0 }].map(t => (
          <span key={t.l} style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600, fontFamily: 'Inter',
            background: t.a ? 'var(--ink)' : 'var(--card)',
            color: t.a ? 'var(--paper)' : 'var(--ink-2)',
            border: '1px solid ' + (t.a ? 'var(--ink)' : 'var(--line)'),
            cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>{t.l} <span style={{ opacity: 0.6, fontWeight: 500 }}>{t.n}</span></span>
        ))}
      </div>
      <div style={{ padding: '12px 32px 32px' }}>
        <Table columns={columns} rows={data.orders} onRow={r => go('pedido', r.id)} />
      </div>
    </>
  );
}

// ============================================================
// PEDIDO DETAIL
// ============================================================
function AdmScreenPedido({ data, orderId, go }) {
  const o = data.orders.find(x => x.id === orderId) || data.orders[0];
  const items = o.items || [
    { name: 'Tinta látex acrílica fosca 18L — Branco Neve · Suvinil', qty: 4, unit: 320.00 },
    { name: 'Massa corrida 25kg · Suvinil', qty: 3, unit: 84.90 },
    { name: 'Rolo de lã 23 cm anti-gota · Tigre', qty: 2, unit: 28.50 },
  ];
  return (
    <>
      <PageHeader
        eyebrow={`PEDIDO #${o.id} · ${o.date}`}
        title={o.title}
        subtitle={<span><b style={{ color: 'var(--ink)' }}>{o.painter}</b> · {o.location}</span>}
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <AdmButton kind="ghost" icon="printer">Imprimir</AdmButton>
            <AdmButton kind="ghost" icon="x">Estornar</AdmButton>
            <AdmButton kind="primary" icon="check">Confirmar pagamento</AdmButton>
          </div>
        }
      />
      <div style={{ padding: '20px 32px 16px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 18 }}>
        {/* left — receipt */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: 20, color: 'var(--ink)', margin: 0, letterSpacing: '-0.02em' }}>Itens do orçamento</h2>
            <AdmPill status={o.status} />
          </div>
          {items.map((it, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '1fr 80px 110px 120px', gap: 16, alignItems: 'center',
              padding: '12px 0',
              borderBottom: i === items.length - 1 ? 0 : '1px dashed var(--line-strong)',
              fontSize: 13.5, color: 'var(--ink-2)',
            }}>
              <div style={{ color: 'var(--ink)' }}>{it.name}</div>
              <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{it.qty} un.</div>
              <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>R$ {it.unit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
              <div style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--ink)' }}>R$ {(it.qty * it.unit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>TOTAL</span>
            <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: 36, color: 'var(--ink)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              R$ {o.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* right — bonus / actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '20px 22px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>BÔNUS A LIBERAR</div>
            <div style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontWeight: 700, fontSize: 44, color: 'var(--brand)',
              letterSpacing: '-0.03em', lineHeight: 1,
              fontVariantNumeric: 'tabular-nums', marginTop: 6,
            }}>{Math.round(o.total).toLocaleString('pt-BR')}<small style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 500, color: 'var(--muted)', marginLeft: 4, letterSpacing: 0 }}>pts</small></div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5, marginTop: 10 }}>
              1% do valor aprovado · creditado ao pintor automaticamente no momento da confirmação do pagamento.
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <AdmButton kind="dark" icon="banknote" style={{ flex: 1, justifyContent: 'center' }}>Liberar bônus</AdmButton>
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>LINHA DO TEMPO</div>
            {[
              { t: '12 mar · 14:32', l: 'Orçamento criado pelo pintor', d: true },
              { t: '12 mar · 16:08', l: 'Pintor enviou à loja', d: true },
              { t: '12 mar · 17:21', l: 'Pagamento em análise', d: true },
              { t: 'agora', l: 'Aguardando confirmação do gerente', d: false },
            ].map((s, i, arr) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '14px 1fr', gap: 12, paddingBottom: i === arr.length - 1 ? 0 : 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.d ? '#4F7A4A' : 'var(--brand)' }} />
                  {i !== arr.length - 1 && <span style={{ width: 1, flex: 1, background: 'var(--line-strong)', marginTop: 2 }} />}
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: s.d ? 500 : 600 }}>{s.l}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{s.t}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================
// PINTORES list
// ============================================================
function AdmScreenPintores({ data, go }) {
  const cols = [
    { label: 'Pintor', render: r => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 999, background: 'var(--paper-deep)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, border: '1px solid var(--line)' }}>
          {r.name.split(' ').map(s => s[0]).slice(0, 2).join('')}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{r.cpf}</div>
        </div>
      </div>
    )},
    { label: 'Cidade', key: 'city', w: '160px' },
    { label: 'Desde', key: 'since', w: '110px' },
    { label: 'Pedidos', w: '90px', align: 'right', num: true, render: r => <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{r.orders}</span> },
    { label: 'Saldo', w: '140px', align: 'right', num: true, render: r => <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{r.points.toLocaleString('pt-BR')} pts</span> },
    { label: 'Status', w: '120px', render: r => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: r.active ? '#E8EFE3' : 'var(--paper-deep)', color: r.active ? '#4F7A4A' : 'var(--muted)' }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: r.active ? '#4F7A4A' : 'var(--muted)' }} />
        {r.active ? 'ativo' : 'inativo'}
      </span>
    )},
  ];
  return (
    <>
      <PageHeader
        eyebrow="CADASTRO"
        title="Pintores parceiros"
        subtitle="124 pintores ativos · 18 cadastros no último mês."
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <AdmSearch placeholder="Buscar por nome, CPF, cidade…" />
            <AdmButton kind="ghost" icon="download">Exportar</AdmButton>
            <AdmButton kind="primary" icon="user-plus">Cadastrar pintor</AdmButton>
          </div>
        }
      />
      <div style={{ padding: '20px 32px 32px' }}>
        <Table columns={cols} rows={data.painters} onRow={() => {}} />
      </div>
    </>
  );
}

// ============================================================
// LOJINHA (admin grid)
// ============================================================
function AdmScreenLojinha({ data, go }) {
  return (
    <>
      <PageHeader
        eyebrow="CATÁLOGO DE RESGATES"
        title="Lojinha"
        subtitle="Itens disponíveis para os pintores trocarem por pontos. Multiplicador padrão 1× sobre o preço."
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <AdmButton kind="ghost" icon="sliders-horizontal">Multiplicadores</AdmButton>
            <AdmButton kind="primary" icon="plus">Adicionar item</AdmButton>
          </div>
        }
      />
      <div style={{ padding: '20px 32px 32px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {data.rewards.map(r => (
          <div key={r.id} style={{
            background: 'var(--card)', border: '1px solid var(--line)',
            borderRadius: 14, padding: 14,
            display: 'flex', flexDirection: 'column', gap: 8,
            boxShadow: '0 1px 2px rgba(28,26,23,0.04)',
          }}>
            <div style={{
              aspectRatio: '1.2', borderRadius: 10,
              background: 'var(--paper-deep)', border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)',
            }}>
              <AdmIcon name={r.icon || 'gift'} size={40} strokeWidth={1.3} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.25 }}>{r.name}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontWeight: 700, fontSize: 18, color: 'var(--ink)',
                letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums',
              }}>
                {r.points.toLocaleString('pt-BR')}<small style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 500, color: 'var(--muted)', marginLeft: 3 }}>pts</small>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>estoque {r.stock}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
              <AdmButton kind="ghost" icon="pencil" style={{ flex: 1, justifyContent: 'center', padding: '7px 8px', fontSize: 12 }}>Editar</AdmButton>
              <AdmButton kind="quiet" icon="eye-off" style={{ padding: '7px 8px', fontSize: 12 }}>Ocultar</AdmButton>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

Object.assign(window, {
  AdmScreenPedidos, AdmScreenPedido, AdmScreenPintores, AdmScreenLojinha,
});
