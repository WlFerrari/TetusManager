/**
 * QR CODE PAYLOAD — Utilitário compartilhado
 *
 * Funções para gerar o conteúdo textual dos QR Codes de chapas e retalhos.
 * Extraído dos padrões duplicados em ChapaRepository e RetalhoRepository.
 */

function safe(v) {
  return (v === undefined || v === null) ? '' : v
}

function buildChapaQrPayload({ id, nome, tipo, status, largura, comprimento, espessura }) {
  return `CHAPA|ID:${safe(id)}|Nome:${safe(nome)}|Tipo:${safe(tipo)}|Status:${safe(status)}|Dimensões:${safe(largura)}x${safe(comprimento)}x${safe(espessura)}mm`
}

function buildRetalhoQrPayload({ id, nome, tipo, status, largura, comprimento, espessura, origem }) {
  const origemLabel = origem ? `Chapa ${origem}` : 'Chapa N/A'
  return `RETALHO|ID:${safe(id)}|Nome:${safe(nome)}|Tipo:${safe(tipo)}|Status:${safe(status)}|Dimensões:${safe(largura)}x${safe(comprimento)}x${safe(espessura)}mm|Origem:${origemLabel}`
}

module.exports = { safe, buildChapaQrPayload, buildRetalhoQrPayload }
