import React, { useState, useEffect } from 'react'
import { Scissors, QrCode, X, CheckCircle } from 'lucide-react'
import { chapaCtrl, retalhoCtrl } from '../../controllers/index.js'
import { FormField, BtnPrimary } from '../components/UI.jsx'

export default function CortePage({ onUpdate }) {
  const [form, setForm] = useState({ chapaId: '', cc: '', lc: '', obs: '' })
  const [done, setDone] = useState(null)
  const [chapas, setChapas] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarChapas()
  }, [])

  async function carregarChapas() {
    setLoading(true)
    const r = await chapaCtrl.listarChapasDisponiveis()
    setChapas(r.ok ? r.data : [])
    setLoading(false)
  }

   const F = (k, v) => setForm(f => ({ ...f, [k]: v }))
   const chapa  = chapas.find(c => c.id === form.chapaId)

   // Calcula via controller (sem persistir)
   // Combina o nome da chapa com observações (se houver)
   const nomeRetalho = chapa ? (form.obs?.trim() ? `${chapa.nome} - ${form.obs}` : chapa.nome) : ''
   const calc = (chapa && +form.cc > 0 && +form.lc > 0)
     ? chapaCtrl.calcularCorte(form.chapaId, +form.cc, +form.lc, nomeRetalho, chapa)
     : null

  const aprov = calc?.ok && chapa
    ? ((+form.cc * +form.lc) / (chapa.comprimento * chapa.largura) * 100).toFixed(0)
    : 0

  async function handleSalvar() {
    if (!calc || !calc.ok) return
    const r = await retalhoCtrl.gravarRetalho(calc.retalho)
    if (r.ok) {
      setDone(r.data)
      setForm({ chapaId: '', cc: '', lc: '', obs: '' })
      onUpdate(r.msg, 'ok')
    } else {
      onUpdate(r.msg, 'err')
    }
  }

  const canSave = calc?.ok

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>Registrar Corte</h2>
        <p style={{ fontSize: 12, color: '#6b7280' }}>
          ChapaCtrl.calcularCorte() → RetalhoCtrl.gravarRetalho()
        </p>
      </div>

      {/* Sucesso */}
      {done && (
        <div style={{
          marginBottom: 14, background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <CheckCircle size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>Retalho criado com sucesso!</p>
            <p style={{ fontSize: 11, color: '#16a34a' }}>
              {done.id} · {done.largura}×{done.comprimento} cm · {done.area} m² · Status: {done.status}
            </p>
          </div>
          <button onClick={() => setDone(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="two-col" style={{ gap: 16 }}>
        {/* Formulário */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Dados do Corte</p>

          <FormField label="Chapa de Origem">
            <select value={form.chapaId} onChange={e => F('chapaId', e.target.value)} disabled={loading}>
              <option value="">{loading ? 'Carregando...' : 'Selecione uma chapa...'}</option>
              {chapas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.id} – {c.nome} ({c.comprimento}×{c.largura} cm)
                </option>
              ))}
            </select>
          </FormField>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <FormField label="Comprimento Consumido (cm)">
              <input type="number" value={form.cc} onChange={e => F('cc', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Largura Consumida (cm)">
              <input type="number" value={form.lc} onChange={e => F('lc', e.target.value)} placeholder="0" />
            </FormField>
          </div>

          <FormField label="Observações / ID do Projeto">
            <textarea
              value={form.obs}
              onChange={e => F('obs', e.target.value)}
              placeholder="ID do projeto ou observações adicionais..."
              style={{ height: 72, resize: 'none' }}
            />
          </FormField>

          {calc && !calc.ok && (
            <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>{calc.msg}</p>
          )}

          {!!calc?.ok && (
            <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#92400e', marginBottom: 12 }}>
              ⚠ Certifique-se das medidas antes de salvar. O QR Code será gerado automaticamente para a sobra.
            </div>
          )}

          <BtnPrimary onClick={handleSalvar} disabled={!canSave} style={{ width: '100%', justifyContent: 'center' }}>
            <QrCode size={15} /> Salvar e Gerar QR Code
          </BtnPrimary>
        </div>

        {/* Pré-visualização */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 18 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14 }}>Pré-visualização da Sobra</p>

          {chapa && calc?.ok ? (
            <>
              {/* Representação visual da chapa */}
              <div style={{
                background: chapa.cor, borderRadius: 10, padding: 14,
                textAlign: 'center', color: '#fff', marginBottom: 14,
              }}>
                <p style={{ fontSize: 10, opacity: .7, marginBottom: 3 }}>CHAPA ORIGINAL</p>
                <p style={{ fontSize: 13, fontWeight: 600 }}>{chapa.comprimento}×{chapa.largura} cm</p>
              </div>

              {/* Dados calculados */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[
                  ['Comprimento Restante', `${calc.retalho.comprimento} cm`],
                  ['Largura Restante',     `${calc.retalho.largura} cm`],
                  ['Área Restante',        `${calc.retalho.area} m²`],
                  ['Aproveitamento',       `${aprov}%`],
                ].map(([k, v]) => (
                  <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '9px 12px' }}>
                    <p style={{ fontSize: 10, color: '#9ca3af' }}>{k}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* QR Code placeholder */}
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: '#111', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
                  <QrCode size={22} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600 }}>QR Code de Identificação</p>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>Gerado automaticamente ao salvar</p>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '75%', color: '#e5e7eb' }}>
              <Scissors size={44} />
              <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 10 }}>
                Selecione uma chapa e insira as medidas consumidas
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
