'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { X, User, Building2, HardHat, Loader2 } from 'lucide-react'
import { PAINTERS, type Client } from '@/lib/mock'

export const MANUAL_CLIENTS_KEY = 'minas-tintas:manual-clients'

export function loadManualClients(): Client[] {
  try {
    const stored = localStorage.getItem(MANUAL_CLIENTS_KEY)
    return stored ? (JSON.parse(stored) as Client[]) : []
  } catch { return [] }
}

function maskCPF(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function maskCEP(value: string) {
  const d = value.replace(/\D/g, '').slice(0, 8)
  if (d.length <= 5) return d
  return `${d.slice(0, 5)}-${d.slice(5)}`
}

type Props = {
  open: boolean
  prefillName?: string
  editClient?: Client | null
  onClose: () => void
  onSave: (client: Client) => void
}

const EMPTY = {
  name: '', cpf: '', phone: '',
  cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '',
  painterSearch: '', selectedPainter: '',
}

export function CadastrarClienteModal({ open, prefillName = '', editClient, onClose, onSave }: Props) {
  const [type, setType] = useState<'pessoa' | 'empresa'>('pessoa')
  const [fields, setFields] = useState({ ...EMPTY, name: prefillName })
  const [cepLoading, setCepLoading] = useState(false)

  const isEdit = !!editClient

  const set = (key: keyof typeof EMPTY, value: string) =>
    setFields(f => ({ ...f, [key]: value }))

  useEffect(() => {
    if (open) {
      setCepLoading(false)
      if (editClient) {
        setType(editClient.type)
        setFields({
          name:            editClient.name,
          cpf:             editClient.cpf          ?? '',
          phone:           editClient.phone         ?? '',
          cep:             editClient.cep           ?? '',
          rua:             editClient.rua           ?? '',
          numero:          editClient.numero        ?? '',
          complemento:     editClient.complemento   ?? '',
          bairro:          editClient.bairro        ?? '',
          cidade:          editClient.cidade        ?? '',
          painterSearch:   editClient.painter       ?? '',
          selectedPainter: editClient.painter       ?? '',
        })
      } else {
        setType('pessoa')
        setFields({ ...EMPTY, name: prefillName })
      }
    }
  }, [open, prefillName, editClient])

  async function fetchCEP(raw: string) {
    const digits = raw.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setFields(f => ({
          ...f,
          rua:    data.logradouro || f.rua,
          bairro: data.bairro     || f.bairro,
          cidade: data.localidade || f.cidade,
        }))
      }
    } catch { /* silencia falha de rede */ }
    finally { setCepLoading(false) }
  }

  if (!open) return null

  const painterMatches = fields.painterSearch.trim() && !fields.selectedPainter
    ? PAINTERS.filter(p => p.active && p.name.toLowerCase().includes(fields.painterSearch.toLowerCase())).slice(0, 4)
    : []

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!fields.name.trim() || !fields.phone.trim()) return

    const client: Client = {
      id:           editClient?.id ?? crypto.randomUUID(),
      name:         fields.name.trim(),
      type,
      phone:        fields.phone.trim(),
      painter:      fields.selectedPainter || null,
      cpf:          fields.cpf.trim()          || undefined,
      cep:          fields.cep.trim()           || undefined,
      rua:          fields.rua.trim()           || undefined,
      numero:       fields.numero.trim()        || undefined,
      complemento:  fields.complemento.trim()   || undefined,
      bairro:       fields.bairro.trim()        || undefined,
      cidade:       fields.cidade.trim()        || undefined,
    }

    try {
      const existing = loadManualClients()
      if (isEdit && editClient?.id) {
        localStorage.setItem(MANUAL_CLIENTS_KEY, JSON.stringify(
          existing.map(c => c.id === editClient.id ? client : c)
        ))
      } else {
        localStorage.setItem(MANUAL_CLIENTS_KEY, JSON.stringify([client, ...existing]))
      }
    } catch { /* mock */ }

    onSave(client)
    onClose()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 40, borderRadius: 10, border: '1px solid var(--line)',
    background: 'var(--card)', padding: '0 12px',
    fontFamily: 'var(--font-body)', fontSize: 13,
    color: 'var(--ink)', outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'grid', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--ink-2)',
  }

  return (
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(28,26,23,.38)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24, zIndex: 60,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: 520,
          background: 'var(--card)',
          border: '1px solid var(--line)',
          borderRadius: 16,
          boxShadow: '0 18px 50px rgba(28,26,23,.22)',
          overflow: 'hidden',
        }}
      >
        {/* Cabeçalho */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 16, padding: '20px 22px 16px',
          borderBottom: '1px solid var(--line)',
        }}>
          <div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 22,
              fontWeight: 800, letterSpacing: '-0.03em',
              color: 'var(--ink)', lineHeight: 1.1,
            }}>
              {isEdit ? 'Editar cliente' : 'Cadastrar cliente'}
            </h2>
            <p style={{ marginTop: 6, fontSize: 13, color: 'var(--muted)', lineHeight: 1.45 }}>
              {isEdit ? 'Atualize os dados do cliente.' : 'Preencha os dados do novo cliente.'}
            </p>
          </div>
          <button
            type="button" onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10,
              border: '1px solid var(--line)',
              background: 'var(--card)', color: 'var(--muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {/* Corpo */}
        <div style={{ padding: '20px 22px 6px', display: 'grid', gap: 14, maxHeight: '68vh', overflowY: 'auto' }}>

          {/* Tipo */}
          <label style={labelStyle}>
            Tipo
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([
                { value: 'pessoa',  label: 'Pessoa física', Icon: User      },
                { value: 'empresa', label: 'Empresa',       Icon: Building2 },
              ] as const).map(({ value, label, Icon }) => {
                const active = type === value
                return (
                  <button
                    key={value} type="button" onClick={() => setType(value)}
                    style={{
                      height: 40, borderRadius: 10,
                      border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                      background: active ? 'var(--ink)' : 'var(--card)',
                      color: active ? 'var(--paper)' : 'var(--ink-2)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <Icon size={14} strokeWidth={1.75} />
                    {label}
                  </button>
                )
              })}
            </div>
          </label>

          {/* Nome */}
          <label style={labelStyle}>
            Nome *
            <input
              value={fields.name}
              onChange={e => set('name', e.target.value)}
              placeholder={type === 'empresa' ? 'Razão social ou nome fantasia...' : 'Nome completo...'}
              required autoFocus
              style={inputStyle}
            />
          </label>

          {/* CPF + Telefone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label style={labelStyle}>
              CPF
              <input
                value={fields.cpf}
                onChange={e => set('cpf', maskCPF(e.target.value))}
                placeholder="000.000.000-00"
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Telefone *
              <input
                value={fields.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="(32) 99999-0000"
                type="tel"
                required
                style={inputStyle}
              />
            </label>
          </div>

          {/* Divisor endereço */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              Endereço
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          {/* CEP */}
          <label style={labelStyle}>
            CEP
            <div style={{ position: 'relative' }}>
              <input
                value={fields.cep}
                onChange={e => {
                  const masked = maskCEP(e.target.value)
                  set('cep', masked)
                  fetchCEP(masked)
                }}
                placeholder="00000-000"
                style={{ ...inputStyle, paddingRight: cepLoading ? 36 : 12 }}
              />
              {cepLoading && (
                <div style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--muted)',
                }}>
                  <Loader2 size={14} strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              )}
            </div>
          </label>

          {/* Rua + Número */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 10 }}>
            <label style={labelStyle}>
              Rua
              <input value={fields.rua} onChange={e => set('rua', e.target.value)} placeholder="Nome da rua..." style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Número
              <input value={fields.numero} onChange={e => set('numero', e.target.value)} placeholder="123" style={inputStyle} />
            </label>
          </div>

          {/* Complemento */}
          <label style={labelStyle}>
            Complemento
            <input value={fields.complemento} onChange={e => set('complemento', e.target.value)} placeholder="Apto, bloco, sala..." style={inputStyle} />
          </label>

          {/* Bairro + Cidade */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label style={labelStyle}>
              Bairro
              <input value={fields.bairro} onChange={e => set('bairro', e.target.value)} placeholder="Nome do bairro..." style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Cidade
              <input value={fields.cidade} onChange={e => set('cidade', e.target.value)} placeholder="São João del-Rei" style={inputStyle} />
            </label>
          </div>

          {/* Divisor vínculo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
              Vínculo
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          {/* Pintor vinculado */}
          <label style={{ ...labelStyle, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Pintor vinculado</span>
              <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(opcional)</span>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                value={fields.selectedPainter || fields.painterSearch}
                onChange={e => { set('selectedPainter', ''); set('painterSearch', e.target.value) }}
                placeholder="Buscar pintor responsável..."
                autoComplete="off"
                style={inputStyle}
              />
              {painterMatches.length > 0 && (
                <div style={{
                  position: 'absolute', zIndex: 6, left: 0, right: 0, bottom: 'calc(100% + 4px)',
                  background: 'var(--card)', border: '1px solid var(--line)',
                  borderRadius: 12, overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(28,26,23,.12)',
                }}>
                  {painterMatches.map(p => (
                    <button
                      key={p.name} type="button"
                      onClick={() => { set('selectedPainter', p.name); set('painterSearch', p.name) }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', border: 'none', background: 'var(--card)',
                        borderBottom: '1px solid var(--line)', textAlign: 'left', cursor: 'pointer',
                      }}
                    >
                      <HardHat size={15} strokeWidth={1.75} color="var(--muted)" />
                      <span style={{ flex: 1 }}>
                        <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</span>
                        <span style={{ display: 'block', fontSize: 11.5, color: 'var(--muted)' }}>{p.city}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Rodapé */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '14px 22px 20px', borderTop: '1px solid var(--line)',
          background: 'var(--paper)',
        }}>
          <button type="button" onClick={onClose} style={{
            height: 38, padding: '0 14px', borderRadius: 10,
            border: '1px solid var(--line)', background: 'var(--card)',
            color: 'var(--ink-2)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Cancelar
          </button>
          <button type="submit" style={{
            height: 38, padding: '0 15px', borderRadius: 10,
            border: '1px solid transparent', background: 'var(--ink)',
            color: 'var(--paper)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(28,26,23,.10)',
          }}>
            {isEdit ? 'Salvar alterações' : 'Cadastrar cliente'}
          </button>
        </div>
      </form>

      <style>{`
        @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }
      `}</style>
    </div>
  )
}
