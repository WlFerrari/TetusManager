/**
 * REPOSITÓRIO DE USUÁRIOS — PostgreSQL
 */

const { query } = require('../database/connection')
const bcrypt    = require('bcryptjs')

function toModel(row) {
  if (!row) return null
  return {
    id:          row.id,
    nome:        row.nome,
    email:       row.email,
    perfil:      row.perfil,
    status:      row.status,
    telefone:    row.telefone || '',
    cargo:       row.cargo    || '',
    foto:        row.foto     || null,
    permissoes:  row.permissoes || {},
    criadoEm:    new Date(row.criado_em).toLocaleDateString('pt-BR'),
    // NUNCA retorna a senha_hash para o frontend
  }
}

const UserRepository = {

  /** [C] CREATE */
  async insert(data) {
    if (!data.senha || data.senha.length < 6) {
      throw new Error('Senha é obrigatória (mínimo 6 caracteres).')
    }
    const hash = await bcrypt.hash(data.senha, 10)
    const { rows } = await query(`
      INSERT INTO usuarios (nome, email, senha_hash, perfil, status, telefone, cargo, foto, permissoes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [data.nome, data.email, hash, data.perfil, data.status || 'Ativo',
        data.telefone || '', data.cargo || '', data.foto || null,
        JSON.stringify(data.permissoes || {})])
    return toModel(rows[0])
  },

  /** [R] READ ALL */
  async findAll(filtro = '') {
    if (filtro) {
      const { rows } = await query(`
        SELECT * FROM usuarios
        WHERE nome ILIKE $1 OR email ILIKE $1 OR perfil ILIKE $1
        ORDER BY nome
      `, [`%${filtro}%`])
      return rows.map(toModel)
    }
    const { rows } = await query('SELECT * FROM usuarios ORDER BY nome')
    return rows.map(toModel)
  },

  /** [R] READ ONE */
  async findById(id) {
    const { rows } = await query('SELECT * FROM usuarios WHERE id=$1', [id])
    return toModel(rows[0])
  },

  /** [R] READ por email (para autenticação — inclui hash) */
  async findByEmail(email) {
    const { rows } = await query('SELECT * FROM usuarios WHERE email=$1', [email.toLowerCase()])
    return rows[0] || null  // retorna row crua (com hash)
  },

  /** [U] UPDATE dados do perfil */
  async update(id, data) {
    const { rows } = await query(`
      UPDATE usuarios
      SET nome=$1, telefone=$2, cargo=$3, foto=$4
      WHERE id=$5
      RETURNING *
    `, [data.nome, data.telefone||'', data.cargo||'', data.foto||null, id])
    if (!rows[0]) throw new Error('Usuário não encontrado')
    return toModel(rows[0])
  },

  /** [U] UPDATE dados completos (admin editando outro usuário) */
  async updateFull(id, data) {
    const { rows } = await query(`
      UPDATE usuarios
      SET nome=$1, email=$2, perfil=$3, status=$4, telefone=$5, cargo=$6
      WHERE id=$7
      RETURNING *
    `, [data.nome, data.email, data.perfil, data.status, data.telefone||'', data.cargo||'', id])
    if (!rows[0]) throw new Error('Usuário não encontrado')
    return toModel(rows[0])
  },

  /** [U] UPDATE permissões individuais */
  async updatePermissoes(id, permissoes) {
    const { rows } = await query(`
      UPDATE usuarios
      SET permissoes = permissoes || $1::jsonb
      WHERE id=$2
      RETURNING *
    `, [JSON.stringify(permissoes), id])
    if (!rows[0]) throw new Error('Usuário não encontrado')
    return toModel(rows[0])
  },

  /** [U] Toggle status Ativo/Inativo */
  async toggleStatus(id) {
    const { rows } = await query(`
      UPDATE usuarios
      SET status = CASE WHEN status='Ativo' THEN 'Inativo' ELSE 'Ativo' END
      WHERE id=$1
      RETURNING *
    `, [id])
    if (!rows[0]) throw new Error('Usuário não encontrado')
    return toModel(rows[0])
  },

  /** [U] Alterar senha */
  async updateSenha(id, novaSenha) {
    const hash = await bcrypt.hash(novaSenha, 10)
    await query('UPDATE usuarios SET senha_hash=$1 WHERE id=$2', [hash, id])
  },

  /** [D] DELETE físico */
  async delete(id) {
    const { rows } = await query('DELETE FROM usuarios WHERE id=$1 RETURNING *', [id])
    if (!rows[0]) throw new Error('Usuário não encontrado')
    return toModel(rows[0])
  },
}

module.exports = UserRepository
