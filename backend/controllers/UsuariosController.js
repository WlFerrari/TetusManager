const bcrypt = require('bcryptjs')
const UserRepo = require('../repositories/UserRepository')
const { PERMISSOES_PADRAO } = require('../models')

class UsuariosController {
  async list(req, res, next) {
    try {
      const data = await UserRepo.findAll(req.query.q || '')
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async show(req, res, next) {
    try {
      const data = await UserRepo.findById(req.params.id)
      if (!data) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuário não encontrado.'
        })
      }
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async create(req, res, next) {
    try {
      const { nome, email, perfil, senha } = req.body

      // Validar
      if (!nome?.trim()) {
        return res.status(400).json({
          ok: false,
          msg: 'Nome é obrigatório.'
        })
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          ok: false,
          msg: 'E-mail inválido.'
        })
      }

      if (!senha || senha.length < 6) {
        return res.status(400).json({
          ok: false,
          msg: 'Senha é obrigatória (mínimo 6 caracteres).'
        })
      }

      // Verificar duplicata
      const existe = await UserRepo.findByEmail(email)
      if (existe) {
        return res.status(400).json({
          ok: false,
          msg: 'E-mail já cadastrado.'
        })
      }

      // Atribuir permissões padrão
      const permissoes = PERMISSOES_PADRAO[perfil] || PERMISSOES_PADRAO['Vendedor']
      const data = await UserRepo.insert({ ...req.body, permissoes })

      res.status(201).json({
        ok: true,
        data,
        msg: `Usuário "${data.nome}" criado!`
      })
    } catch (e) { next(e) }
  }

  async update(req, res, next) {
    try {
      const data = await UserRepo.updateFull(req.params.id, req.body)
      res.json({
        ok: true,
        data,
        msg: `Usuário "${data.nome}" atualizado!`
      })
    } catch (e) { next(e) }
  }

  async updatePermissions(req, res, next) {
    try {
      const user = await UserRepo.findById(req.params.id)
      if (!user) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuário não encontrado.'
        })
      }

      if (user.perfil === 'Administrador') {
        return res.status(400).json({
          ok: false,
          msg: 'Permissões do Administrador não podem ser alteradas.'
        })
      }

      const data = await UserRepo.updatePermissoes(req.params.id, req.body.permissoes)
      res.json({
        ok: true,
        data,
        msg: 'Permissões atualizadas!'
      })
    } catch (e) { next(e) }
  }

  async resetPermissions(req, res, next) {
    try {
      const user = await UserRepo.findById(req.params.id)
      if (!user) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuário não encontrado.'
        })
      }

      if (user.perfil === 'Administrador') {
        return res.status(400).json({
          ok: false,
          msg: 'Permissões do Administrador não podem ser resetadas.'
        })
      }

      const defaultPerms = PERMISSOES_PADRAO[user.perfil] || PERMISSOES_PADRAO['Vendedor']
      const data = await UserRepo.updatePermissoes(req.params.id, defaultPerms)

      res.json({
        ok: true,
        data,
        msg: 'Permissões resetadas para padrão!'
      })
    } catch (e) { next(e) }
  }

  async toggle(req, res, next) {
    try {
      const data = await UserRepo.toggleStatus(req.params.id)
      res.json({
        ok: true,
        data,
        msg: `Usuário ${data.status === 'Ativo' ? 'ativado' : 'inativado'}!`
      })
    } catch (e) { next(e) }
  }

  async delete(req, res, next) {
    try {
      const data = await UserRepo.delete(req.params.id)
      res.json({
        ok: true,
        data,
        msg: `Usuário "${data.nome}" excluído!`
      })
    } catch (e) { next(e) }
  }

  async me(req, res, next) {
    try {
      const data = await UserRepo.findById(req.user.id)
      if (!data) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuário não encontrado.'
        })
      }
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async updateProfile(req, res, next) {
    try {
      const { nome, telefone, cargo, foto } = req.body
      if (!nome?.trim()) {
        return res.status(400).json({
          ok: false,
          msg: 'Nome é obrigatório.'
        })
      }

      const data = await UserRepo.update(req.user.id, { nome, telefone, cargo, foto })
      res.json({
        ok: true,
        data,
        msg: 'Perfil atualizado!'
      })
    } catch (e) { next(e) }
  }

  async changePassword(req, res, next) {
    try {
      const { senhaAtual, novaSenha } = req.body

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          ok: false,
          msg: 'Senhas são obrigatórias.'
        })
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({
          ok: false,
          msg: 'Nova senha: mínimo 6 caracteres.'
        })
      }

      const row = await UserRepo.findByEmail(req.user.email)
      if (!row) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuário não encontrado.'
        })
      }
      const valid = await bcrypt.compare(senhaAtual, row.senha_hash)

      if (!valid) {
        return res.status(401).json({
          ok: false,
          msg: 'Senha atual incorreta.'
        })
      }

      await UserRepo.updateSenha(req.user.id, novaSenha)

      res.json({
        ok: true,
        msg: 'Senha alterada com sucesso!'
      })
    } catch (e) { next(e) }
  }
}

module.exports = new UsuariosController()

