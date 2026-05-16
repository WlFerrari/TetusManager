/**
 * REPOSITÓRIO DE RETALHOS — PostgreSQL
 */

const { query } = require('../database/connection')

function toModel(row) {
  if (!row) return null
  return {
    id:          row.id,
    origem:      row.origem,
    nome:        row.nome,
    tipo:        row.tipo,
    cor:         row.cor,
    largura:     Number(row.largura),
    comprimento: Number(row.comprimento),
    espessura:   Number(row.espessura),
    area:        Number(row.area),
    status:      row.status,
    qrCode:      row.qr_code,
    criadoPor:   row.criado_por || null,
    consumidoPor: row.consumido_por || null,
    criadoEm:    new Date(row.criado_em).toLocaleDateString('pt-BR'),
  }
}

function gerarId() {
  return 'RET-' + Date.now().toString().slice(-6)
}

function buildRetalhoQrPayload({ id, nome, tipo, status, largura, comprimento, espessura, origem }) {
  const safe = (v) => (v === undefined || v === null) ? '' : v
  const origemLabel = origem ? `Chapa ${origem}` : 'Chapa N/A'
  return `RETALHO|ID:${safe(id)}|Nome:${safe(nome)}|Tipo:${safe(tipo)}|Status:${safe(status)}|Dimensões:${safe(largura)}x${safe(comprimento)}x${safe(espessura)}mm|Origem:${origemLabel}`
}

const RetalhoRepository = {

  /** [C] CREATE */
  async insert(data) {
    const id   = gerarId()
    const area = parseFloat(((+data.comprimento * +data.largura) / 10000).toFixed(4))
    const nome = data.nome?.trim() || `Sobra-${id}` // Fallback se nome vazio/null
    const tipo = data.tipo || 'Granito'
    const cor = data.cor || '#6b7280'
    const espessura = data.espessura || 2
    const status = data.status || 'Disponível'
    const qrCode = data.qrCode || buildRetalhoQrPayload({
      id,
      nome,
      tipo,
      status,
      largura: data.largura,
      comprimento: data.comprimento,
      espessura,
      origem: data.origem || null,
    })
    const { rows } = await query(`
      INSERT INTO retalhos (id, origem, nome, tipo, cor, largura, comprimento, espessura, area, status, qr_code, criado_por)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `, [id, data.origem||null, nome, tipo, cor,
        data.largura, data.comprimento, espessura, area, status, qrCode, data.criadoPor || null])
    return toModel(rows[0])
  },

  /** [R] READ ALL */
  async findAll(filtro = '') {
    if (filtro) {
      const { rows } = await query(`
        SELECT * FROM retalhos
        WHERE nome ILIKE $1 OR id ILIKE $1 OR status ILIKE $1
        ORDER BY criado_em DESC
      `, [`%${filtro}%`])
      return rows.map(toModel)
    }
    const { rows } = await query('SELECT * FROM retalhos ORDER BY criado_em DESC')
    return rows.map(toModel)
  },

  /** [R] READ ONE */
  async findById(id) {
    const { rows } = await query('SELECT * FROM retalhos WHERE id=$1', [id])
    return toModel(rows[0])
  },

  /** [U] UPDATE */
  async update(id, data) {
    const area = data.area ?? parseFloat(((+data.comprimento * +data.largura) / 10000).toFixed(4))
    const nome = data.nome?.trim() || `Sobra-${id}` // Fallback se nome vazio/null
    const tipo = data.tipo || 'Granito'
    const cor = data.cor || '#6b7280'
    const espessura = data.espessura || 2
    const status = data.status || 'Disponível'
    const qrCode = data.qrCode || buildRetalhoQrPayload({
      id,
      nome,
      tipo,
      status,
      largura: data.largura,
      comprimento: data.comprimento,
      espessura,
      origem: data.origem || null,
    })
    const { rows } = await query(`
      UPDATE retalhos
      SET nome=$1, tipo=$2, cor=$3, largura=$4, comprimento=$5,
          espessura=$6, area=$7, status=$8, qr_code=COALESCE($9, qr_code)
      WHERE id=$10
      RETURNING *
    `, [nome, tipo, cor, data.largura, data.comprimento,
        espessura, area, status, qrCode, id])
    if (!rows[0]) throw new Error(`Retalho "${id}" não encontrado`)
    return toModel(rows[0])
  },

  /** [D] DELETE físico */
  async delete(id) {
    const { rows } = await query('DELETE FROM retalhos WHERE id=$1 RETURNING *', [id])
    if (!rows[0]) throw new Error(`Retalho "${id}" não encontrado`)
    return toModel(rows[0])
  },

  /** [D] DELETE lógico — soft delete */
  async marcarConsumido(id, consumidoPor) {
    const { rows } = await query(`
      UPDATE retalhos SET status='Consumido', consumido_por=$2 WHERE id=$1 RETURNING *
    `, [id, consumidoPor || null])
    if (!rows[0]) throw new Error(`Retalho "${id}" não encontrado`)
    return toModel(rows[0])
  },

  /** Stats para dashboard */
  async stats() {
    const { rows } = await query(`
      SELECT
        COUNT(*)                                         AS total,
        COUNT(*) FILTER (WHERE status='Disponível')     AS disponiveis,
        COUNT(*) FILTER (WHERE status='Reservado')      AS reservados,
        COUNT(*) FILTER (WHERE status='Consumido')      AS consumidos,
        COALESCE(SUM(area), 0)                          AS area_total
      FROM retalhos
    `)
    return {
      total:       Number(rows[0].total),
      disponiveis: Number(rows[0].disponiveis),
      reservados:  Number(rows[0].reservados),
      consumidos:  Number(rows[0].consumidos),
      areaTotal:   parseFloat(Number(rows[0].area_total).toFixed(2)),
    }
  },
}

module.exports = RetalhoRepository
