import React, { useState, useEffect } from 'react'
import { chapaCtrl, retalhoCtrl, userCtrl } from '../../controllers/index.js'
import { Package, Layers, CheckCircle, Users } from 'lucide-react'

export default function DashboardPage() {
  const [cStats, setCStats] = useState({ total: 0, disponiveis: 0, emUso: 0 })
  const [rStats, setRStats] = useState({ total: 0, disponiveis: 0, reservados: 0, consumidos: 0, areaTotal: 0 })
  const [uAll, setUAll] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    setLoading(true)
    const [cRes, rRes, uRes] = await Promise.all([
      chapaCtrl.stats(),
      retalhoCtrl.stats(),
      userCtrl.listar(),
    ])
    setCStats(cRes || { total: 0, disponiveis: 0, emUso: 0 })
    setRStats(rRes || { total: 0, disponiveis: 0, reservados: 0, consumidos: 0, areaTotal: 0 })
    setUAll(uRes.ok ? uRes.data : [])
    setLoading(false)
  }

  const cards = [
    { label:'Total Chapas',    value:cStats.total,                              color:'#dbeafe,#1d4ed8', delta:'+12%', Icon:Package        },
    { label:'Total Retalhos',  value:rStats.total,                              color:'#d1fae5,#065f46', delta:'+8%',  Icon:Layers         },
    { label:'Área Útil (m²)',  value:rStats.areaTotal,                          color:'#ede9fe,#7c3aed', delta:'+15%', Icon:CheckCircle    },
    { label:'Usuários Ativos', value:uAll.filter(u=>u.status==='Ativo').length, color:'#fef3c7,#92400e', delta:'',     Icon:Users          },
  ]

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#d1d5db' }}>
        Carregando dashboard...
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom:22 }}>
        <h1 style={{ fontSize:20, fontWeight:700, color:'#111827' }}>Dashboard</h1>
        <p style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>Visão geral em tempo real</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {cards.map(({ label, value, color, delta, Icon }) => {
          const [bg, tc] = color.split(',')
          return (
            <div key={label} className="card" style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ width:36, height:36, background:bg, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={18} style={{ color:tc }}/>
                </div>
                {delta && <span style={{ fontSize:11, color:'#16a34a', background:'#f0fdf4', padding:'2px 8px', borderRadius:99, fontWeight:600 }}>{delta}</span>}
              </div>
              <p style={{ fontSize:26, fontWeight:800, color:'#111827' }}>{value}</p>
              <p style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{label}</p>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="two-col">
        <div className="card">
          <p style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:14 }}>Retalhos por Status</p>
          {[
            ['Disponíveis', rStats.disponiveis, '#34d399'],
            ['Reservados',  rStats.reservados,  '#fbbf24'],
            ['Consumidos',  rStats.consumidos,  '#9ca3af'],
          ].map(([s,n,c]) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:c, flexShrink:0 }}/>
              <span style={{ fontSize:13, color:'#6b7280', flex:1 }}>{s}</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{n}</span>
              <div style={{ width:72, height:5, background:'#f3f4f6', borderRadius:4 }}>
                <div style={{ width:`${rStats.total?(n/rStats.total*100):0}%`, height:5, background:c, borderRadius:4 }}/>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <p style={{ fontSize:13, fontWeight:600, color:'#374151', marginBottom:14 }}>Chapas por Status</p>
          {[
            ['Disponíveis', cStats.disponiveis, '#60a5fa'],
            ['Em uso',      cStats.emUso,       '#f97316'],
          ].map(([s,n,c]) => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:9, height:9, borderRadius:'50%', background:c, flexShrink:0 }}/>
              <span style={{ fontSize:13, color:'#6b7280', flex:1 }}>{s}</span>
              <span style={{ fontSize:13, fontWeight:600, color:'#374151' }}>{n}</span>
              <div style={{ width:72, height:5, background:'#f3f4f6', borderRadius:4 }}>
                <div style={{ width:`${cStats.total?(n/cStats.total*100):0}%`, height:5, background:c, borderRadius:4 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
