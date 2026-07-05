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
    foto:        row.foto || null,
    criadoPor:   row.criado_por || null,
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
      INSERT INTO chapas (id, nome, tipo, cor, largura, comprimento, espessura, status, qr_code, foto, criado_por)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [id, data.nome, data.tipo, data.cor, data.largura, data.comprimento, data.espessura, status, qrCode, data.foto || null, data.criadoPor || null])
    return toModel(rows[0])
  },

  /** [R] READ ALL — com filtro opcional */
  async findAll(filtros = '') {
    if (typeof filtros === 'string') {
      if (filtros) {
        const { rows } = await query(`
          SELECT * FROM chapas
          WHERE nome ILIKE $1 OR tipo ILIKE $1 OR id ILIKE $1
          ORDER BY criado_em DESC
        `, [`%${filtros}%`])
        return rows.map(toModel)
      }
      const { rows } = await query('SELECT * FROM chapas ORDER BY criado_em DESC')
      return rows.map(toModel)
    }

    const {
      q, tipo, cor, espessura, status,
      minLargura, minComprimento,
    } = filtros || {}

    const where = []
    const params = []
    const add = (sql, val) => {
      params.push(val)
      where.push(sql.replace(/\$/g, `$${params.length}`))
    }

    if (q) add('(nome ILIKE $ OR tipo ILIKE $ OR id ILIKE $)', `%${q}%`)
    if (tipo) add('tipo ILIKE $', `%${tipo}%`)
    if (status) add('status = $', status)
    if (cor) add('cor ILIKE $', `%${cor}%`)
    if (+espessura > 0) add('espessura = $', Number(espessura))
    if (+minLargura > 0) add('largura >= $', Number(minLargura))
    if (+minComprimento > 0) add('comprimento >= $', Number(minComprimento))

    const sql = `SELECT * FROM chapas ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY criado_em DESC`
    const { rows } = await query(sql, params)
    return rows.map(toModel)
  },

  /** Alias: listar (diagrama) */
  async listar(filtro = '') {
    return this.findAll(filtro)
  },

  /** Alias: listarDisponiveis (diagrama) */
  async listarDisponiveis() {
    const { rows } = await query(
      "SELECT * FROM chapas WHERE status = 'Disponível' ORDER BY criado_em DESC"
    )
    return rows.map(toModel)
  },

  /** [R] READ ONE */
  async findById(id) {
    const { rows } = await query('SELECT * FROM chapas WHERE id = $1', [id])
    return toModel(rows[0])
  },

  /** Alias: buscarPorId (diagrama) */
  async buscarPorId(id) {
    return this.findById(id)
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
    const hasFoto = Object.prototype.hasOwnProperty.call(data, 'foto')
    const foto = hasFoto ? data.foto : null
    const { rows } = await query(`
      UPDATE chapas
      SET nome=$1, tipo=$2, cor=$3, largura=$4, comprimento=$5, espessura=$6, status=$7,
          qr_code=COALESCE($8, qr_code),
          foto=CASE WHEN $9 THEN $10 ELSE foto END
      WHERE id=$11
      RETURNING *
    `, [data.nome, data.tipo, data.cor, data.largura, data.comprimento, data.espessura, status, qrCode, hasFoto, foto, id])
    if (!rows[0]) throw new Error(`Chapa "${id}" não encontrada`)
    return toModel(rows[0])
  },

  /** Alias: atualizar (diagrama) */
  async atualizar(id, data) {
    return this.update(id, data)
  },

  /** [D] DELETE físico */
  async delete(id) {
    const { rows } = await query('DELETE FROM chapas WHERE id=$1 RETURNING *', [id])
    if (!rows[0]) throw new Error(`Chapa "${id}" não encontrada`)
    return toModel(rows[0])
  },

  /** Alias: remover (diagrama) */
  async remover(id) {
    return this.delete(id)
  },

  /** Stats para dashboard */
  async stats() {
    const { rows } = await query(`
      SELECT
        COUNT(*)                                       AS total,
        COUNT(*) FILTER (WHERE status='Disponível')   AS disponiveis,
        COUNT(*) FILTER (WHERE status='Em uso')       AS em_uso,
        COALESCE(SUM((largura * comprimento) / 10000), 0) AS area_total
      FROM chapas
    `)
    return {
      total:       Number(rows[0].total),
      disponiveis: Number(rows[0].disponiveis),
      emUso:       Number(rows[0].em_uso),
      areaTotal:   parseFloat(Number(rows[0].area_total).toFixed(2)),
    }
  },
}

module.exports = ChapaRepository
