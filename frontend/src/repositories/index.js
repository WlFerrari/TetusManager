/**
 * CAMADA DE REPOSITÓRIO (Repository)
 * Conecta os controllers do frontend à API REST real.
 */

import { ChapaService, RetalhoService, UsuarioService, EmpresaService, CorteService } from '../services/api.js'
import { mkChapa, mkRetalho, mkUser, mkEmpresa, mkCorte } from '../models/index.js'

export const chapaRepo = {
  findAll:async (filtro='') => {
    const res = await ChapaService.listar(filtro)
    if (!res.ok) throw new Error(res.msg)
    return res.data.map(mkChapa)
  },
  findById:async id => {
    const res = await ChapaService.buscar(id)
    return res.ok ? mkChapa(res.data) : null
  },
  listarDisponiveis:async () => {
    const res = await ChapaService.listarDisponiveis()
    if (!res.ok) throw new Error(res.msg)
    return res.data.map(mkChapa)
  },
  insert:async data => {
    const res = await ChapaService.criar(data)
    if (!res.ok) throw new Error(res.msg)
    return mkChapa(res.data)
  },
  update:async (id,patch) => {
    const res = await ChapaService.atualizar(id, patch)
    if (!res.ok) throw new Error(res.msg)
    return mkChapa(res.data)
  },
  reactivate:async id => {
    const res = await ChapaService.reativar(id)
    if (!res.ok) throw new Error(res.msg)
    return mkChapa(res.data)
  },
  delete:async id => {
    const res = await ChapaService.excluir(id)
    if (!res.ok) throw new Error(res.msg)
    return mkChapa(res.data)
  },
  stats:async () => {
    const res = await ChapaService.stats()
    return res.ok ? res.data : { total:0, disponiveis:0, emUso:0, inativas:0 }
  },
}

export const retalhoRepo = {
  findAll:async (filtro='') => {
    const res = await RetalhoService.listar(filtro)
    if (!res.ok) throw new Error(res.msg)
    return res.data.map(mkRetalho)
  },
  findById:async id => {
    const res = await RetalhoService.buscar(id)
    return res.ok ? mkRetalho(res.data) : null
  },
  insert:async data => {
    const res = await RetalhoService.criar(data)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  update:async (id,patch) => {
    const res = await RetalhoService.atualizar(id, patch)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  marcarReservado:async id => {
    const res = await RetalhoService.marcarReservado(id)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  marcarDisponivel:async id => {
    const res = await RetalhoService.liberarReserva(id)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  marcarConsumido:async id => {
    const res = await RetalhoService.marcarConsumido(id)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  marcarDescartado:async id => {
    const res = await RetalhoService.marcarDescartado(id)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  reativar:async id => {
    const res = await RetalhoService.reativar(id)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  delete:async id => {
    const res = await RetalhoService.marcarDescartado(id)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  stats:async () => {
    const res = await RetalhoService.stats()
    return res.ok ? res.data : { total:0, disponiveis:0, reservados:0, consumidos:0, descartados:0, areaTotal:0 }
  },
}

export const corteRepo = {
  registrar:async data => {
    const res = await CorteService.registrar(data)
    if (!res.ok) throw new Error(res.msg)
    return {
      data:(res.data || []).map(mkRetalho),
      cortes:(res.cortes || []).map(mkCorte),
      semRetalho:!!res.semRetalho,
      msg:res.msg,
    }
  },
  listar:async (filters={}) => {
    const res = await CorteService.listar(filters)
    if (!res.ok) throw new Error(res.msg)
    return res.data.map(mkCorte)
  },
  stats:async () => {
    const res = await CorteService.stats()
    return res.ok ? res.data : { total:0, areaConsumida:0, areaRetalho:0 }
  },
}

export const userRepo = {
  findAll:async (filtro='') => {
    const res = await UsuarioService.listar(filtro)
    if (!res.ok) throw new Error(res.msg)
    return res.data.map(mkUser)
  },
  findById:async id => {
    const res = await UsuarioService.buscar(id)
    return res.ok ? mkUser(res.data) : null
  },
  findWhere:async fn => {
    const res = await UsuarioService.listar()
    if (!res.ok) throw new Error(res.msg)
    return res.data.filter(fn).map(mkUser)
  },
  insert:async data => {
    const res = await UsuarioService.criar(data)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  update:async (id,patch) => {
    const res = await UsuarioService.atualizar(id, patch)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  updateProfile:async patch => {
    const res = await UsuarioService.atualizarMeuPerfil(patch)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  delete:async id => {
    const res = await UsuarioService.excluir(id)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  toggleStatus:async id => {
    const res = await UsuarioService.toggleStatus(id)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  atualizarPermissoes:async (id,permissoes) => {
    const res = await UsuarioService.atualizarPermissoes(id, permissoes)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  resetarPermissoes:async id => {
    const res = await UsuarioService.resetarPermissoes(id)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  alterarSenha:async (senhaAtual,novaSenha) => UsuarioService.alterarSenha(senhaAtual, novaSenha),
}

export const empresaRepo = {
  get:async () => {
    const res = await EmpresaService.buscar()
    if (!res.ok) throw new Error(res.msg)
    return mkEmpresa(res.data)
  },
  update:async patch => {
    const res = await EmpresaService.atualizar(patch)
    if (!res.ok) throw new Error(res.msg)
    return mkEmpresa(res.data)
  },
}
