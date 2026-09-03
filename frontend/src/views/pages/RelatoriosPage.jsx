import React, { useEffect, useMemo, useState } from 'react'
import { BarChart3, Download, Layers, Package, RefreshCw, Scissors } from 'lucide-react'
import { chapaCtrl, corteCtrl, retalhoCtrl } from '../../controllers/index.js'
import { BtnSecondary, SectionHeader } from '../components/UI.jsx'

const csvEscape = value => `"${String(value ?? '').replace(/"/g, '""')}"`

function StatCard({ Icon, label, value, detail }) {
  return (
    <div className="card" style={{ padding:16 }}>
      <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:8 }}>
        <div style={{ width:34, height:34, borderRadius:8, background:'var(--bg-tertiary)', display:'flex', alignItems:'center', justifyContent:'center', color:'#2563eb' }}>
          <Icon size={17}/>
        </div>
        <p style={{ fontSize:12, color:'var(--text-secondary)' }}>{label}</p>
      </div>
      <p style={{ fontSize:24, fontWeight:800 }}>{value}</p>
      {detail && <p style={{ fontSize:11, color:'var(--text-secondary)', marginTop:3 }}>{detail}</p>}
    </div>
  )
}

export default function RelatoriosPage({ onUpdate }) {
  const [loading, setLoading] = useState(true)
  const [chapas, setChapas] = useState([])
  const [retalhos, setRetalhos] = useState([])
  const [cortes, setCortes] = useState([])
  const [cStats, setCStats] = useState({ total:0, disponiveis:0, emUso:0, inativas:0, areaTotal:0 })
  const [rStats, setRStats] = useState({ total:0, disponiveis:0, reservados:0, consumidos:0, descartados:0, areaTotal:0 })
  const [cutStats, setCutStats] = useState({ total:0, areaConsumida:0, areaRetalho:0 })

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setLoading(true)
    const [chapasRes, retalhosRes, cortesRes, chapaStats, retalhoStats, corteStats] = await Promise.all([
      chapaCtrl.listarChapas({}),
      retalhoCtrl.listar({}),
      corteCtrl.listar({}),
      chapaCtrl.stats(),
      retalhoCtrl.stats(),
      corteCtrl.stats(),
    ])

    if (!chapasRes.ok || !retalhosRes.ok || !cortesRes.ok) {
      onUpdate?.('Não foi possível carregar todos os dados dos relatórios.', 'err')
    }

    setChapas(chapasRes.ok ? chapasRes.data : [])
    setRetalhos(retalhosRes.ok ? retalhosRes.data : [])
    setCortes(cortesRes.ok ? cortesRes.data : [])
    setCStats(chapaStats || {})
    setRStats(retalhoStats || {})
    setCutStats(corteStats || {})
    setLoading(false)
  }

  const indicadores = useMemo(() => {
    const totalMovimentado = Number(cutStats.areaConsumida || 0) + Number(cutStats.areaRetalho || 0)
    const sobraGeradaPct = totalMovimentado > 0
      ? ((Number(cutStats.areaRetalho || 0) / totalMovimentado) * 100).toFixed(1)
      : '0.0'
    const perdas = retalhos.filter(r => r.status === 'Descartado')
    const areaDescartada = perdas.reduce((soma, r) => soma + Number(r.area || 0), 0)
    const manuais = retalhos.filter(r => r.origemTipo === 'MANUAL').length
    return { sobraGeradaPct, areaDescartada:areaDescartada.toFixed(4), manuais }
  }, [cutStats, retalhos])

  function exportarCortes() {
    if (!cortes.length) {
      onUpdate?.('Não há cortes para exportar.', 'err')
      return
    }

    const header = ['ID','OS','Chapa','Retalho','Comprimento consumido (cm)','Largura consumida (cm)','Área consumida (m²)','Área de retalho (m²)','Data','Observação']
    const rows = cortes.map(c => [
      c.id, c.osNumero, c.chapaId || '', c.retalhoId || '', c.comprimentoConsumido,
      c.larguraConsumida, c.areaConsumida, c.areaRetalho, c.criadoEm, c.observacao || '',
    ])
    const csv = [header, ...rows].map(row => row.map(csvEscape).join(';')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `tetusmanager-relatorio-cortes-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    onUpdate?.('Relatório de cortes exportado.', 'ok')
  }

  if (loading) return <div style={{ textAlign:'center', padding:50, color:'var(--text-secondary)' }}>Carregando relatórios...</div>

  return (
    <div>
      <SectionHeader
        title="Relatórios"
        subtitle="Indicadores de estoque, cortes, reaproveitamento e perdas"
        action={
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <BtnSecondary onClick={carregar}><RefreshCw size={14}/> Atualizar</BtnSecondary>
            <BtnSecondary onClick={exportarCortes}><Download size={14}/> Exportar cortes</BtnSecondary>
          </div>
        }
      />

      <div className="stats-grid">
        <StatCard Icon={Package} label="Chapas cadastradas" value={cStats.total || chapas.length} detail={`${cStats.disponiveis || 0} disponíveis · ${cStats.emUso || 0} em uso`} />
        <StatCard Icon={Layers} label="Retalhos cadastrados" value={rStats.total || retalhos.length} detail={`${rStats.disponiveis || 0} disponíveis · ${rStats.reservados || 0} reservados`} />
        <StatCard Icon={Scissors} label="Cortes registrados" value={cutStats.total || cortes.length} detail={`${Number(cutStats.areaConsumida || 0).toFixed(2)} m² consumidos`} />
        <StatCard Icon={BarChart3} label="Sobra reaproveitável gerada" value={`${indicadores.sobraGeradaPct}%`} detail={`${Number(cutStats.areaRetalho || 0).toFixed(2)} m² registrados como retalho`} />
      </div>

      <div className="two-col" style={{ marginBottom:16 }}>
        <div className="card">
          <p style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Situação das chapas</p>
          {[
            ['Disponíveis', cStats.disponiveis || 0],
            ['Em uso', cStats.emUso || 0],
            ['Inativas', cStats.inativas || 0],
          ].map(([label, value]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border-color)' }}>
              <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{label}</span>
              <strong style={{ fontSize:13 }}>{value}</strong>
            </div>
          ))}
        </div>

        <div className="card">
          <p style={{ fontSize:13, fontWeight:700, marginBottom:14 }}>Situação dos retalhos</p>
          {[
            ['Disponíveis', rStats.disponiveis || 0],
            ['Reservados', rStats.reservados || 0],
            ['Utilizados', rStats.consumidos || 0],
            ['Descartados', rStats.descartados || 0],
          ].map(([label, value]) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid var(--border-color)' }}>
              <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{label}</span>
              <strong style={{ fontSize:13 }}>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="two-col" style={{ marginBottom:16 }}>
        <div className="card">
          <p style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Indicadores de rastreabilidade</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div style={{ background:'var(--bg-tertiary)', borderRadius:8, padding:12 }}>
              <p style={{ fontSize:10, color:'var(--text-secondary)' }}>RETALHOS MANUAIS / LEGADOS</p>
              <p style={{ fontSize:20, fontWeight:800, marginTop:3 }}>{indicadores.manuais}</p>
            </div>
            <div style={{ background:'var(--bg-tertiary)', borderRadius:8, padding:12 }}>
              <p style={{ fontSize:10, color:'var(--text-secondary)' }}>ÁREA DESCARTADA</p>
              <p style={{ fontSize:20, fontWeight:800, marginTop:3 }}>{indicadores.areaDescartada} m²</p>
            </div>
          </div>
        </div>

        <div className="card">
          <p style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Resumo do estoque físico</p>
          <p style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.7 }}>
            O relatório usa os mesmos registros de chapas, retalhos e cortes do sistema. As localizações físicas cadastradas permanecem disponíveis nas telas de consulta e nos detalhes de cada peça.
          </p>
        </div>
      </div>

      <div className="card">
        <p style={{ fontSize:13, fontWeight:700, marginBottom:12 }}>Cortes recentes</p>
        {cortes.length === 0 ? (
          <p style={{ fontSize:12, color:'var(--text-secondary)' }}>Nenhum corte registrado.</p>
        ) : (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr><th>OS</th><th>Chapa</th><th>Retalho</th><th>Medidas</th><th>Área consumida</th><th>Data</th></tr>
              </thead>
              <tbody>
                {cortes.slice(0,30).map(c => (
                  <tr key={c.id}>
                    <td>{c.osNumero}</td>
                    <td>{c.chapaId || '—'}</td>
                    <td>{c.retalhoId || 'Sem retalho'}</td>
                    <td>{c.comprimentoConsumido}×{c.larguraConsumida} cm</td>
                    <td>{c.areaConsumida} m²</td>
                    <td>{c.criadoEm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
