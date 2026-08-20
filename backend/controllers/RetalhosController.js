const ChapaRepo = require('../repositories/ChapaRepository')
const RetalhoRepo = require('../repositories/RetalhoRepository')

class RetalhosController {
  async list(req, res, next) {
    try {
      const data = await RetalhoRepo.findAll(req.query || '')
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async show(req, res, next) {
    try {
      const data = await RetalhoRepo.findById(req.params.id)
      if (!data) return res.status(404).json({ ok: false, msg: 'Retalho não encontrado.' })
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async stats(req, res, next) {
    try {
      const data = await RetalhoRepo.stats()
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async create(req, res, next) {
    try {
      const { nome, comprimento, largura, origem } = req.body
      if (!nome?.trim()) return res.status(400).json({ ok: false, msg: 'Nome é obrigatório.' })
      if (!(+comprimento > 0 && +largura > 0)) {
        return res.status(400).json({ ok: false, msg: 'Dimensões inválidas.' })
      }

      if (origem) {
        const chapa = await ChapaRepo.findById(origem)
        if (!chapa) return res.status(404).json({ ok: false, msg: `Chapa "${origem}" não encontrada.` })
        if (+comprimento > chapa.comprimento || +largura > chapa.largura) {
          return res.status(400).json({ ok: false, msg: 'O retalho é maior do que a chapa de origem.' })
        }
      }

      const data = await RetalhoRepo.insert({
        ...req.body,
        origemTipo: origem ? 'AUTOMATICA' : 'MANUAL',
        tipo: req.body.tipo || 'Granito',
        cor: req.body.cor || '#6b7280',
        espessura: req.body.espessura || 2,
        criadoPor: req.user?.id || null,
      })

      res.status(201).json({ ok: true, data, msg: `Retalho "${data.id}" cadastrado!` })
    } catch (e) { next(e) }
  }

  async gravarRetalho(req, res, next) { return this.create(req, res, next) }

  async update(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok: false, msg: 'Retalho não encontrado.' })
      if (['Consumido', 'Descartado'].includes(atual.status)) {
        return res.status(400).json({ ok: false, msg: 'Retalhos consumidos ou descartados não podem ter seus dados físicos alterados.' })
      }
      const data = await RetalhoRepo.update(req.params.id, req.body)
      res.json({ ok: true, data, msg: `Retalho "${data.id}" atualizado!` })
    } catch (e) { next(e) }
  }

  async reserve(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok: false, msg: 'Retalho não encontrado.' })
      if (atual.status !== 'Disponível') {
        return res.status(400).json({ ok: false, msg: 'Somente retalhos disponíveis podem ser reservados.' })
      }
      const data = await RetalhoRepo.marcarReservado(req.params.id)
      res.json({ ok: true, data, msg: 'Retalho reservado!' })
    } catch (e) { next(e) }
  }

  async release(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok: false, msg: 'Retalho não encontrado.' })
      if (atual.status !== 'Reservado') {
        return res.status(400).json({ ok: false, msg: 'Somente retalhos reservados podem ser liberados.' })
      }
      const data = await RetalhoRepo.marcarDisponivel(req.params.id)
      res.json({ ok: true, data, msg: 'Reserva liberada!' })
    } catch (e) { next(e) }
  }

  async consume(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok: false, msg: 'Retalho não encontrado.' })
      if (!['Disponível', 'Reservado'].includes(atual.status)) {
        return res.status(400).json({ ok: false, msg: 'Este retalho não pode ser consumido no estado atual.' })
      }
      const data = await RetalhoRepo.marcarConsumido(req.params.id, req.user?.id || null)
      res.json({ ok: true, data, msg: 'Retalho marcado como consumido!' })
    } catch (e) { next(e) }
  }

  async discard(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok: false, msg: 'Retalho não encontrado.' })
      if (atual.status === 'Consumido') {
        return res.status(400).json({ ok: false, msg: 'Retalho consumido não pode ser descartado.' })
      }
      const data = await RetalhoRepo.marcarDescartado(req.params.id, req.user?.id || null)
      res.json({ ok: true, data, msg: 'Retalho descartado do inventário. Histórico preservado!' })
    } catch (e) { next(e) }
  }

  // Compatibilidade com clientes antigos: DELETE passa a ser descarte lógico.
  async delete(req, res, next) { return this.discard(req, res, next) }
}

module.exports = new RetalhosController()
