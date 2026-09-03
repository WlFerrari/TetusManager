import React, { useEffect, useState } from 'react'
import { Ban, Camera, Edit2, Eye, Plus, QrCode, RefreshCw, X } from 'lucide-react'
import { chapaCtrl, corteCtrl } from '../../controllers/index.js'
import { STATUS_CHAPA, TIPOS_ROCHA } from '../../models/index.js'
import {
  Badge, Modal, FormField, BtnPrimary, BtnSecondary, BtnIcon,
  SectionHeader, SearchInput,
} from '../components/UI.jsx'
import QRCodeModal from '../components/QRCodeModal.jsx'
import { LIMITS, chapaFieldErrors, prepareImageFile } from '../../utils/validation.js'

const BLANK = {
  nome:'', tipo:'Granito', cor:'#6b7280', largura:'', comprimento:'',
  espessura:2, status:'Disponível', localizacao:'', foto:null,
}

export default function ChapasPage({ onUpdate, user }) {
  const canEdit = user?.permissoes?.editarEstoque !== false
  const [filters, setFilters] = useState({
    q:'', tipo:'', status:'', espessura:'', cor:'', localizacao:'',
    minLargura:'', minComprimento:'',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [grupo, setGrupo] = useState('ativas')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [target, setTarget] = useState(null)
  const [erro, setErro] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(false)
  const [qrCodeItem, setQrCodeItem] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => { carregarChapas() }, [filters])

  async function carregarChapas() {
    setLoading(true)
    const r = await chapaCtrl.listarChapas(filters)
    setLista(r.ok ? r.data : [])
    if (!r.ok && r.msg) onUpdate?.(r.msg, 'err')
    setLoading(false)
  }

  const F = (k,v) => {
    setErro('')
    setFieldErrors(errors => ({ ...errors, [k]:null }))
    setForm(f => ({ ...f, [k]:v }))
  }
  const FF = (k,v) => setFilters(f => ({ ...f, [k]:v }))
  const FFNumber = (k,v) => {
    if (v === '') return FF(k, '')
    const n = Number(v)
    if (Number.isFinite(n) && n >= 0) FF(k, v)
  }
  const close = () => {
    setModal(null)
    setTarget(null)
    setErro('')
    setFieldErrors({})
    setHistory([])
  }

  function validateField(key) {
    const errors = chapaFieldErrors({ ...form, status:form.status || 'Disponível' })
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

  async function openView(chapa) {
    setTarget(chapa)
    setModal('view')
    const r = await corteCtrl.listar({ chapaId:chapa.id, limit:6 })
    setHistory(r.ok ? r.data : [])
  }

  function validateForm(payload) {
    const errors = chapaFieldErrors(payload)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setErro('Revise os campos destacados antes de continuar.')
      return false
    }
    setErro('')
    return true
  }

  async function handleAdd() {
    const payload = { ...form, status:'Disponível' }
    if (!validateForm(payload)) return
    const r = await chapaCtrl.gravarChapa(payload)
    if (!r.ok) return setErro(r.msg)
    onUpdate(r.msg, 'ok')
    await carregarChapas()
    close()
  }

  async function handleEdit() {
    if (!validateForm(form)) return
    const r = await chapaCtrl.atualizarChapa(form.id, form)
    if (!r.ok) return setErro(r.msg)
    onUpdate(r.msg, 'ok')
    await carregarChapas()
    close()
  }

  async function handleInativar(chapa) {
    if (!window.confirm(`Inativar a chapa "${chapa.nome}"? O histórico será preservado.`)) return
    const r = await chapaCtrl.excluirChapa(chapa.id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) await carregarChapas()
  }

  async function handleReativar(chapa) {
    if (!window.confirm(`Reativar a chapa "${chapa.nome}" e torná-la disponível novamente?`)) return
    const r = await chapaCtrl.reativarChapa(chapa.id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) await carregarChapas()
  }

  const activeFilters = Object.values(filters).filter(v => String(v ?? '').trim()).length
  const chapasAtivas = lista.filter(c => c.status !== 'Inativa')
  const chapasInativas = lista.filter(c => c.status === 'Inativa')
  const listaVisivel = filters.status
    ? lista
    : grupo === 'inativas' ? chapasInativas : chapasAtivas

  return (
    <div>
      <SectionHeader
        title="Chapas Brutas"
        subtitle={`${chapasAtivas.length} ativa(s) · ${chapasInativas.length} inativa(s)`}
        action={
          <div style={{ display:'flex', gap:8 }}>
            <BtnSecondary onClick={() => setShowFilters(v => !v)}>
              {showFilters ? 'Ocultar filtros' : `Filtros (${activeFilters})`}
            </BtnSecondary>
            {canEdit && (
              <BtnPrimary onClick={() => { setForm({ ...BLANK }); setErro(''); setFieldErrors({}); setModal('add') }}>
                <Plus size={14}/> Nova Chapa
              </BtnPrimary>
            )}
          </div>
        }
      />

      <SearchInput value={filters.q} onChange={v => FF('q',v.slice(0,120))} placeholder="Buscar por nome, tipo, ID ou localização…" />

      {showFilters && (
        <div className="card" style={{ padding:12, marginBottom:12 }}>
          <div className="form-grid-2">
            <FormField label="Tipo">
              <select value={filters.tipo} onChange={e => FF('tipo',e.target.value)}>
                <option value="">Todos</option>
                {TIPOS_ROCHA.map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select value={filters.status} onChange={e => FF('status',e.target.value)}>
                <option value="">Todos</option>
                {STATUS_CHAPA.map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Localização">
              <input maxLength={LIMITS.localizacao} value={filters.localizacao} onChange={e => FF('localizacao',e.target.value)} placeholder="Ex: Pátio A" />
            </FormField>
            <FormField label="Espessura (cm)">
              <input type="number" min="0" max="100" step="0.01" value={filters.espessura} onChange={e => FFNumber('espessura',e.target.value)} />
            </FormField>
            <FormField label="Largura mínima (cm)">
              <input type="number" min="0" max="10000" step="0.01" value={filters.minLargura} onChange={e => FFNumber('minLargura',e.target.value)} />
            </FormField>
            <FormField label="Comprimento mínimo (cm)">
              <input type="number" min="0" max="10000" step="0.01" value={filters.minComprimento} onChange={e => FFNumber('minComprimento',e.target.value)} />
            </FormField>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
            <BtnSecondary onClick={() => setFilters({ q:'',tipo:'',status:'',espessura:'',cor:'',localizacao:'',minLargura:'',minComprimento:'' })}>
              Limpar filtros
            </BtnSecondary>
          </div>
        </div>
      )}

      {!filters.status && (
        <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
          <button
            type="button"
            onClick={() => setGrupo('ativas')}
            style={{ border:'1px solid #e5e7eb', borderRadius:8, padding:'7px 12px', cursor:'pointer', fontSize:12, fontWeight:grupo === 'ativas' ? 700 : 500, background:grupo === 'ativas' ? '#eff6ff' : '#fff', color:grupo === 'ativas' ? '#2563eb' : '#6b7280' }}
          >
            Ativas ({chapasAtivas.length})
          </button>
          <button
            type="button"
            onClick={() => setGrupo('inativas')}
            style={{ border:'1px solid #e5e7eb', borderRadius:8, padding:'7px 12px', cursor:'pointer', fontSize:12, fontWeight:grupo === 'inativas' ? 700 : 500, background:grupo === 'inativas' ? '#f9fafb' : '#fff', color:grupo === 'inativas' ? '#374151' : '#6b7280' }}
          >
            Inativas ({chapasInativas.length})
          </button>
        </div>
      )}

      <div className="cards-grid" style={{ maxHeight:'68vh', overflowY:'auto' }}>
        {loading ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'#9ca3af' }}>Carregando...</div>
        ) : listaVisivel.length === 0 ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:48, color:'#9ca3af' }}>
            {grupo === 'inativas' && !filters.status ? 'Nenhuma chapa inativa encontrada.' : 'Nenhuma chapa ativa encontrada.'}
          </div>
        ) : listaVisivel.map(c => (
          <div key={c.id} style={{ background:'#fff', borderRadius:12, border:'1px solid #f3f4f6', overflow:'hidden' }}>
            {c.foto
              ? <img src={c.foto} alt={c.nome} style={{ width:'100%', height:70, objectFit:'cover' }}/>
              : <div style={{ height:60, background:c.cor, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', padding:6, fontSize:11, fontWeight:600 }}>{c.nome}</div>
            }
            <div style={{ padding:'10px 11px' }}>
              <p style={{ fontSize:12, fontWeight:600, color:'#1f2937' }}>{c.nome}</p>
              <p style={{ fontSize:10, color:'#9ca3af' }}>{c.tipo} · {c.largura}×{c.comprimento} cm</p>
              {c.localizacao && <p style={{ fontSize:10, color:'#6b7280', marginTop:2 }}>{c.localizacao}</p>}
              <div style={{ marginTop:6 }}><Badge status={c.status}/></div>
              <div style={{ display:'flex', gap:4, marginTop:9 }}>
                <button onClick={() => openView(c)} style={{ flex:1, border:'1px solid #e5e7eb', borderRadius:6, padding:5, background:'#fff', cursor:'pointer', fontSize:10 }}>
                  <Eye size={11}/> Ver
                </button>
                {canEdit && <BtnIcon title="QR Code" onClick={() => setQrCodeItem(c)}><QrCode size={12}/></BtnIcon>}
                {canEdit && c.status !== 'Inativa' && <BtnIcon title="Editar" onClick={() => { setForm({ ...c }); setErro(''); setFieldErrors({}); setModal('edit') }}><Edit2 size={12}/></BtnIcon>}
                {canEdit && c.status !== 'Inativa' && <BtnIcon title="Inativar" danger onClick={() => handleInativar(c)}><Ban size={12}/></BtnIcon>}
                {canEdit && c.status === 'Inativa' && <BtnIcon title="Reativar" onClick={() => handleReativar(c)}><RefreshCw size={12}/></BtnIcon>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal === 'view' && target && (
        <Modal title="Detalhes da Chapa" onClose={close}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              ['ID', target.id], ['Tipo', target.tipo], ['Status', target.status],
              ['Espessura', `${target.espessura} cm`], ['Largura', `${target.largura} cm`],
              ['Comprimento', `${target.comprimento} cm`], ['Localização', target.localizacao || 'Não informada'],
              ['Cadastrado em', target.criadoEm],
            ].map(([k,v]) => (
              <div key={k} style={{ background:'#f9fafb', borderRadius:8, padding:'8px 12px' }}>
                <p style={{ fontSize:10, color:'#9ca3af' }}>{k}</p>
                <p style={{ fontSize:13, fontWeight:500, color:'#1f2937' }}>{v}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize:12, fontWeight:600, color:'#374151', marginTop:14, marginBottom:8 }}>Histórico de cortes</p>
          {history.length === 0
            ? <p style={{ fontSize:12, color:'#9ca3af' }}>Nenhum corte registrado para esta chapa.</p>
            : history.map(h => <div key={h.id} style={{ background:'#f9fafb', padding:8, borderRadius:8, marginBottom:5, fontSize:12 }}>OS {h.osNumero} · {h.comprimentoConsumido}×{h.larguraConsumida} cm · {h.criadoEm}</div>)
          }
          <BtnSecondary onClick={close} style={{ width:'100%', marginTop:14 }}>Fechar</BtnSecondary>
        </Modal>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Nova Chapa' : 'Editar Chapa'} onClose={close}>
          {erro && <p style={{ color:'#dc2626', fontSize:12, marginBottom:10 }}>{erro}</p>}
          <FormField label="Nome da Chapa *" error={fieldErrors.nome}>
            <input maxLength={LIMITS.nome} value={form.nome} onChange={e => F('nome',e.target.value)} onBlur={() => validateField('nome')} />
          </FormField>
          <FormField label="Foto do lote (JPG, PNG ou WEBP)" error={fieldErrors.foto} hint="A imagem é validada, redimensionada para até 1280 px e comprimida para até 500 KB.">
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <label style={{ display:'inline-flex', gap:6, alignItems:'center', cursor:'pointer', border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
                <Camera size={14}/> Enviar foto<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFoto} style={{ display:'none' }}/>
              </label>
              {form.foto && <button type="button" onClick={() => F('foto',null)} title="Remover foto" style={{ border:'none', background:'transparent', color:'#dc2626', cursor:'pointer', display:'flex' }}><X size={16}/></button>}
            </div>
          </FormField>
          <div className="form-grid-2">
            <FormField label="Tipo" error={fieldErrors.tipo}><select value={form.tipo} onChange={e => F('tipo',e.target.value)} onBlur={() => validateField('tipo')}>{TIPOS_ROCHA.map(v => <option key={v}>{v}</option>)}</select></FormField>
            <FormField label="Cor" error={fieldErrors.cor}><input type="color" value={form.cor} onChange={e => F('cor',e.target.value)} onBlur={() => validateField('cor')}/></FormField>
            <FormField label="Largura (cm) *" error={fieldErrors.largura}><input type="number" min="0.01" max="10000" step="0.01" value={form.largura} onChange={e => F('largura',e.target.value)} onBlur={() => validateField('largura')}/></FormField>
            <FormField label="Comprimento (cm) *" error={fieldErrors.comprimento}><input type="number" min="0.01" max="10000" step="0.01" value={form.comprimento} onChange={e => F('comprimento',e.target.value)} onBlur={() => validateField('comprimento')}/></FormField>
            <FormField label="Espessura (cm) *" error={fieldErrors.espessura}><input type="number" min="0.01" max="100" step="0.01" value={form.espessura} onChange={e => F('espessura',e.target.value)} onBlur={() => validateField('espessura')}/></FormField>
            <FormField label="Status" error={fieldErrors.status}><input value={form.status || 'Disponível'} disabled/></FormField>
          </div>
          <FormField label="Localização física" error={fieldErrors.localizacao}>
            <input maxLength={LIMITS.localizacao} value={form.localizacao || ''} onChange={e => F('localizacao',e.target.value)} onBlur={() => validateField('localizacao')} placeholder="Ex: Pátio A - Cavalete 03"/>
          </FormField>
          <div style={{ display:'flex', gap:8 }}>
            <BtnSecondary onClick={close}>Cancelar</BtnSecondary>
            <BtnPrimary onClick={modal === 'add' ? handleAdd : handleEdit} style={{ flex:1, justifyContent:'center' }}>
              {modal === 'add' ? 'Cadastrar Chapa' : 'Salvar alterações'}
            </BtnPrimary>
          </div>
        </Modal>
      )}

      {qrCodeItem && <QRCodeModal item={qrCodeItem} type="chapa" onClose={() => setQrCodeItem(null)}/>} 
    </div>
  )
}
