const ChapaRepo = require('../repositories/ChapaRepository')

class ChapasController {
  async list(req, res, next) {
    try {
      const data = await ChapaRepo.findAll(req.query || '')
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async listarChapas(req, res, next) { return this.list(req, res, next) }

  async show(req, res, next) {
    try {
      const data = await ChapaRepo.findById(req.params.id)
      if (!data) return res.status(404).json({ ok: false, msg: 'Chapa não encontrada.' })
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async consultarChapa(req, res, next) { return this.show(req, res, next) }

  async stats(req, res, next) {
    try {
      const data = await ChapaRepo.stats()
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async create(req, res, next) {
    try {
      const { nome, largura, comprimento } = req.body
      if (!nome?.trim()) return res.status(400).json({ ok: false, msg: 'Nome é obrigatório.' })
      if (!(+largura > 0)) return res.status(400).json({ ok: false, msg: 'Largura inválida.' })
      if (!(+comprimento > 0)) return res.status(400).json({ ok: false, msg: 'Comprimento inválido.' })

      const data = await ChapaRepo.insert({ ...req.body, criadoPor: req.user?.id || null })
      res.status(201).json({ ok: true, data, msg: `Chapa "${data.nome}" cadastrada!` })
    } catch (e) { next(e) }
  }

  async gravarChapa(req, res, next) { return this.create(req, res, next) }

  async update(req, res, next) {
    try {
      if (!req.body.nome?.trim()) return res.status(400).json({ ok: false, msg: 'Nome é obrigatório.' })
      const data = await ChapaRepo.update(req.params.id, req.body)
      res.json({ ok: true, data, msg: `Chapa "${data.nome}" atualizada!` })
    } catch (e) { next(e) }
  }

  async atualizarChapa(req, res, next) { return this.update(req, res, next) }

  async inactivate(req, res, next) {
    try {
      const data = await ChapaRepo.inativar(req.params.id)
      res.json({ ok: true, data, msg: `Chapa "${data.nome}" inativada. Histórico preservado.` })
    } catch (e) { next(e) }
  }

  // Compatibilidade com o endpoint antigo: DELETE agora executa exclusão lógica.
  async delete(req, res, next) { return this.inactivate(req, res, next) }
  async excluirChapa(req, res, next) { return this.inactivate(req, res, next) }

  async listarChapasDisponiveis(req, res, next) {
    try {
      const data = await ChapaRepo.listarDisponiveis()
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }
}

module.exports = new ChapasController()
