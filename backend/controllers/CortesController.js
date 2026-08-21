const { pool } = require('../database/connection')
const ChapaRepo = require('../repositories/ChapaRepository')
const RetalhoRepo = require('../repositories/RetalhoRepository')
const CorteRepo = require('../repositories/CorteRepository')
const { validateCorte, validateRetalho } = require('../utils/validation')

function calcularSobraPrincipal(chapa, comprimentoConsumido, larguraConsumida) {
  const cc = Number(comprimentoConsumido)
  const lc = Number(larguraConsumida)
  const comprimentoChapa = Number(chapa.comprimento)
  const larguraChapa = Number(chapa.largura)

  const opcoes = [
    { comprimento:comprimentoChapa - cc, largura:larguraChapa },
    { comprimento:comprimentoChapa, largura:larguraChapa - lc },
  ].filter(r => r.comprimento > 0 && r.largura > 0)

  if (!opcoes.length) return null
  opcoes.sort((a,b) => (b.comprimento * b.largura) - (a.comprimento * a.largura))
  return opcoes[0]
}

class CortesController {
  async registrar(req, res, next) {
    let client
    try {
      const {
        chapaId,
        osNumero,
        comprimentoConsumido,
        larguraConsumida,
        observacao,
        retalhos = [],
      } = req.body

      const invalid = validateCorte({ chapaId, osNumero, comprimentoConsumido, larguraConsumida, observacao })
      if (invalid) return res.status(400).json({ ok:false, msg:invalid })
      if (!Array.isArray(retalhos)) return res.status(400).json({ ok:false, msg:'Formato de retalhos inválido.' })
      if (retalhos.length > 1) {
        return res.status(400).json({ ok:false, msg:'A versão atual registra apenas o principal retalho resultante de cada corte.' })
      }

      client = await pool.connect()
      await client.query('BEGIN')
      const exec = client.query.bind(client)
      const chapa = await ChapaRepo.findById(chapaId, exec)

      if (!chapa) {
        await client.query('ROLLBACK')
        return res.status(404).json({ ok:false, msg:'Chapa não encontrada.' })
      }
      if (chapa.status !== 'Disponível') {
        await client.query('ROLLBACK')
        return res.status(400).json({ ok:false, msg:'Somente chapas disponíveis podem receber um novo corte.' })
      }
      if (+comprimentoConsumido > chapa.comprimento || +larguraConsumida > chapa.largura) {
        await client.query('ROLLBACK')
        return res.status(400).json({ ok:false, msg:'O corte é maior do que a chapa selecionada.' })
      }

      const sobra = calcularSobraPrincipal(chapa, comprimentoConsumido, larguraConsumida)
      const areaConsumida = parseFloat(((+comprimentoConsumido * +larguraConsumida) / 10000).toFixed(4))
      const resultado = []
      const cortes = []

      if (!sobra) {
        if (retalhos.length) {
          await client.query('ROLLBACK')
          return res.status(400).json({ ok:false, msg:'O corte informado consome toda a chapa e não pode gerar retalho.' })
        }

        const corte = await CorteRepo.insert({
          osNumero:osNumero.trim(),
          chapaId,
          retalhoId:null,
          comprimentoConsumido:+comprimentoConsumido,
          larguraConsumida:+larguraConsumida,
          areaConsumida,
          areaRetalho:0,
          observacao:String(observacao || '').trim() || null,
          criadoPor:req.user?.id || null,
        }, exec)
        cortes.push(corte)
      } else {
        if (retalhos.length !== 1) {
          await client.query('ROLLBACK')
          return res.status(400).json({ ok:false, msg:'Este corte é parcial e deve gerar o retalho principal calculado pelo sistema.' })
        }

        const informado = retalhos[0] || {}
        const payloadRetalho = {
          ...informado,
          nome:String(informado.nome || `Sobra ${chapa.nome}`).trim(),
          origem:chapaId,
          origemTipo:'AUTOMATICA',
          comprimento:sobra.comprimento,
          largura:sobra.largura,
          status:'Disponível',
          tipo:chapa.tipo,
          cor:chapa.cor,
          espessura:chapa.espessura || 2,
          localizacao:informado.localizacao || chapa.localizacao || '',
          foto:null,
        }
        const invalidRetalho = validateRetalho(payloadRetalho)
        if (invalidRetalho) {
          await client.query('ROLLBACK')
          return res.status(400).json({ ok:false, msg:invalidRetalho })
        }

        const retalho = await RetalhoRepo.insert({
          ...payloadRetalho,
          area:undefined,
          criadoPor:req.user?.id || null,
        }, exec)
        resultado.push(retalho)

        const corte = await CorteRepo.insert({
          osNumero:osNumero.trim(),
          chapaId,
          retalhoId:retalho.id,
          comprimentoConsumido:+comprimentoConsumido,
          larguraConsumida:+larguraConsumida,
          areaConsumida,
          areaRetalho:retalho.area,
          observacao:String(observacao || '').trim() || null,
          criadoPor:req.user?.id || null,
        }, exec)
        cortes.push(corte)
      }

      // A chapa inteira deixa de existir fisicamente após o primeiro corte.
      // A sobra reutilizável passa a ser representada exclusivamente pelo retalho.
      // Isso evita contabilizar ao mesmo tempo a chapa original e sua sobra no estoque.
      await ChapaRepo.setStatus(chapaId, 'Inativa', exec)

      await client.query('COMMIT')
      res.json({
        ok:true,
        data:resultado,
        cortes,
        semRetalho:resultado.length === 0,
        msg:resultado.length
          ? 'Corte registrado. A chapa de origem foi inativada e a sobra foi cadastrada como retalho.'
          : 'Corte registrado. A chapa de origem foi inativada sem geração de retalho reutilizável.',
      })
    } catch (e) {
      if (client) {
        try { await client.query('ROLLBACK') } catch (_) {}
      }
      next(e)
    } finally {
      client?.release()
    }
  }

  async list(req, res, next) {
    try {
      const limit = req.query.limit === undefined || req.query.limit === '' ? undefined : Number(req.query.limit)
      if (limit !== undefined && (!Number.isInteger(limit) || limit <= 0 || limit > 100)) {
        return res.status(400).json({ ok:false, msg:'Limite de histórico inválido.' })
      }
      const data = await CorteRepo.findAll({
        chapaId:req.query.chapaId,
        retalhoId:req.query.retalhoId,
        osNumero:req.query.osNumero,
        limit,
      })
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }

  async stats(req, res, next) {
    try {
      const data = await CorteRepo.stats()
      res.json({ ok:true, data })
    } catch (e) { next(e) }
  }
}

module.exports = new CortesController()
