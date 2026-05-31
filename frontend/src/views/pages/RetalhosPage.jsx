import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckSquare, QrCode, Eye, XSquare, Camera } from 'lucide-react'
import { retalhoCtrl, corteCtrl } from '../../controllers/index.js'
import { TIPOS_ROCHA, STATUS_RETALHO } from '../../models/index.js'
import {
  Badge, Modal, ConfirmDelete, FormField,
  BtnPrimary, BtnSecondary, BtnIcon, SectionHeader, SearchInput,
} from '../components/UI.jsx'
import QRCodeModal from '../components/QRCodeModal.jsx'

const BLANK = { nome:'', tipo:'Granito', cor:'#6b7280', largura:'', comprimento:'', espessura:2, status:'Disponível', origem:'', foto:null }

export default function RetalhosPage({ onUpdate }) {
  const [filters, setFilters] = useState({
    q: '', tipo: '', status: '', espessura: '', cor: '', origem: '', minLargura: '', minComprimento: '', minArea: '',
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

  // Carrega retalhos ao montar e quando search mudar
  useEffect(() => {
    carregarRetalhos()
  }, [filters])

  async function carregarRetalhos() {
    setLoading(true)
    const r = await retalhoCtrl.listar(filters)
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

  async function carregarHistorico(retalhoId) {
    setHistoryLoading(true)
    const r = await corteCtrl.listar({ retalhoId, limit: 6 })
    setHistory(r.ok ? r.data : [])
    setHistoryLoading(false)
  }

  function openView(r) {
    setTarget(r)
    setModal('view')
    setHistory([])
    carregarHistorico(r.id)
  }

  async function handleAdd() {
    const r = await retalhoCtrl.gravarRetalho(form)
    if (!r.ok) { setErros({ geral: r.msg }); return }
    onUpdate(r.msg, 'ok')
    carregarRetalhos()
    closeModal()
  }

  async function handleEdit() {
    const r = await retalhoCtrl.atualizar(form.id, form)
    if (!r.ok) { setErros({ geral: r.msg }); return }
    onUpdate(r.msg, 'ok')
    carregarRetalhos()
    closeModal()
  }

  async function handleDelete() {
    if (!target?.id) { onUpdate('Retalho não selecionado.', 'err'); closeModal(); return }
    const r = await retalhoCtrl.excluir(target.id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    carregarRetalhos()
    closeModal()
  }

  async function handleConsumir(id) {
    const r = await retalhoCtrl.marcarConsumido(id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    carregarRetalhos()
  }

  async function handleDescartar(id) {
    const r = await retalhoCtrl.marcarDescartado(id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    carregarRetalhos()
  }

  const areaCalculada = form.comprimento && form.largura
    ? ((+form.comprimento * +form.largura) / 10000).toFixed(2)
    : null

  const activeFilters = Object.values(filters).filter(v => {
    if (v === null || v === undefined) return false
    return String(v).trim() !== ''
  }).length

  return (
    <div>
      <SectionHeader
        title="Retalhos"
        subtitle={`${lista.length} registro(s)`}
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnSecondary onClick={() => setShowFilters(s => !s)}>
              {showFilters ? 'Ocultar filtros' : `Filtros (${activeFilters})`}
            </BtnSecondary>
            <BtnPrimary onClick={() => { setForm(BLANK); setModal('add') }}>
              <Plus size={14} /> Novo Retalho
            </BtnPrimary>
          </div>
        }
      />

      <SearchInput value={filters.q} onChange={v => FF('q', v)} placeholder="Buscar por nome, tipo, status ou ID…" />

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
                {STATUS_RETALHO.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Espessura (cm)">
              <input type="number" value={filters.espessura} onChange={e => FF('espessura', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Cor">
              <input type="text" value={filters.cor} onChange={e => FF('cor', e.target.value)} placeholder="#6b7280" />
            </FormField>
            <FormField label="Origem (ID da chapa)">
              <input value={filters.origem} onChange={e => FF('origem', e.target.value)} placeholder="CH001" />
            </FormField>
            <FormField label="Área mínima (m²)">
              <input type="number" value={filters.minArea} onChange={e => FF('minArea', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Largura mínima (cm)">
              <input type="number" value={filters.minLargura} onChange={e => FF('minLargura', e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Comprimento mínimo (cm)">
              <input type="number" value={filters.minComprimento} onChange={e => FF('minComprimento', e.target.value)} placeholder="0" />
            </FormField>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <BtnSecondary onClick={() => setFilters({ q: '', tipo: '', status: '', espessura: '', cor: '', origem: '', minLargura: '', minComprimento: '', minArea: '' })}>
              Limpar filtros
            </BtnSecondary>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '68vh', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#d1d5db' }}>
            Carregando...
          </div>
        ) : lista.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#d1d5db', fontSize: 14 }}>
            Nenhum retalho encontrado.
          </div>
        ) : (
          lista.map(r => (
            <div key={r.id} style={{ background: '#fff', borderRadius: 10, border: '1px solid #f3f4f6', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              {r.foto ? (
                <img src={r.foto} alt={r.nome} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 38, height: 38, borderRadius: 8, background: r.cor, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>{r.nome}</p>
                  <code style={{ fontSize: 10, color: '#9ca3af', background: '#f3f4f6', padding: '1px 6px', borderRadius: 4 }}>{r.id}</code>
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af' }}>
                  {r.tipo} · {r.largura}×{r.comprimento} cm · {r.area} m² · {r.criadoEm}
                </p>
              </div>
              <Badge status={r.status} />
              <div style={{ display: 'flex', gap: 5 }}>
                <button
                  onClick={() => openView(r)}
                  title="Ver detalhes"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 10, color: '#374151', fontWeight: 500 }}
                >
                  <Eye size={12} /> Ver
                </button>
                <button
                  onClick={() => setQrCodeItem(r)}
                  title="Gerar QR Code"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 10, color: '#7c3aed', fontWeight: 500, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f3e8ff'; e.currentTarget.style.borderColor = '#d8b4fe' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  <QrCode size={12} /> QR
                </button>
                <BtnIcon title="Editar" onClick={() => { setForm({ ...r }); setModal('edit') }}><Edit2 size={13} /></BtnIcon>
                {r.status !== 'Consumido' && r.status !== 'Descartado' && (
                  <button
                    title="Marcar como consumido (mantém histórico)"
                    onClick={() => handleConsumir(r.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 10, color: '#92400e', fontWeight: 500 }}
                  >
                    <CheckSquare size={12} /> consumir
                  </button>
                )}
                {r.status !== 'Descartado' && (
                  <button
                    title="Descartar do inventário"
                    onClick={() => handleDescartar(r.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 10, color: '#991b1b', fontWeight: 500 }}
                  >
                    <XSquare size={12} /> descartar
                  </button>
                )}
                <BtnIcon title="Excluir" danger onClick={() => { setTarget(r); setModal('del') }}><Trash2 size={13} /></BtnIcon>
              </div>
            </div>
          ))
        )}
      </div>

      {modal === 'view' && target && (
        <Modal title="Detalhes do Retalho" onClose={closeModal}>
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
            {[['Tipo', target?.tipo], ['Espessura', `${target?.espessura || 0} cm`], ['Largura', `${target?.largura || 0} cm`], ['Comprimento', `${target?.comprimento || 0} cm`], ['Área', `${target?.area || 0} m²`], ['Origem', target?.origem || '—']].map(([k, v]) => (
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
              <p style={{ fontSize: 12, color: '#9ca3af' }}>Nenhum corte registrado para este retalho.</p>
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
        <Modal title={modal === 'add' ? 'Novo Retalho' : 'Editar Retalho'} onClose={closeModal}>
          {erros.geral && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>{erros.geral}</p>}

          <FormField label="Nome *">
            <input value={form.nome} onChange={e => F('nome', e.target.value)} placeholder="Nome do material" />
          </FormField>
          <FormField label="Foto do retalho">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={() => document.getElementById('retalho-foto-input')?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12 }}
              >
                <Camera size={14} /> Enviar foto
              </button>
              {form.foto && <img src={form.foto} alt="Prévia" style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover' }} />}
              {form.foto && (
                <button type="button" onClick={() => F('foto', null)} style={{ fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Remover
                </button>
              )}
            </div>
            <input id="retalho-foto-input" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} />
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
                {STATUS_RETALHO.map(s => <option key={s}>{s}</option>)}
              </select>
            </FormField>
          </div>
          {areaCalculada && (
            <p style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', padding: '6px 10px', borderRadius: 7, marginTop: -4, marginBottom: 10 }}>
              Área calculada automaticamente: <strong>{areaCalculada} m²</strong>
            </p>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <BtnSecondary onClick={closeModal}>Cancelar</BtnSecondary>
            <BtnPrimary onClick={modal === 'add' ? handleAdd : handleEdit} style={{ flex: 1, justifyContent: 'center' }}>
              {modal === 'add' ? 'Cadastrar Retalho' : 'Salvar Alterações'}
            </BtnPrimary>
          </div>
        </Modal>
      )}

      {modal === 'del' && target && (
        <ConfirmDelete
          message={`Excluir permanentemente o retalho "${target?.id || 'sem id'}"? O registro será removido do sistema.`}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}

      {qrCodeItem && (
        <QRCodeModal 
          item={qrCodeItem} 
          type="retalho" 
          onClose={() => setQrCodeItem(null)} 
        />
      )}
    </div>
  )
}
