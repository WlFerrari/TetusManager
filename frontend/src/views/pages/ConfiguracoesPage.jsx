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
  LIMITS, password, prepareImageFile, validateCompany, validateProfile, validateUser,
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

function TabMeuPerfil({ user, onUserUpdate, onToast }) {
  const [form, setForm] = useState({ nome:user.nome, telefone:user.telefone || '', cargo:user.cargo || '', foto:user.foto || null })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const fileRef = useRef()

  async function handleFoto(e) {
    const input = e.target
    const file = input.files?.[0]
    if (!file) return
    const result = await prepareImageFile(file)
    input.value = ''
    if (!result.ok) return setErro(result.msg)
    setErro('')
    setForm(f => ({ ...f, foto:result.data }))
  }

  async function handleSave() {
    const invalid = validateProfile(form)
    if (invalid) return setErro(invalid)
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
          <button onClick={() => fileRef.current?.click()} style={{ position:'absolute', bottom:0, right:0, width:26, height:26, borderRadius:'50%', background:'#2563eb', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <Camera size={13} style={{ color:'#fff' }}/>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display:'none' }} onChange={handleFoto}/>
        </div>
        <div>
          <p style={{ fontWeight:600, fontSize:15, color:'#1f2937' }}>{user.nome}</p>
          <p style={{ fontSize:12, color:'#6b7280' }}>{user.email}</p>
          <p style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{PERFIL_LABELS[user.perfil] || user.perfil} · Membro desde {user.criadoEm}</p>
          {form.foto && <button type="button" onClick={() => setForm(f => ({ ...f, foto:null }))} style={{ border:'none', background:'transparent', color:'#dc2626', padding:0, marginTop:5, cursor:'pointer', fontSize:11 }}>Remover foto</button>}
        </div>
      </div>

      <FormField label="Nome completo *"><input maxLength={LIMITS.nome} value={form.nome} onChange={e => { setErro(''); setForm(f => ({ ...f, nome:e.target.value })) }}/></FormField>
      <div className="form-grid-2">
        <FormField label="Telefone"><input maxLength={LIMITS.telefone} value={form.telefone} onChange={e => { setErro(''); setForm(f => ({ ...f, telefone:e.target.value })) }}/></FormField>
        <FormField label="Cargo"><input maxLength={LIMITS.cargo} value={form.cargo} onChange={e => { setErro(''); setForm(f => ({ ...f, cargo:e.target.value })) }}/></FormField>
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

  async function handleSalvar() {
    const currentInvalid = password(form.atual, 'Senha atual')
    if (currentInvalid) return setErro(currentInvalid)
    const newInvalid = password(form.nova, 'Nova senha')
    if (newInvalid) return setErro(newInvalid)
    if (form.nova !== form.confirma) return setErro('As senhas não coincidem.')
    if (form.nova === form.atual) return setErro('A nova senha deve ser diferente da senha atual.')

    setSaving(true)
    setErro('')
    const r = await userCtrl.alterarSenha(form.atual, form.nova)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) setForm({ atual:'', nova:'', confirma:'' })
    else setErro(r.msg)
    setSaving(false)
  }

  function PasswordField({ label, fkey }) {
    return (
      <FormField label={label}>
        <div style={{ position:'relative' }}>
          <input maxLength={72} type={show[fkey] ? 'text' : 'password'} value={form[fkey]} onChange={e => { setErro(''); setForm(f => ({ ...f, [fkey]:e.target.value })) }} style={{ paddingRight:40 }}/>
          <button type="button" onClick={() => setShow(s => ({ ...s, [fkey]:!s[fkey] }))} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9ca3af' }}>
            {show[fkey] ? <EyeOff size={15}/> : <Eye size={15}/>} 
          </button>
        </div>
      </FormField>
    )
  }

  return (
    <div style={{ maxWidth:420 }}>
      <p style={{ fontSize:14, color:'#6b7280', marginBottom:24 }}>Altere sua senha de acesso. A senha atual é validada no backend.</p>
      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #f3f4f6', padding:20, marginBottom:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}><Lock size={18} style={{ color:'#2563eb' }}/><strong>Alterar senha</strong></div>
        {erro && <p style={{ color:'#dc2626', fontSize:12, marginBottom:10 }}>{erro}</p>}
        <PasswordField label="Senha atual *" fkey="atual"/>
        <PasswordField label="Nova senha *" fkey="nova"/>
        <PasswordField label="Confirmar senha *" fkey="confirma"/>
        <BtnPrimary onClick={handleSalvar} disabled={saving || !form.atual || !form.nova || !form.confirma}><Lock size={14}/>{saving ? 'Salvando...' : 'Alterar senha'}</BtnPrimary>
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

  useEffect(() => { carregar() }, [])
  async function carregar() {
    const r = await empresaCtrl.buscar()
    if (r.ok) { setEmpresa(r.data); setForm(r.data) }
  }

  if (!isAdmin) return <p style={{ color:'#9ca3af' }}>Somente o Administrador pode acessar os dados da empresa.</p>
  if (!empresa) return <p style={{ color:'#9ca3af' }}>Carregando...</p>

  async function salvar() {
    const invalid = validateCompany(form)
    if (invalid) return setErro(invalid)
    setErro('')
    const r = await empresaCtrl.atualizar(form)
    onToast(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) { setEmpresa(r.data); setEditing(false) }
    else setErro(r.msg)
  }

  const fields = [['Nome','nome',LIMITS.nome],['CNPJ','cnpj',20],['E-mail','email',160],['Telefone','telefone',LIMITS.telefone],['Endereço','endereco',LIMITS.endereco]]
  return (
    <div style={{ maxWidth:600 }}>
      <p style={{ fontSize:14, color:'#6b7280', marginBottom:20 }}>Dados cadastrais visíveis e editáveis pelo Administrador.</p>
      {!editing && (
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:'#fff', border:'1px solid #f3f4f6', borderRadius:12, padding:18, marginBottom:14 }}>
          <div><strong>{empresa.nome}</strong><p style={{ fontSize:12, color:'#6b7280' }}>{empresa.cnpj}</p></div>
          <BtnSecondary onClick={() => { setForm({ ...empresa }); setErro(''); setEditing(true) }}><Edit2 size={13}/> Editar</BtnSecondary>
        </div>
      )}
      {editing ? (
        <div style={{ background:'#fff', border:'1px solid #f3f4f6', borderRadius:12, padding:18 }}>
          {erro && <p style={{ color:'#dc2626', fontSize:12, marginBottom:10 }}>{erro}</p>}
          {fields.map(([label,key,max]) => <FormField key={key} label={label}><input type={key === 'email' ? 'email' : 'text'} maxLength={max} value={form[key] || ''} onChange={e => { setErro(''); setForm(f => ({ ...f, [key]:e.target.value })) }}/></FormField>)}
          <div style={{ display:'flex', gap:8 }}><BtnSecondary onClick={() => { setEditing(false); setErro('') }}>Cancelar</BtnSecondary><BtnPrimary onClick={salvar}><Save size={14}/> Salvar</BtnPrimary></div>
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
  const BLANK = { nome:'', email:'', perfil:'Vendedor', status:'Ativo', senha:'123456', telefone:'', cargo:'' }

  useEffect(() => { if (isAdmin) carregar() }, [search, isAdmin])
  async function carregar() {
    const r = await userCtrl.listar(search)
    setLista(r.ok ? r.data : [])
    if (!r.ok && r.msg) onToast(r.msg, 'err')
  }
  const F = (k,v) => { setErro(''); setForm(f => ({ ...f, [k]:v })) }
  const close = () => { setModal(null); setTarget(null); setErro('') }

  if (!isAdmin) return <p style={{ color:'#9ca3af' }}>Somente o Administrador pode gerenciar usuários.</p>

  async function add() {
    const invalid = validateUser(form, { requirePassword:true })
    if (invalid) return setErro(invalid)
    const r = await userCtrl.criar(form)
    onToast(r.msg, r.ok ? 'ok':'err')
    if (r.ok) { await carregar(); close() } else setErro(r.msg)
  }
  async function edit() {
    const invalid = validateUser(form)
    if (invalid) return setErro(invalid)
    const r = await userCtrl.atualizar(form.id, form)
    onToast(r.msg, r.ok ? 'ok':'err')
    if (r.ok) { await carregar(); close() } else setErro(r.msg)
  }
  async function toggle(id) {
    const r = await userCtrl.toggleStatus(id); onToast(r.msg, r.ok ? 'ok':'err')
    if (r.ok) await carregar()
  }
  async function perm(uid,key,val) {
    const r = await userCtrl.atualizarPermissoes(uid,{ [key]:val }); onToast(r.msg, r.ok ? 'ok':'err')
    if (r.ok) { setTarget(t => ({ ...t, permissoes:{ ...t.permissoes, [key]:val } })); await carregar() }
  }
  async function reset(uid) {
    const r = await userCtrl.resetarPermissoes(uid); onToast(r.msg, r.ok ? 'ok':'err')
    if (r.ok) { await carregar(); close() }
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <p style={{ fontSize:13, color:'#6b7280' }}>Gerencie contas por ativação/inativação lógica e permissões.</p>
        <BtnPrimary onClick={() => { setForm({ ...BLANK }); setErro(''); setModal('add') }}><Plus size={14}/> Novo Usuário</BtnPrimary>
      </div>
      <SearchInput value={search} onChange={v => setSearch(v.slice(0,120))} placeholder="Buscar usuário..."/>
      <div style={{ background:'#fff', borderRadius:12, border:'1px solid #f3f4f6', overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ background:'#f9fafb' }}>{['Usuário','Perfil','Status','Ações'].map(h => <th key={h} style={{ padding:'9px 14px', textAlign:'left', fontSize:11, color:'#9ca3af' }}>{h}</th>)}</tr></thead>
          <tbody>{lista.map(u => (
            <tr key={u.id} style={{ borderTop:'1px solid #f3f4f6' }}>
              <td style={{ padding:'11px 14px' }}><div style={{ display:'flex', gap:9, alignItems:'center' }}><Avatar name={u.nome} size={30}/><div><p style={{ fontSize:13, fontWeight:500 }}>{u.nome}</p><p style={{ fontSize:11, color:'#9ca3af' }}>{u.email}</p></div></div></td>
              <td style={{ padding:'11px 14px', fontSize:12 }}>{PERFIL_LABELS[u.perfil] || u.perfil}</td>
              <td style={{ padding:'11px 14px' }}><Badge status={u.status}/></td>
              <td style={{ padding:'11px 14px' }}><div style={{ display:'flex', gap:5 }}>
                <BtnIcon title="Permissões" onClick={() => { setTarget(u); setModal('perm') }}><Shield size={13}/></BtnIcon>
                <BtnIcon title="Editar" onClick={() => { setForm({ ...u }); setErro(''); setModal('edit') }}><Edit2 size={13}/></BtnIcon>
                <button onClick={() => toggle(u.id)} style={{ border:'1px solid #e5e7eb', borderRadius:6, background:'#fff', cursor:'pointer', padding:'5px 9px', fontSize:11 }}>
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
          <FormField label="Nome completo *"><input maxLength={LIMITS.nome} value={form.nome || ''} onChange={e => F('nome',e.target.value)}/></FormField>
          <FormField label="E-mail *"><input type="email" maxLength={160} value={form.email || ''} onChange={e => F('email',e.target.value)}/></FormField>
          <div className="form-grid-2">
            <FormField label="Telefone"><input maxLength={LIMITS.telefone} value={form.telefone || ''} onChange={e => F('telefone',e.target.value)}/></FormField>
            <FormField label="Cargo"><input maxLength={LIMITS.cargo} value={form.cargo || ''} onChange={e => F('cargo',e.target.value)}/></FormField>
            <FormField label="Perfil"><select value={form.perfil || 'Vendedor'} onChange={e => F('perfil',e.target.value)}>{PERFIS_USUARIO.map(p => <option key={p} value={p}>{PERFIL_LABELS[p] || p}</option>)}</select></FormField>
            <FormField label="Status"><select value={form.status || 'Ativo'} onChange={e => F('status',e.target.value)}><option>Ativo</option><option>Inativo</option></select></FormField>
          </div>
          {modal === 'add' && <FormField label="Senha inicial *"><input type="password" minLength={6} maxLength={72} value={form.senha || ''} onChange={e => F('senha',e.target.value)}/></FormField>}
          <div style={{ display:'flex', gap:8 }}><BtnSecondary onClick={close}>Cancelar</BtnSecondary><BtnPrimary onClick={modal === 'add' ? add : edit} style={{ flex:1, justifyContent:'center' }}>{modal === 'add' ? 'Criar usuário' : 'Salvar alterações'}</BtnPrimary></div>
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
    { id:'empresa', label:'Empresa', Icon:Building2 },
    { id:'usuarios', label:'Usuários', Icon:Users },
  ]

  return (
    <div>
      <div style={{ marginBottom:20 }}><h1 style={{ fontSize:18, fontWeight:700 }}>Configurações</h1><p style={{ fontSize:12, color:'#6b7280' }}>Gerencie perfil, segurança e preferências do sistema</p></div>
      <div style={{ display:'flex', borderBottom:'2px solid #f3f4f6', marginBottom:24, overflowX:'auto' }}>
        {tabs.map(t => <Tab key={t.id} {...t} active={tab === t.id} onClick={setTab}/>) }
      </div>
      {tab === 'perfil' && <TabMeuPerfil user={user} onUserUpdate={onUserUpdate} onToast={onToast}/>} 
      {tab === 'seguranca' && <TabSeguranca user={user} onToast={onToast}/>} 
      {tab === 'empresa' && <TabEmpresa user={user} onToast={onToast}/>} 
      {tab === 'usuarios' && <TabUsuarios user={user} onToast={onToast}/>} 
    </div>
  )
}
