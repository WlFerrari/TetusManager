import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, UserX, UserCheck } from 'lucide-react'
import { userCtrl } from '../../controllers/index.js'
import { PERFIS_USUARIO } from '../../models/index.js'
import {
  Badge, Modal, ConfirmDelete, FormField,
  BtnPrimary, BtnSecondary, BtnIcon, Avatar, SectionHeader, SearchInput,
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

  async function handleAdd() {
    const r = await userCtrl.criar(form)
    if (!r.ok) { setErros({ geral: r.msg }); return }
    onUpdate(r.msg, 'ok')
    carregarUsuarios()
    closeModal()
  }

  async function handleEdit() {
    const r = await userCtrl.atualizar(form.id, form)
    if (!r.ok) { setErros({ geral: r.msg }); return }
    onUpdate(r.msg, 'ok')
    carregarUsuarios()
    closeModal()
  }

  async function handleToggle(id) {
    const r = await userCtrl.toggleStatus(id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    carregarUsuarios()
  }

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
        subtitle={`${lista.length} registro(s)`}
        action={
          <BtnPrimary onClick={() => { setForm(BLANK); setModal('add') }}>
            <Plus size={14} /> Novo Usuário
          </BtnPrimary>
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, e-mail ou perfil…" />

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>
                  Carregando...
                </td>
              </tr>
            ) : lista.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: 14 }}>
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              lista.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Avatar name={u.nome} size={28} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{u.nome}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ color: 'var(--text-primary)' }}>{u.perfil}</td>
                  <td><Badge status={u.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <BtnIcon title="Editar" onClick={() => { setForm({ ...u }); setModal('edit') }}>
                        <Edit2 size={13} />
                      </BtnIcon>

                      <BtnIcon
                        title={u.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                        onClick={() => handleToggle(u.id)}
                        danger={u.status === 'Ativo'}
                      >
                        {u.status === 'Ativo' ? <UserX size={13} /> : <UserCheck size={13} />}
                      </BtnIcon>

                      <BtnIcon title="Excluir" danger onClick={() => { setTarget(u); setModal('del') }}>
                        <Trash2 size={13} />
                      </BtnIcon>
                    </div>
                  </td>
              </tr>
            )))}

          </tbody>
        </table>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Novo Usuário' : 'Editar Usuário'} onClose={closeModal}>
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
