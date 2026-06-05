/**
 * QR CODE PAYLOAD — Utilitário compartilhado (Frontend)
 *
 * Funções para gerar o conteúdo textual dos QR Codes.
 * Extraído dos padrões duplicados em controllers/index.js.
 */

export function buildChapaQrPayload(data = {}) {
  return `CHAPA|ID:${data.id}|Nome:${data.nome}|Tipo:${data.tipo}|Status:${data.status}|Dimensões:${data.largura}x${data.comprimento}x${data.espessura}mm`
}

export function buildRetalhoQrPayload(data = {}) {
  const origemLabel = data.origem ? `Chapa ${data.origem}` : 'Chapa N/A'
  return `RETALHO|ID:${data.id}|Nome:${data.nome}|Tipo:${data.tipo}|Status:${data.status}|Dimensões:${data.largura}x${data.comprimento}x${data.espessura}mm|Origem:${origemLabel}`
}
