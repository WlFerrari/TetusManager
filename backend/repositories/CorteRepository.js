/**
 * REPOSITÓRIO DE CORTES — PostgreSQL
 */

const { query } = require('../database/connection')
const { createQueryBuilder } = require('../utils/queryBuilder')

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
    criadoEm:             new Date(row.criado_em).toLocaleDateString('pt-BR'),
  }
}

const CorteRepository = {

  async insert(data) {
    const { rows } = await query(`
      INSERT INTO cortes (os_numero, chapa_id, retalho_id, comprimento_consumido, largura_consumida, area_consumida, area_retalho, observacao, criado_por)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [
      data.osNumero,
      data.chapaId,
      data.retalhoId,
      data.comprimentoConsumido,
      data.larguraConsumida,
      data.areaConsumida,
      data.areaRetalho,
      data.observacao || null,
      data.criadoPor || null,
    ])
    return toModel(rows[0])
  },

  async findAll(filtros = {}) {
    const { chapaId, retalhoId, osNumero, limit } = filtros

    const qb = createQueryBuilder()
    qb.eq('chapa_id', chapaId)
    qb.eq('retalho_id', retalhoId)
    qb.ilike('os_numero', osNumero)

    const { whereClause, params } = qb.build()
    const limitClause = (+limit > 0) ? ` LIMIT ${+limit}` : ''
    const sql = `SELECT * FROM cortes ${whereClause} ORDER BY criado_em DESC${limitClause}`
    const { rows } = await query(sql, params)
    return rows.map(toModel)
  },

  async stats() {
    const { rows } = await query(`
      SELECT
        COUNT(*)                            AS total,
        COALESCE(SUM(area_consumida), 0)    AS area_consumida,
        COALESCE(SUM(area_retalho), 0)      AS area_retalho
      FROM cortes
    `)
    return {
      total:         Number(rows[0].total),
      areaConsumida: parseFloat(Number(rows[0].area_consumida).toFixed(2)),
      areaRetalho:   parseFloat(Number(rows[0].area_retalho).toFixed(2)),
    }
  },
}

module.exports = CorteRepository
