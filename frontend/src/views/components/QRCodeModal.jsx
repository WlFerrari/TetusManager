import React, { useRef } from 'react'
import { Download, X } from 'lucide-react'
import QRCode from 'qrcode.react'
import html2canvas from 'html2canvas'

export default function QRCodeModal({ item, type = 'chapa', onClose }) {
  const qrRef = useRef()

  // Identificador persistente: os detalhes da peça ficam no sistema e podem mudar
  // sem tornar a etiqueta impressa obsoleta.
  const qrValue = item?.qrCode || `TETUS|${type.toUpperCase()}|${item.id}`

  async function downloadQRCode() {
    const element = qrRef.current
    if (!element) return
    try {
      const canvas = await html2canvas(element, { backgroundColor:'#ffffff', scale:2 })
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `qrcode-${type}-${item.id}.png`
      link.click()
    } catch (error) {
      console.error('Erro ao baixar QR code:', error)
    }
  }

  function printQRCode() {
    const element = qrRef.current
    if (!element) return
    const printWindow = window.open('', '', 'width=420,height=560')
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${item.nome}</title>
          <style>
            body { text-align:center; font-family:Arial,sans-serif; padding:20px; }
            h2 { margin:10px 0; font-size:18px; }
            p { margin:5px 0; font-size:12px; color:#666; }
          </style>
        </head>
        <body>
          <h2>${item.nome}</h2>
          <p>ID: ${item.id}</p>
          <p>${item.tipo} · ${item.largura} × ${item.comprimento} cm · ${item.espessura} cm</p>
          ${item.localizacao ? `<p>Localização: ${item.localizacao}</p>` : ''}
          ${element.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => { printWindow.print(); printWindow.close() }, 250)
  }

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}
      onClick={onClose}
    >
      <div
        style={{ position:'relative', background:'var(--bg-secondary)', borderRadius:12, padding:32, width:'90%', maxWidth:420, boxShadow:'0 20px 25px rgba(0,0,0,.15)', border:'1px solid var(--border-color)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, color:'var(--text-primary)', margin:0 }}>QR Code</h2>
            <p style={{ fontSize:13, color:'var(--text-secondary)', margin:'4px 0 0' }}>{item.nome}</p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:4 }}><X size={20}/></button>
        </div>

        <div ref={qrRef} style={{ display:'flex', justifyContent:'center', background:'#fff', borderRadius:8, padding:20, marginBottom:24, border:'1px solid var(--border-color)' }}>
          <QRCode value={qrValue} size={256} level="H" includeMargin fgColor="#111827" bgColor="#ffffff" />
        </div>

        <div style={{ background:'var(--bg-tertiary)', borderRadius:8, padding:12, marginBottom:24, fontSize:13 }}>
          <p style={{ margin:'4px 0' }}><strong>ID:</strong> {item.id}</p>
          <p style={{ margin:'4px 0' }}><strong>Tipo:</strong> {item.tipo}</p>
          <p style={{ margin:'4px 0' }}><strong>Status:</strong> {item.status}</p>
          <p style={{ margin:'4px 0' }}><strong>Dimensões:</strong> {item.largura} × {item.comprimento} × {item.espessura} cm</p>
          {item.localizacao && <p style={{ margin:'4px 0' }}><strong>Localização:</strong> {item.localizacao}</p>}
          {item.origem && <p style={{ margin:'4px 0' }}><strong>Origem:</strong> {item.origem}</p>}
        </div>

        <div style={{ display:'flex', gap:8 }}>
          <button onClick={downloadQRCode} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 16px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:600 }}><Download size={16}/> Baixar</button>
          <button onClick={printQRCode} style={{ flex:1, padding:'10px 16px', background:'var(--bg-tertiary)', color:'var(--text-primary)', border:'1px solid var(--border-color)', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:600 }}>Imprimir</button>
          <button onClick={onClose} style={{ flex:1, padding:'10px 16px', background:'var(--bg-tertiary)', color:'var(--text-primary)', border:'1px solid var(--border-color)', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:600 }}>Fechar</button>
        </div>
      </div>
    </div>
  )
}
