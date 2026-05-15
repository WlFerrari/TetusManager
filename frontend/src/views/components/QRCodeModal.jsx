import React, { useRef } from 'react'
import { Download, X } from 'lucide-react'
import QRCode from 'qrcode.react'
import html2canvas from 'html2canvas'

export default function QRCodeModal({ item, type = 'chapa', onClose }) {
  const qrRef = useRef()

  // Gera dados para o QR code
  const generateQRData = () => {
    if (item?.qrCode) return item.qrCode
    const baseInfo = `${type.toUpperCase()}|ID:${item.id}|Nome:${item.nome}`
    
    if (type === 'chapa') {
      return `${baseInfo}|Tipo:${item.tipo}|Status:${item.status}|Dimensões:${item.largura}x${item.comprimento}x${item.espessura}mm`
    } else if (type === 'retalho') {
      return `${baseInfo}|Tipo:${item.tipo}|Status:${item.status}|Dimensões:${item.largura}x${item.comprimento}x${item.espessura}mm|Origem:${item.origem}`
    }
    return baseInfo
  }

  const downloadQRCode = async () => {
    const element = qrRef.current
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
      })

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `qrcode-${type}-${item.id}-${new Date().getTime()}.png`
      link.click()
    } catch (error) {
      console.error('Erro ao baixar QR code:', error)
    }
  }

  const printQRCode = () => {
    const element = qrRef.current
    if (!element) return

    const printWindow = window.open('', '', 'width=400,height=500')
    printWindow.document.write(`
      <html>
        <head>
          <title>QR Code - ${item.nome}</title>
          <style>
            body { text-align: center; font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin: 10px 0; font-size: 18px; }
            p { margin: 5px 0; font-size: 12px; color: #666; }
            #qrcode { margin: 20px 0; }
          </style>
        </head>
        <body>
          <h2>${item.nome}</h2>
          <p>ID: ${item.id}</p>
          <p>Tipo: ${item.tipo} | Status: ${item.status}</p>
          ${element.innerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          width: '90%',
          maxWidth: 420,
          boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 }}>QR Code</h2>
            <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0 0' }}>{item.nome}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* QR Code */}
        <div
          ref={qrRef}
          style={{
            display: 'flex',
            justifyContent: 'center',
            background: '#f9fafb',
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
            border: '1px solid #e5e7eb',
          }}
        >
          <QRCode
            value={generateQRData()}
            size={256}
            level="H"
            includeMargin={true}
            fgColor="#111827"
            bgColor="#ffffff"
          />
        </div>

        {/* Informações */}
        <div style={{ background: '#f3f4f6', borderRadius: 8, padding: 12, marginBottom: 24, fontSize: 13 }}>
          <p style={{ margin: '4px 0', color: '#374151' }}>
            <strong>ID:</strong> {item.id}
          </p>
          <p style={{ margin: '4px 0', color: '#374151' }}>
            <strong>Tipo:</strong> {item.tipo}
          </p>
          <p style={{ margin: '4px 0', color: '#374151' }}>
            <strong>Status:</strong> {item.status}
          </p>
          <p style={{ margin: '4px 0', color: '#374151' }}>
            <strong>Dimensões:</strong> {item.largura} × {item.comprimento} × {item.espessura}mm
          </p>
          {item.origem && (
            <p style={{ margin: '4px 0', color: '#374151' }}>
              <strong>Origem:</strong> {item.origem}
            </p>
          )}
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={downloadQRCode}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '10px 16px',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = '#2563eb'}
            onMouseLeave={e => e.target.style.background = '#3b82f6'}
          >
            <Download size={16} /> Baixar
          </button>
          <button
            onClick={printQRCode}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: '#e5e7eb',
              color: '#374151',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = '#d1d5db'}
            onMouseLeave={e => e.target.style.background = '#e5e7eb'}
          >
            Imprimir
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: '#f3f4f6',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = '#e5e7eb'}
            onMouseLeave={e => e.target.style.background = '#f3f4f6'}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
