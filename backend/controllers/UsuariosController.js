const bcrypt = require('bcryptjs')
const UserRepo = require('../repositories/UserRepository')
const { PERMISSOES_PADRAO } = require('../models')
const { asyncHandler, sendSuccess, sendError } = require('../utils/controllerHelpers')

class UsuariosController {
  list = asyncHandler(async (req, res) => {
    const data = await UserRepo.findAll(req.query.q || '')
    sendSuccess(res, data)
  })

  show = asyncHandler(async (req, res) => {
    const data = await UserRepo.findById(req.params.id)
    if (!data) return sendError(res, 'Usuário não encontrado.', 404)
    sendSuccess(res, data)
  })

  create = asyncHandler(async (req, res) => {
    const { nome, email, perfil, senha } = req.body

    if (!nome?.trim()) return sendError(res, 'Nome é obrigatório.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendError(res, 'E-mail inválido.')
    if (!senha || senha.length < 6) return sendError(res, 'Senha é obrigatória (mínimo 6 caracteres).')

    // Verificar duplicata
    const existe = await UserRepo.findByEmail(email)
    if (existe) return sendError(res, 'E-mail já cadastrado.')

    // Atribuir permissões padrão
    const permissoes = PERMISSOES_PADRAO[perfil] || PERMISSOES_PADRAO['Vendedor']
    const data = await UserRepo.insert({ ...req.body, permissoes })

    sendSuccess(res, data, `Usuário "${data.nome}" criado!`, 201)
  })

  update = asyncHandler(async (req, res) => {
    const data = await UserRepo.updateFull(req.params.id, req.body)
    sendSuccess(res, data, `Usuário "${data.nome}" atualizado!`)
  })

  updatePermissions = asyncHandler(async (req, res) => {
    const user = await UserRepo.findById(req.params.id)
    if (!user) return sendError(res, 'Usuário não encontrado.', 404)
    if (user.perfil === 'Administrador') {
      return sendError(res, 'Permissões do Administrador não podem ser alteradas.')
    }

    const data = await UserRepo.updatePermissoes(req.params.id, req.body.permissoes)
    sendSuccess(res, data, 'Permissões atualizadas!')
  })

  resetPermissions = asyncHandler(async (req, res) => {
    const user = await UserRepo.findById(req.params.id)
    if (!user) return sendError(res, 'Usuário não encontrado.', 404)
    if (user.perfil === 'Administrador') {
      return sendError(res, 'Permissões do Administrador não podem ser resetadas.')
    }

    const defaultPerms = PERMISSOES_PADRAO[user.perfil] || PERMISSOES_PADRAO['Vendedor']
    const data = await UserRepo.updatePermissoes(req.params.id, defaultPerms)
    sendSuccess(res, data, 'Permissões resetadas para padrão!')
  })

  toggle = asyncHandler(async (req, res) => {
    const data = await UserRepo.toggleStatus(req.params.id)
    sendSuccess(res, data, `Usuário ${data.status === 'Ativo' ? 'ativado' : 'inativado'}!`)
  })

  delete = asyncHandler(async (req, res) => {
    const data = await UserRepo.delete(req.params.id)
    sendSuccess(res, data, `Usuário "${data.nome}" excluído!`)
  })

  me = asyncHandler(async (req, res) => {
    const data = await UserRepo.findById(req.user.id)
    if (!data) return sendError(res, 'Usuário não encontrado.', 404)
    sendSuccess(res, data)
  })

  updateProfile = asyncHandler(async (req, res) => {
    const { nome, telefone, cargo, foto } = req.body
    if (!nome?.trim()) return sendError(res, 'Nome é obrigatório.')

    const data = await UserRepo.update(req.user.id, { nome, telefone, cargo, foto })
    sendSuccess(res, data, 'Perfil atualizado!')
  })

  changePassword = asyncHandler(async (req, res) => {
    const { senhaAtual, novaSenha } = req.body

    if (!senhaAtual || !novaSenha) return sendError(res, 'Senhas são obrigatórias.')
    if (novaSenha.length < 6) return sendError(res, 'Nova senha: mínimo 6 caracteres.')

    const row = await UserRepo.findByEmail(req.user.email)
    const valid = await bcrypt.compare(senhaAtual, row.senha_hash)

    if (!valid) return sendError(res, 'Senha atual incorreta.', 401)

    await UserRepo.updateSenha(req.user.id, novaSenha)
    sendSuccess(res, undefined, 'Senha alterada com sucesso!')
  })
}

module.exports = new UsuariosController()
