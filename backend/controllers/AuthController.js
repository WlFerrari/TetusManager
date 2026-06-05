const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const UserRepo = require('../repositories/UserRepository')

class AuthController {
  async login(req, res, next) {
    try {
      const { email, senha } = req.body

      // Validar
      if (!email || !senha) {
        return res.status(400).json({
          ok: false,
          msg: 'E-mail e senha são obrigatórios.'
        })
      }

      // Buscar usuário
      const row = await UserRepo.findByEmail(email)
      if (!row) {
        return res.status(401).json({
          ok: false,
          msg: 'Usuário não encontrado ou conta inativa.'
        })
      }

      if (row.status !== 'Ativo') {
        return res.status(401).json({
          ok: false,
          msg: 'Conta inativa.'
        })
      }

      // Validar senha
      const valid = await bcrypt.compare(senha, row.senha_hash)
      if (!valid) {
        return res.status(401).json({
          ok: false,
          msg: 'Senha incorreta.'
        })
      }

      // Gerar JWT (payload mínimo — dados sensíveis ficam apenas na resposta)
      const tokenPayload = {
        id: row.id,
        email: row.email,
        perfil: row.perfil,
        permissoes: row.permissoes,
      }

      const token = jwt.sign(
        tokenPayload,
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      )

      const userResponse = {
        id: row.id,
        nome: row.nome,
        email: row.email,
        perfil: row.perfil,
        permissoes: row.permissoes,
        foto: row.foto,
        telefone: row.telefone,
        cargo: row.cargo,
      }

      res.json({
        ok: true,
        data: { token, user: userResponse },
        msg: 'Login realizado com sucesso!'
      })

    } catch (e) {
      console.error('Erro ao fazer login:', e.message)
      next(e)
    }
  }
}

module.exports = new AuthController()

