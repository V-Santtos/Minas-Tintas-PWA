'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { ChevronLeft, ChevronRight, Printer, Trophy, Award, Star, ClipboardList, TrendingUp, Gift, BarChart2 } from 'lucide-react'
import { ORDERS, PAINTERS } from '@/lib/mock'

/* ── constants ── */
const MONTH_SHORT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const MONTH_FULL  = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const BAR_COLORS  = ['#4F7A4A','#6B46C1','#B5751F','#8A817A','#8A817A','#8A817A']

type DonutEntry = { name: string; value: number; color: string }
type ChartPoint = { idx: number; value: number }

/* ── helpers ── */
function parseDate(dateStr: string) {
  const [dayStr, mStr] = dateStr.split(' ')
  return { day: parseInt(dayStr), monthIdx: MONTH_SHORT.indexOf(mStr) }
}

function fmtVol(v: number) {
  return v >= 10000 ? `R$ ${(v / 1000).toFixed(0)}k` : `R$ ${(v / 1000).toFixed(1)}k`
}
function fmtBonus(v: number) {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}k pts` : `${v} pts`
}
function initials(name: string) {
  const parts = name.split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase()
}

// Distribui um total em n buckets com variação determinística (sem Math.random)
function distributeAcrossN(total: number, n: number, seed: number): number[] {
  if (total === 0) return Array(n).fill(0)
  const raws = Array.from({ length: n }, (_, i) => {
    const x = Math.sin((seed + i + 1) * 127.1) * 43758.5453
    return Math.abs(x - Math.floor(x)) + 0.15
  })
  const rawSum = raws.reduce((a, b) => a + b, 0)
  const vals = raws.map(r => Math.round(total * r / rawSum))
  const diff = total - vals.reduce((a, b) => a + b, 0)
  vals[vals.length - 1] = Math.max(0, (vals[vals.length - 1] ?? 0) + diff)
  return vals
}

/* ── defaults ── */
const ALL_MONTH_IDXS = [...new Set(ORDERS.map(o => parseDate(o.date).monthIdx))]
  .filter(m => m >= 0).sort((a, b) => a - b)
const defaultMonth = ALL_MONTH_IDXS[ALL_MONTH_IDXS.length - 1] ?? 4

/* ── shared styles ── */
const card: React.CSSProperties = {
  background: 'var(--card)',
  borderRadius: 14,
  boxShadow: '0 2px 6px rgba(28,26,23,.06)',
  border: '1px solid var(--line)',
  padding: '18px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}
const lbl: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '.1em',
  textTransform: 'uppercase', color: 'var(--muted)',
}
const ctrlBtn: React.CSSProperties = {
  height: '100%', padding: 0, border: 'none',
  background: 'none', cursor: 'pointer', color: 'var(--muted)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
}

function ChartEmpty() {
  return (
    <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 12 }}>
      Sem dados no período
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════ */
export default function RelatoriosPage() {
  const [view,  setView]  = useState<'mes' | 'ano'>('mes')
  const [month, setMonth] = useState(defaultMonth)
  const [year,  setYear]  = useState(2026)

  function prev() {
    if (view === 'mes') {
      if (month === 0) { setYear(y => y - 1); setMonth(11) }
      else setMonth(m => m - 1)
    } else setYear(y => y - 1)
  }
  function next() {
    if (view === 'mes') {
      if (month === 11) { setYear(y => y + 1); setMonth(0) }
      else setMonth(m => m + 1)
    } else setYear(y => y + 1)
  }

  /* ── filter orders by period ── */
  const periodOrders = view === 'mes'
    ? ORDERS.filter(o => parseDate(o.date).monthIdx === month)
    : ORDERS

  const approved = periodOrders.filter(o => o.status === 'aprovado')
  const totalVol = approved.reduce((s, o) => s + o.total, 0)
  const totBonus = approved.reduce((s, o) => s + Math.round(o.total * 0.10), 0)
  const ticket   = approved.length > 0 ? totalVol / approved.length : 0

  const sc = {
    aprovado:  periodOrders.filter(o => o.status === 'aprovado').length,
    pendente:  periodOrders.filter(o => o.status === 'pendente').length,
    recusado:  periodOrders.filter(o => o.status === 'recusado').length,
    estornado: periodOrders.filter(o => o.status === 'estornado').length,
  }

  /* ── chart data ── */
  let volData:   ChartPoint[]
  let bonusData: ChartPoint[]
  let xTicks:    number[]
  let xFmt:      (v: number) => string
  let xDomain:   [number, number]
  let xLabelFmt: (v: number) => string

  if (view === 'mes') {
    // Agregação semanal → 7 pontos diários por semana = 28 pontos totais
    const wv = [0, 0, 0, 0]
    const wb = [0, 0, 0, 0]
    approved.forEach(o => {
      const { day } = parseDate(o.date)
      const wi = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3
      wv[wi] += o.total
      wb[wi] += Math.round(o.total * 0.10)
    })
    const vp: ChartPoint[] = []
    const bp: ChartPoint[] = []
    for (let w = 0; w < 4; w++) {
      distributeAcrossN(wv[w], 7, month * 1000 + w * 10).forEach((v, d) =>
        vp.push({ idx: w * 7 + d, value: v }))
      distributeAcrossN(wb[w], 7, month * 1000 + w * 10 + 500).forEach((v, d) =>
        bp.push({ idx: w * 7 + d, value: v }))
    }
    volData   = vp
    bonusData = bp
    xDomain   = [0, 27]
    xTicks    = [6, 13, 20, 27]
    xFmt      = (v) => `Sem ${Math.floor(v / 7) + 1}`
    xLabelFmt = (v) => `Sem ${Math.floor(v / 7) + 1}`
  } else {
    // Agregação mensal → 4 pontos semanais por mês = ~20 pontos totais
    const vp: ChartPoint[] = []
    const bp: ChartPoint[] = []
    ALL_MONTH_IDXS.forEach((m, mi) => {
      const mApproved = approved.filter(o => parseDate(o.date).monthIdx === m)
      const mVol   = mApproved.reduce((s, o) => s + o.total, 0)
      const mBonus = mApproved.reduce((s, o) => s + Math.round(o.total * 0.10), 0)
      distributeAcrossN(mVol,   4, m * 100).forEach((v, w) =>
        vp.push({ idx: mi * 4 + w, value: v }))
      distributeAcrossN(mBonus, 4, m * 100 + 500).forEach((v, w) =>
        bp.push({ idx: mi * 4 + w, value: v }))
    })
    volData   = vp
    bonusData = bp
    xDomain   = [0, Math.max(3, ALL_MONTH_IDXS.length * 4 - 1)]
    xTicks    = ALL_MONTH_IDXS.map((_, i) => i * 4)
    xFmt      = (v) => MONTH_FULL[ALL_MONTH_IDXS[Math.floor(v / 4)]]?.slice(0, 3) ?? ''
    xLabelFmt = (v) => MONTH_FULL[ALL_MONTH_IDXS[Math.floor(v / 4)]] ?? ''
  }

  /* ── ranking ── */
  const ranking = PAINTERS.map(p => {
    const pOrds = approved.filter(o => o.painter === p.name)
    return {
      name: p.name, city: p.city,
      volume: pOrds.reduce((s, o) => s + o.total, 0),
      bonus:  pOrds.reduce((s, o) => s + Math.round(o.total * 0.10), 0),
    }
  }).sort((a, b) => b.volume - a.volume)

  const maxVol = ranking[0]?.volume || 1
  const top    = ranking[0]

  /* ── donut ── */
  const donutData: DonutEntry[] = [
    { name: 'Aprovado',  value: sc.aprovado,  color: '#4F7A4A' },
    { name: 'Pendente',  value: sc.pendente,  color: '#B5751F' },
    { name: 'Recusado',  value: sc.recusado,  color: '#CC0000' },
    { name: 'Estornado', value: sc.estornado, color: '#8A817A' },
  ]
  const hasDonut = donutData.some(d => d.value > 0)
  const displayDonut: DonutEntry[] = hasDonut
    ? donutData
    : [{ name: 'vazio', value: 1, color: '#E8E4DF' }]

  /* ── labels ── */
  const periodLabel    = view === 'mes' ? `${MONTH_FULL[month]} ${year}` : String(year)
  const chartGranLabel = view === 'mes' ? 'por semana' : 'por mês'
  const topLabel       = view === 'mes' ? 'Pintor do Mês' : 'Pintor do Ano'

  const tooltipStyle = {
    fontSize: 12, border: '1px solid var(--line)',
    borderRadius: 8, background: 'var(--card)', color: 'var(--ink)',
    boxShadow: '0 4px 16px rgba(28,26,23,.10)',
  }

  return (
    <div style={{ padding: '32px 32px 40px' }}>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
            LOJA · CENTRO · SIMONÉSIA
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0 }}>
            Relatórios
          </h1>
        </div>
        {/* ── Unified control bar ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          height: 36, border: '1px solid var(--line)', borderRadius: 10,
          background: 'var(--card)', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(28,26,23,.06)',
        }}>
          {/* Toggle Mês / Ano */}
          {(['mes', 'ano'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              height: '100%', padding: '0 16px', border: 'none',
              borderRight: v === 'ano' ? '1px solid var(--line)' : 'none',
              fontFamily: 'var(--font-body)', fontSize: 12.5, fontWeight: 600,
              cursor: 'pointer', transition: 'background .15s, color .15s',
              background: view === v ? 'var(--paper-deep)' : 'transparent',
              color: view === v ? 'var(--ink)' : 'var(--muted)',
            }}>
              {v === 'mes' ? 'Mês' : 'Ano'}
            </button>
          ))}

          {/* Chevron prev */}
          <button onClick={prev} style={{ ...ctrlBtn, width: 32 }}>
            <ChevronLeft size={13} strokeWidth={2} />
          </button>

          {/* Period label */}
          <span style={{
            fontSize: 13, fontWeight: 700, color: 'var(--ink)',
            minWidth: 110, textAlign: 'center', letterSpacing: '-0.02em',
            userSelect: 'none',
          }}>
            {periodLabel}
          </span>

          {/* Chevron next */}
          <button onClick={next} style={{ ...ctrlBtn, width: 32, borderRight: '1px solid var(--line)' }}>
            <ChevronRight size={13} strokeWidth={2} />
          </button>

          {/* Print */}
          <button onClick={() => window.print()} style={{
            ...ctrlBtn, color: 'var(--ink)',
            gap: 6, padding: '0 14px',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center',
          }}>
            <Printer size={13} strokeWidth={1.75} />
            Imprimir
          </button>
        </div>
      </div>

      {/* ── Stat tiles ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>

        {/* Pedidos gerados */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, display: 'flex', overflow: 'hidden', boxShadow: '0 2px 6px rgba(28,26,23,.06), 0 1px 2px rgba(28,26,23,.04)' }}>
          <div style={{ width: 52, flexShrink: 0, background: 'rgba(28,26,23,.72)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={22} strokeWidth={1.75} style={{ color: '#fff' }} />
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>PEDIDOS GERADOS</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              {periodOrders.length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{sc.aprovado} aprovados · {sc.pendente} pendentes</div>
          </div>
        </div>

        {/* Volume aprovado */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, display: 'flex', overflow: 'hidden', boxShadow: '0 2px 6px rgba(28,26,23,.06), 0 1px 2px rgba(28,26,23,.04)' }}>
          <div style={{ width: 52, flexShrink: 0, background: '#4F7A4A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={22} strokeWidth={1.75} style={{ color: '#fff' }} />
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>VOLUME APROVADO</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: '#4F7A4A', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {totalVol > 0 ? `R$ ${(totalVol / 1000).toFixed(1)}k` : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>em {approved.length} pedidos</div>
          </div>
        </div>

        {/* Bônus distribuídos */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, display: 'flex', overflow: 'hidden', boxShadow: '0 2px 6px rgba(28,26,23,.06), 0 1px 2px rgba(28,26,23,.04)' }}>
          <div style={{ width: 52, flexShrink: 0, background: '#6B46C1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Gift size={22} strokeWidth={1.75} style={{ color: '#fff' }} />
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>BÔNUS DISTRIBUÍDOS</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: '#6B46C1', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {totBonus > 0 ? totBonus.toLocaleString('pt-BR') + ' pts' : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>via programa de fidelidade</div>
          </div>
        </div>

        {/* Ticket médio */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, display: 'flex', overflow: 'hidden', boxShadow: '0 2px 6px rgba(28,26,23,.06), 0 1px 2px rgba(28,26,23,.04)' }}>
          <div style={{ width: 52, flexShrink: 0, background: '#B5751F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart2 size={22} strokeWidth={1.75} style={{ color: '#fff' }} />
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>TICKET MÉDIO</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {ticket > 0 ? `R$ ${(ticket / 1000).toFixed(1)}k` : '—'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              {approved.length > 0 ? 'por pedido aprovado' : 'sem pedidos aprovados'}
            </div>
          </div>
        </div>

      </div>

      {/* ── Row 1: Volume chart | Donut + Pintor ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Volume area chart */}
        <div style={{ ...card, gap: 0, padding: '20px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={lbl}>Volume aprovado {chartGranLabel}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{periodLabel}</span>
          </div>
          {volData.every(d => d.value === 0) ? <ChartEmpty /> : (
            <ResponsiveContainer width="100%" height={175}>
              <AreaChart data={volData} margin={{ top: 16, right: 20, left: 20, bottom: 0 }} tabIndex={-1}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#4F7A4A" stopOpacity={0.32} />
                    <stop offset="55%"  stopColor="#4F7A4A" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#4F7A4A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--line)" strokeOpacity={0.5} strokeDasharray="0" />
                <XAxis
                  type="number" dataKey="idx" domain={xDomain} ticks={xTicks}
                  tickFormatter={xFmt}
                  tick={{ fontSize: 10.5, fill: 'var(--muted)', fontFamily: 'Inter' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [fmtVol(v as number), 'Volume']}
                  labelFormatter={(v) => xLabelFmt(v as number)}
                  contentStyle={tooltipStyle}
                  cursor={{ stroke: 'var(--line)', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="value" stroke="#4F7A4A" strokeWidth={2.5}
                  strokeLinecap="round" strokeLinejoin="round"
                  fill="url(#volGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#4F7A4A', stroke: '#fff', strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Donut — status dos pedidos */}
          <div style={{ ...card, gap: 0, padding: 20 }}>
            <span style={{ ...lbl, marginBottom: 12, display: 'block' }}>Status dos pedidos</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative', width: 148, height: 148, flexShrink: 0 }}>
                <PieChart width={148} height={148}>
                  <Pie
                    data={displayDonut}
                    cx={74} cy={74}
                    innerRadius={44} outerRadius={66}
                    dataKey="value" strokeWidth={0}
                    paddingAngle={hasDonut ? 4 : 0}
                    cornerRadius={6}
                    startAngle={90} endAngle={-270}
                  >
                    {displayDonut.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                </PieChart>
                {/* Center label */}
                <div style={{
                  position: 'absolute', top: 74, left: 74,
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center', pointerEvents: 'none',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: 'var(--ink)', lineHeight: 1 }}>
                    {periodOrders.length}
                  </div>
                  <div style={{ fontSize: 9.5, color: 'var(--muted)', marginTop: 3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>pedidos</div>
                </div>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {donutData.map(s => (
                  <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: s.color, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 12, color: 'var(--ink-2)', flex: 1 }}>{s.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{s.value}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)', minWidth: 32, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {Math.round(s.value / (periodOrders.length || 1) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pintor do Mês / Ano */}
          <div style={{
            background: '#1C1A17', borderRadius: 14,
            padding: '18px 20px',
            display: 'flex', alignItems: 'center', gap: 14, flex: 1,
          }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 50, height: 50, borderRadius: '50%',
                background: 'rgba(201,162,39,.15)', border: '2px solid #C9A227',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#fff',
              }}>
                {initials(top?.name ?? 'NA')}
              </div>
              <div style={{
                position: 'absolute', bottom: -2, right: -4,
                width: 18, height: 18, background: '#C9A227',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Star size={10} fill="#1C1A17" color="#1C1A17" />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 2 }}>
                {topLabel}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {top?.name ?? '—'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>
                {top?.city ?? ''}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#C9A227', letterSpacing: '-0.02em' }}>
                {top?.volume ? `R$ ${(top.volume / 1000).toFixed(1)}k` : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 3 }}>
                {(top?.bonus ?? 0).toLocaleString('pt-BR')} pts
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Row 2: Bônus chart | Ranking ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Bônus area chart */}
        <div style={{ ...card, gap: 0, padding: '20px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={lbl}>Bônus distribuídos {chartGranLabel}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{periodLabel}</span>
          </div>
          {bonusData.every(d => d.value === 0) ? <ChartEmpty /> : (
            <ResponsiveContainer width="100%" height={175}>
              <AreaChart data={bonusData} margin={{ top: 16, right: 20, left: 20, bottom: 0 }} tabIndex={-1}>
                <defs>
                  <linearGradient id="bonusGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6B46C1" stopOpacity={0.32} />
                    <stop offset="55%"  stopColor="#6B46C1" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#6B46C1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--line)" strokeOpacity={0.5} strokeDasharray="0" />
                <XAxis
                  type="number" dataKey="idx" domain={xDomain} ticks={xTicks}
                  tickFormatter={xFmt}
                  tick={{ fontSize: 10.5, fill: 'var(--muted)', fontFamily: 'Inter' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [fmtBonus(v as number), 'Bônus']}
                  labelFormatter={(v) => xLabelFmt(v as number)}
                  contentStyle={tooltipStyle}
                  cursor={{ stroke: 'var(--line)', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6B46C1" strokeWidth={2.5}
                  strokeLinecap="round" strokeLinejoin="round"
                  fill="url(#bonusGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#6B46C1', stroke: '#fff', strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Ranking de pintores */}
        <div style={{ ...card, gap: 0, padding: 20 }}>
          <span style={{ ...lbl, marginBottom: 14, display: 'block' }}>Ranking de pintores</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ranking.map((p, i) => {
              const pct = Math.round((p.volume / maxVol) * 100)
              return (
                <div key={p.name}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                    {i === 0
                      ? <Trophy size={15} strokeWidth={1.75} color="#C9A227" style={{ flexShrink: 0 }} />
                      : i === 1
                      ? <Award  size={15} strokeWidth={1.75} color="#9AA5B1" style={{ flexShrink: 0 }} />
                      : i === 2
                      ? <Award  size={15} strokeWidth={1.75} color="#9C6B3A" style={{ flexShrink: 0 }} />
                      : <span style={{ width: 15, height: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 }}>{i + 1}</span>
                    }
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {p.name}
                    </span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {p.volume > 0 ? `R$ ${(p.volume / 1000).toFixed(1)}k` : '—'}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--paper-deep)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: BAR_COLORS[i] ?? 'var(--muted)',
                      borderRadius: 999,
                      transition: 'width .4s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
