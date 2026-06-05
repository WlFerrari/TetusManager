const ChapaRepo = require('../repositories/ChapaRepository')
const RetalhoRepo = require('../repositories/RetalhoRepository')
const CorteRepo = require('../repositories/CorteRepository')
const { pool } = require('../database/connection')
const { asyncHandler, sendSuccess, sendError } = require('../utils/controllerHelpers')

class CortesController {
  registrar = asyncHandler(async (req, res) => {
    const {
      chapaId,
      osNumero,
      comprimentoConsumido,
      larguraConsumida,
      observacao,
      retalhos,
    } = req.body

    if (!chapaId) return sendError(res, 'Chapa é obrigatória.')
    if (!osNumero?.trim()) return sendError(res, 'Número da OS é obrigatório.')
    if (!(+comprimentoConsumido > 0 && +larguraConsumida > 0)) {
      return sendError(res, 'Dimensões consumidas inválidas.')
    }
    if (!Array.isArray(retalhos) || retalhos.length === 0) {
      return sendError(res, 'Mínimo 1 retalho.')
    }

    const chapa = await ChapaRepo.findById(chapaId)
    if (!chapa) return sendError(res, 'Chapa não encontrada.', 404)
    if (chapa.status !== 'Disponível') {
      return sendError(res, 'Chapa não está disponível para corte.')
    }

    for (const r of retalhos) {
      if (!r.nome?.trim()) return sendError(res, 'Nome do retalho é obrigatório.')
      if (!(+r.comprimento > 0 && +r.largura > 0)) return sendError(res, 'Dimensões inválidas.')
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      const resultado = []
      const cortes = []
      const areaConsumida = parseFloat(((+comprimentoConsumido * +larguraConsumida) / 10000).toFixed(4))

      for (const r of retalhos) {
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

      await client.query('COMMIT')

      res.json({
        ok: true,
        data: resultado,
        cortes,
        msg: `${resultado.length} retalho(s) registrado(s) com sucesso!`
      })
    } catch (e) {
      await client.query('ROLLBACK').catch(() => {})
      throw e
    } finally {
      client.release()
    }
  })

  list = asyncHandler(async (req, res) => {
    const data = await CorteRepo.findAll({
      chapaId: req.query.chapaId,
      retalhoId: req.query.retalhoId,
      osNumero: req.query.osNumero,
      limit: req.query.limit,
    })
    sendSuccess(res, data)
  })

  stats = asyncHandler(async (req, res) => {
    const data = await CorteRepo.stats()
    sendSuccess(res, data)
  })
}

module.exports = new CortesController()
