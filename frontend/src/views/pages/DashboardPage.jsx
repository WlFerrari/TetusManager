import React, { useEffect, useState } from 'react'
import { CheckCircle, Layers, Package, Scissors, Users } from 'lucide-react'
import { chapaCtrl, corteCtrl, retalhoCtrl, userCtrl } from '../../controllers/index.js'

export default function DashboardPage({ user }) {
  const [cStats, setCStats] = useState({ total:0, disponiveis:0, emUso:0, inativas:0, areaTotal:0 })
  const [rStats, setRStats] = useState({ total:0, disponiveis:0, reservados:0, consumidos:0, descartados:0, areaTotal:0 })
  const [cutStats, setCutStats] = useState({ total:0, areaConsumida:0, areaRetalho:0 })
  const [recentCuts, setRecentCuts] = useState([])
  const [uAll, setUAll] = useState([])
  const [loading, setLoading] = useState(true)
  const canSeeUsers = user?.permissoes?.gerenciarUsuarios === true

  useEffect(() => { carregarDados() }, [canSeeUsers])

  async function carregarDados() {
    setLoading(true)
    const userRequest = canSeeUsers ? userCtrl.listar() : Promise.resolve({ ok:1, data:[] })
    const [cRes, rRes, uRes, cutRes, cutList] = await Promise.all([
      chapaCtrl.stats(),
      retalhoCtrl.stats(),
      userRequest,
      corteCtrl.stats(),
      corteCtrl.listar({ limit:6 }),
    ])
    setCStats(cRes || { total:0, disponiveis:0, emUso:0, inativas:0, areaTotal:0 })
    setRStats(rRes || { total:0, disponiveis:0, reservados:0, consumidos:0, descartados:0, areaTotal:0 })
    setCutStats(cutRes || { total:0, areaConsumida:0, areaRetalho:0 })
    setRecentCuts(cutList.ok ? cutList.data : [])
    setUAll(uRes.ok ? uRes.data : [])
    setLoading(false)
  }

  const aproveitamento = cStats.areaTotal > 0
    ? ((rStats.areaTotal / cStats.areaTotal) * 100).toFixed(0)
    : 0

  const cards = [
    { label:'Total Chapas', value:cStats.total, color:'#dbeafe,#1d4ed8', Icon:Package },
    { label:'Total Retalhos', value:rStats.total, color:'#d1fae5,#065f46', Icon:Layers },
    { label:'Aproveitamento', value:`${aproveitamento}%`, color:'#ede9fe,#7c3aed', Icon:CheckCircle },
    { label:'Área em Retalhos (m²)', value:cutStats.areaRetalho, color:'#fef3c7,#92400e', Icon:Scissors },
    ...(canSeeUsers ? [{ label:'Usuários Ativos', value:uAll.filter(u => u.status === 'Ativo').length, color:'#e0f2fe,#0369a1', Icon:Users }] : []),
  ]

  if (loading) return <div style={{ textAlign:'center', padding:'60px 20px', color:'#d1d5db' }}>Carregando dashboard...</div>

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#111827' }}>Dashboard</h1>
        <p style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>Visão geral do estoque e da operação</p>
      </div>

      <div className="stats-grid">
        {cards.map(({ label, value, color, Icon }) => {
          const [bg, tc] = color.split(',')
          return (
            <div key={label} className="card" style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ width:36, height:36, background:bg, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={18} style={{ color:tc }}/>
                </div>
              </div>
              <p style={{ fontSize:26, fontWeight:800, color:'#111827' }}>{value}</p>
              <p style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{label}</p>
            </div>
          )
        })}
      </div>

      <div className="two-col">
        <div className="card">
          <p style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:14 }}>Retalhos por Status</p>
          {[
            ['Disponíveis', rStats.disponiveis, '#34d399'],
            ['Reservados', rStats.reservados, '#fbbf24'],
            ['Utilizados', rStats.consumidos, '#9ca3af'],
            ['Descartados', rStats.descartados, '#f87171'],
          ].map(([s,n,c]) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:c, flexShrink:0 }}/>
              <span style={{ fontSize:13, color:'#6b7280', flex:1 }}>{s}</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{n}</span>
              <div style={{ width:72, height:5, background:'#f3f4f6', borderRadius:4 }}>
                <div style={{ width:`${rStats.total ? (n/rStats.total*100) : 0}%`, height:5, background:c, borderRadius:4 }}/>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <p style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:14 }}>Chapas por Status</p>
          {[
            ['Disponíveis', cStats.disponiveis, '#60a5fa'],
            ['Em uso', cStats.emUso, '#f97316'],
            ['Inativas', cStats.inativas, '#9ca3af'],
          ].map(([s,n,c]) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:c, flexShrink:0 }}/>
              <span style={{ fontSize:13, color:'#6b7280', flex:1 }}>{s}</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{n}</span>
              <div style={{ width:72, height:5, background:'#f3f4f6', borderRadius:4 }}>
                <div style={{ width:`${cStats.total ? (n/cStats.total*100) : 0}%`, height:5, background:c, borderRadius:4 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop:16 }}>
        <p style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:12 }}>Histórico recente de cortes</p>
        {recentCuts.length === 0 ? (
          <p style={{ fontSize:12, color:'#9ca3af' }}>Nenhum corte registrado.</p>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {recentCuts.map(c => (
              <div key={c.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', background:'#f9fafb', borderRadius:8 }}>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:'#1f2937' }}>OS {c.osNumero}</p>
                  <p style={{ fontSize:11, color:'#9ca3af' }}>{c.comprimentoConsumido}×{c.larguraConsumida} cm · {c.areaRetalho} m²</p>
                </div>
                <span style={{ fontSize:11, color:'#9ca3af' }}>{c.criadoEm}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
