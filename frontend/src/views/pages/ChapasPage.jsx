import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Eye, QrCode } from 'lucide-react'
import { chapaCtrl } from '../../controllers/index.js'
import { TIPOS_ROCHA, STATUS_CHAPA } from '../../models/index.js'
import {
  Badge, Modal, ConfirmDelete, FormField,
  BtnPrimary, BtnSecondary, BtnIcon, CrudLabel, SectionHeader, SearchInput,
} from '../components/UI.jsx'
import QRCodeModal from '../components/QRCodeModal.jsx'

const BLANK = { nome:'', tipo:'Granito', cor:'#6b7280', largura:'', comprimento:'', espessura:2, status:'Disponível' }

export default function ChapasPage({ onUpdate }) {
  const [search, setSearch] = useState('')
  const [modal,  setModal]  = useState(null)
  const [form,   setForm]   = useState(BLANK)
  const [target, setTarget] = useState(null)
  const [erros,  setErros]  = useState({})
  const [lista,  setLista]  = useState([])
  const [loading, setLoading] = useState(false)
  const [qrCodeItem, setQrCodeItem] = useState(null)

  // Carrega chapas ao montar
  useEffect(() => {
    carregarChapas()
  }, [search])

  async function carregarChapas() {
    setLoading(true)
    const r = await chapaCtrl.listar(search)
    setLista(r.ok ? r.data : [])
    setLoading(false)
  }

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const closeModal = () => { setModal(null); setErros({}); setTarget(null) }

  // [C] CREATE
  async function handleAdd() {
    const r = await chapaCtrl.criar(form)
    if (!r.ok) { setErros({ geral: r.msg }); return }
    onUpdate(r.msg, 'ok')
    carregarChapas()
    closeModal()
  }

  // [U] UPDATE
  async function handleEdit() {
    const r = await chapaCtrl.atualizar(form.id, form)
    if (!r.ok) { setErros({ geral: r.msg }); return }
    onUpdate(r.msg, 'ok')
    carregarChapas()
    closeModal()
  }

  // [D] DELETE físico
  async function handleDelete() {
    if (!target?.id) { onUpdate('Chapa não selecionada.', 'err'); closeModal(); return }
    const r = await chapaCtrl.excluir(target.id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    carregarChapas()
    closeModal()
  }

  return (
    <div>
      <SectionHeader
        title="Chapas Brutas"
        subtitle={`CRUD completo · ${lista.length} registro(s)`}
        action={
          <BtnPrimary onClick={() => { setForm(BLANK); setModal('add') }}>
            <Plus size={14} /> Nova Chapa <CrudLabel op="C" />
          </BtnPrimary>
        }
      />

      {/* [R] READ — filtro de busca */}
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, tipo ou ID… (READ)" />

      {/* [R] READ — grid de cards */}
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
              {/* Swatch */}
              <div style={{
                height: 60, background: c.cor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 600, textAlign: 'center', padding: 6,
              }}>
                {c.nome}
              </div>
              <div style={{ padding: '10px 11px' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</p>
                <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 6 }}>{c.tipo} · {c.largura}×{c.comprimento} cm</p>
                <Badge status={c.status} />
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 4, marginTop: 9 }}>
                  <button
                    onClick={() => { setTarget(c); setModal('view') }}
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
                  <BtnIcon title="UPDATE" onClick={() => { setForm({ ...c }); setModal('edit') }}><Edit2 size={12} /></BtnIcon>
                  <BtnIcon title="DELETE" danger onClick={() => { setTarget(c); setModal('del') }}><Trash2 size={12} /></BtnIcon>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal READ (detalhes) */}
      {modal === 'view' && target && (
        <Modal title="Detalhes da Chapa (READ)" onClose={closeModal}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 10, background: target?.cor, flexShrink: 0 }} />
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
          <BtnSecondary onClick={closeModal} style={{ width: '100%', marginTop: 14, textAlign: 'center' }}>Fechar</BtnSecondary>
        </Modal>
      )}

      {/* Modal CREATE / UPDATE */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Nova Chapa (CREATE)' : 'Editar Chapa (UPDATE)'} onClose={closeModal}>
          <div style={{
            background: modal === 'add' ? '#eff6ff' : '#fefce8',
            borderRadius: 8, padding: '7px 12px', fontSize: 12,
            color: modal === 'add' ? '#1e40af' : '#92400e',
            marginBottom: 14, fontWeight: 500,
          }}>
            <CrudLabel op={modal === 'add' ? 'C' : 'U'} />
            {' '}{modal === 'add' ? 'chapaCtrl.criar(data)' : `chapaCtrl.atualizar("${form.id}", data)`}
          </div>

          {erros.geral && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>{erros.geral}</p>}

          <FormField label="Nome da Chapa *">
            <input value={form.nome} onChange={e => F('nome', e.target.value)} placeholder="Ex: Preto São Gabriel" />
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

      {/* Confirm DELETE */}
      {modal === 'del' && target && (
        <ConfirmDelete
          message={`Deseja excluir permanentemente a chapa "${target?.nome || 'sem nome'}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}

      {/* QR Code Modal */}
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
