/**
 * CAMADA DE CONTROLE (Controller)
 * Regras de negócio e validações alinhadas à documentação v1.2.
 * Retorno padrão: { ok: 1|0, data?, msg }
 */

import { chapaRepo, retalhoRepo, userRepo, empresaRepo, corteRepo } from '../repositories/index.js'

// O QR Code guarda somente um identificador estável. Os demais dados são consultados
// no sistema, evitando etiquetas obsoletas após uma edição da peça.
const withChapaQrCode = (payload = {}) => payload.id
  ? { ...payload, qrCode: `TETUS|CHAPA|${payload.id}` }
  : payload

const withRetalhoQrCode = (payload = {}) => payload.id
  ? { ...payload, qrCode: `TETUS|RETALHO|${payload.id}` }
  : payload

class ChapaController {
  constructor(r) { this.r = r }

  async criar(d) {
    if (!d.nome?.trim()) return { ok:0, msg:'Nome é obrigatório.' }
    if (!(+d.largura > 0)) return { ok:0, msg:'Largura inválida.' }
    if (!(+d.comprimento > 0)) return { ok:0, msg:'Comprimento inválido.' }
    try {
      const e = await this.r.insert(d)
      return { ok:1, data:e, msg:`Chapa "${e.nome}" cadastrada!` }
    } catch(err) { return { ok:0, msg:err.message } }
  }

  async listar(f='') {
    try { return { ok:1, data:await this.r.findAll(f) } }
    catch(err) { return { ok:0, data:[], msg:err.message } }
  }

  async buscar(id) {
    try {
      const e = await this.r.findById(id)
      return e ? {ok:1,data:e} : {ok:0,msg:'Não encontrada.'}
    } catch(err) { return { ok:0, msg:err.message } }
  }

  async atualizar(id,d) {
    if (!d.nome?.trim()) return {ok:0, msg:'Nome é obrigatório.'}
    try {
      const e = await this.r.update(id, withChapaQrCode({ ...d, id }))
      return {ok:1,data:e,msg:`Chapa "${e.nome}" atualizada!`}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async excluir(id) {
    try {
      const e = await this.r.delete(id)
      return {ok:1,data:e,msg:`Chapa "${e.nome}" inativada. Histórico preservado.`}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async listarChapas(f='') { return this.listar(f) }
  async gravarChapa(d) { return this.criar(d) }
  async atualizarChapa(id, d) { return this.atualizar(id, d) }
  async excluirChapa(id) { return this.excluir(id) }
  async consultarChapa(id) { return this.buscar(id) }

  async listarChapasDisponiveis() {
    try { return { ok:1, data:await this.r.listarDisponiveis() } }
    catch (err) { return { ok:0, data:[], msg:err.message } }
  }

  calcularCorte(cid, cc, lc, nome = '', chapa = null) {
    if (!cid || !(+cc > 0) || !(+lc > 0)) {
      return { ok:0, msg:'Chapa, comprimento e largura são obrigatórios.' }
    }
    if (!chapa) return { ok:0, msg:'Chapa não encontrada.' }

    const comprimentoChapa = Number(chapa.comprimento)
    const larguraChapa = Number(chapa.largura)
    cc = Number(cc)
    lc = Number(lc)

    if (cc > comprimentoChapa || lc > larguraChapa) {
      return { ok:0, msg:'O corte é maior do que a chapa selecionada. Ajuste as medidas.' }
    }

    // Modelo geométrico retangular simplificado (corte de guilhotina):
    // calcula as duas sobras retangulares possíveis e preserva a maior.
    const opcoes = [
      { comprimento: comprimentoChapa - cc, largura: larguraChapa },
      { comprimento: comprimentoChapa, largura: larguraChapa - lc },
    ].filter(r => r.comprimento > 0 && r.largura > 0)

    const areaConsumida = parseFloat(((cc * lc) / 10000).toFixed(4))
    if (!opcoes.length) {
      return {
        ok:1,
        retalho:null,
        semRetalho:true,
        areaConsumida,
        msg:'O corte consome toda a área retangular reutilizável; não será gerado retalho.',
      }
    }

    opcoes.sort((a,b) => (b.comprimento * b.largura) - (a.comprimento * a.largura))
    const sobra = opcoes[0]
    const area = parseFloat(((sobra.comprimento * sobra.largura) / 10000).toFixed(4))
    const retalho = {
      origem: String(cid),
      origemTipo: 'AUTOMATICA',
      comprimento: sobra.comprimento,
      largura: sobra.largura,
      area,
      status: 'Disponível',
      nome: nome?.trim() ? nome : `Sobra ${chapa.nome}`,
      tipo: chapa.tipo,
      cor: chapa.cor,
      espessura: chapa.espessura || 2,
      localizacao: chapa.localizacao || '',
    }

    return { ok:1, retalho, semRetalho:false, areaConsumida, msg:`Retalho calculado: ${area.toFixed(4)} m²` }
  }

  async stats() {
    try { return await this.r.stats() }
    catch(err) { return { total:0, disponiveis:0, emUso:0, inativas:0 } }
  }
}

class RetalhoController {
  constructor(r) { this.r = r }

  async criar(d) {
    if (!d.nome?.trim()) return {ok:0,msg:'Nome é obrigatório.'}
    if (!(+d.comprimento > 0 && +d.largura > 0)) return {ok:0,msg:'Dimensões inválidas.'}
    try {
      const payload = {
        ...d,
        area: parseFloat(((+d.comprimento * +d.largura) / 10000).toFixed(4)),
        origemTipo: d.origem ? 'AUTOMATICA' : 'MANUAL',
        tipo: d.tipo || 'Granito',
        cor: d.cor || '#6b7280',
        espessura: +d.espessura || 2,
      }
      const e = await this.r.insert(payload)
      return {ok:1,data:e,msg:`Retalho "${e.id}" cadastrado!`}
    } catch(err) { return {ok:0,msg:err.message} }
  }

  async gravarRetalho(d) { return this.criar(d) }

  async listar(f='') {
    try { return {ok:1,data:await this.r.findAll(f)} }
    catch(err) { return {ok:0,data:[],msg:err.message} }
  }

  async buscar(id) {
    try {
      const e = await this.r.findById(id)
      return e ? {ok:1,data:e} : {ok:0,msg:'Não encontrado.'}
    } catch(err) { return {ok:0,msg:err.message} }
  }

  async atualizar(id,d) {
    try {
      const area = parseFloat(((+d.comprimento * +d.largura) / 10000).toFixed(4))
      const e = await this.r.update(id, withRetalhoQrCode({ ...d, id, area }))
      return {ok:1,data:e,msg:`Retalho "${e.id}" atualizado!`}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async reservar(id) {
    try {
      const e = await this.r.marcarReservado(id)
      return {ok:1,data:e,msg:'Retalho reservado!'}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async liberarReserva(id) {
    try {
      const e = await this.r.marcarDisponivel(id)
      return {ok:1,data:e,msg:'Reserva liberada!'}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async marcarConsumido(id) {
    try {
      const e = await this.r.marcarConsumido(id)
      return {ok:1,data:e,msg:'Marcado como consumido!'}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async marcarDescartado(id) {
    try {
      const e = await this.r.marcarDescartado(id)
      return {ok:1,data:e,msg:'Retalho descartado. Histórico preservado!'}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  // Compatibilidade com telas antigas: excluir significa descartar logicamente.
  async excluir(id) { return this.marcarDescartado(id) }

  async stats() {
    try { return await this.r.stats() }
    catch(err) { return { total:0, disponiveis:0, reservados:0, consumidos:0, descartados:0, areaTotal:0 } }
  }
}

class UserController {
  constructor(r) { this.r = r }
  _ve(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }

  async criar(d) {
    if (!d.nome?.trim()) return {ok:0,msg:'Nome é obrigatório.'}
    if (!this._ve(d.email)) return {ok:0,msg:'E-mail inválido.'}
    if (d.senha && d.senha.length < 6) return {ok:0,msg:'Senha inicial: mínimo 6 caracteres.'}
    try {
      const e = await this.r.insert(d)
      return {ok:1,data:e,msg:`Usuário "${e.nome}" criado!`}
    } catch(err) { return {ok:0,msg:err.message} }
  }

  async listar(f='') {
    try { return {ok:1,data:await this.r.findAll(f)} }
    catch(err) { return {ok:0,data:[],msg:err.message} }
  }

  async buscar(id) {
    try {
      const e = await this.r.findById(id)
      return e ? {ok:1,data:e} : {ok:0,msg:'Não encontrado.'}
    } catch(err) { return {ok:0,msg:err.message} }
  }

  async atualizar(id,d) {
    if (!d.nome?.trim()) return {ok:0,msg:'Nome é obrigatório.'}
    if (!this._ve(d.email)) return {ok:0,msg:'E-mail inválido.'}
    try {
      const e = await this.r.update(id,d)
      return {ok:1,data:e,msg:`Usuário "${e.nome}" atualizado!`}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async toggleStatus(id) {
    try {
      const e = await this.r.toggleStatus(id)
      return {ok:1,data:e,msg:`Usuário ${e.status==='Ativo'?'ativado':'inativado'}!`}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async excluir(id) {
    try {
      const e = await this.r.delete(id)
      return {ok:1,data:e,msg:`Usuário "${e.nome}" inativado. Histórico preservado.`}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async atualizarPermissoes(id, permissoes) {
    try {
      const e = await this.r.atualizarPermissoes(id, permissoes)
      return {ok:1,data:e,msg:'Permissões atualizadas!'}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async resetarPermissoes(id) {
    try {
      const e = await this.r.resetarPermissoes(id)
      return {ok:1,data:e,msg:'Permissões resetadas ao padrão do perfil!'}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async atualizarPerfil(id, d) {
    if (!d.nome?.trim()) return {ok:0,msg:'Nome é obrigatório.'}
    try {
      const e = await this.r.update(id, { nome:d.nome, telefone:d.telefone||'', cargo:d.cargo||'', foto:d.foto||null })
      return {ok:1,data:e,msg:'Perfil atualizado com sucesso!'}
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async alterarSenha(senhaAtual, novaSenha) {
    if (!senhaAtual || !novaSenha) return {ok:0,msg:'Senhas são obrigatórias.'}
    if (novaSenha.length < 6) return {ok:0,msg:'Nova senha: mínimo 6 caracteres.'}
    try {
      const r = await this.r.alterarSenha(senhaAtual, novaSenha)
      return {ok:r.ok ? 1 : 0,msg:r.msg}
    } catch(e) { return {ok:0,msg:e.message} }
  }
}

class EmpresaController {
  constructor(r) { this.r = r }
  async buscar() {
    try { return {ok:1,data:await this.r.get()} }
    catch(err) { return {ok:0,msg:err.message} }
  }
  async atualizar(d) {
    try {
      const e = await this.r.update(d)
      return {ok:1,data:e,msg:'Empresa atualizada com sucesso!'}
    } catch(e) { return {ok:0,msg:e.message} }
  }
}

class CorteController {
  constructor(r) { this.r = r }

  async registrarCorte(payload) {
    if (!payload?.chapaId) return { ok:0, msg:'Chapa é obrigatória.' }
    if (!payload?.osNumero?.trim()) return { ok:0, msg:'Número da OS é obrigatório.' }
    if (!(+payload.comprimentoConsumido > 0 && +payload.larguraConsumida > 0)) {
      return { ok:0, msg:'Dimensões consumidas inválidas.' }
    }
    try {
      const res = await this.r.registrar({ ...payload, retalhos: payload.retalhos || [] })
      return {
        ok:1,
        data:res.data,
        cortes:res.cortes,
        semRetalho:res.semRetalho,
        msg:res.msg || 'Corte registrado com sucesso!',
      }
    } catch(e) { return {ok:0,msg:e.message} }
  }

  async listar(filters = {}) {
    try { return {ok:1,data:await this.r.listar(filters)} }
    catch(e) { return {ok:0,data:[],msg:e.message} }
  }

  async stats() {
    try { return await this.r.stats() }
    catch(e) { return {total:0,areaConsumida:0,areaRetalho:0} }
  }
}

export const chapaCtrl = new ChapaController(chapaRepo)
export const retalhoCtrl = new RetalhoController(retalhoRepo)
export const userCtrl = new UserController(userRepo)
export const empresaCtrl = new EmpresaController(empresaRepo)
export const corteCtrl = new CorteController(corteRepo)
