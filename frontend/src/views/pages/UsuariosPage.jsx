import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, UserX, UserCheck } from 'lucide-react'
import { userCtrl } from '../../controllers/index.js'
import { PERFIS_USUARIO } from '../../models/index.js'
import {
  Badge, Modal, ConfirmDelete, FormField,
  BtnPrimary, BtnSecondary, BtnIcon, CrudLabel, Avatar, SectionHeader, SearchInput,
} from '../components/UI.jsx'

const BLANK = { nome:'', email:'', perfil:'Vendedor', status:'Ativo', senha:'123456' }

export default function UsuariosPage({ onUpdate }) {
  const [search, setSearch] = useState('')
  const [modal,  setModal]  = useState(null)
  const [form,   setForm]   = useState(BLANK)
  const [target, setTarget] = useState(null)
  const [erros,  setErros]  = useState({})
  const [lista,  setLista]  = useState([])
  const [loading, setLoading] = useState(false)

  // Carrega usuários ao montar e quando search mudar
  useEffect(() => {
    carregarUsuarios()
  }, [search])

  async function carregarUsuarios() {
    setLoading(true)
    const r = await userCtrl.listar(search)
    setLista(r.ok ? r.data : [])
    setLoading(false)
  }

  const F = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const closeModal = () => { setModal(null); setErros({}); setTarget(null) }

  // [C] CREATE
  async function handleAdd() {
    const r = await userCtrl.criar(form)
    if (!r.ok) { setErros({ geral: r.msg }); return }
    onUpdate(r.msg, 'ok')
    carregarUsuarios()
    closeModal()
  }

  // [U] UPDATE
  async function handleEdit() {
    const r = await userCtrl.atualizar(form.id, form)
    if (!r.ok) { setErros({ geral: r.msg }); return }
    onUpdate(r.msg, 'ok')
    carregarUsuarios()
    closeModal()
  }

  // [D] DELETE lógico — toggle Ativo/Inativo
  async function handleToggle(id) {
    const r = await userCtrl.toggleStatus(id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    carregarUsuarios()
  }

  // [D] DELETE físico
  async function handleDelete() {
    if (!target?.id) { onUpdate('Usuário não selecionado.', 'err'); closeModal(); return }
    const r = await userCtrl.excluir(target.id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    carregarUsuarios()
    closeModal()
  }

  return (
    <div>
      <SectionHeader
        title="Usuários"
        subtitle={`CRUD completo · delete físico e lógico (toggle status) · ${lista.length} registro(s)`}
        action={
          <BtnPrimary onClick={() => { setForm(BLANK); setModal('add') }}>
            <Plus size={14} /> Novo Usuário <CrudLabel op="C" />
          </BtnPrimary>
        }
      />

      {/* [R] READ — busca */}
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, e-mail ou perfil… (READ)" />

      {/* [R] READ — tabela */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações CRUD</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#d1d5db' }}>
                  Carregando...
                </td>
              </tr>
            ) : lista.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#d1d5db', fontSize: 14 }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              lista.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Avatar name={u.nome} size={28} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{u.nome}</span>
                    </div>
                  </td>
                  <td style={{ color: '#6b7280' }}>{u.email}</td>
                  <td style={{ color: '#374151' }}>{u.perfil}</td>
                  <td><Badge status={u.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {/* [U] UPDATE */}
                      <BtnIcon title="UPDATE" onClick={() => { setForm({ ...u }); setModal('edit') }}>
                        <Edit2 size={13} />
                      </BtnIcon>

                      {/* [D] DELETE lógico — inativar/ativar */}
                      <button
                        title={`DELETE lógico: ${u.status === 'Ativo' ? 'inativar' : 'ativar'} usuário`}
                        onClick={() => handleToggle(u.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '4px 9px', border: '1px solid #e5e7eb', borderRadius: 6,
                          background: '#fff', cursor: 'pointer', fontSize: 11,
                          color: u.status === 'Ativo' ? '#92400e' : '#065f46', fontWeight: 500,
                        }}
                      >
                        {u.status === 'Ativo' ? <UserX size={13} /> : <UserCheck size={13} />}
                        {u.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                        <CrudLabel op="D" />
                      </button>

                      {/* [D] DELETE físico */}
                      <BtnIcon title="DELETE físico" danger onClick={() => { setTarget(u); setModal('del') }}>
                        <Trash2 size={13} />
                      </BtnIcon>
                    </div>
                  </td>
              </tr>
            )))}

          </tbody>
        </table>
      </div>

      {/* Modal CREATE / UPDATE */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Novo Usuário (CREATE)' : 'Editar Usuário (UPDATE)'} onClose={closeModal}>
          <div style={{ background: modal === 'add' ? '#eff6ff' : '#fefce8', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: modal === 'add' ? '#1e40af' : '#92400e', marginBottom: 14, fontWeight: 500 }}>
            <CrudLabel op={modal === 'add' ? 'C' : 'U'} />
            {' '}{modal === 'add' ? 'userCtrl.criar(data)' : `userCtrl.atualizar(${form.id}, data)`}
          </div>

          {erros.geral && <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 10 }}>{erros.geral}</p>}

          <FormField label="Nome completo *">
            <input value={form.nome} onChange={e => F('nome', e.target.value)} placeholder="Nome do usuário" />
          </FormField>
          <FormField label="E-mail corporativo *">
            <input type="email" value={form.email} onChange={e => F('email', e.target.value)} placeholder="email@tetus.com" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Perfil">
              <select value={form.perfil} onChange={e => F('perfil', e.target.value)}>
                {PERFIS_USUARIO.map(p => <option key={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e => F('status', e.target.value)}>
                <option>Ativo</option>
                <option>Inativo</option>
              </select>
            </FormField>
          </div>
          {modal === 'add' && (
            <FormField label="Senha inicial">
              <input type="password" value={form.senha} onChange={e => F('senha', e.target.value)} placeholder="••••••••" />
            </FormField>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <BtnSecondary onClick={closeModal}>Cancelar</BtnSecondary>
            <BtnPrimary onClick={modal === 'add' ? handleAdd : handleEdit} style={{ flex: 1, justifyContent: 'center' }}>
              {modal === 'add' ? 'Criar Usuário' : 'Salvar Alterações'}
            </BtnPrimary>
          </div>
        </Modal>
      )}

      {/* Confirm DELETE físico */}
      {modal === 'del' && target && (
        <ConfirmDelete
          message={`Excluir permanentemente o usuário "${target?.nome || 'sem nome'}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
    </div>
  )
}
