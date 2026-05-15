/**
 * CAMADA DE REPOSITÓRIO (Repository)
 * Agora conecta com API REST real em vez de usar mock em memória.
 * Todas as operações vão para o backend e são persistidas em PostgreSQL.
 */

import { ChapaService, RetalhoService, UsuarioService, EmpresaService } from '../services/api.js'
import { mkChapa, mkRetalho, mkUser, mkEmpresa } from '../models/index.js'

// ── Repositório de Chapas (com API real) ──────────────────────────────
export const chapaRepo = {
  findAll: async (filtro = '') => {
    const res = await ChapaService.listar(filtro)
    return res.ok ? res.data.map(mkChapa) : []
  },
  findById: async (id) => {
    const res = await ChapaService.buscar(id)
    return res.ok ? mkChapa(res.data) : null
  },
  insert: async (data) => {
    const res = await ChapaService.criar(data)
    if (!res.ok) throw new Error(res.msg)
    return mkChapa(res.data)
  },
  update: async (id, patch) => {
    const res = await ChapaService.atualizar(id, patch)
    if (!res.ok) throw new Error(res.msg)
    return mkChapa(res.data)
  },
  delete: async (id) => {
    const res = await ChapaService.excluir(id)
    if (!res.ok) throw new Error(res.msg)
    return mkChapa(res.data)
  },
  stats: async () => {
    const res = await ChapaService.stats()
    return res.ok ? res.data : { total: 0, disponiveis: 0, emUso: 0 }
  },
}

// ── Repositório de Retalhos (com API real) ────────────────────────────
export const retalhoRepo = {
  findAll: async (filtro = '') => {
    const res = await RetalhoService.listar(filtro)
    return res.ok ? res.data.map(mkRetalho) : []
  },
  findById: async (id) => {
    const res = await RetalhoService.buscar(id)
    return res.ok ? mkRetalho(res.data) : null
  },
  insert: async (data) => {
    const res = await RetalhoService.criar(data)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  update: async (id, patch) => {
    const res = await RetalhoService.atualizar(id, patch)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  delete: async (id) => {
    const res = await RetalhoService.excluir(id)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  marcarConsumido: async (id) => {
    const res = await RetalhoService.marcarConsumido(id)
    if (!res.ok) throw new Error(res.msg)
    return mkRetalho(res.data)
  },
  stats: async () => {
    const res = await RetalhoService.stats()
    return res.ok ? res.data : { total: 0, disponiveis: 0, reservados: 0, consumidos: 0, areaTotal: 0 }
  },
}

// ── Repositório de Usuários (com API real) ────────────────────────────
export const userRepo = {
  findAll: async (filtro = '') => {
    const res = await UsuarioService.listar(filtro)
    return res.ok ? res.data.map(mkUser) : []
  },
  findById: async (id) => {
    const res = await UsuarioService.buscar(id)
    return res.ok ? mkUser(res.data) : null
  },
  findWhere: async (fn) => {
    const res = await UsuarioService.listar()
    return res.ok ? res.data.filter(fn).map(mkUser) : []
  },
  insert: async (data) => {
    const res = await UsuarioService.criar(data)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  update: async (id, patch) => {
    const res = await UsuarioService.atualizar(id, patch)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  delete: async (id) => {
    const res = await UsuarioService.excluir(id)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  toggleStatus: async (id) => {
    const res = await UsuarioService.toggleStatus(id)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  atualizarPermissoes: async (id, permissoes) => {
    const res = await UsuarioService.atualizarPermissoes(id, permissoes)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
  resetarPermissoes: async (id) => {
    const res = await UsuarioService.resetarPermissoes(id)
    if (!res.ok) throw new Error(res.msg)
    return mkUser(res.data)
  },
}

// ── Repositório de Empresa (com API real) ─────────────────────────────
export const empresaRepo = {
  get: async () => {
    const res = await EmpresaService.buscar()
    return res.ok ? mkEmpresa(res.data) : mkEmpresa({})
  },
  update: async (patch) => {
    const res = await EmpresaService.atualizar(patch)
    if (!res.ok) throw new Error(res.msg)
    return mkEmpresa(res.data)
  },
}
