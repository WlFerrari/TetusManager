/**
 * CAMADA DE CONTROLE (Controller)
 * Regras de negócio e validações.
 * Agora com suporte a operações assíncronas (API real).
 * Retorno: { ok: 1|0, data?, msg }
 */

import { chapaRepo, retalhoRepo, userRepo, empresaRepo, corteRepo } from '../repositories/index.js'
import { mkChapa, mkRetalho } from '../models/index.js'
import { buildChapaQrPayload, buildRetalhoQrPayload } from '../utils/qrPayload.js'
import { asyncAction } from '../utils/asyncAction.js'

const withChapaQrCode = (payload = {}) => {
  if (!payload.id) return payload
  const normalized = mkChapa({ ...payload, id: payload.id })
  return { ...payload, qrCode: buildChapaQrPayload(normalized) }
}

const withRetalhoQrCode = (payload = {}) => {
  if (!payload.id) return payload
  const normalized = mkRetalho({ ...payload, id: payload.id })
  return { ...payload, qrCode: buildRetalhoQrPayload(normalized) }
}

// ── ChapaController ───────────────────────────────────────────────────
class ChapaController {
  constructor(r) { this.r = r }
  
  async criar(d) {
    if (!d.nome?.trim())         return { ok:0, msg:'Nome é obrigatório.' }
    if (!(+d.largura > 0))       return { ok:0, msg:'Largura inválida.' }
    if (!(+d.comprimento > 0))   return { ok:0, msg:'Comprimento inválido.' }
    return asyncAction(async () => {
      const e = await this.r.insert(withChapaQrCode(d))
      return { ok:1, data:e, msg:`Chapa "${e.nome}" cadastrada!` }
    })
  }
  
  async listar(f='') {
    return asyncAction(
      async () => ({ ok:1, data: await this.r.findAll(f) }),
      { data: [] }
    )
  }
  
  async buscar(id) {
    return asyncAction(async () => {
      const e = await this.r.findById(id)
      return e ? {ok:1,data:e} : {ok:0,msg:'Não encontrada.'}
    })
  }
  
  async atualizar(id,d) {
    if (!d.nome?.trim()) return {ok:0, msg:'Nome é obrigatório.'}
    return asyncAction(async () => {
      const e = await this.r.update(id, withChapaQrCode({ ...d, id }))
      return {ok:1,data:e,msg:`Chapa "${e.nome}" atualizada!`}
    })
  }
  
  async excluir(id) {
    return asyncAction(async () => {
      const e = await this.r.delete(id)
      return {ok:1,msg:`Chapa "${e.nome}" excluída!`}
    })
  }

  // Aliases do diagrama
  async listarChapas(f='') { return this.listar(f) }
  async gravarChapa(d) { return this.criar(d) }
  async atualizarChapa(id, d) { return this.atualizar(id, d) }
  async excluirChapa(id) { return this.excluir(id) }
  async consultarChapa(id) { return this.buscar(id) }
  async listarChapasDisponiveis() {
    return asyncAction(
      async () => ({ ok: 1, data: await this.r.listarDisponiveis() }),
      { data: [] }
    )
  }

  calcularCorte(cid, cc, lc, nome = '', chapa = null) {
    if (!cid || !cc || !lc) return { ok: 0, msg: 'Todos os campos são obrigatórios.' }
    if (cc <= 0 || lc <= 0) return { ok: 0, msg: 'Comprimento e largura devem ser maiores que 0.' }

    if (chapa && (cc > Number(chapa.comprimento) || lc > Number(chapa.largura))) {
      return { ok: 0, msg: 'O corte é maior do que a chapa selecionada. Ajuste as medidas.' }
    }

    const area = cc * lc
    const retalho = {
      origem: String(cid),
      comprimento: cc,
      largura: lc,
      area: area,
      status: 'Disponível',
      nome: nome?.trim() ? nome : `Sobra-${Math.random().toString(36).substr(2, 9)}`,
      tipo: 'Granito',
      cor: '#6b7280',
      espessura: 2
    }

    return { ok: 1, retalho, msg: `Retalho calculado: ${area.toFixed(2)}m²` }
  }

  async stats() {
    return asyncAction(
      async () => await this.r.stats(),
      { total: 0, disponiveis: 0, emUso: 0 }
    )
  }
}

// ── RetalhoController ─────────────────────────────────────────────────
class RetalhoController {
  constructor(r) { this.r = r }

  async criar(d) {
    if (!d.nome?.trim()) return {ok:0,msg:'Nome é obrigatório.'}
    if (!(+d.comprimento>0 && +d.largura>0)) return {ok:0,msg:'Dimensões inválidas.'}
    return asyncAction(async () => {
      const area = parseFloat(((+d.comprimento*+d.largura)/10000).toFixed(2))
      const payload = {
        ...d,
        area,
        tipo: d.tipo || 'Granito',
        cor: d.cor || '#6b7280',
        espessura: +d.espessura || 2
      }
      const e = await this.r.insert(withRetalhoQrCode(payload))
      return {ok:1,data:e,msg:`Retalho "${e.id}" cadastrado!`}
    })
  }

  // Alias do diagrama
  async gravarRetalho(d) { return this.criar(d) }

  async listar(f='') {
    return asyncAction(
      async () => ({ok:1, data: await this.r.findAll(f)}),
      { data: [] }
    )
  }
  
  async buscar(id) {
    return asyncAction(async () => {
      const e = await this.r.findById(id)
      return e?{ok:1,data:e}:{ok:0,msg:'Não encontrado.'}
    })
  }
  
  async atualizar(id,d) {
    return asyncAction(async () => {
      const area=parseFloat(((+d.comprimento*+d.largura)/10000).toFixed(2))
      const e = await this.r.update(id, withRetalhoQrCode({ ...d, id, area }))
      return {ok:1,data:e,msg:`Retalho "${e.id}" atualizado!`}
    })
  }
  
  async excluir(id) {
    return asyncAction(async () => {
      await this.r.delete(id)
      return {ok:1,msg:`Retalho "${id}" excluído!`}
    })
  }

  async marcarConsumido(id) {
    return asyncAction(async () => {
      const e = await this.r.marcarConsumido(id)
      return {ok:1,data:e,msg:'Marcado como consumido!'}
    })
  }

  async marcarDescartado(id) {
    return asyncAction(async () => {
      const e = await this.r.marcarDescartado(id)
      return {ok:1,data:e,msg:'Retalho descartado!'}
    })
  }

  async stats() {
    return asyncAction(
      async () => await this.r.stats(),
      { total: 0, disponiveis: 0, reservados: 0, consumidos: 0, descartados: 0, areaTotal: 0 }
    )
  }
}

// ── UserController ────────────────────────────────────────────────────
class UserController {
  constructor(r) { this.r = r }
  _ve(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

  async criar(d) {
    if (!d.nome?.trim())         return {ok:0,msg:'Nome é obrigatório.'}
    if (!this._ve(d.email))      return {ok:0,msg:'E-mail inválido.'}
    return asyncAction(async () => {
      const e = await this.r.insert(d)
      return {ok:1,data:e,msg:`Usuário "${e.nome}" criado!`}
    })
  }
  
  async listar(f='') {
    return asyncAction(
      async () => ({ok:1, data: await this.r.findAll(f)}),
      { data: [] }
    )
  }
  
  async buscar(id) {
    return asyncAction(async () => {
      const e = await this.r.findById(id)
      return e?{ok:1,data:e}:{ok:0,msg:'Não encontrado.'}
    })
  }
  
  async atualizar(id,d) {
    if (!d.nome?.trim())    return {ok:0,msg:'Nome é obrigatório.'}
    if (!this._ve(d.email)) return {ok:0,msg:'E-mail inválido.'}
    return asyncAction(async () => {
      const e = await this.r.update(id,d)
      return {ok:1,data:e,msg:`Usuário "${e.nome}" atualizado!`}
    })
  }
  
  async toggleStatus(id) {
    return asyncAction(async () => {
      const e = await this.r.toggleStatus(id)
      return {ok:1,data:e,msg:`Usuário ${e.status==='Ativo'?'ativado':'inativado'}!`}
    })
  }
  
  async excluir(id) {
    return asyncAction(async () => {
      const e = await this.r.delete(id)
      return {ok:1,msg:`Usuário "${e.nome}" excluído!`}
    })
  }

  async atualizarPermissoes(id, permissoes) {
    return asyncAction(async () => {
      const e = await this.r.atualizarPermissoes(id, permissoes)
      return {ok:1,data:e,msg:`Permissões atualzadas!`}
    })
  }

  async resetarPermissoes(id) {
    return asyncAction(async () => {
      const e = await this.r.resetarPermissoes(id)
      return {ok:1,data:e,msg:'Permissões resetadas ao padrão do perfil!'}
    })
  }

  async atualizarPerfil(id, d) {
    if (!d.nome?.trim()) return {ok:0,msg:'Nome é obrigatório.'}
    return asyncAction(async () => {
      const e = await this.r.update(id, { nome:d.nome, telefone:d.telefone||'', cargo:d.cargo||'', foto:d.foto||null })
      return {ok:1,data:e,msg:'Perfil atualizado com sucesso!'}
    })
  }
}

// ── EmpresaController ─────────────────────────────────────────────────
class EmpresaController {
  constructor(r) { this.r = r }

  async buscar() {
    return asyncAction(async () => {
      const e = await this.r.get()
      return {ok:1,data:e}
    })
  }

  async atualizar(d) {
    return asyncAction(async () => {
      const e = await this.r.update(d)
      return {ok:1,data:e,msg:'Empresa atualizada com sucesso!'}
    })
  }
}

// ── CorteController ────────────────────────────────────────────────────
class CorteController {
  constructor(r) { this.r = r }

  async registrarCorte(payload) {
    if (!payload?.chapaId) return { ok: 0, msg: 'Chapa é obrigatória.' }
    if (!payload?.osNumero?.trim()) return { ok: 0, msg: 'Número da OS é obrigatório.' }
    if (!(+payload.comprimentoConsumido > 0 && +payload.larguraConsumida > 0)) {
      return { ok: 0, msg: 'Dimensões consumidas inválidas.' }
    }
    return asyncAction(async () => {
      const res = await this.r.registrar(payload)
      return { ok: 1, data: res.data, cortes: res.cortes, msg: 'Corte registrado com sucesso!' }
    })
  }

  async listar(filters = {}) {
    return asyncAction(
      async () => ({ ok: 1, data: await this.r.listar(filters) }),
      { data: [] }
    )
  }

  async stats() {
    return asyncAction(
      async () => await this.r.stats(),
      { total: 0, areaConsumida: 0, areaRetalho: 0 }
    )
  }
}

// ── Exports ───────────────────────────────────────────────────────────
export const chapaCtrl   = new ChapaController(chapaRepo)
export const retalhoCtrl = new RetalhoController(retalhoRepo)
export const userCtrl    = new UserController(userRepo)
export const empresaCtrl = new EmpresaController(empresaRepo)
export const corteCtrl   = new CorteController(corteRepo)
