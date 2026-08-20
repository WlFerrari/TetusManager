const { pool } = require('../database/connection')
const ChapaRepo = require('../repositories/ChapaRepository')
const RetalhoRepo = require('../repositories/RetalhoRepository')
const CorteRepo = require('../repositories/CorteRepository')

class CortesController {
  async registrar(req, res, next) {
    const client = await pool.connect()
    try {
      const {
        chapaId,
        osNumero,
        comprimentoConsumido,
        larguraConsumida,
        observacao,
        retalhos = [],
      } = req.body

      if (!chapaId) return res.status(400).json({ ok: false, msg: 'Chapa é obrigatória.' })
      if (!osNumero?.trim()) return res.status(400).json({ ok: false, msg: 'Número da OS é obrigatório.' })
      if (!(+comprimentoConsumido > 0 && +larguraConsumida > 0)) {
        return res.status(400).json({ ok: false, msg: 'Dimensões consumidas inválidas.' })
      }
      if (!Array.isArray(retalhos)) {
        return res.status(400).json({ ok: false, msg: 'Formato de retalhos inválido.' })
      }

      await client.query('BEGIN')
      const exec = client.query.bind(client)
      const chapa = await ChapaRepo.findById(chapaId, exec)

      if (!chapa) {
        await client.query('ROLLBACK')
        return res.status(404).json({ ok: false, msg: 'Chapa não encontrada.' })
      }
      if (chapa.status !== 'Disponível') {
        await client.query('ROLLBACK')
        return res.status(400).json({ ok: false, msg: 'Chapa não está disponível para corte.' })
      }
      if (+comprimentoConsumido > chapa.comprimento || +larguraConsumida > chapa.largura) {
        await client.query('ROLLBACK')
        return res.status(400).json({ ok: false, msg: 'O corte é maior do que a chapa selecionada.' })
      }

      const areaConsumida = parseFloat(((+comprimentoConsumido * +larguraConsumida) / 10000).toFixed(4))
      const resultado = []
      const cortes = []

      if (retalhos.length === 0) {
        const corte = await CorteRepo.insert({
          osNumero: osNumero.trim(),
          chapaId,
          retalhoId: null,
          comprimentoConsumido: +comprimentoConsumido,
          larguraConsumida: +larguraConsumida,
          areaConsumida,
          areaRetalho: 0,
          observacao: observacao || null,
          criadoPor: req.user?.id || null,
        }, exec)
        cortes.push(corte)
        await ChapaRepo.setStatus(chapaId, 'Inativa', exec)
      } else {
        for (const r of retalhos) {
          if (!r.nome?.trim()) {
            await client.query('ROLLBACK')
            return res.status(400).json({ ok: false, msg: 'Nome do retalho é obrigatório.' })
          }
          if (!(+r.comprimento > 0 && +r.largura > 0)) {
            await client.query('ROLLBACK')
            return res.status(400).json({ ok: false, msg: 'Dimensões do retalho inválidas.' })
          }
          if (+r.comprimento > chapa.comprimento || +r.largura > chapa.largura) {
            await client.query('ROLLBACK')
            return res.status(400).json({ ok: false, msg: 'Retalho calculado incompatível com a chapa.' })
          }

          const retalho = await RetalhoRepo.insert({
            ...r,
            origem: chapaId,
            origemTipo: 'AUTOMATICA',
            area: undefined,
            status: 'Disponível',
            tipo: r.tipo || chapa.tipo,
            cor: r.cor || chapa.cor,
            espessura: r.espessura || chapa.espessura || 2,
            localizacao: r.localizacao || chapa.localizacao || null,
            criadoPor: req.user?.id || null,
          }, exec)
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
          }, exec)
          cortes.push(corte)
        }
        await ChapaRepo.setStatus(chapaId, 'Em uso', exec)
      }

      await client.query('COMMIT')
      res.json({
        ok: true,
        data: resultado,
        cortes,
        semRetalho: resultado.length === 0,
        msg: resultado.length
          ? `${resultado.length} retalho(s) registrado(s) com sucesso!`
          : 'Corte registrado sem geração de retalho reutilizável.',
      })
    } catch (e) {
      try { await client.query('ROLLBACK') } catch (_) {}
      next(e)
    } finally {
      client.release()
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
    } catch (e) { next(e) }
  }

  async stats(req, res, next) {
    try {
      const data = await CorteRepo.stats()
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }
}

module.exports = new CortesController()
