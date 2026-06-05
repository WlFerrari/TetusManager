const ChapaRepo = require('../repositories/ChapaRepository')
const RetalhoRepo = require('../repositories/RetalhoRepository')
const CorteRepo = require('../repositories/CorteRepository')

class CortesController {
  async registrar(req, res, next) {
    try {
      const {
        chapaId,
        osNumero,
        comprimentoConsumido,
        larguraConsumida,
        observacao,
        retalhos,
      } = req.body
      if (!chapaId) {
        return res.status(400).json({ ok: false, msg: 'Chapa é obrigatória.' })
      }
      if (!osNumero?.trim()) {
        return res.status(400).json({ ok: false, msg: 'Número da OS é obrigatório.' })
      }
      if (!(+comprimentoConsumido > 0 && +larguraConsumida > 0)) {
        return res.status(400).json({ ok: false, msg: 'Dimensões consumidas inválidas.' })
      }
      if (!Array.isArray(retalhos) || retalhos.length === 0) {
        return res.status(400).json({ ok: false, msg: 'Mínimo 1 retalho.' })
      }

      const chapa = await ChapaRepo.findById(chapaId)
      if (!chapa) {
        return res.status(404).json({ ok: false, msg: 'Chapa não encontrada.' })
      }
      if (chapa.status !== 'Disponível') {
        return res.status(400).json({ ok: false, msg: 'Chapa não está disponível para corte.' })
      }

      const resultado = []
      const cortes = []
      const areaConsumida = parseFloat(((+comprimentoConsumido * +larguraConsumida) / 10000).toFixed(4))
      for (const r of retalhos) {
        if (!r.nome?.trim()) {
          return res.status(400).json({ ok: false, msg: 'Nome do retalho é obrigatório.' })
        }
        if (!(+r.comprimento > 0 && +r.largura > 0)) {
          return res.status(400).json({ ok: false, msg: 'Dimensões inválidas.' })
        }

        const area = parseFloat(((+r.comprimento * +r.largura) / 10000).toFixed(2))
        const retalho = await RetalhoRepo.insert({
          ...r,
          origem: chapaId,
          area,
          status: 'Disponível',
          tipo: r.tipo || chapa.tipo,
          cor: r.cor || chapa.cor,
          espessura: r.espessura || chapa.espessura || 2,
        })
        resultado.push(retalho)

        const corte = await CorteRepo.insert({
          osNumero: osNumero.trim(),
          chapaId,
          retalhoId: retalho.id,
          comprimentoConsumido: +comprimentoConsumido,
          larguraConsumida: +larguraConsumida,
          areaConsumida,
          areaRetalho: retalho.area,
          observacao: observacao || null,
          criadoPor: req.user?.id || null,
        })
        cortes.push(corte)
      }

      res.json({
        ok: true,
        data: resultado,
        cortes,
        msg: `${resultado.length} retalho(s) registrado(s) com sucesso!`
      })
    } catch (e) {
      next(e)
    }
  }

  async list(req, res, next) {
    try {
      const data = await CorteRepo.findAll({
        chapaId: req.query.chapaId,
        retalhoId: req.query.retalhoId,
        osNumero: req.query.osNumero,
        limit: req.query.limit,
      })
      res.json({ ok: true, data })
    } catch (e) {
      next(e)
    }
  }

  async stats(req, res, next) {
    try {
      const data = await CorteRepo.stats()
      res.json({ ok: true, data })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new CortesController()

