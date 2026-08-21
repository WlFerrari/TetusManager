const bcrypt = require('bcryptjs')
const UserRepo = require('../repositories/UserRepository')
const { PERMISSOES_PADRAO } = require('../models')
const { validateProfile, validateUser, password } = require('../utils/validation')

const PERMISSION_KEYS = new Set(Object.keys(PERMISSOES_PADRAO.Administrador || {}))

class UsuariosController {
  async list(req, res, next) {
    try {
      const q = String(req.query.q || '')
      if (q.length > 120) return res.status(400).json({ ok:false, msg:'Busca muito longa.' })
      const data = await UserRepo.findAll(q)
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async show(req, res, next) {
    try {
      const data = await UserRepo.findById(req.params.id)
      if (!data) return res.status(404).json({ ok:false, msg:'Usuário não encontrado.' })
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async create(req, res, next) {
    try {
      const payload = {
        ...req.body,
        nome:String(req.body.nome || '').trim(),
        email:String(req.body.email || '').trim().toLowerCase(),
        status:req.body.status || 'Ativo',
      }
      const invalid = validateUser(payload, { requirePassword:true })
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })

      const existe = await UserRepo.findByEmail(payload.email)
      if (existe) return res.status(400).json({ ok:false, msg:'E-mail já cadastrado.' })

      const permissoes = PERMISSOES_PADRAO[payload.perfil] || PERMISSOES_PADRAO.Vendedor
      const data = await UserRepo.insert({ ...payload, permissoes })
      res.status(201).json({ ok:true, data, msg:`Usuário "${data.nome}" criado!` })
    } catch (e) { next(e) }
  }

  async update(req, res, next) {
    try {
      const atual = await UserRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Usuário não encontrado.' })

      const payload = {
        ...atual,
        ...req.body,
        nome:String(req.body.nome ?? atual.nome).trim(),
        email:String(req.body.email ?? atual.email).trim().toLowerCase(),
      }
      const invalid = validateUser(payload)
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })

      const deixaDeSerAdminAtivo = atual.perfil === 'Administrador' && atual.status === 'Ativo'
        && (payload.perfil !== 'Administrador' || payload.status !== 'Ativo')
      if (deixaDeSerAdminAtivo && await UserRepo.countActiveAdmins(atual.id) === 0) {
        return res.status(400).json({ ok:false, msg:'É necessário manter ao menos um Administrador ativo.' })
      }

      const emailDuplicado = await UserRepo.findByEmail(payload.email)
      if (emailDuplicado && Number(emailDuplicado.id) !== Number(atual.id)) {
        return res.status(400).json({ ok:false, msg:'E-mail já cadastrado.' })
      }

      const data = await UserRepo.updateFull(req.params.id, payload)
      res.json({ ok:true, data, msg:`Usuário "${data.nome}" atualizado!` })
    } catch (e) { next(e) }
  }

  async updatePermissions(req, res, next) {
    try {
      const user = await UserRepo.findById(req.params.id)
      if (!user) return res.status(404).json({ ok:false, msg:'Usuário não encontrado.' })
      if (user.perfil === 'Administrador') {
        return res.status(400).json({ ok:false, msg:'Permissões do Administrador não podem ser alteradas.' })
      }

      const permissoes = req.body.permissoes
      if (!permissoes || typeof permissoes !== 'object' || Array.isArray(permissoes)) {
        return res.status(400).json({ ok:false, msg:'Formato de permissões inválido.' })
      }
      for (const [key, value] of Object.entries(permissoes)) {
        if (!PERMISSION_KEYS.has(key) || typeof value !== 'boolean') {
          return res.status(400).json({ ok:false, msg:`Permissão inválida: ${key}.` })
        }
      }

      const data = await UserRepo.updatePermissoes(req.params.id, permissoes)
      res.json({ ok:true, data, msg:'Permissões atualizadas!' })
    } catch (e) { next(e) }
  }

  async resetPermissions(req, res, next) {
    try {
      const user = await UserRepo.findById(req.params.id)
      if (!user) return res.status(404).json({ ok:false, msg:'Usuário não encontrado.' })
      if (user.perfil === 'Administrador') {
        return res.status(400).json({ ok:false, msg:'Permissões do Administrador não podem ser resetadas.' })
      }
      const defaultPerms = PERMISSOES_PADRAO[user.perfil] || PERMISSOES_PADRAO.Vendedor
      const data = await UserRepo.updatePermissoes(req.params.id, defaultPerms)
      res.json({ ok:true, data, msg:'Permissões resetadas para o padrão do perfil!' })
    } catch (e) { next(e) }
  }

  async toggle(req, res, next) {
    try {
      const atual = await UserRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Usuário não encontrado.' })
      if (atual.perfil === 'Administrador' && atual.status === 'Ativo'
          && await UserRepo.countActiveAdmins(atual.id) === 0) {
        return res.status(400).json({ ok:false, msg:'Não é possível inativar o último Administrador ativo.' })
      }
      const data = await UserRepo.toggleStatus(req.params.id)
      res.json({ ok:true, data, msg:`Usuário ${data.status === 'Ativo' ? 'ativado' : 'inativado'}!` })
    } catch (e) { next(e) }
  }

  async delete(req, res, next) {
    try {
      const atual = await UserRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Usuário não encontrado.' })
      if (atual.perfil === 'Administrador' && atual.status === 'Ativo'
          && await UserRepo.countActiveAdmins(atual.id) === 0) {
        return res.status(400).json({ ok:false, msg:'Não é possível inativar o último Administrador ativo.' })
      }
      const data = await UserRepo.inativar(req.params.id)
      res.json({ ok:true, data, msg:`Usuário "${data.nome}" inativado. Histórico preservado.` })
    } catch (e) { next(e) }
  }

  async me(req, res, next) {
    try {
      const data = await UserRepo.findById(req.user.id)
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async updateProfile(req, res, next) {
    try {
      const payload = {
        nome:String(req.body.nome || '').trim(),
        telefone:req.body.telefone || '',
        cargo:req.body.cargo || '',
        foto:req.body.foto || null,
      }
      const invalid = validateProfile(payload)
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })

      const data = await UserRepo.update(req.user.id, payload)
      res.json({ ok:true, data, msg:'Perfil atualizado!' })
    } catch (e) { next(e) }
  }

  async changePassword(req, res, next) {
    try {
      const { senhaAtual, novaSenha } = req.body
      const currentInvalid = password(senhaAtual, 'Senha atual')
      if (currentInvalid) return res.status(400).json({ ok:false, msg:currentInvalid })
      const newInvalid = password(novaSenha, 'Nova senha')
      if (newInvalid) return res.status(400).json({ ok:false, msg:newInvalid })
      if (senhaAtual === novaSenha) {
        return res.status(400).json({ ok:false, msg:'A nova senha deve ser diferente da senha atual.' })
      }

      const row = await UserRepo.findByEmail(req.user.email)
      if (!row) return res.status(404).json({ ok:false, msg:'Usuário não encontrado.' })
      const valid = await bcrypt.compare(senhaAtual, row.senha_hash)
      if (!valid) return res.status(401).json({ ok:false, msg:'Senha atual incorreta.' })

      await UserRepo.updateSenha(req.user.id, novaSenha)
      res.json({ ok:true, msg:'Senha alterada com sucesso!' })
    } catch (e) { next(e) }
  }
}

module.exports = new UsuariosController()
