import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, CheckSquare, QrCode } from 'lucide-react'
import { retalhoCtrl } from '../../controllers/index.js'
import { TIPOS_ROCHA, STATUS_RETALHO } from '../../models/index.js'
import {
  Badge, Modal, ConfirmDelete, FormField,
  BtnPrimary, BtnSecondary, BtnIcon, SectionHeader, SearchInput,
} from '../components/UI.jsx'
import QRCodeModal from '../components/QRCodeModal.jsx'

const BLANK = { nome:'', tipo:'Granito', cor:'#6b7280', largura:'', comprimento:'', espessura:2, status:'Disponível', origem:'' }

export default function RetalhosPage({ onUpdate }) {
  const [search, setSearch] = useState('')
  const [modal,  setModal]  = useState(null)
  const [form,   setForm]   = useState(BLANK)
  const [target, setTarget] = useState(null)
  const [erros,  setErros]  = useState({})
  const [lista,  setLista]  = useState([])
  const [loading, setLoading] = useState(false)
  const [qrCodeItem, setQrCodeItem] = useState(null)

  // Carrega retalhos ao montar e quando search mudar
  useEffect(() => {
    carregarRetalhos()
  }, [search])

  async function carregarRetalhos() {
    setLoading(true)
    const r = await retalhoCtrl.listar(search)
    setLista(r.ok ? r.data : [])
    setLoading(false)
  }

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const closeModal = () => { setModal(null); setErros({}); setTarget(null) }

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

  const areaCalculada = form.comprimento && form.largura
    ? ((+form.comprimento * +form.largura) / 10000).toFixed(2)
    : null

  return (
    <div>
      <SectionHeader
        title="Retalhos"
        subtitle={`${lista.length} registro(s)`}
        action={
          <BtnPrimary onClick={() => { setForm(BLANK); setModal('add') }}>
            <Plus size={14} /> Novo Retalho
          </BtnPrimary>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, tipo, status ou ID…" />

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
              <div style={{ width: 38, height: 38, borderRadius: 8, background: r.cor, flexShrink: 0 }} />
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
                  onClick={() => setQrCodeItem(r)}
                  title="Gerar QR Code"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 10, color: '#7c3aed', fontWeight: 500, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f3e8ff'; e.currentTarget.style.borderColor = '#d8b4fe' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb' }}
                >
                  <QrCode size={12} /> QR
                </button>
                <BtnIcon title="Editar" onClick={() => { setForm({ ...r }); setModal('edit') }}><Edit2 size={13} /></BtnIcon>
                {r.status !== 'Consumido' && (
                  <button
                    title="Marcar como consumido (mantém histórico)"
                    onClick={() => handleConsumir(r.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 10, color: '#92400e', fontWeight: 500 }}
                  >
                    <CheckSquare size={12} /> consumir
                  </button>
                )}
                <BtnIcon title="Excluir" danger onClick={() => { setTarget(r); setModal('del') }}><Trash2 size={13} /></BtnIcon>
              </div>
            </div>
          ))
        )}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Novo Retalho' : 'Editar Retalho'} onClose={closeModal}>
          {erros.geral && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>{erros.geral}</p>}

          <FormField label="Nome *">
            <input value={form.nome} onChange={e => F('nome', e.target.value)} placeholder="Nome do material" />
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
