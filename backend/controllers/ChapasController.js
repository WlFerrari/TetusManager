const ChapaRepo = require('../repositories/ChapaRepository')
const { asyncHandler, sendSuccess, sendError } = require('../utils/controllerHelpers')

class ChapasController {
  list = asyncHandler(async (req, res) => {
    const data = await ChapaRepo.findAll(req.query || '')
    sendSuccess(res, data)
  })

  // Alias do diagrama
  listarChapas = (req, res, next) => this.list(req, res, next)

  show = asyncHandler(async (req, res) => {
    const data = await ChapaRepo.findById(req.params.id)
    if (!data) return sendError(res, 'Chapa não encontrada.', 404)
    sendSuccess(res, data)
  })

  // Alias do diagrama
  consultarChapa = (req, res, next) => this.show(req, res, next)

  stats = asyncHandler(async (req, res) => {
    const data = await ChapaRepo.stats()
    sendSuccess(res, data)
  })

  create = asyncHandler(async (req, res) => {
    const { nome, largura, comprimento } = req.body

    if (!nome?.trim()) return sendError(res, 'Nome é obrigatório.')
    if (!(+largura > 0)) return sendError(res, 'Largura inválida.')
    if (!(+comprimento > 0)) return sendError(res, 'Comprimento inválido.')

    const data = await ChapaRepo.insert({
      ...req.body,
      criadoPor: req.user?.id || null,
    })
    sendSuccess(res, data, `Chapa "${data.nome}" cadastrada!`, 201)
  })

  // Alias do diagrama
  gravarChapa = (req, res, next) => this.create(req, res, next)

  update = asyncHandler(async (req, res) => {
    if (!req.body.nome?.trim()) return sendError(res, 'Nome é obrigatório.')

    const data = await ChapaRepo.update(req.params.id, req.body)
    sendSuccess(res, data, `Chapa "${data.nome}" atualizada!`)
  })

  // Alias do diagrama
  atualizarChapa = (req, res, next) => this.update(req, res, next)

  delete = asyncHandler(async (req, res) => {
    const data = await ChapaRepo.delete(req.params.id)
    sendSuccess(res, data, `Chapa "${data.nome}" excluída!`)
  })

  // Alias do diagrama
  excluirChapa = (req, res, next) => this.delete(req, res, next)

  // Lista apenas chapas disponiveis (diagrama)
  listarChapasDisponiveis = asyncHandler(async (req, res) => {
    const data = await ChapaRepo.listarDisponiveis()
    sendSuccess(res, data)
  })
}

module.exports = new ChapasController()
