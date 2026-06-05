/**
 * REPOSITÓRIO DE CORTES — PostgreSQL
 * Placeholder for the corte (cut) records.
 */

const { query } = require('../database/connection')

function toModel(row) {
  if (!row) return null
  return {
    id:                   row.id,
    osNumero:             row.os_numero,
    chapaId:              row.chapa_id,
    retalhoId:            row.retalho_id,
    comprimentoConsumido: Number(row.comprimento_consumido),
    larguraConsumida:     Number(row.largura_consumida),
    areaConsumida:        Number(row.area_consumida),
    areaRetalho:          Number(row.area_retalho),
    observacao:           row.observacao || '',
    criadoPor:            row.criado_por || null,
    criadoEm:             row.criado_em ? new Date(row.criado_em).toLocaleDateString('pt-BR') : null,
  }
}

const CorteRepository = {
  async insert(data) {
    const { rows } = await query(`
      INSERT INTO cortes (os_numero, chapa_id, retalho_id, comprimento_consumido, largura_consumida, area_consumida, area_retalho, observacao, criado_por)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [data.osNumero, data.chapaId, data.retalhoId, data.comprimentoConsumido,
        data.larguraConsumida, data.areaConsumida, data.areaRetalho, data.observacao, data.criadoPor])
    return toModel(rows[0])
  },

  async findAll(filtros = {}) {
    const where = []
    const params = []
    if (filtros.chapaId) { params.push(filtros.chapaId); where.push(`chapa_id = $${params.length}`) }
    if (filtros.retalhoId) { params.push(filtros.retalhoId); where.push(`retalho_id = $${params.length}`) }
    if (filtros.osNumero) { params.push(filtros.osNumero); where.push(`os_numero = $${params.length}`) }

    let sql = `SELECT * FROM cortes ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY criado_em DESC`
    if (+filtros.limit > 0) { params.push(+filtros.limit); sql += ` LIMIT $${params.length}` }

    const { rows } = await query(sql, params)
    return rows.map(toModel)
  },

  async stats() {
    const { rows } = await query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(area_consumida), 0) AS area_total_consumida,
        COALESCE(SUM(area_retalho), 0) AS area_total_retalho
      FROM cortes
    `)
    return {
      total:               Number(rows[0].total),
      areaTotalConsumida:  parseFloat(Number(rows[0].area_total_consumida).toFixed(2)),
      areaTotalRetalho:    parseFloat(Number(rows[0].area_total_retalho).toFixed(2)),
    }
  },
}

module.exports = CorteRepository
