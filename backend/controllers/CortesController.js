const ChapaRepo = require('../repositories/ChapaRepository')
const RetalhoRepo = require('../repositories/RetalhoRepository')

class CortesController {
  async registrar(req, res, next) {
    try {
      const { chapaId, retalhos } = req.body
      if (!chapaId) {
        return res.status(400).json({ ok: false, msg: 'Chapa é obrigatória.' })
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
      }

      res.json({
        ok: true,
        data: resultado,
        msg: `${resultado.length} retalho(s) registrado(s) com sucesso!`
      })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new CortesController()

