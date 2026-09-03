const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const UserRepo = require('../repositories/UserRepository')
const { email:validateEmail, password:validatePassword } = require('../utils/validation')

class AuthController {
  async login(req, res, next) {
    try {
      const email = String(req.body.email || '').trim().toLowerCase()
      const senha = String(req.body.senha || '')

      const emailError = validateEmail(email)
      if (emailError) return res.status(400).json({ ok:false, msg:emailError })
      const passwordError = validatePassword(senha, 'Senha')
      if (passwordError) return res.status(400).json({ ok:false, msg:passwordError })

      const row = await UserRepo.findByEmail(email)
      if (!row || row.status !== 'Ativo') {
        return res.status(401).json({ ok:false, msg:'E-mail ou senha inválidos.' })
      }

      const valid = await bcrypt.compare(senha, row.senha_hash)
      if (!valid) return res.status(401).json({ ok:false, msg:'E-mail ou senha inválidos.' })

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ ok:false, msg:'Configuração de autenticação indisponível.' })
      }

      const payload = {
        id:row.id,
        nome:row.nome,
        email:row.email,
        perfil:row.perfil,
        permissoes:row.permissoes,
      }

      const user = {
        ...payload,
        foto:row.foto || null,
        telefone:row.telefone || '',
        cargo:row.cargo || '',
      }

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRES_IN || '8h',
      })

      res.json({
        ok:true,
        data:{ token, user },
        msg:'Login realizado com sucesso!',
      })
    } catch (e) {
      console.error('Erro ao fazer login:', e.message)
      next(e)
    }
  }
}

module.exports = new AuthController()
