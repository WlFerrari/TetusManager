const { query } = require('../database/connection')

function toModel(row) {
  if (!row) return null
  return {
    nome:     row.nome,
    cnpj:     row.cnpj     || '',
    email:    row.email    || '',
    telefone: row.telefone || '',
    endereco: row.endereco || '',
    logo:     row.logo     || null,
    plano:    row.plano    || 'Profissional',
    fundacao: row.fundacao || '',
  }
}

const EmpresaRepository = {
  async get() {
    const { rows } = await query('SELECT * FROM empresa WHERE id=1')
    return toModel(rows[0])
  },

  async update(data) {
    const { rows } = await query(`
      INSERT INTO empresa (id, nome, cnpj, email, telefone, endereco, logo, plano, fundacao)
      VALUES (1,$1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (id) DO UPDATE
        SET nome=$1, cnpj=$2, email=$3, telefone=$4,
            endereco=$5, logo=$6, plano=$7, fundacao=$8
      RETURNING *
    `, [data.nome, data.cnpj, data.email, data.telefone,
        data.endereco, data.logo||null, data.plano, data.fundacao])
    return toModel(rows[0])
  },
}

module.exports = EmpresaRepository
