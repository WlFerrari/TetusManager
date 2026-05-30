/**
 * CAMADA DE CONTROLE (Controller)
 * Regras de negócio e validações.
 * Agora com suporte a operações assíncronas (API real).
 * Retorno: { ok: 1|0, data?, msg }
 */

import { chapaRepo, retalhoRepo, userRepo, empresaRepo } from '../repositories/index.js'
import { PERMISSOES_PADRAO, mkChapa, mkRetalho } from '../models/index.js'

const buildChapaQrPayload = (data = {}) => {
  return `CHAPA|ID:${data.id}|Nome:${data.nome}|Tipo:${data.tipo}|Status:${data.status}|Dimensões:${data.largura}x${data.comprimento}x${data.espessura}mm`
}

const buildRetalhoQrPayload = (data = {}) => {
  const origemLabel = data.origem ? `Chapa ${data.origem}` : 'Chapa N/A'
  return `RETALHO|ID:${data.id}|Nome:${data.nome}|Tipo:${data.tipo}|Status:${data.status}|Dimensões:${data.largura}x${data.comprimento}x${data.espessura}mm|Origem:${origemLabel}`
}

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
    try {
      const e = await this.r.insert(withChapaQrCode(d))
      return { ok:1, data:e, msg:`Chapa "${e.nome}" cadastrada!` }
    } catch(err) {
      return { ok:0, msg: err.message }
    }
  }
  
  async listar(f='') {
    try {
      const a = await this.r.findAll(f)
      return { ok:1, data:a }
    } catch(err) {
      return { ok:0, data:[], msg: err.message }
    }
  }
  
  async buscar(id) {
    try {
      const e = await this.r.findById(id)
      return e ? {ok:1,data:e} : {ok:0,msg:'Não encontrada.'}
    } catch(err) {
      return { ok:0, msg: err.message }
    }
  }
  
  async atualizar(id,d) {
    if (!d.nome?.trim()) return {ok:0, msg:'Nome é obrigatório.'}
    try {
      const e = await this.r.update(id, withChapaQrCode({ ...d, id }))
      return {ok:1,data:e,msg:`Chapa "${e.nome}" atualizada!`}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }
  
  async excluir(id) {
    try {
      const e = await this.r.delete(id)
      return {ok:1,msg:`Chapa "${e.nome}" excluída!`}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }

  // Aliases do diagrama
  async listarChapas(f='') { return this.listar(f) }
  async gravarChapa(d) { return this.criar(d) }
  async atualizarChapa(id, d) { return this.atualizar(id, d) }
  async excluirChapa(id) { return this.excluir(id) }
  async consultarChapa(id) { return this.buscar(id) }
  async listarChapasDisponiveis() {
    try {
      const a = await this.r.listarDisponiveis()
      return { ok: 1, data: a }
    } catch (err) {
      return { ok: 0, data: [], msg: err.message }
    }
  }

  calcularCorte(cid, cc, lc, nome = '', chapa = null) {
    // Cálculo básico: area = comprimento × largura
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
    try {
      return await this.r.stats()
    } catch(err) {
      return { total: 0, disponiveis: 0, emUso: 0 }
    }
  }
}

// ── RetalhoController ─────────────────────────────────────────────────
class RetalhoController {
  constructor(r) { this.r = r }

   async criar(d) {
     if (!d.nome?.trim()) return {ok:0,msg:'Nome é obrigatório.'}
     if (!(+d.comprimento>0 && +d.largura>0)) return {ok:0,msg:'Dimensões inválidas.'}
     try {
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
     } catch(err) {
       return {ok:0,msg:err.message}
     }
   }

  // Alias do diagrama
  async gravarRetalho(d) { return this.criar(d) }

  async listar(f='') {
    try {
      const a = await this.r.findAll(f)
      return {ok:1,data:a}
    } catch(err) {
      return {ok:0,data:[],msg:err.message}
    }
  }
  
  async buscar(id) {
    try {
      const e = await this.r.findById(id)
      return e?{ok:1,data:e}:{ok:0,msg:'Não encontrado.'}
    } catch(err) {
      return {ok:0,msg:err.message}
    }
  }
  
  async atualizar(id,d) {
    try {
      const area=parseFloat(((+d.comprimento*+d.largura)/10000).toFixed(2))
      const e = await this.r.update(id, withRetalhoQrCode({ ...d, id, area }))
      return {ok:1,data:e,msg:`Retalho "${e.id}" atualizado!`}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }
  
  async excluir(id) {
    try {
      await this.r.delete(id)
      return {ok:1,msg:`Retalho "${id}" excluído!`}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }

  async marcarConsumido(id) {
    try {
      const e = await this.r.marcarConsumido(id)
      return {ok:1,data:e,msg:'Marcado como consumido!'}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }

  async stats() {
    try {
      return await this.r.stats()
    } catch(err) {
      return { total: 0, disponiveis: 0, reservados: 0, consumidos: 0, areaTotal: 0 }
    }
  }
}

// ── UserController ────────────────────────────────────────────────────
class UserController {
  constructor(r) { this.r = r }
  _ve(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

  async criar(d) {
    if (!d.nome?.trim())         return {ok:0,msg:'Nome é obrigatório.'}
    if (!this._ve(d.email))      return {ok:0,msg:'E-mail inválido.'}
    try {
      const e = await this.r.insert(d)
      return {ok:1,data:e,msg:`Usuário "${e.nome}" criado!`}
    } catch(err) {
      return {ok:0,msg:err.message}
    }
  }
  
  async listar(f='') {
    try {
      const a = await this.r.findAll(f)
      return {ok:1,data:a}
    } catch(err) {
      return {ok:0,data:[],msg:err.message}
    }
  }
  
  async buscar(id) {
    try {
      const e = await this.r.findById(id)
      return e?{ok:1,data:e}:{ok:0,msg:'Não encontrado.'}
    } catch(err) {
      return {ok:0,msg:err.message}
    }
  }
  
  async atualizar(id,d) {
    if (!d.nome?.trim())    return {ok:0,msg:'Nome é obrigatório.'}
    if (!this._ve(d.email)) return {ok:0,msg:'E-mail inválido.'}
    try {
      const e = await this.r.update(id,d)
      return {ok:1,data:e,msg:`Usuário "${e.nome}" atualizado!`}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }
  
  async toggleStatus(id) {
    try {
      const e = await this.r.toggleStatus(id)
      return {ok:1,data:e,msg:`Usuário ${e.status==='Ativo'?'ativado':'inativado'}!`}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }
  
  async excluir(id) {
    try {
      const e = await this.r.delete(id)
      return {ok:1,msg:`Usuário "${e.nome}" excluído!`}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }

  async atualizarPermissoes(id, permissoes) {
    try {
      const e = await this.r.atualizarPermissoes(id, permissoes)
      return {ok:1,data:e,msg:`Permissões atualzadas!`}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }

  async resetarPermissoes(id) {
    try {
      const e = await this.r.resetarPermissoes(id)
      return {ok:1,data:e,msg:'Permissões resetadas ao padrão do perfil!'}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }

  async atualizarPerfil(id, d) {
    if (!d.nome?.trim()) return {ok:0,msg:'Nome é obrigatório.'}
    try {
      const e = await this.r.update(id, { nome:d.nome, telefone:d.telefone||'', cargo:d.cargo||'', foto:d.foto||null })
      return {ok:1,data:e,msg:'Perfil atualizado com sucesso!'}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }
}

// ── EmpresaController ─────────────────────────────────────────────────
class EmpresaController {
  constructor(r) { this.r = r }

  async buscar() {
    try {
      const e = await this.r.get()
      return {ok:1,data:e}
    } catch(err) {
      return {ok:0,msg:err.message}
    }
  }

  async atualizar(d) {
    try {
      const e = await this.r.update(d)
      return {ok:1,data:e,msg:'Empresa atualizada com sucesso!'}
    } catch(e) {
      return {ok:0,msg:e.message}
    }
  }
}

// ── Exports ───────────────────────────────────────────────────────────
export const chapaCtrl   = new ChapaController(chapaRepo)
export const retalhoCtrl = new RetalhoController(retalhoRepo)
export const userCtrl    = new UserController(userRepo)
export const empresaCtrl = new EmpresaController(empresaRepo)
