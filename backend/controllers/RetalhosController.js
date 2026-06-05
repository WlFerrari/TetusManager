const ChapaRepo = require('../repositories/ChapaRepository')
const RetalhoRepo = require('../repositories/RetalhoRepository')
const { asyncHandler, sendSuccess, sendError } = require('../utils/controllerHelpers')

class RetalhosController {
  list = asyncHandler(async (req, res) => {
    const data = await RetalhoRepo.findAll(req.query || '')
    sendSuccess(res, data)
  })

  show = asyncHandler(async (req, res) => {
    const data = await RetalhoRepo.findById(req.params.id)
    if (!data) return sendError(res, 'Retalho não encontrado.', 404)
    sendSuccess(res, data)
  })

  stats = asyncHandler(async (req, res) => {
    const data = await RetalhoRepo.stats()
    sendSuccess(res, data)
  })

  create = asyncHandler(async (req, res) => {
    const { nome, comprimento, largura, origem } = req.body

    if (!nome?.trim()) return sendError(res, 'Nome é obrigatório.')
    if (!(+comprimento > 0 && +largura > 0)) return sendError(res, 'Dimensões inválidas.')

    // Validar chapa origem (se informada)
    if (origem) {
      const chapa = await ChapaRepo.findById(origem)
      if (!chapa) return sendError(res, `Chapa "${origem}" não encontrada.`, 404)
      if (+comprimento > Number(chapa.comprimento) || +largura > Number(chapa.largura)) {
        return sendError(res, 'O corte é maior do que a chapa selecionada. Ajuste as medidas.')
      }
    }

    const data = await RetalhoRepo.insert({
      ...req.body,
      tipo: req.body.tipo || 'Granito',
      cor: req.body.cor || '#6b7280',
      espessura: req.body.espessura || 2,
      criadoPor: req.user?.id || null,
    })

    sendSuccess(res, data, `Retalho "${data.id}" cadastrado!`, 201)
  })

  // Alias do diagrama
  gravarRetalho = (req, res, next) => this.create(req, res, next)

  update = asyncHandler(async (req, res) => {
    const data = await RetalhoRepo.update(req.params.id, req.body)
    sendSuccess(res, data, `Retalho "${data.id}" atualizado!`)
  })

  consume = asyncHandler(async (req, res) => {
    const data = await RetalhoRepo.marcarConsumido(req.params.id, req.user?.id || null)
    sendSuccess(res, data, 'Retalho marcado como consumido!')
  })

  discard = asyncHandler(async (req, res) => {
    const data = await RetalhoRepo.marcarDescartado(req.params.id, req.user?.id || null)
    sendSuccess(res, data, 'Retalho descartado do inventário!')
  })

  delete = asyncHandler(async (req, res) => {
    const data = await RetalhoRepo.delete(req.params.id)
    sendSuccess(res, data, `Retalho "${data.id}" excluído!`)
  })
}

module.exports = new RetalhosController()
