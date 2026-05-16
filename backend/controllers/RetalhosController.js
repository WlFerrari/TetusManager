const ChapaRepo = require('../repositories/ChapaRepository')
const RetalhoRepo = require('../repositories/RetalhoRepository')

class RetalhosController {
  async list(req, res, next) {
    try {
      const data = await RetalhoRepo.findAll(req.query.q || '')
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async show(req, res, next) {
    try {
      const data = await RetalhoRepo.findById(req.params.id)
      if (!data) {
        return res.status(404).json({
          ok: false,
          msg: 'Retalho não encontrado.'
        })
      }
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

      // Validações
      if (!nome?.trim()) {
        return res.status(400).json({
          ok: false,
          msg: 'Nome é obrigatório.'
        })
      }
      if (!(+comprimento > 0 && +largura > 0)) {
        return res.status(400).json({
          ok: false,
          msg: 'Dimensões inválidas.'
        })
      }

      // Validar chapa origem (se informada)
      if (origem) {
        const chapa = await ChapaRepo.findById(origem)
        if (!chapa) {
          return res.status(404).json({
            ok: false,
            msg: `Chapa "${origem}" não encontrada.`
          })
        }
      }

      // Garantir valores padrão
      const data = await RetalhoRepo.insert({
        ...req.body,
        tipo: req.body.tipo || 'Granito',
        cor: req.body.cor || '#6b7280',
        espessura: req.body.espessura || 2,
        criadoPor: req.user?.id || null,
      })

      res.status(201).json({
        ok: true,
        data,
        msg: `Retalho "${data.id}" cadastrado!`
      })
    } catch (e) { next(e) }
  }

  async update(req, res, next) {
    try {
      const data = await RetalhoRepo.update(req.params.id, req.body)
      res.json({
        ok: true,
        data,
        msg: `Retalho "${data.id}" atualizado!`
      })
    } catch (e) { next(e) }
  }

  async consume(req, res, next) {
    try {
      const data = await RetalhoRepo.marcarConsumido(req.params.id, req.user?.id || null)
      res.json({
        ok: true,
        data,
        msg: 'Retalho marcado como consumido!'
      })
    } catch (e) { next(e) }
  }

  async delete(req, res, next) {
    try {
      const data = await RetalhoRepo.delete(req.params.id)
      res.json({
        ok: true,
        data,
        msg: `Retalho "${data.id}" excluído!`
      })
    } catch (e) { next(e) }
  }
}

module.exports = new RetalhosController()
