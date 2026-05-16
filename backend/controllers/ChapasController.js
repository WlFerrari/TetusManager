const ChapaRepo = require('../repositories/ChapaRepository')

class ChapasController {
  async list(req, res, next) {
    try {
      const data = await ChapaRepo.findAll(req.query.q || '')
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async show(req, res, next) {
    try {
      const data = await ChapaRepo.findById(req.params.id)
      if (!data) {
        return res.status(404).json({
          ok: false,
          msg: 'Chapa não encontrada.'
        })
      }
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async stats(req, res, next) {
    try {
      const data = await ChapaRepo.stats()
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async create(req, res, next) {
    try {
      const { nome, largura, comprimento } = req.body

      // Validar
      if (!nome?.trim()) {
        return res.status(400).json({
          ok: false,
          msg: 'Nome é obrigatório.'
        })
      }
      if (!(+largura > 0)) {
        return res.status(400).json({
          ok: false,
          msg: 'Largura inválida.'
        })
      }
      if (!(+comprimento > 0)) {
        return res.status(400).json({
          ok: false,
          msg: 'Comprimento inválido.'
        })
      }

      const data = await ChapaRepo.insert({
        ...req.body,
        criadoPor: req.user?.id || null,
      })
      res.status(201).json({
        ok: true,
        data,
        msg: `Chapa "${data.nome}" cadastrada!`
      })
    } catch (e) { next(e) }
  }

  async update(req, res, next) {
    try {
      if (!req.body.nome?.trim()) {
        return res.status(400).json({
          ok: false,
          msg: 'Nome é obrigatório.'
        })
      }

      const data = await ChapaRepo.update(req.params.id, req.body)
      res.json({
        ok: true,
        data,
        msg: `Chapa "${data.nome}" atualizada!`
      })
    } catch (e) { next(e) }
  }

  async delete(req, res, next) {
    try {
      const data = await ChapaRepo.delete(req.params.id)
      res.json({
        ok: true,
        data,
        msg: `Chapa "${data.nome}" excluída!`
      })
    } catch (e) { next(e) }
  }
}

module.exports = new ChapasController()
