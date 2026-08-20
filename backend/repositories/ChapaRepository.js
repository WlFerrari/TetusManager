/**
 * REPOSITÓRIO DE CHAPAS — PostgreSQL
 * Alinhado à documentação v1.2 do TetusManager.
 */

const { query } = require('../database/connection')

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
    localizacao: row.localizacao || '',
    qrCode:      row.qr_code,
    foto:        row.foto || null,
    criadoPor:   row.criado_por || null,
    criadoEm:    new Date(row.criado_em).toLocaleDateString('pt-BR'),
  }
}

function gerarId() {
  return 'CH' + Date.now().toString().slice(-6)
}

function buildChapaQrPayload({ id }) {
  return `TETUS|CHAPA|${id}`
}

const ChapaRepository = {
  async insert(data, exec = query) {
    const id = data.id || gerarId()
    const status = data.status || 'Disponível'
    const qrCode = data.qrCode || buildChapaQrPayload({ id })
    const { rows } = await exec(`
      INSERT INTO chapas (
        id, nome, tipo, cor, largura, comprimento, espessura,
        status, localizacao, qr_code, foto, criado_por
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `, [
      id, data.nome, data.tipo, data.cor, data.largura, data.comprimento,
      data.espessura, status, data.localizacao || null, qrCode,
      data.foto || null, data.criadoPor || null,
    ])
    return toModel(rows[0])
  },

  async findAll(filtros = '') {
    if (typeof filtros === 'string') {
      if (filtros) {
        const { rows } = await query(`
          SELECT * FROM chapas
          WHERE nome ILIKE $1 OR tipo ILIKE $1 OR id ILIKE $1 OR COALESCE(localizacao,'') ILIKE $1
          ORDER BY criado_em DESC
        `, [`%${filtros}%`])
        return rows.map(toModel)
      }
      const { rows } = await query('SELECT * FROM chapas ORDER BY criado_em DESC')
      return rows.map(toModel)
    }

    const { q, tipo, cor, espessura, status, localizacao, minLargura, minComprimento } = filtros || {}
    const where = []
    const params = []
    const add = (sql, val) => {
      params.push(val)
      where.push(sql.replace(/\$/g, `$${params.length}`))
    }

    if (q) add('(nome ILIKE $ OR tipo ILIKE $ OR id ILIKE $ OR COALESCE(localizacao,\'\') ILIKE $)', `%${q}%`)
    if (tipo) add('tipo ILIKE $', `%${tipo}%`)
    if (status) add('status = $', status)
    if (cor) add('cor ILIKE $', `%${cor}%`)
    if (localizacao) add('localizacao ILIKE $', `%${localizacao}%`)
    if (+espessura > 0) add('espessura = $', Number(espessura))
    if (+minLargura > 0) add('largura >= $', Number(minLargura))
    if (+minComprimento > 0) add('comprimento >= $', Number(minComprimento))

    const sql = `SELECT * FROM chapas ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY criado_em DESC`
    const { rows } = await query(sql, params)
    return rows.map(toModel)
  },

  async listar(filtro = '') { return this.findAll(filtro) },

  async listarDisponiveis() {
    const { rows } = await query("SELECT * FROM chapas WHERE status = 'Disponível' ORDER BY criado_em DESC")
    return rows.map(toModel)
  },

  async findById(id, exec = query) {
    const { rows } = await exec('SELECT * FROM chapas WHERE id = $1', [id])
    return toModel(rows[0])
  },

  async buscarPorId(id) { return this.findById(id) },

  async update(id, data, exec = query) {
    const status = data.status || 'Disponível'
    const qrCode = data.qrCode || buildChapaQrPayload({ id })
    const hasFoto = Object.prototype.hasOwnProperty.call(data, 'foto')
    const foto = hasFoto ? data.foto : null
    const { rows } = await exec(`
      UPDATE chapas
      SET nome=$1, tipo=$2, cor=$3, largura=$4, comprimento=$5, espessura=$6,
          status=$7, localizacao=$8, qr_code=$9,
          foto=CASE WHEN $10 THEN $11 ELSE foto END
      WHERE id=$12
      RETURNING *
    `, [
      data.nome, data.tipo, data.cor, data.largura, data.comprimento,
      data.espessura, status, data.localizacao || null, qrCode,
      hasFoto, foto, id,
    ])
    if (!rows[0]) throw new Error(`Chapa "${id}" não encontrada`)
    return toModel(rows[0])
  },

  async atualizar(id, data) { return this.update(id, data) },

  async setStatus(id, status, exec = query) {
    const { rows } = await exec('UPDATE chapas SET status=$1 WHERE id=$2 RETURNING *', [status, id])
    if (!rows[0]) throw new Error(`Chapa "${id}" não encontrada`)
    return toModel(rows[0])
  },

  async inativar(id, exec = query) {
    return this.setStatus(id, 'Inativa', exec)
  },

  // Mantido como alias para compatibilidade com chamadas antigas; não faz DELETE físico.
  async delete(id) { return this.inativar(id) },
  async remover(id) { return this.inativar(id) },

  async stats() {
    const { rows } = await query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status='Disponível') AS disponiveis,
        COUNT(*) FILTER (WHERE status='Em uso') AS em_uso,
        COUNT(*) FILTER (WHERE status='Inativa') AS inativas,
        COALESCE(SUM((largura * comprimento) / 10000), 0) AS area_total
      FROM chapas
    `)
    return {
      total: Number(rows[0].total),
      disponiveis: Number(rows[0].disponiveis),
      emUso: Number(rows[0].em_uso),
      inativas: Number(rows[0].inativas),
      areaTotal: parseFloat(Number(rows[0].area_total).toFixed(2)),
    }
  },
}

module.exports = ChapaRepository
