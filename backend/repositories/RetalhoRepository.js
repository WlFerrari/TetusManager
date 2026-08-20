/**
 * REPOSITÓRIO DE RETALHOS — PostgreSQL
 * Alinhado à documentação v1.2 do TetusManager.
 */

const { query } = require('../database/connection')

function toModel(row) {
  if (!row) return null
  return {
    id:            row.id,
    origem:        row.origem || null,
    origemTipo:    row.origem_tipo || (row.origem ? 'AUTOMATICA' : 'MANUAL'),
    nome:          row.nome,
    tipo:          row.tipo,
    cor:           row.cor,
    largura:       Number(row.largura),
    comprimento:   Number(row.comprimento),
    espessura:     Number(row.espessura),
    area:          Number(row.area),
    status:        row.status,
    localizacao:   row.localizacao || '',
    qrCode:        row.qr_code,
    foto:          row.foto || null,
    criadoPor:     row.criado_por || null,
    consumidoPor:  row.consumido_por || null,
    consumidoEm:   row.consumido_em ? new Date(row.consumido_em).toLocaleDateString('pt-BR') : null,
    descartadoPor: row.descartado_por || null,
    descartadoEm:  row.descartado_em ? new Date(row.descartado_em).toLocaleDateString('pt-BR') : null,
    criadoEm:      new Date(row.criado_em).toLocaleDateString('pt-BR'),
  }
}

function gerarId() {
  return 'RET-' + Date.now().toString().slice(-6)
}

function buildRetalhoQrPayload({ id }) {
  return `TETUS|RETALHO|${id}`
}

const RetalhoRepository = {
  async insert(data, exec = query) {
    const id = data.id || gerarId()
    const area = parseFloat(((+data.comprimento * +data.largura) / 10000).toFixed(4))
    const nome = data.nome?.trim() || `Sobra-${id}`
    const tipo = data.tipo || 'Granito'
    const cor = data.cor || '#6b7280'
    const espessura = data.espessura || 2
    const status = data.status || 'Disponível'
    const origem = data.origem || null
    const origemTipo = data.origemTipo || data.origem_tipo || (origem ? 'AUTOMATICA' : 'MANUAL')
    const qrCode = data.qrCode || buildRetalhoQrPayload({ id })

    const { rows } = await exec(`
      INSERT INTO retalhos (
        id, origem, origem_tipo, nome, tipo, cor, largura, comprimento,
        espessura, area, status, localizacao, qr_code, foto, criado_por
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *
    `, [
      id, origem, origemTipo, nome, tipo, cor, data.largura, data.comprimento,
      espessura, area, status, data.localizacao || null, qrCode,
      data.foto || null, data.criadoPor || null,
    ])
    return toModel(rows[0])
  },

  async inserir(data) { return this.insert(data) },

  async findAll(filtros = '') {
    if (typeof filtros === 'string') {
      if (filtros) {
        const { rows } = await query(`
          SELECT * FROM retalhos
          WHERE nome ILIKE $1 OR id ILIKE $1 OR status ILIKE $1
             OR COALESCE(localizacao,'') ILIKE $1
          ORDER BY criado_em DESC
        `, [`%${filtros}%`])
        return rows.map(toModel)
      }
      const { rows } = await query('SELECT * FROM retalhos ORDER BY criado_em DESC')
      return rows.map(toModel)
    }

    const {
      q, tipo, cor, espessura, status, origem, origemTipo, localizacao,
      minLargura, minComprimento, minArea,
    } = filtros || {}

    const where = []
    const params = []
    const add = (sql, val) => {
      params.push(val)
      where.push(sql.replace(/\$/g, `$${params.length}`))
    }

    if (q) add('(nome ILIKE $ OR id ILIKE $ OR status ILIKE $ OR COALESCE(localizacao,\'\') ILIKE $)', `%${q}%`)
    if (tipo) add('tipo ILIKE $', `%${tipo}%`)
    if (status) add('status = $', status)
    if (origem) add('origem = $', origem)
    if (origemTipo) add('origem_tipo = $', origemTipo)
    if (localizacao) add('localizacao ILIKE $', `%${localizacao}%`)
    if (cor) add('cor ILIKE $', `%${cor}%`)
    if (+espessura > 0) add('espessura = $', Number(espessura))
    if (+minLargura > 0) add('largura >= $', Number(minLargura))
    if (+minComprimento > 0) add('comprimento >= $', Number(minComprimento))
    if (+minArea > 0) add('area >= $', Number(minArea))

    const sql = `SELECT * FROM retalhos ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY criado_em DESC`
    const { rows } = await query(sql, params)
    return rows.map(toModel)
  },

  async findById(id, exec = query) {
    const { rows } = await exec('SELECT * FROM retalhos WHERE id=$1', [id])
    return toModel(rows[0])
  },

  async buscarPorId(id) { return this.findById(id) },

  async update(id, data, exec = query) {
    const area = data.area ?? parseFloat(((+data.comprimento * +data.largura) / 10000).toFixed(4))
    const nome = data.nome?.trim() || `Sobra-${id}`
    const tipo = data.tipo || 'Granito'
    const cor = data.cor || '#6b7280'
    const espessura = data.espessura || 2
    const status = data.status || 'Disponível'
    const qrCode = data.qrCode || buildRetalhoQrPayload({ id })
    const hasFoto = Object.prototype.hasOwnProperty.call(data, 'foto')
    const foto = hasFoto ? data.foto : null

    const { rows } = await exec(`
      UPDATE retalhos
      SET nome=$1, tipo=$2, cor=$3, largura=$4, comprimento=$5,
          espessura=$6, area=$7, status=$8, localizacao=$9, qr_code=$10,
          foto=CASE WHEN $11 THEN $12 ELSE foto END
      WHERE id=$13
      RETURNING *
    `, [
      nome, tipo, cor, data.largura, data.comprimento, espessura,
      area, status, data.localizacao || null, qrCode, hasFoto, foto, id,
    ])
    if (!rows[0]) throw new Error(`Retalho "${id}" não encontrado`)
    return toModel(rows[0])
  },

  async setStatus(id, status, userId = null, exec = query) {
    const auditSql = status === 'Consumido'
      ? ', consumido_por=$3, consumido_em=NOW()'
      : status === 'Descartado'
        ? ', descartado_por=$3, descartado_em=NOW()'
        : ''
    const params = auditSql ? [status, id, userId] : [status, id]
    const { rows } = await exec(`
      UPDATE retalhos SET status=$1 ${auditSql}
      WHERE id=$2 RETURNING *
    `, params)
    if (!rows[0]) throw new Error(`Retalho "${id}" não encontrado`)
    return toModel(rows[0])
  },

  async marcarReservado(id) { return this.setStatus(id, 'Reservado') },
  async marcarDisponivel(id) { return this.setStatus(id, 'Disponível') },
  async marcarConsumido(id, consumidoPor) { return this.setStatus(id, 'Consumido', consumidoPor) },
  async marcarDescartado(id, descartadoPor) { return this.setStatus(id, 'Descartado', descartadoPor) },

  // Compatibilidade: exclusão operacional vira descarte lógico.
  async delete(id) { return this.marcarDescartado(id, null) },

  async stats() {
    const { rows } = await query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status='Disponível') AS disponiveis,
        COUNT(*) FILTER (WHERE status='Reservado') AS reservados,
        COUNT(*) FILTER (WHERE status='Consumido') AS consumidos,
        COUNT(*) FILTER (WHERE status='Descartado') AS descartados,
        COALESCE(SUM(area) FILTER (WHERE status IN ('Disponível','Reservado')), 0) AS area_total
      FROM retalhos
    `)
    return {
      total: Number(rows[0].total),
      disponiveis: Number(rows[0].disponiveis),
      reservados: Number(rows[0].reservados),
      consumidos: Number(rows[0].consumidos),
      descartados: Number(rows[0].descartados),
      areaTotal: parseFloat(Number(rows[0].area_total).toFixed(2)),
    }
  },
}

module.exports = RetalhoRepository
