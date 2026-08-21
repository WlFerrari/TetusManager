const ChapaRepo = require('../repositories/ChapaRepository')
const CorteRepo = require('../repositories/CorteRepository')
const { validateChapa } = require('../utils/validation')

function validateFilters(query = {}) {
  for (const [key, label] of [
    ['espessura', 'Espessura'],
    ['minLargura', 'Largura mínima'],
    ['minComprimento', 'Comprimento mínimo'],
  ]) {
    if (query[key] !== undefined && query[key] !== '') {
      const n = Number(query[key])
      if (!Number.isFinite(n) || n < 0) return `${label} não pode ser negativa.`
    }
  }
  return null
}

class ChapasController {
  async list(req, res, next) {
    try {
      const invalid = validateFilters(req.query)
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })
      const data = await ChapaRepo.findAll(req.query || '')
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async listarChapas(req, res, next) { return this.list(req, res, next) }

  async show(req, res, next) {
    try {
      const data = await ChapaRepo.findById(req.params.id)
      if (!data) return res.status(404).json({ ok:false, msg:'Chapa não encontrada.' })
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async consultarChapa(req, res, next) { return this.show(req, res, next) }

  async stats(req, res, next) {
    try {
      const data = await ChapaRepo.stats()
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async create(req, res, next) {
    try {
      const payload = { ...req.body, status:'Disponível' }
      const invalid = validateChapa(payload)
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })

      const data = await ChapaRepo.insert({ ...payload, criadoPor:req.user?.id || null })
      res.status(201).json({ ok:true, data, msg:`Chapa "${data.nome}" cadastrada!` })
    } catch (e) { next(e) }
  }

  async gravarChapa(req, res, next) { return this.create(req, res, next) }

  async update(req, res, next) {
    try {
      const atual = await ChapaRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Chapa não encontrada.' })
      if (atual.status === 'Inativa') {
        return res.status(400).json({ ok:false, msg:'Reative a chapa antes de editar seus dados.' })
      }

      const payload = { ...atual, ...req.body, status:atual.status }
      const invalid = validateChapa(payload)
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })

      const data = await ChapaRepo.update(req.params.id, payload)
      res.json({ ok:true, data, msg:`Chapa "${data.nome}" atualizada!` })
    } catch (e) { next(e) }
  }

  async atualizarChapa(req, res, next) { return this.update(req, res, next) }

  async inactivate(req, res, next) {
    try {
      const atual = await ChapaRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Chapa não encontrada.' })
      if (atual.status === 'Inativa') {
        return res.json({ ok:true, data:atual, msg:`Chapa "${atual.nome}" já está inativa.` })
      }
      const data = await ChapaRepo.inativar(req.params.id)
      res.json({ ok:true, data, msg:`Chapa "${data.nome}" inativada. Histórico preservado.` })
    } catch (e) { next(e) }
  }

  async reactivate(req, res, next) {
    try {
      const atual = await ChapaRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Chapa não encontrada.' })
      if (atual.status !== 'Inativa') {
        return res.status(400).json({ ok:false, msg:'Somente chapas inativas podem ser reativadas.' })
      }

      const cortes = await CorteRepo.findAll({ chapaId:req.params.id, limit:1 })
      if (cortes.length) {
        return res.status(400).json({
          ok:false,
          msg:'Esta chapa possui histórico de corte e não pode voltar ao estoque como disponível.',
        })
      }

      const data = await ChapaRepo.setStatus(req.params.id, 'Disponível')
      res.json({ ok:true, data, msg:`Chapa "${data.nome}" reativada e disponível novamente.` })
    } catch (e) { next(e) }
  }

  async delete(req, res, next) { return this.inactivate(req, res, next) }
  async excluirChapa(req, res, next) { return this.inactivate(req, res, next) }

  async listarChapasDisponiveis(req, res, next) {
    try {
      const data = await ChapaRepo.listarDisponiveis()
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }
}

module.exports = new ChapasController()
