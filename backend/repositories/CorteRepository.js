/**
 * REPOSITÓRIO DE CORTES — PostgreSQL
 */

const { query } = require('../database/connection')

function toModel(row) {
  if (!row) return null
  return {
    id: row.id,
    osNumero: row.os_numero,
    chapaId: row.chapa_id || null,
    retalhoId: row.retalho_id || null,
    comprimentoConsumido: Number(row.comprimento_consumido),
    larguraConsumida: Number(row.largura_consumida),
    areaConsumida: Number(row.area_consumida),
    areaRetalho: Number(row.area_retalho),
    observacao: row.observacao || null,
    criadoPor: row.criado_por || null,
    criadoEm: new Date(row.criado_em).toLocaleDateString('pt-BR'),
  }
}

const CorteRepository = {
  /** [C] CREATE */
  async insert(data) {
    const { rows } = await query(`
      INSERT INTO cortes (
        os_numero, chapa_id, retalho_id,
        comprimento_consumido, largura_consumida,
        area_consumida, area_retalho,
        observacao, criado_por
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [
      data.osNumero,
      data.chapaId || null,
      data.retalhoId || null,
      data.comprimentoConsumido,
      data.larguraConsumida,
      data.areaConsumida || 0,
      data.areaRetalho || 0,
      data.observacao || null,
      data.criadoPor || null,
    ])
    return toModel(rows[0])
  },

  /** [R] READ ALL */
  async findAll(filtros = {}) {
    const { chapaId, retalhoId, osNumero, limit } = filtros || {}

    const where = []
    const params = []
    const add = (sql, val) => {
      params.push(val)
      where.push(sql.replace('$', `$${params.length}`))
    }

    if (chapaId) add('chapa_id = $', chapaId)
    if (retalhoId) add('retalho_id = $', retalhoId)
    if (osNumero) add('os_numero ILIKE $', `%${osNumero}%`)

    let sql = `SELECT * FROM cortes ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY criado_em DESC`
    if (+limit > 0) {
      params.push(Number(limit))
      sql += ` LIMIT $${params.length}`
    }

    const { rows } = await query(sql, params)
    return rows.map(toModel)
  },

  /** Stats para dashboard */
  async stats() {
    const { rows } = await query(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(area_consumida), 0) AS area_consumida,
        COALESCE(SUM(area_retalho), 0) AS area_retalho
      FROM cortes
    `)
    return {
      total: Number(rows[0].total),
      areaConsumida: parseFloat(Number(rows[0].area_consumida).toFixed(2)),
      areaRetalho: parseFloat(Number(rows[0].area_retalho).toFixed(2)),
    }
  },
}

module.exports = CorteRepository

