/**
 * REPOSITÓRIO DE CHAPAS — PostgreSQL
 * Todas as queries parametrizadas ($1, $2...) para evitar SQL Injection.
 */

const { query } = require('../database/connection')

// Converte snake_case do banco para camelCase do front
function toModel(row) {
  if (!row) return null
  return {
    id:          row.id,
    nome:        row.nome,
    tipo:        row.tipo,
    cor:         row.cor,
    largura:     Number(row.largura),
    comprimento: Number(row.comprimento),
    espessura:   Number(row.espessura),
    status:      row.status,
    qrCode:      row.qr_code,
    criadoEm:    new Date(row.criado_em).toLocaleDateString('pt-BR'),
  }
}

function gerarId() {
  return 'CH' + Date.now().toString().slice(-6)
}

function buildChapaQrPayload({ id, nome, tipo, status, largura, comprimento, espessura }) {
  const safe = (v) => (v === undefined || v === null) ? '' : v
  return `CHAPA|ID:${safe(id)}|Nome:${safe(nome)}|Tipo:${safe(tipo)}|Status:${safe(status)}|Dimensões:${safe(largura)}x${safe(comprimento)}x${safe(espessura)}mm`
}

const ChapaRepository = {

  /** [C] CREATE */
  async insert(data) {
    const id = gerarId()
    const status = data.status || 'Disponível'
    const qrCode = data.qrCode || buildChapaQrPayload({
      id,
      nome: data.nome,
      tipo: data.tipo,
      status,
      largura: data.largura,
      comprimento: data.comprimento,
      espessura: data.espessura,
    })
    const { rows } = await query(`
      INSERT INTO chapas (id, nome, tipo, cor, largura, comprimento, espessura, status, qr_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [id, data.nome, data.tipo, data.cor, data.largura, data.comprimento, data.espessura, status, qrCode])
    return toModel(rows[0])
  },

  /** [R] READ ALL — com filtro opcional */
  async findAll(filtro = '') {
    if (filtro) {
      const { rows } = await query(`
        SELECT * FROM chapas
        WHERE nome ILIKE $1 OR tipo ILIKE $1 OR id ILIKE $1
        ORDER BY criado_em DESC
      `, [`%${filtro}%`])
      return rows.map(toModel)
    }
    const { rows } = await query('SELECT * FROM chapas ORDER BY criado_em DESC')
    return rows.map(toModel)
  },

  /** [R] READ ONE */
  async findById(id) {
    const { rows } = await query('SELECT * FROM chapas WHERE id = $1', [id])
    return toModel(rows[0])
  },

  /** [U] UPDATE */
  async update(id, data) {
    const status = data.status || 'Disponível'
    const qrCode = data.qrCode || buildChapaQrPayload({
      id,
      nome: data.nome,
      tipo: data.tipo,
      status,
      largura: data.largura,
      comprimento: data.comprimento,
      espessura: data.espessura,
    })
    const { rows } = await query(`
      UPDATE chapas
      SET nome=$1, tipo=$2, cor=$3, largura=$4, comprimento=$5, espessura=$6, status=$7,
          qr_code=COALESCE($8, qr_code)
      WHERE id=$9
      RETURNING *
    `, [data.nome, data.tipo, data.cor, data.largura, data.comprimento, data.espessura, status, qrCode, id])
    if (!rows[0]) throw new Error(`Chapa "${id}" não encontrada`)
    return toModel(rows[0])
  },

  /** [D] DELETE físico */
  async delete(id) {
    const { rows } = await query('DELETE FROM chapas WHERE id=$1 RETURNING *', [id])
    if (!rows[0]) throw new Error(`Chapa "${id}" não encontrada`)
    return toModel(rows[0])
  },

  /** Stats para dashboard */
  async stats() {
    const { rows } = await query(`
      SELECT
        COUNT(*)                                       AS total,
        COUNT(*) FILTER (WHERE status='Disponível')   AS disponiveis,
        COUNT(*) FILTER (WHERE status='Em uso')       AS em_uso
      FROM chapas
    `)
    return {
      total:       Number(rows[0].total),
      disponiveis: Number(rows[0].disponiveis),
      emUso:       Number(rows[0].em_uso),
    }
  },
}

module.exports = ChapaRepository
