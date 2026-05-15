import React, { useState, useRef, useEffect } from 'react'
import {
  User, Building2, Shield, Users,
  Camera, Save, RefreshCw, Lock, Eye, EyeOff,
  Edit2, Trash2, Plus, UserX, UserCheck, CheckSquare, XSquare,
} from 'lucide-react'
import { userCtrl, empresaCtrl } from '../../controllers/index.js'
import { PERFIS_USUARIO, LABELS_PERMISSOES, PERMISSOES_PADRAO } from '../../models/index.js'
import {
  Badge, Modal, ConfirmDelete, FormField,
  BtnPrimary, BtnSecondary, BtnIcon, CrudLabel, Avatar, SearchInput,
} from '../components/UI.jsx'

// ── helper: toggle switch ─────────────────────────────────────────────
function Switch({ checked, onChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? '#2563eb' : '#d1d5db', position: 'relative', transition: 'background .2s', flexShrink: 0,
        opacity: disabled ? .5 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%', background: '#fff',
        transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)',
      }} />
    </button>
  )
}

// ── Tab button ────────────────────────────────────────────────────────
function Tab({ id, label, icon: Icon, active, onClick }) {
  return (
    <button onClick={() => onClick(id)} style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '10px 16px', border: 'none', cursor: 'pointer',
      fontSize: 13, fontWeight: active ? 600 : 400,
      background: 'transparent',
      color: active ? '#2563eb' : '#6b7280',
      borderBottom: active ? '2px solid #2563eb' : '2px solid transparent',
      marginBottom: -2, transition: 'all .15s', whiteSpace: 'nowrap',
    }}>
      <Icon size={15} />
      {label}
    </button>
  )
}

// ════════════════════════════════════════════════════════════════════════
// ABA: MEU PERFIL
// ════════════════════════════════════════════════════════════════════════
function TabMeuPerfil({ user, onUserUpdate, onToast }) {
  const [form, setForm] = useState({ nome: user.nome, telefone: user.telefone || '', cargo: user.cargo || '', foto: user.foto || null })
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, foto: ev.target.result }))
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    setSaving(true)
    const r = await userCtrl.atualizarPerfil(user.id, form)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) onUserUpdate(r.data)
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        Atualize suas informações pessoais e foto de perfil.
      </p>

      {/* Foto */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
        <div style={{ position: 'relative' }}>
          {form.foto ? (
            <img src={form.foto} alt="Foto" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e5e7eb' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: '#1d4ed8', border: '3px solid #e5e7eb' }}>
              {(user.nome || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
            </div>
          )}
          <button
            onClick={() => fileRef.current.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#2563eb', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Camera size={13} style={{ color: '#fff' }} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFoto} />
        </div>
        <div>
          <p style={{ fontWeight: 600, fontSize: 15, color: '#1f2937' }}>{user.nome}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>{user.email}</p>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{user.perfil} · Membro desde {user.criadoEm}</p>
          {form.foto && (
            <button onClick={() => setForm(f => ({ ...f, foto: null }))} style={{ fontSize: 11, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', marginTop: 4, padding: 0 }}>
              Remover foto
            </button>
          )}
        </div>
      </div>

      {/* Campos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1/-1' }}>
          <FormField label="Nome completo *">
            <input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          </FormField>
        </div>
        <FormField label="Telefone">
          <input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(43) 99999-0000" />
        </FormField>
        <FormField label="Cargo">
          <input value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} placeholder="Ex: Vendedor" />
        </FormField>
      </div>

      {/* Campos somente-leitura */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4, marginBottom: 20 }}>
        {[['E-mail', user.email], ['Perfil de acesso', user.perfil]].map(([k, v]) => (
          <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 10, color: '#9ca3af', marginBottom: 2 }}>{k}</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>{v}</p>
            <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>Não editável aqui</p>
          </div>
        ))}
      </div>

      <BtnPrimary onClick={handleSave} disabled={saving} style={{ gap: 8 }}>
        <Save size={15} /> {saving ? 'Salvando...' : 'Salvar alterações'}
      </BtnPrimary>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// ABA: SEGURANÇA
// ════════════════════════════════════════════════════════════════════════
function TabSeguranca({ user, onToast }) {
  const [form, setForm] = useState({ atual: '', nova: '', confirma: '' })
  const [show, setShow] = useState({ atual: false, nova: false, confirma: false })
  const [saving, setSaving] = useState(false)

  async function handleSalvar() {
    if (form.nova !== form.confirma) { onToast('As senhas não coincidem.', 'err'); return }
    setSaving(true)
    const r = await userCtrl.atualizarPerfil(user.id, { nome: user.nome })
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) setForm({ atual: '', nova: '', confirma: '' })
    setSaving(false)
  }

  function PasswordField({ label, fkey }) {
    return (
      <FormField label={label}>
        <div style={{ position: 'relative' }}>
          <input
            type={show[fkey] ? 'text' : 'password'}
            value={form[fkey]}
            onChange={e => setForm(f => ({ ...f, [fkey]: e.target.value }))}
            placeholder="••••••••"
            style={{ paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={() => setShow(s => ({ ...s, [fkey]: !s[fkey] }))}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex' }}
          >
            {show[fkey] ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </FormField>
    )
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        Altere sua senha de acesso ao sistema. Use uma senha forte com pelo menos 6 caracteres.
      </p>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 36, height: 36, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={17} style={{ color: '#2563eb' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>Alterar senha</p>
            <p style={{ fontSize: 11, color: '#9ca3af' }}>Última alteração: não registrada</p>
          </div>
        </div>
        <PasswordField label="Senha atual *"    fkey="atual"    />
        <PasswordField label="Nova senha *"     fkey="nova"     />
        <PasswordField label="Confirmar senha *" fkey="confirma" />
        {form.nova && form.confirma && form.nova !== form.confirma && (
          <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>As senhas não coincidem.</p>
        )}
        {form.nova && form.nova.length < 6 && (
          <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 8 }}>Mínimo de 6 caracteres.</p>
        )}
        <BtnPrimary onClick={handleSalvar} disabled={saving || !form.atual || !form.nova || !form.confirma} style={{ marginTop: 4 }}>
          <Lock size={14} /> {saving ? 'Salvando...' : 'Alterar senha'}
        </BtnPrimary>
      </div>

      {/* Info de sessão */}
      <div style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #f3f4f6', padding: 16 }}>
        <p style={{ fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 12 }}>Sessão ativa</p>
        {[['Usuário', user.email], ['Perfil', user.perfil], ['Acesso', 'Agora']].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>{k}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// ABA: EMPRESA (somente Administrador)
// ════════════════════════════════════════════════════════════════════════
function TabEmpresa({ user, onToast }) {
  const isAdmin = user.perfil === 'Administrador'
  const [empresa, setEmpresa] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)
  const logoRef = useRef()

  useEffect(() => {
    carregarEmpresa()
  }, [])

  async function carregarEmpresa() {
    setLoading(true)
    const r = await empresaCtrl.buscar()
    if (r.ok) {
      setEmpresa(r.data)
      setForm(r.data)
    }
    setLoading(false)
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#d1d5db' }}>
        <Building2 size={48} style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>Acesso restrito</p>
        <p style={{ fontSize: 12, color: '#d1d5db', marginTop: 4 }}>Somente o Administrador pode acessar os dados da empresa.</p>
      </div>
    )
  }

  if (loading || !empresa) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#d1d5db' }}>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>Carregando dados da empresa...</p>
      </div>
    )
  }

  function handleLogoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setForm(f => ({ ...f, logo: ev.target.result }))
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    const r = await empresaCtrl.atualizar(form)
    if (r.ok) {
      setEmpresa(r.data)
      setEditing(false)
      onToast(r.msg, 'ok')
    } else {
      onToast(r.msg, 'err')
    }
  }

  const fields = [
    ['Nome da empresa', 'nome'], ['CNPJ', 'cnpj'],
    ['E-mail', 'email'], ['Telefone', 'telefone'],
    ['Endereço', 'endereco'],
  ]

  return (
    <div style={{ maxWidth: 600 }}>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
        Dados cadastrais da empresa. Visível e editável apenas pelo Administrador.
      </p>

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', padding: 16 }}>
        <div style={{ position: 'relative' }}>
          {(editing ? form.logo : empresa?.logo) ? (
            <img src={editing ? form.logo : empresa?.logo} alt="Logo" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', border: '2px solid #e5e7eb' }} />
          ) : (
            <div style={{ width: 72, height: 72, background: '#eff6ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #bfdbfe' }}>
              <Building2 size={28} style={{ color: '#93c5fd' }} />
            </div>
          )}
          {editing && (
            <button onClick={() => logoRef.current.click()} style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: '#2563eb', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Camera size={11} style={{ color: '#fff' }} />
            </button>
          )}
          <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>{empresa?.nome || 'N/A'}</p>
          <p style={{ fontSize: 12, color: '#6b7280' }}>{empresa?.cnpj || 'N/A'}</p>
          <span style={{ display: 'inline-block', marginTop: 6, background: '#dbeafe', color: '#1e40af', padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 500 }}>
            Plano {empresa?.plano || 'N/A'}
          </span>
        </div>
        {!editing && (
          <BtnSecondary onClick={() => { setForm({ ...(empresa || {}) }); setEditing(true) }}>
            <Edit2 size={13} style={{ marginRight: 5 }} /> Editar
          </BtnSecondary>
        )}
      </div>

      {/* Campos */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        {editing ? (
          <div style={{ padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {fields.map(([label, key]) => (
                <div key={key} style={{ gridColumn: key === 'endereco' ? '1/-1' : 'auto' }}>
                  <FormField label={label}>
                    <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                  </FormField>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <BtnSecondary onClick={() => setEditing(false)}>Cancelar</BtnSecondary>
              <BtnPrimary onClick={handleSave} style={{ gap: 7 }}><Save size={14} /> Salvar</BtnPrimary>
            </div>
          </div>
        ) : (
          fields.map(([label, key]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #f9fafb' }}>
              <span style={{ fontSize: 13, color: '#9ca3af' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{empresa?.[key] || '—'}</span>
            </div>
          ))
        )}
      </div>

      {/* Plano — só leitura */}
      {!editing && (
        <div style={{ marginTop: 14, background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe', padding: '14px 18px' }}>
          <p style={{ fontWeight: 600, fontSize: 13, color: '#1e40af', marginBottom: 4 }}>Plano atual: {empresa?.plano || 'N/A'}</p>
          <p style={{ fontSize: 12, color: '#3b82f6' }}>Para alterar o plano ou dados de faturamento, entre em contato com o suporte TetusManager.</p>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// ABA: GERENCIAR USUÁRIOS (somente Administrador)
// ════════════════════════════════════════════════════════════════════════
function TabUsuarios({ user, onToast }) {
  const isAdmin = user.perfil === 'Administrador'
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({})
  const [target,  setTarget]  = useState(null)
  const [lista,   setLista]   = useState([])
  const [loading, setLoading] = useState(false)
  const BLANK = { nome:'', email:'', perfil:'Vendedor', status:'Ativo', senha:'123456', telefone:'', cargo:'' }
  const F = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const close = () => { setModal(null); setTarget(null) }

  useEffect(() => {
    carregarUsuarios()
  }, [search])

  async function carregarUsuarios() {
    setLoading(true)
    const r = await userCtrl.listar(search)
    setLista(r.ok ? r.data : [])
    setLoading(false)
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#d1d5db' }}>
        <Users size={48} style={{ marginBottom: 12 }} />
        <p style={{ fontSize: 14, color: '#9ca3af', fontWeight: 500 }}>Acesso restrito</p>
        <p style={{ fontSize: 12, color: '#d1d5db', marginTop: 4 }}>Somente o Administrador pode gerenciar usuários.</p>
      </div>
    )
  }

  async function handleAdd() {
    const r = await userCtrl.criar(form)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) { await carregarUsuarios(); close() }
  }
  async function handleEdit() {
    const r = await userCtrl.atualizar(form.id, form)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) { await carregarUsuarios(); close() }
  }
  async function handleToggle(id) {
    const r = await userCtrl.toggleStatus(id)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) await carregarUsuarios()
  }
  async function handleDelete() {
    if (!target?.id) { onToast('Usuário não selecionado.', 'err'); return }
    const r = await userCtrl.excluir(target.id)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) { await carregarUsuarios(); close() }
  }
  async function handlePermUpdate(uid, key, val) {
    const r = await userCtrl.atualizarPermissoes(uid, { [key]: val })
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) await carregarUsuarios()
  }
  async function handlePermReset(uid) {
    const r = await userCtrl.resetarPermissoes(uid)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) await carregarUsuarios()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Gerencie usuários e suas permissões individuais.</p>
        <BtnPrimary onClick={() => { setForm(BLANK); setModal('add') }}>
          <Plus size={14} /> Novo Usuário <CrudLabel op="C" />
        </BtnPrimary>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Buscar usuário..." />

      {/* Tabela */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb' }}>
              {['Usuário', 'Perfil', 'Status', 'Ações'].map(h => (
                <th key={h} style={{ padding: '9px 14px', fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.04em', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lista.map(u => (
              <tr key={u.id} style={{ borderTop: '1px solid #f9fafb' }}>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {u.foto
                      ? <img src={u.foto} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                      : <Avatar name={u.nome} size={30} />
                    }
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{u.nome}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af' }}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151' }} className="hide-mobile">{u.perfil}</td>
                <td style={{ padding: '11px 14px' }}><Badge status={u.status} /></td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {/* Permissões */}
                    <button
                      title="Gerenciar permissões"
                      onClick={() => { setTarget(u); setModal('perm') }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 11, color: '#1d4ed8', fontWeight: 500 }}
                    >
                      <Shield size={13} /> Permissões
                    </button>
                    <BtnIcon title="Editar" onClick={() => { setForm({ ...u }); setModal('edit') }}><Edit2 size={13} /></BtnIcon>
                    <button
                      onClick={() => handleToggle(u.id)}
                      title={u.status === 'Ativo' ? 'Inativar usuário' : 'Ativar usuário'}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', border: '1px solid #e5e7eb', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 11, color: u.status === 'Ativo' ? '#92400e' : '#065f46', fontWeight: 500 }}
                    >
                      {u.status === 'Ativo' ? <UserX size={13} /> : <UserCheck size={13} />}
                      {u.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                    </button>
                    {u.id !== user.id && (
                      <BtnIcon title="Excluir" danger onClick={() => { setTarget(u); setModal('del') }}><Trash2 size={13} /></BtnIcon>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal ADD / EDIT */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Novo Usuário (CREATE)' : 'Editar Usuário (UPDATE)'} onClose={close}>
          <FormField label="Nome completo *">
            <input value={form.nome || ''} onChange={e => F('nome', e.target.value)} placeholder="Nome do usuário" />
          </FormField>
          <FormField label="E-mail *">
            <input type="email" value={form.email || ''} onChange={e => F('email', e.target.value)} placeholder="email@tetus.com" />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <FormField label="Telefone">
              <input value={form.telefone || ''} onChange={e => F('telefone', e.target.value)} placeholder="(43) 9xxxx-xxxx" />
            </FormField>
            <FormField label="Cargo">
              <input value={form.cargo || ''} onChange={e => F('cargo', e.target.value)} placeholder="Ex: Vendedor" />
            </FormField>
            <FormField label="Perfil">
              <select value={form.perfil || 'Vendedor'} onChange={e => F('perfil', e.target.value)}>
                {PERFIS_USUARIO.map(p => <option key={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select value={form.status || 'Ativo'} onChange={e => F('status', e.target.value)}>
                <option>Ativo</option><option>Inativo</option>
              </select>
            </FormField>
          </div>
          {modal === 'add' && (
            <FormField label="Senha inicial">
              <input type="password" value={form.senha || ''} onChange={e => F('senha', e.target.value)} placeholder="••••••••" />
            </FormField>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <BtnSecondary onClick={close}>Cancelar</BtnSecondary>
            <BtnPrimary onClick={modal === 'add' ? handleAdd : handleEdit} style={{ flex: 1, justifyContent: 'center' }}>
              {modal === 'add' ? 'Criar usuário' : 'Salvar alterações'}
            </BtnPrimary>
          </div>
        </Modal>
      )}

      {/* Modal PERMISSÕES */}
      {modal === 'perm' && target && (
        <Modal title={`Permissões — ${target?.nome || 'Usuário'}`} onClose={close}>
          {target?.perfil === 'Administrador' ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#6b7280', fontSize: 13 }}>
              <Shield size={32} style={{ color: '#d1d5db', marginBottom: 8 }} />
              <p>Administradores possuem acesso total e suas permissões não podem ser alteradas.</p>
            </div>
          ) : (
            <>
              <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#92400e', marginBottom: 16 }}>
                Perfil base: <strong>{target?.perfil || 'N/A'}</strong>. Você pode ajustar permissões individualmente.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(LABELS_PERMISSOES).map(([key, label]) => {
                  const val = target?.permissoes?.[key] ?? false
                  const padrao = (PERMISSOES_PADRAO[target?.perfil] || {})[key] ?? false
                  const changed = val !== padrao
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 8, background: changed ? '#fffbeb' : '#f9fafb', border: `1px solid ${changed ? '#fde68a' : '#f3f4f6'}` }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: '#1f2937' }}>{label}</p>
                        {changed && <p style={{ fontSize: 10, color: '#d97706' }}>Diferente do padrão do perfil</p>}
                      </div>
                      <Switch
                        checked={val}
                        onChange={v => { if (target?.id) { handlePermUpdate(target.id, key, v); if (target) setTarget(prev => ({ ...prev, permissoes: { ...prev.permissoes, [key]: v } })) } }}
                      />
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => { if (target?.id) { handlePermReset(target.id); close() } }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12, color: '#374151' }}
                >
                  <RefreshCw size={13} /> Resetar para padrão do perfil
                </button>
                <BtnPrimary onClick={close} style={{ flex: 1, justifyContent: 'center' }}>Concluir</BtnPrimary>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* Confirm DELETE */}
      {modal === 'del' && target && (
        <ConfirmDelete
          message={`Excluir permanentemente o usuário "${target?.nome || 'sem nome'}"?`}
          onConfirm={handleDelete}
          onCancel={close}
        />
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════
// PÁGINA PRINCIPAL — Configurações
// ════════════════════════════════════════════════════════════════════════
export default function ConfiguracoesPage({ user, onUserUpdate, onToast }) {
  const isAdmin = user.perfil === 'Administrador'
  const [tab, setTab] = useState('perfil')

  const tabs = [
    { id: 'perfil',   label: 'Meu Perfil',  icon: User      },
    { id: 'seguranca',label: 'Segurança',    icon: Lock      },
    { id: 'empresa',  label: 'Empresa',      icon: Building2 },
    { id: 'usuarios', label: 'Usuários',     icon: Users     },
  ]

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111827' }}>Configurações</h1>
        <p style={{ fontSize: 12, color: '#6b7280' }}>Gerencie seu perfil, segurança e preferências do sistema</p>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #f3f4f6', marginBottom: 24, overflowX: 'auto' }}>
        {tabs.map(t => (
          <Tab key={t.id} {...t} active={tab === t.id} onClick={setTab} />
        ))}
      </div>

      {/* Tab content */}
      {tab === 'perfil'    && <TabMeuPerfil user={user} onUserUpdate={onUserUpdate} onToast={onToast} />}
      {tab === 'seguranca' && <TabSeguranca user={user} onToast={onToast} />}
      {tab === 'empresa'   && <TabEmpresa   user={user} onToast={onToast} />}
      {tab === 'usuarios'  && <TabUsuarios  user={user} onToast={onToast} />}
    </div>
  )
}
