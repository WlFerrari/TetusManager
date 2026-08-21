const ChapaRepo = require('../repositories/ChapaRepository')
const RetalhoRepo = require('../repositories/RetalhoRepository')
const { validateRetalho } = require('../utils/validation')

function validateFilters(query = {}) {
  for (const [key, label] of [
    ['espessura', 'Espessura'],
    ['minLargura', 'Largura mínima'],
    ['minComprimento', 'Comprimento mínimo'],
    ['minArea', 'Área mínima'],
  ]) {
    if (query[key] !== undefined && query[key] !== '') {
      const n = Number(query[key])
      if (!Number.isFinite(n) || n < 0) return `${label} não pode ser negativa.`
    }
  }
  return null
}

class RetalhosController {
  async list(req, res, next) {
    try {
      const invalid = validateFilters(req.query)
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })
      const data = await RetalhoRepo.findAll(req.query || '')
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async show(req, res, next) {
    try {
      const data = await RetalhoRepo.findById(req.params.id)
      if (!data) return res.status(404).json({ ok:false, msg:'Retalho não encontrado.' })
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async stats(req, res, next) {
    try {
      const data = await RetalhoRepo.stats()
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async create(req, res, next) {
    try {
      const origem = String(req.body.origem || '').trim() || null
      const payload = {
        ...req.body,
        origem,
        origemTipo:origem ? 'AUTOMATICA' : 'MANUAL',
        status:'Disponível',
        tipo:req.body.tipo || 'Granito',
        cor:req.body.cor || '#6b7280',
        espessura:req.body.espessura || 2,
      }

      const invalid = validateRetalho(payload)
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })

      if (origem) {
        const chapa = await ChapaRepo.findById(origem)
        if (!chapa) return res.status(404).json({ ok:false, msg:`Chapa "${origem}" não encontrada.` })
        if (chapa.status === 'Inativa') {
          return res.status(400).json({ ok:false, msg:'Não é possível vincular um novo retalho a uma chapa inativa.' })
        }
        if (+payload.comprimento > chapa.comprimento || +payload.largura > chapa.largura) {
          return res.status(400).json({ ok:false, msg:'O retalho é maior do que a chapa de origem.' })
        }
      }

      const data = await RetalhoRepo.insert({ ...payload, criadoPor:req.user?.id || null })
      res.status(201).json({ ok:true, data, msg:`Retalho "${data.id}" cadastrado!` })
    } catch (e) { next(e) }
  }

  async gravarRetalho(req, res, next) { return this.create(req, res, next) }

  async update(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Retalho não encontrado.' })
      if (['Consumido','Descartado'].includes(atual.status)) {
        return res.status(400).json({ ok:false, msg:'Reative o retalho antes de alterar seus dados físicos.' })
      }

      const payload = {
        ...atual,
        ...req.body,
        origem:atual.origem,
        origemTipo:atual.origemTipo,
        status:atual.status,
      }
      const invalid = validateRetalho(payload)
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })

      if (atual.origem) {
        const chapa = await ChapaRepo.findById(atual.origem)
        if (chapa && (+payload.comprimento > chapa.comprimento || +payload.largura > chapa.largura)) {
          return res.status(400).json({ ok:false, msg:'O retalho não pode ser maior do que sua chapa de origem.' })
        }
      }

      const data = await RetalhoRepo.update(req.params.id, payload)
      res.json({ ok:true, data, msg:`Retalho "${data.id}" atualizado!` })
    } catch (e) { next(e) }
  }

  async reserve(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Retalho não encontrado.' })
      if (atual.status !== 'Disponível') {
        return res.status(400).json({ ok:false, msg:'Somente retalhos disponíveis podem ser reservados.' })
      }
      const data = await RetalhoRepo.marcarReservado(req.params.id)
      res.json({ ok:true, data, msg:'Retalho reservado!' })
    } catch (e) { next(e) }
  }

  async release(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Retalho não encontrado.' })
      if (atual.status !== 'Reservado') {
        return res.status(400).json({ ok:false, msg:'Somente retalhos reservados podem ser liberados.' })
      }
      const data = await RetalhoRepo.marcarDisponivel(req.params.id)
      res.json({ ok:true, data, msg:'Reserva liberada!' })
    } catch (e) { next(e) }
  }

  async consume(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Retalho não encontrado.' })
      if (atual.status === 'Consumido') {
        return res.status(400).json({ ok:false, msg:'Este retalho já foi marcado como utilizado.' })
      }
      if (!['Disponível','Reservado'].includes(atual.status)) {
        return res.status(400).json({ ok:false, msg:'Este retalho não pode ser marcado como utilizado no estado atual.' })
      }
      const data = await RetalhoRepo.marcarConsumido(req.params.id, req.user?.id || null)
      res.json({ ok:true, data, msg:'Retalho marcado como utilizado!' })
    } catch (e) { next(e) }
  }

  async discard(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Retalho não encontrado.' })
      if (atual.status === 'Consumido') {
        return res.status(400).json({ ok:false, msg:'Retalho utilizado não pode ser descartado. Reative-o primeiro apenas se o status tiver sido informado incorretamente.' })
      }
      if (atual.status === 'Descartado') {
        return res.status(400).json({ ok:false, msg:'Este retalho já está descartado.' })
      }
      const data = await RetalhoRepo.marcarDescartado(req.params.id, req.user?.id || null)
      res.json({ ok:true, data, msg:'Retalho descartado do inventário. Histórico preservado!' })
    } catch (e) { next(e) }
  }

  async reactivate(req, res, next) {
    try {
      const atual = await RetalhoRepo.findById(req.params.id)
      if (!atual) return res.status(404).json({ ok:false, msg:'Retalho não encontrado.' })
      if (!['Consumido','Descartado'].includes(atual.status)) {
        return res.status(400).json({ ok:false, msg:'Somente retalhos utilizados ou descartados podem ser reativados por correção de status.' })
      }

      const data = await RetalhoRepo.reativar(req.params.id)
      res.json({
        ok:true,
        data,
        msg:'Status corrigido. O retalho voltou a ficar disponível.',
      })
    } catch (e) { next(e) }
  }

  async delete(req, res, next) { return this.discard(req, res, next) }
}

module.exports = new RetalhosController()
