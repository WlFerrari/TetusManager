import React, { useEffect, useState } from 'react'
import { Camera, CheckSquare, Edit2, Eye, Plus, QrCode, XSquare, Bookmark, BookmarkX } from 'lucide-react'
import { retalhoCtrl, corteCtrl } from '../../controllers/index.js'
import { STATUS_RETALHO, TIPOS_ROCHA } from '../../models/index.js'
import {
  Badge, Modal, FormField, BtnPrimary, BtnSecondary, BtnIcon,
  SectionHeader, SearchInput,
} from '../components/UI.jsx'
import QRCodeModal from '../components/QRCodeModal.jsx'

const BLANK = {
  nome:'', tipo:'Granito', cor:'#6b7280', largura:'', comprimento:'',
  espessura:2, status:'Disponível', origem:'', origemTipo:'MANUAL',
  localizacao:'', foto:null,
}

export default function RetalhosPage({ onUpdate, user }) {
  const canEdit = user?.permissoes?.editarEstoque !== false
  const [filters, setFilters] = useState({
    q:'', tipo:'', status:'', espessura:'', cor:'', origem:'', origemTipo:'',
    localizacao:'', minLargura:'', minComprimento:'', minArea:'',
  })
  const [showFilters, setShowFilters] = useState(false)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [target, setTarget] = useState(null)
  const [erro, setErro] = useState('')
  const [lista, setLista] = useState([])
  const [loading, setLoading] = useState(false)
  const [qrCodeItem, setQrCodeItem] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => { carregarRetalhos() }, [filters])

  async function carregarRetalhos() {
    setLoading(true)
    const r = await retalhoCtrl.listar(filters)
    setLista(r.ok ? r.data : [])
    setLoading(false)
  }

  const F = (k,v) => setForm(f => ({ ...f, [k]:v }))
  const FF = (k,v) => setFilters(f => ({ ...f, [k]:v }))
  const close = () => { setModal(null); setTarget(null); setErro(''); setHistory([]) }

  function handleFoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => F('foto', ev.target.result)
    reader.readAsDataURL(file)
  }

  async function openView(retalho) {
    setTarget(retalho)
    setModal('view')
    const r = await corteCtrl.listar({ retalhoId:retalho.id, limit:6 })
    setHistory(r.ok ? r.data : [])
  }

  async function handleAdd() {
    const payload = { ...form, origem:form.origem || null, origemTipo:form.origem ? 'AUTOMATICA' : 'MANUAL' }
    const r = await retalhoCtrl.gravarRetalho(payload)
    if (!r.ok) return setErro(r.msg)
    onUpdate(r.msg, 'ok')
    await carregarRetalhos()
    close()
  }

  async function handleEdit() {
    const r = await retalhoCtrl.atualizar(form.id, form)
    if (!r.ok) return setErro(r.msg)
    onUpdate(r.msg, 'ok')
    await carregarRetalhos()
    close()
  }

  async function runAction(action, id) {
    const r = await action(id)
    onUpdate(r.msg, r.ok ? 'ok' : 'err')
    if (r.ok) await carregarRetalhos()
  }

  async function handleDescartar(retalho) {
    if (!window.confirm(`Descartar o retalho "${retalho.nome}"? O histórico será preservado.`)) return
    await runAction(retalhoCtrl.marcarDescartado.bind(retalhoCtrl), retalho.id)
  }

  const activeFilters = Object.values(filters).filter(v => String(v ?? '').trim()).length
  const areaForm = form.comprimento && form.largura
    ? ((Number(form.comprimento) * Number(form.largura)) / 10000).toFixed(4)
    : '0.0000'

  return (
    <div>
      <SectionHeader
        title="Retalhos"
        subtitle={`${lista.length} registro(s)`}
        action={
          <div style={{ display:'flex', gap:8 }}>
            <BtnSecondary onClick={() => setShowFilters(v => !v)}>
              {showFilters ? 'Ocultar filtros' : `Filtros (${activeFilters})`}
            </BtnSecondary>
            {canEdit && (
              <BtnPrimary onClick={() => { setForm(BLANK); setModal('add') }}>
                <Plus size={14}/> Novo Retalho
              </BtnPrimary>
            )}
          </div>
        }
      />

      <SearchInput value={filters.q} onChange={v => FF('q',v)} placeholder="Buscar por nome, tipo, status, ID ou localização…" />

      {showFilters && (
        <div className="card" style={{ padding:12, marginBottom:12 }}>
          <div className="form-grid-2">
            <FormField label="Tipo">
              <select value={filters.tipo} onChange={e => FF('tipo',e.target.value)}>
                <option value="">Todos</option>{TIPOS_ROCHA.map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select value={filters.status} onChange={e => FF('status',e.target.value)}>
                <option value="">Todos</option>{STATUS_RETALHO.map(v => <option key={v}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Origem">
              <select value={filters.origemTipo} onChange={e => FF('origemTipo',e.target.value)}>
                <option value="">Todas</option><option value="AUTOMATICA">Automática</option><option value="MANUAL">Manual / Legada</option>
              </select>
            </FormField>
            <FormField label="Localização"><input value={filters.localizacao} onChange={e => FF('localizacao',e.target.value)} /></FormField>
            <FormField label="Largura mínima (cm)"><input type="number" value={filters.minLargura} onChange={e => FF('minLargura',e.target.value)} /></FormField>
            <FormField label="Comprimento mínimo (cm)"><input type="number" value={filters.minComprimento} onChange={e => FF('minComprimento',e.target.value)} /></FormField>
            <FormField label="Área mínima (m²)"><input type="number" step="0.0001" value={filters.minArea} onChange={e => FF('minArea',e.target.value)} /></FormField>
            <FormField label="Espessura (cm)"><input type="number" value={filters.espessura} onChange={e => FF('espessura',e.target.value)} /></FormField>
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:8 }}>
            <BtnSecondary onClick={() => setFilters({ q:'',tipo:'',status:'',espessura:'',cor:'',origem:'',origemTipo:'',localizacao:'',minLargura:'',minComprimento:'',minArea:'' })}>Limpar filtros</BtnSecondary>
          </div>
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:'68vh', overflowY:'auto' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:48, color:'#9ca3af' }}>Carregando...</div>
        ) : lista.length === 0 ? (
          <div style={{ textAlign:'center', padding:48, color:'#9ca3af' }}>Nenhum retalho encontrado.</div>
        ) : lista.map(r => (
          <div key={r.id} style={{ background:'#fff', borderRadius:10, border:'1px solid #f3f4f6', padding:'11px 14px', display:'flex', alignItems:'center', gap:12 }}>
            {r.foto
              ? <img src={r.foto} alt={r.nome} style={{ width:38, height:38, borderRadius:8, objectFit:'cover' }}/>
              : <div style={{ width:38, height:38, borderRadius:8, background:r.cor, flexShrink:0 }}/>
            }
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', gap:7, alignItems:'center' }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#1f2937' }}>{r.nome}</p>
                <code style={{ fontSize:10, color:'#9ca3af' }}>{r.id}</code>
              </div>
              <p style={{ fontSize:11, color:'#9ca3af' }}>{r.tipo} · {r.largura}×{r.comprimento} cm · {r.area} m²</p>
              <p style={{ fontSize:10, color:'#6b7280' }}>
                {r.origemTipo === 'MANUAL' ? 'Origem manual/legada' : `Origem: ${r.origem || '—'}`}
                {r.localizacao ? ` · ${r.localizacao}` : ''}
              </p>
            </div>
            <Badge status={r.status}/>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'flex-end' }}>
              <BtnIcon title="Ver detalhes" onClick={() => openView(r)}><Eye size={13}/></BtnIcon>
              {canEdit && <BtnIcon title="QR Code" onClick={() => setQrCodeItem(r)}><QrCode size={13}/></BtnIcon>}
              {canEdit && ['Disponível','Reservado'].includes(r.status) && <BtnIcon title="Editar" onClick={() => { setForm({ ...r }); setModal('edit') }}><Edit2 size={13}/></BtnIcon>}
              {canEdit && r.status === 'Disponível' && <BtnIcon title="Reservar" onClick={() => runAction(retalhoCtrl.reservar.bind(retalhoCtrl), r.id)}><Bookmark size={13}/></BtnIcon>}
              {canEdit && r.status === 'Reservado' && <BtnIcon title="Liberar reserva" onClick={() => runAction(retalhoCtrl.liberarReserva.bind(retalhoCtrl), r.id)}><BookmarkX size={13}/></BtnIcon>}
              {canEdit && ['Disponível','Reservado'].includes(r.status) && <BtnIcon title="Consumir" onClick={() => runAction(retalhoCtrl.marcarConsumido.bind(retalhoCtrl), r.id)}><CheckSquare size={13}/></BtnIcon>}
              {canEdit && r.status !== 'Consumido' && r.status !== 'Descartado' && <BtnIcon title="Descartar" danger onClick={() => handleDescartar(r)}><XSquare size={13}/></BtnIcon>}
            </div>
          </div>
        ))}
      </div>

      {modal === 'view' && target && (
        <Modal title="Detalhes do Retalho" onClose={close}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              ['ID', target.id], ['Tipo', target.tipo], ['Status', target.status],
              ['Origem', target.origemTipo === 'MANUAL' ? 'Manual / Legada' : target.origem || '—'],
              ['Largura', `${target.largura} cm`], ['Comprimento', `${target.comprimento} cm`],
              ['Área', `${target.area} m²`], ['Espessura', `${target.espessura} cm`],
              ['Localização', target.localizacao || 'Não informada'], ['Criado em', target.criadoEm],
            ].map(([k,v]) => (
              <div key={k} style={{ background:'#f9fafb', borderRadius:8, padding:'8px 12px' }}>
                <p style={{ fontSize:10, color:'#9ca3af' }}>{k}</p>
                <p style={{ fontSize:13, fontWeight:500, color:'#1f2937' }}>{v}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize:12, fontWeight:600, color:'#374151', marginTop:14, marginBottom:8 }}>Histórico de cortes</p>
          {history.length === 0
            ? <p style={{ fontSize:12, color:'#9ca3af' }}>Nenhum corte vinculado a este retalho.</p>
            : history.map(h => <div key={h.id} style={{ background:'#f9fafb', padding:8, borderRadius:8, marginBottom:5, fontSize:12 }}>OS {h.osNumero} · {h.criadoEm}</div>)
          }
          <BtnSecondary onClick={close} style={{ width:'100%', marginTop:14 }}>Fechar</BtnSecondary>
        </Modal>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Novo Retalho' : 'Editar Retalho'} onClose={close}>
          {erro && <p style={{ color:'#dc2626', fontSize:12, marginBottom:10 }}>{erro}</p>}
          {modal === 'add' && (
            <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#1e40af', marginBottom:12 }}>
              Retalhos cadastrados manualmente são identificados como peças legadas quando não há chapa de origem informada.
            </div>
          )}
          <FormField label="Nome *"><input value={form.nome || ''} onChange={e => F('nome',e.target.value)}/></FormField>
          <FormField label="Foto do retalho">
            <label style={{ display:'inline-flex', gap:6, alignItems:'center', cursor:'pointer', border:'1px solid #e5e7eb', borderRadius:8, padding:'8px 12px', fontSize:12 }}>
              <Camera size={14}/> Enviar foto<input type="file" accept="image/*" onChange={handleFoto} style={{ display:'none' }}/>
            </label>
          </FormField>
          <div className="form-grid-2">
            <FormField label="Tipo"><select value={form.tipo} onChange={e => F('tipo',e.target.value)}>{TIPOS_ROCHA.map(v => <option key={v}>{v}</option>)}</select></FormField>
            <FormField label="Cor"><input type="color" value={form.cor} onChange={e => F('cor',e.target.value)}/></FormField>
            <FormField label="Largura (cm) *"><input type="number" value={form.largura} onChange={e => F('largura',e.target.value)}/></FormField>
            <FormField label="Comprimento (cm) *"><input type="number" value={form.comprimento} onChange={e => F('comprimento',e.target.value)}/></FormField>
            <FormField label="Espessura (cm)"><input type="number" value={form.espessura} onChange={e => F('espessura',e.target.value)}/></FormField>
            <FormField label="Área calculada (m²)"><input value={areaForm} disabled/></FormField>
          </div>
          {modal === 'add' && <FormField label="Chapa de origem (opcional)"><input value={form.origem || ''} onChange={e => F('origem',e.target.value)} placeholder="Deixe vazio para retalho legado"/></FormField>}
          <FormField label="Localização física"><input value={form.localizacao || ''} onChange={e => F('localizacao',e.target.value)} placeholder="Ex: Retalhos A - Posição 04"/></FormField>
          <div style={{ display:'flex', gap:8 }}>
            <BtnSecondary onClick={close}>Cancelar</BtnSecondary>
            <BtnPrimary onClick={modal === 'add' ? handleAdd : handleEdit} style={{ flex:1, justifyContent:'center' }}>
              {modal === 'add' ? 'Cadastrar Retalho' : 'Salvar alterações'}
            </BtnPrimary>
          </div>
        </Modal>
      )}

      {qrCodeItem && <QRCodeModal item={qrCodeItem} type="retalho" onClose={() => setQrCodeItem(null)}/>} 
    </div>
  )
}
