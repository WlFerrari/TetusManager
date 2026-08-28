import React, { useEffect, useRef, useState } from 'react'
import {
  Building2, Camera, Edit2, Eye, EyeOff, Lock, Plus, RefreshCw,
  Save, Shield, User, UserCheck, Users, UserX,
} from 'lucide-react'
import { empresaCtrl, userCtrl } from '../../controllers/index.js'
import {
  LABELS_PERMISSOES, PERFIL_LABELS, PERFIS_USUARIO, PERMISSOES_PADRAO,
} from '../../models/index.js'
import {
  Avatar, Badge, BtnIcon, BtnPrimary, BtnSecondary, FormField, Modal, SearchInput,
} from '../components/UI.jsx'
import {
  LIMITS, companyFieldErrors, passwordFieldErrors, prepareImageFile,
  profileFieldErrors, userFieldErrors,
} from '../../utils/validation.js'

function Switch({ checked, onChange, disabled=false }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      style={{
        width:40, height:22, borderRadius:11, border:'none', cursor:disabled ? 'not-allowed' : 'pointer',
        background:checked ? '#2563eb' : '#d1d5db', position:'relative', opacity:disabled ? .5 : 1,
      }}
      aria-pressed={checked}
    >
      <span style={{ position:'absolute', top:3, left:checked ? 21 : 3, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .2s' }}/>
    </button>
  )
}

function Tab({ id, label, Icon, active, onClick }) {
  return (
    <button onClick={() => onClick(id)} style={{
      display:'flex', alignItems:'center', gap:7, padding:'10px 16px', border:'none', cursor:'pointer',
      fontSize:13, fontWeight:active ? 600 : 400, background:'transparent',
      color:active ? '#2563eb' : '#6b7280', borderBottom:active ? '2px solid #2563eb' : '2px solid transparent',
      marginBottom:-2, whiteSpace:'nowrap',
    }}><Icon size={15}/>{label}</button>
  )
}

function PasswordInputField({ label, field, value, visible, error, onChange, onBlur, onToggle }) {
  return (
    <FormField label={label} error={error}>
      <div style={{ position:'relative' }}>
        <input
          maxLength={72}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          style={{ paddingRight:40 }}
          autoComplete={field === 'atual' ? 'current-password' : 'new-password'}
        />
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={onToggle}
          style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'#9ca3af' }}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff size={15}/> : <Eye size={15}/>} 
        </button>
      </div>
    </FormField>
  )
}

function TabMeuPerfil({ user, onUserUpdate, onToast }) {
  const [form, setForm] = useState({ nome:user.nome, telefone:user.telefone || '', cargo:user.cargo || '', foto:user.foto || null })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const fileRef = useRef()

  const F = (key, value) => {
    setErro('')
    setFieldErrors(errors => ({ ...errors, [key]:null }))
    setForm(current => ({ ...current, [key]:value }))
  }

  function validateField(key) {
    const errors = profileFieldErrors(form)
    setFieldErrors(current => ({ ...current, [key]:errors[key] || null }))
  }

  async function handleFoto(e) {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return
    const result = await prepareImageFile(file)
    input.value = ''
    if (!result.ok) {
      setFieldErrors(errors => ({ ...errors, foto:result.msg }))
      return
    }
    F('foto', result.data)
  }

  async function handleSave() {
    const errors = profileFieldErrors(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setErro('Revise os campos destacados antes de salvar.')
      return
    }
    setSaving(true)
    setErro('')
    const r = await userCtrl.atualizarPerfil(user.id, form)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) onUserUpdate(r.data)
    else setErro(r.msg)
    setSaving(false)
  }

  return (
    <div style={{ maxWidth:560 }}>
      <p style={{ fontSize:14, color:'#6b7280', marginBottom:24 }}>Atualize suas informações pessoais e foto de perfil.</p>
      {erro && <p style={{ color:'#dc2626', fontSize:12, marginBottom:12 }}>{erro}</p>}
      <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:28 }}>
        <div style={{ position:'relative' }}>
          {form.foto
            ? <img src={form.foto} alt="Foto" style={{ width:80, height:80, borderRadius:'50%', objectFit:'cover', border:'3px solid #e5e7eb' }}/>
            : <Avatar name={user.nome} size={80}/>
          }
          <button onClick={() => fileRef.current?.click()} style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background:'#2563eb', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center' }} aria-label="Selecionar foto">
            <Camera size={13} style={{ color:'#fff' }}/>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={handleFoto}/>
        </div>
        <div>
          <p style={{ fontWeight:600, fontSize:15, color:'#1f2937' }}>{user.nome}</p>
          <p style={{ fontSize:12, color:'#6b7280' }}>{user.email}</p>
          <p style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{PERFIL_LABELS[user.perfil] || user.perfil} · Membro desde {user.criadoEm}</p>
          {form.foto && <button type="button" onClick={() => F('foto', null)} style={{ border:'none', background:'transparent', color:'#dc2626', padding:0, marginTop:5, fontSize:11 }}>Remover foto</button>}
        </div>
      </div>
      {fieldErrors.foto && <p className="field-error" style={{ marginBottom:12 }}>{fieldErrors.foto}</p>}

      <FormField label="Nome completo *" error={fieldErrors.nome}><input maxLength={LIMITS.nome} value={form.nome} onChange={e => F('nome',e.target.value)} onBlur={() => validateField('nome')}/></FormField>
      <div className="form-grid-2">
        <FormField label="Telefone" error={fieldErrors.telefone}><input maxLength={LIMITS.telefone} value={form.telefone} onChange={e => F('telefone',e.target.value)} onBlur={() => validateField('telefone')}/></FormField>
        <FormField label="Cargo" error={fieldErrors.cargo}><input maxLength={LIMITS.cargo} value={form.cargo} onChange={e => F('cargo',e.target.value)} onBlur={() => validateField('cargo')}/></FormField>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
        {[
          ['E-mail', user.email], ['Perfil de acesso', PERFIL_LABELS[user.perfil] || user.perfil],
        ].map(([k,v]) => (
          <div key={k} style={{ background:'#f9fafb', borderRadius:8, padding:'10px 14px' }}>
            <p style={{ fontSize:10, color:'#9ca3af' }}>{k}</p>
            <p style={{ fontSize:13, fontWeight:500, color:'#374151' }}>{v}</p>
            <p style={{ fontSize:10, color:'#9ca3af' }}>Não editável aqui</p>
          </div>
        ))}
      </div>
      <BtnPrimary onClick={handleSave} disabled={saving}><Save size={15}/>{saving ? 'Salvando...' : 'Salvar alterações'}</BtnPrimary>
    </div>
  )
}

function TabSeguranca({ user, onToast }) {
  const [form, setForm] = useState({ atual:'', nova:'', confirma:'' })
  const [show, setShow] = useState({ atual:false, nova:false, confirma:false })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const F = (key, value) => {
    setErro('')
    setFieldErrors(errors => ({ ...errors, [key]:null }))
    setForm(current => ({ ...current, [key]:value }))
  }

  function validateField(key) {
    const errors = passwordFieldErrors(form)
    setFieldErrors(current => ({ ...current, [key]:errors[key] || null }))
  }

  async function handleSalvar() {
    const errors = passwordFieldErrors(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setErro('Revise os campos destacados antes de alterar a senha.')
      return
    }

    setSaving(true)
    setErro('')
    const r = await userCtrl.alterarSenha(form.atual, form.nova)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) {
      setForm({ atual:'', nova:'', confirma:'' })
      setFieldErrors({})
    } else setErro(r.msg)
    setSaving(false)
  }

  return (
    <div style={{ maxWidth:420 }}>
      <p style={{ fontSize:14, color:'#6b7280', marginBottom:24 }}>Altere sua senha de acesso. A senha atual é validada no servidor.</p>
      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #f3f4f6', padding:20, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}><Lock size={18} style={{ color:'#2563eb' }}/><strong>Alterar senha</strong></div>
        {erro && <p style={{ color:'#dc2626', fontSize:12, marginBottom:10 }}>{erro}</p>}
        <PasswordInputField
          label="Senha atual *"
          field="atual"
          value={form.atual}
          visible={show.atual}
          error={fieldErrors.atual}
          onChange={value => F('atual', value)}
          onBlur={() => validateField('atual')}
          onToggle={() => setShow(current => ({ ...current, atual:!current.atual }))}
        />
        <PasswordInputField
          label="Nova senha *"
          field="nova"
          value={form.nova}
          visible={show.nova}
          error={fieldErrors.nova}
          onChange={value => F('nova', value)}
          onBlur={() => validateField('nova')}
          onToggle={() => setShow(current => ({ ...current, nova:!current.nova }))}
        />
        <PasswordInputField
          label="Confirmar senha *"
          field="confirma"
          value={form.confirma}
          visible={show.confirma}
          error={fieldErrors.confirma}
          onChange={value => F('confirma', value)}
          onBlur={() => validateField('confirma')}
          onToggle={() => setShow(current => ({ ...current, confirma:!current.confirma }))}
        />
        <BtnPrimary onClick={handleSalvar} disabled={saving}><Lock size={14}/>{saving ? 'Salvando...' : 'Alterar senha'}</BtnPrimary>
      </div>
      <div style={{ background:'#f9fafb', borderRadius:12, padding:16 }}>
        <p style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Sessão ativa</p>
        <p style={{ fontSize:12 }}>Usuário: {user.email}</p>
        <p style={{ fontSize:12 }}>Perfil: {PERFIL_LABELS[user.perfil] || user.perfil}</p>
      </div>
    </div>
  )
}

function TabEmpresa({ user, onToast }) {
  const isAdmin = user.perfil === 'Administrador'
  const [empresa, setEmpresa] = useState(null)
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(false)
  const [erro, setErro] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  useEffect(() => { carregar() }, [])

  async function carregar() {
    const r = await empresaCtrl.buscar()
    if (r.ok) { setEmpresa(r.data); setForm(r.data) }
    else setErro(r.msg)
  }

  const F = (key, value) => {
    setErro('')
    setFieldErrors(errors => ({ ...errors, [key]:null }))
    setForm(current => ({ ...current, [key]:value }))
  }

  function validateField(key) {
    const errors = companyFieldErrors(form)
    setFieldErrors(current => ({ ...current, [key]:errors[key] || null }))
  }

  if (!isAdmin) return <p style={{ color:'#9ca3af' }}>Somente o Administrador pode acessar os dados da empresa.</p>
  if (!empresa) return <p style={{ color:'#9ca3af' }}>{erro || 'Carregando...'}</p>

  async function salvar() {
    const errors = companyFieldErrors(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setErro('Revise os campos destacados antes de salvar.')
      return
    }
    setErro('')
    const r = await empresaCtrl.atualizar(form)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) { setEmpresa(r.data); setEditing(false); setFieldErrors({}) }
    else setErro(r.msg)
  }

  const fields = [
    ['Nome','nome',LIMITS.nome,'text'],
    ['CNPJ','cnpj',20,'text'],
    ['E-mail','email',160,'email'],
    ['Telefone','telefone',LIMITS.telefone,'text'],
    ['Endereço','endereco',LIMITS.endereco,'text'],
  ]

  return (
    <div style={{ maxWidth:600 }}>
      <p style={{ fontSize:14, color:'#6b7280', marginBottom:20 }}>Dados cadastrais visíveis e editáveis pelo Administrador.</p>
      {!editing && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', border:'1px solid #f3f4f6', borderRadius:12, padding:18, marginBottom:14 }}>
          <div><strong>{empresa.nome}</strong><p style={{ fontSize:12, color:'#6b7280' }}>{empresa.cnpj}</p></div>
          <BtnSecondary onClick={() => { setForm({ ...empresa }); setErro(''); setFieldErrors({}); setEditing(true) }}><Edit2 size={13}/> Editar</BtnSecondary>
        </div>
      )}
      {editing ? (
        <div style={{ background:'#fff', border:'1px solid #f3f4f6', borderRadius:12, padding:18 }}>
          {erro && <p style={{ color:'#dc2626', fontSize:12, marginBottom:10 }}>{erro}</p>}
          {fields.map(([label,key,max,type]) => (
            <FormField key={key} label={label} error={fieldErrors[key]}>
              <input type={type} maxLength={max} value={form[key] || ''} onChange={e => F(key,e.target.value)} onBlur={() => validateField(key)}/>
            </FormField>
          ))}
          <div style={{ display:'flex', gap:8 }}><BtnSecondary onClick={() => { setEditing(false); setErro(''); setFieldErrors({}) }}>Cancelar</BtnSecondary><BtnPrimary onClick={salvar}><Save size={14}/> Salvar</BtnPrimary></div>
        </div>
      ) : fields.map(([label,key]) => (
        <div key={key} style={{ display:'flex', justifyContent:'space-between', padding:'11px 16px', background:'#fff', borderBottom:'1px solid #f3f4f6' }}>
          <span style={{ color:'#9ca3af', fontSize:12 }}>{label}</span><span style={{ fontSize:13 }}>{empresa[key] || '—'}</span>
        </div>
      ))}
    </div>
  )
}

function TabUsuarios({ user, onToast }) {
  const isAdmin = user.perfil === 'Administrador'
  const [search, setSearch] = useState('')
  const [lista, setLista] = useState([])
  const [modal, setModal] = useState(null)
  const [target, setTarget] = useState(null)
  const [form, setForm] = useState({})
  const [erro, setErro] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const BLANK = { nome:'', email:'', perfil:'Vendedor', status:'Ativo', senha:'123456', telefone:'', cargo:'' }

  useEffect(() => { if (isAdmin) carregar() }, [search, isAdmin])

  async function carregar() {
    const r = await userCtrl.listar(search)
    setLista(r.ok ? r.data : [])
    if (!r.ok && r.msg) onToast(r.msg, 'err')
  }

  const F = (key, value) => {
    setErro('')
    setFieldErrors(errors => ({ ...errors, [key]:null }))
    setForm(current => ({ ...current, [key]:value }))
  }
  const close = () => { setModal(null); setTarget(null); setErro(''); setFieldErrors({}) }

  function validateField(key, requirePassword=false) {
    const errors = userFieldErrors(form, { requirePassword })
    setFieldErrors(current => ({ ...current, [key]:errors[key] || null }))
  }

  if (!isAdmin) return <p style={{ color:'#9ca3af' }}>Somente o Administrador pode gerenciar usuários.</p>

  async function submit(mode) {
    const requirePassword = mode === 'add'
    const errors = userFieldErrors(form, { requirePassword })
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setErro('Revise os campos destacados antes de continuar.')
      return
    }
    const r = mode === 'add' ? await userCtrl.criar(form) : await userCtrl.atualizar(form.id, form)
    onToast(r.msg, r.ok ? 'ok':'err')
    if (r.ok) { await carregar(); close() } else setErro(r.msg)
  }

  async function toggle(id) {
    const r = await userCtrl.toggleStatus(id)
    onToast(r.msg, r.ok ? 'ok':'err')
    if (r.ok) await carregar()
  }

  async function perm(uid,key,val) {
    const r = await userCtrl.atualizarPermissoes(uid,{ [key]:val })
    onToast(r.msg, r.ok ? 'ok':'err')
    if (r.ok) { setTarget(t => ({ ...t, permissoes:{ ...t.permissoes, [key]:val } })); await carregar() }
  }

  async function reset(uid) {
    const r = await userCtrl.resetarPermissoes(uid)
    onToast(r.msg, r.ok ? 'ok':'err')
    if (r.ok) { await carregar(); close() }
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <p style={{ fontSize:13, color:'#6b7280' }}>Gerencie contas por ativação/inativação lógica e permissões.</p>
        <BtnPrimary onClick={() => { setForm({ ...BLANK }); setErro(''); setFieldErrors({}); setModal('add') }}><Plus size={14}/> Novo Usuário</BtnPrimary>
      </div>
      <SearchInput value={search} onChange={v => setSearch(v.slice(0,120))} placeholder="Buscar usuário..."/>
      <div className="table-scroll" style={{ background:'#fff', borderRadius:12, border:'1px solid #f3f4f6', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:650 }}>
          <thead><tr style={{ background:'#f9fafb' }}>{['Usuário','Perfil','Status','Ações'].map(h => <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, color:'#9ca3af' }}>{h}</th>)}</tr></thead>
          <tbody>{lista.map(u => (
            <tr key={u.id} style={{ borderTop:'1px solid #f3f4f6' }}>
              <td style={{ padding:'11px 14px' }}><div style={{ display:'flex', gap:9, alignItems:'center' }}><Avatar name={u.nome} size={30}/><div><p style={{ fontSize:13, fontWeight:500 }}>{u.nome}</p><p style={{ fontSize:11, color:'#9ca3af' }}>{u.email}</p></div></div></td>
              <td style={{ padding:'11px 14px', fontSize:12 }}>{PERFIL_LABELS[u.perfil] || u.perfil}</td>
              <td style={{ padding:'11px 14px' }}><Badge status={u.status}/></td>
              <td style={{ padding:'11px 14px' }}><div style={{ display:'flex', gap:5 }}>
                <BtnIcon title="Permissões" onClick={() => { setTarget(u); setModal('perm') }}><Shield size={13}/></BtnIcon>
                <BtnIcon title="Editar" onClick={() => { setForm({ ...u }); setErro(''); setFieldErrors({}); setModal('edit') }}><Edit2 size={13}/></BtnIcon>
                <button onClick={() => toggle(u.id)} style={{ border:'1px solid #e5e7eb', borderRadius:6, background:'#fff', padding:'5px 9px', fontSize:11 }}>
                  {u.status === 'Ativo' ? <><UserX size={13}/> Inativar</> : <><UserCheck size={13}/> Ativar</>}
                </button>
              </div></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Novo Usuário' : 'Editar Usuário'} onClose={close}>
          {erro && <p style={{ color:'#dc2626', fontSize:12, marginBottom:10 }}>{erro}</p>}
          <FormField label="Nome completo *" error={fieldErrors.nome}><input maxLength={LIMITS.nome} value={form.nome || ''} onChange={e => F('nome',e.target.value)} onBlur={() => validateField('nome', modal === 'add')}/></FormField>
          <FormField label="E-mail *" error={fieldErrors.email}><input type="email" maxLength={160} value={form.email || ''} onChange={e => F('email',e.target.value)} onBlur={() => validateField('email', modal === 'add')}/></FormField>
          <div className="form-grid-2">
            <FormField label="Telefone" error={fieldErrors.telefone}><input maxLength={LIMITS.telefone} value={form.telefone || ''} onChange={e => F('telefone',e.target.value)} onBlur={() => validateField('telefone', modal === 'add')}/></FormField>
            <FormField label="Cargo" error={fieldErrors.cargo}><input maxLength={LIMITS.cargo} value={form.cargo || ''} onChange={e => F('cargo',e.target.value)} onBlur={() => validateField('cargo', modal === 'add')}/></FormField>
            <FormField label="Perfil" error={fieldErrors.perfil}><select value={form.perfil || 'Vendedor'} onChange={e => F('perfil',e.target.value)}>{PERFIS_USUARIO.map(p => <option key={p} value={p}>{PERFIL_LABELS[p] || p}</option>)}</select></FormField>
            <FormField label="Status" error={fieldErrors.status}><select value={form.status || 'Ativo'} onChange={e => F('status',e.target.value)}><option>Ativo</option><option>Inativo</option></select></FormField>
          </div>
          {modal === 'add' && <FormField label="Senha inicial *" error={fieldErrors.senha}><input type="password" minLength={6} maxLength={72} value={form.senha || ''} onChange={e => F('senha',e.target.value)} onBlur={() => validateField('senha', true)}/></FormField>}
          <div style={{ display:'flex', gap:8 }}><BtnSecondary onClick={close}>Cancelar</BtnSecondary><BtnPrimary onClick={() => submit(modal)} style={{ flex:1, justifyContent:'center' }}>{modal === 'add' ? 'Criar usuário' : 'Salvar alterações'}</BtnPrimary></div>
        </Modal>
      )}

      {modal === 'perm' && target && (
        <Modal title={`Permissões — ${target.nome}`} onClose={close}>
          {target.perfil === 'Administrador' ? <p>Administradores possuem acesso total.</p> : (
            <>
              {Object.entries(LABELS_PERMISSOES).map(([key,label]) => {
                const val = target.permissoes?.[key] ?? false
                const padrao = (PERMISSOES_PADRAO[target.perfil] || {})[key] ?? false
                return <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', borderBottom:'1px solid #f3f4f6' }}><div><p style={{ fontSize:13 }}>{label}</p>{val !== padrao && <p style={{ fontSize:10, color:'#d97706' }}>Diferente do padrão</p>}</div><Switch checked={val} onChange={v => perm(target.id,key,v)}/></div>
              })}
              <div style={{ display:'flex', gap:8, marginTop:14 }}><BtnSecondary onClick={() => reset(target.id)}><RefreshCw size={13}/> Resetar</BtnSecondary><BtnPrimary onClick={close}>Concluir</BtnPrimary></div>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}

export default function ConfiguracoesPage({ user, onUserUpdate, onToast }) {
  const [tab, setTab] = useState('perfil')
  const tabs = [
    { id:'perfil', label:'Meu Perfil', Icon:User },
    { id:'seguranca', label:'Segurança', Icon:Lock },
    ...(user.perfil === 'Administrador' ? [
      { id:'empresa', label:'Empresa', Icon:Building2 },
      { id:'usuarios', label:'Usuários', Icon:Users },
    ] : []),
  ]

  return (
    <div>
      <div style={{ marginBottom:20 }}><h1 style={{ fontSize:18, fontWeight:700 }}>Configurações</h1><p style={{ fontSize:12, color:'#6b7280' }}>Gerencie perfil, segurança e preferências do sistema</p></div>
      <div style={{ display:'flex', borderBottom:'2px solid #f3f4f6', marginBottom:24, overflowX:'auto' }}>
        {tabs.map(t => <Tab key={t.id} {...t} active={tab === t.id} onClick={setTab}/>) }
      </div>
      {tab === 'perfil' && <TabMeuPerfil user={user} onUserUpdate={onUserUpdate} onToast={onToast}/>} 
      {tab === 'seguranca' && <TabSeguranca user={user} onToast={onToast}/>} 
      {tab === 'empresa' && user.perfil === 'Administrador' && <TabEmpresa user={user} onToast={onToast}/>} 
      {tab === 'usuarios' && user.perfil === 'Administrador' && <TabUsuarios user={user} onToast={onToast}/>} 
    </div>
  )
}
