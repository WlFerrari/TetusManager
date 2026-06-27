import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, QrCode, Camera } from 'lucide-react'
import { chapaCtrl, corteCtrl } from '../../controllers/index.js'
import { TIPOS_ROCHA, STATUS_CHAPA } from '../../models/index.js'
import {
  Badge, Modal, ConfirmDelete, FormField,
  BtnPrimary, BtnSecondary, BtnIcon, SectionHeader, SearchInput,
} from '../components/UI.jsx'
import QRCodeModal from '../components/QRCodeModal.jsx'

const BLANK = { nome:'', tipo:'Granito', cor:'#6b7280', largura:'', comprimento:'', espessura:2, status:'Disponível', foto:null }

export default function ChapasPage({ onUpdate }) {
  const [filters, setFilters] = useState({
    q: '', tipo: '', status: '', espessura: '', cor: '', minLargura: '', minComprimento: '',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [modal,  setModal]  = useState(null)
  const [form,   setForm]   = useState(BLANK)
  const [target, setTarget] = useState(null)
  const [erros,  setErros]  = useState({})
  const [lista,  setLista]  = useState([])
  const [loading, setLoading] = useState(false)
  const [qrCodeItem, setQrCodeItem] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Carrega chapas ao montar
  useEffect(() => {
    carregarChapas()
  }, [filters])

  async function carregarChapas() {
    setLoading(true)
    const r = await chapaCtrl.listarChapas(filters)
    setLista(r.ok ? r.data : [])
    setLoading(false)
  }

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const FF = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const closeModal = () => { setModal(null); setErros({}); setTarget(null) }

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => F('foto', ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleRemoverFoto() {
    const input = document.getElementById('chapa-foto-input')
    if (input) input.value = ''
    F('foto', null)
  }

  async function carregarHistorico(chapaId) {
    setHistoryLoading(true)
    const r = await corteCtrl.listar({ chapaId, limit: 6 })
    setHistory(r.ok ? r.data : [])
    setHistoryLoading(false)
  }

  function openView(c) {
    setTarget(c)
    setModal('view')
    setHistory([])
    carregarHistorico(c.id)
  }

  async function handleAdd() {
    const r = await chapaCtrl.gravarChapa(form)
    if (!r.ok) { setErros({ geral: r.msg }); return }
    onUpdate(r.msg, 'ok')
    carregarChapas()
    closeModal()
  }

  async function handleEdit() {
    const r = await chapaCtrl.atualizarChapa(form.id, form)
    if (!r.ok) { setErros({ geral: r.msg }); return }
    onUpdate(r.msg, 'ok')
    carregarChapas()
    closeModal()
  }

  async function handleDelete() {
    if (!target?.id) { onUpdate('Chapa não selecionada.', 'err'); closeModal(); return }
    const r = await chapaCtrl.excluirChapa(target.id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    carregarChapas()
    closeModal()
  }

  const activeFilters = Object.values(filters).filter(v => {
    if (v === null || v === undefined) return false
    return String(v).trim() !== ''
  }).length

  return (
    <div>
      <SectionHeader
        title="Chapas Brutas"
        subtitle={`${lista.length} registro(s)`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnSecondary onClick={() => setShowFilters(s => !s)}>
              {showFilters ? 'Ocultar filtros' : `Filtros (${activeFilters})`}
            </BtnSecondary>
            <BtnPrimary onClick={() => { setForm(BLANK); setModal('add') }}>
              <Plus size={14} /> Nova Chapa
            </BtnPrimary>
          </div>
        }
      />

      <SearchInput value={filters.q} onChange={v => FF('q', v)} placeholder="Buscar por nome, tipo ou ID…" />

      {showFilters && (
        <div className="card" style={{ padding: 12, marginBottom: 12 }}>
          <div className="form-grid-2">
            <FormField label="Tipo">
              <select value={filters.tipo} onChange={e => FF('tipo', e.target.value)}>
                <option value="">Todos</option>
                {TIPOS_ROCHA.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select value={filters.status} onChange={e => FF('status', e.target.value)}>
                <option value="">Todos</option>
                {STATUS_CHAPA.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Espessura (cm)">
              <input type="number" value={filters.espessura} onChange={e => FF('espessura', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Cor">
              <input type="text" value={filters.cor} onChange={e => FF('cor', e.target.value)} placeholder="#6b7280" />
            </FormField>
            <FormField label="Largura mínima (cm)">
              <input type="number" value={filters.minLargura} onChange={e => FF('minLargura', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Comprimento mínimo (cm)">
              <input type="number" value={filters.minComprimento} onChange={e => FF('minComprimento', e.target.value)} placeholder="0" />
            </FormField>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <BtnSecondary onClick={() => setFilters({ q: '', tipo: '', status: '', espessura: '', cor: '', minLargura: '', minComprimento: '' })}>
              Limpar filtros
            </BtnSecondary>
          </div>
        </div>
      )}

      <div className="cards-grid" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#d1d5db' }}>
            Carregando...
          </div>
        ) : lista.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '48px 0', color: '#d1d5db', fontSize: 14 }}>
            Nenhuma chapa encontrada.
          </div>
        ) : (
          lista.map(c => (
            <div key={c.id} style={{
              background: '#fff', borderRadius: 12,
              border: '1px solid #f3f4f6', overflow: 'hidden',
            }}>
              {/* Foto / Swatch */}
              {c.foto ? (
                <img src={c.foto} alt={c.nome} style={{ width: '100%', height: 70, objectFit: 'cover' }} />
              ) : (
                <div style={{
                  height: 60, background: c.cor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 600, textAlign: 'center', padding: 6,
                }}>
                  {c.nome}
                </div>
              )}
              <div style={{ padding: '10px 11px' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 6 }}>{c.tipo} · {c.largura}×{c.comprimento} cm</p>
                <Badge status={c.status} />
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 4, marginTop: 9 }}>
                  <button
                    onClick={() => openView(c)}
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px', background: '#fff', cursor: 'pointer', fontSize: 10, color: '#374151' }}
                  >
                    <Eye size={11} /> Ver
                  </button>
                  <button
                    onClick={() => setQrCodeItem(c)}
                    title="Gerar QR Code"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, border: '1px solid #e5e7eb', borderRadius: 6, padding: '5px', background: '#fff', cursor: 'pointer', fontSize: 10, color: '#7c3aed', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f3e8ff'; e.currentTarget.style.borderColor = '#d8b4fe' }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                  >
                    <QrCode size={11} /> QR
                  </button>
                  <BtnIcon title="Editar" onClick={() => { setForm({ ...c }); setModal('edit') }}><Edit2 size={12} /></BtnIcon>
                  <BtnIcon title="Excluir" danger onClick={() => { setTarget(c); setModal('del') }}><Trash2 size={12} /></BtnIcon>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modal === 'view' && target && (
        <Modal title="Detalhes da Chapa" onClose={closeModal}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            {target?.foto ? (
              <img src={target.foto} alt={target.nome} style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: 10, background: target?.cor, flexShrink: 0 }} />
            )}
            <div>
              <p style={{ fontWeight: 700, color: '#1f2937', fontSize: 15 }}>{target?.nome || 'sem nome'}</p>
              <code style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 }}>{target?.id}</code>
              <div style={{ marginTop: 4 }}><Badge status={target?.status} /></div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['Tipo', target?.tipo], ['Espessura', `${target?.espessura || 0} cm`], ['Largura', `${target?.largura || 0} cm`], ['Comprimento', `${target?.comprimento || 0} cm`], ['Cadastrado em', target?.criadoEm]].map(([k, v]) => (
              <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 12px' }}>
                <p style={{ fontSize: 10, color: '#9ca3af' }}>{k}</p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Histórico de cortes</p>
            {historyLoading ? (
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Carregando...</p>
            ) : history.length === 0 ? (
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Nenhum corte registrado para esta chapa.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {history.map(h => (
                  <div key={h.id} style={{ background: '#f9fafb', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#1f2937' }}>OS {h.osNumero}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af' }}>{h.comprimentoConsumido}×{h.larguraConsumida} cm · {h.areaRetalho} m²</p>
                    </div>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{h.criadoEm}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <BtnSecondary onClick={closeModal} style={{ width: '100%', marginTop: 14, textAlign: 'center' }}>Fechar</BtnSecondary>
        </Modal>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Nova Chapa' : 'Editar Chapa'} onClose={closeModal}>
          {erros.geral && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>{erros.geral}</p>}

          <FormField label="Nome da Chapa *">
            <input value={form.nome} onChange={e => F('nome', e.target.value)} placeholder="Ex: Preto São Gabriel" />
          </FormField>
          <FormField label="Foto do lote">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => document.getElementById('chapa-foto-input')?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12 }}
              >
                <Camera size={14} /> Enviar foto
              </button>
              {form.foto && <img src={form.foto} alt="Prévia" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }} />}
              {form.foto && (
                <button type="button" onClick={handleRemoverFoto} style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Remover
                </button>
              )}
            </div>
            <input id="chapa-foto-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} />
          </FormField>
          <div className="form-grid-2">
            <FormField label="Tipo">
              <select value={form.tipo} onChange={e => F('tipo', e.target.value)}>
                {TIPOS_ROCHA.map(t => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Cor">
              <input type="color" value={form.cor} onChange={e => F('cor', e.target.value)} />
            </FormField>
            <FormField label="Largura (cm) *">
              <input type="number" value={form.largura} onChange={e => F('largura', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Comprimento (cm) *">
              <input type="number" value={form.comprimento} onChange={e => F('comprimento', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Espessura (cm)">
              <input type="number" value={form.espessura} onChange={e => F('espessura', e.target.value)} />
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e => F('status', e.target.value)}>
                {STATUS_CHAPA.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <BtnSecondary onClick={closeModal}>Cancelar</BtnSecondary>
            <BtnPrimary onClick={modal === 'add' ? handleAdd : handleEdit} style={{ flex: 1, justifyContent: 'center' }}>
              {modal === 'add' ? 'Cadastrar Chapa' : 'Salvar Alterações'}
            </BtnPrimary>
          </div>
        </Modal>
      )}

      {modal === 'del' && target && (
        <ConfirmDelete
          message={`Deseja excluir permanentemente a chapa "${target?.nome || 'sem nome'}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}

      {qrCodeItem && (
        <QRCodeModal 
          item={qrCodeItem} 
          type="chapa" 
          onClose={() => setQrCodeItem(null)} 
        />
      )}
    </div>
  )
}
