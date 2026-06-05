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
    foto:        row.foto || null,
    criadoPor:   row.criado_por || null,
    consumidoPor: row.consumido_por || null,
    consumidoEm: row.consumido_em ? new Date(row.consumido_em).toLocaleDateString('pt-BR') : null,
    descartadoPor: row.descartado_por || null,
    descartadoEm: row.descartado_em ? new Date(row.descartado_em).toLocaleDateString('pt-BR') : null,
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
      INSERT INTO retalhos (id, origem, nome, tipo, cor, largura, comprimento, espessura, area, status, qr_code, foto, criado_por)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `, [id, data.origem||null, nome, tipo, cor,
        data.largura, data.comprimento, espessura, area, status, qrCode, data.foto || null, data.criadoPor || null])
    return toModel(rows[0])
  },

  /** Alias: inserir (diagrama) */
  async inserir(data) {
    return this.insert(data)
  },

  /** [R] READ ALL */
  async findAll(filtros = '') {
    if (typeof filtros === 'string') {
      if (filtros) {
        const { rows } = await query(`
          SELECT * FROM retalhos
          WHERE nome ILIKE $1 OR id ILIKE $1 OR status ILIKE $1
          ORDER BY criado_em DESC
        `, [`%${filtros}%`])
        return rows.map(toModel)
      }
      const { rows } = await query('SELECT * FROM retalhos ORDER BY criado_em DESC')
      return rows.map(toModel)
    }

    const {
      q, tipo, cor, espessura, status, origem,
      minLargura, minComprimento, minArea,
    } = filtros || {}

    const where = []
    const params = []
    const add = (sql, val) => {
      const placeholderCount = (sql.match(/\$/g) || []).length
      let clause = sql
      for (let i = 0; i < placeholderCount; i++) {
        params.push(val)
        clause = clause.replace('$', `$${params.length}`)
      }
      where.push(clause)
    }

    if (q) add('(nome ILIKE $ OR id ILIKE $ OR status ILIKE $)', `%${q}%`)
    if (tipo) add('tipo ILIKE $', `%${tipo}%`)
    if (status) add('status = $', status)
    if (origem) add('origem = $', origem)
    if (cor) add('cor ILIKE $', `%${cor}%`)
    if (+espessura > 0) add('espessura = $', Number(espessura))
    if (+minLargura > 0) add('largura >= $', Number(minLargura))
    if (+minComprimento > 0) add('comprimento >= $', Number(minComprimento))
    if (+minArea > 0) add('area >= $', Number(minArea))

    const sql = `SELECT * FROM retalhos ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY criado_em DESC`
    const { rows } = await query(sql, params)
    return rows.map(toModel)
  },

  /** [R] READ ONE */
  async findById(id) {
    const { rows } = await query('SELECT * FROM retalhos WHERE id=$1', [id])
    return toModel(rows[0])
  },

  /** Alias: buscarPorId (diagrama) */
  async buscarPorId(id) {
    return this.findById(id)
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
          espessura=$6, area=$7, status=$8, qr_code=COALESCE($9, qr_code), foto=COALESCE($10, foto)
      WHERE id=$11
      RETURNING *
    `, [nome, tipo, cor, data.largura, data.comprimento,
        espessura, area, status, qrCode, data.foto || null, id])
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
      UPDATE retalhos
      SET status='Consumido', consumido_por=$2, consumido_em=NOW()
      WHERE id=$1 RETURNING *
    `, [id, consumidoPor || null])
    if (!rows[0]) throw new Error(`Retalho "${id}" não encontrado`)
    return toModel(rows[0])
  },

  /** [D] DESCARTAR — marca como descartado (histórico) */
  async marcarDescartado(id, descartadoPor) {
    const { rows } = await query(`
      UPDATE retalhos
      SET status='Descartado', descartado_por=$2, descartado_em=NOW()
      WHERE id=$1 RETURNING *
    `, [id, descartadoPor || null])
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
        COUNT(*) FILTER (WHERE status='Descartado')     AS descartados,
        COALESCE(SUM(area), 0)                          AS area_total
      FROM retalhos
    `)
    return {
      total:       Number(rows[0].total),
      disponiveis: Number(rows[0].disponiveis),
      reservados:  Number(rows[0].reservados),
      consumidos:  Number(rows[0].consumidos),
      descartados: Number(rows[0].descartados),
      areaTotal:   parseFloat(Number(rows[0].area_total).toFixed(2)),
    }
  },
}

module.exports = RetalhoRepository
