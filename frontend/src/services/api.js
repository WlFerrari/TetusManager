/**
 * SERVIÇO DE API — Frontend
 * Camada HTTP do TetusManager com autenticação JWT.
 */

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
const BASE_URL = rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, '')}/api`

export const tokenStorage = {
  get: () => localStorage.getItem('tetus_token'),
  set: (t) => localStorage.setItem('tetus_token', t),
  remove: () => localStorage.removeItem('tetus_token'),
}

async function apiFetch(path, options = {}) {
  const token = tokenStorage.get()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const json = await res.json()

  if (res.status === 401) {
    tokenStorage.remove()
    window.location.reload()
  }
  return json
}

const get = (path) => apiFetch(path)
const post = (path, body) => apiFetch(path, { method:'POST', body:JSON.stringify(body) })
const put = (path, body) => apiFetch(path, { method:'PUT', body:JSON.stringify(body) })
const patch = (path, body) => apiFetch(path, { method:'PATCH', body:JSON.stringify(body) })
const del = (path) => apiFetch(path, { method:'DELETE' })

const toQueryString = (params = {}) => {
  const qp = new URLSearchParams()
  Object.entries(params).forEach(([k,v]) => {
    if (v === undefined || v === null || v === '') return
    qp.set(k, String(v))
  })
  const s = qp.toString()
  return s ? `?${s}` : ''
}

export const AuthService = {
  login: (email, senha) => post('/auth/login', { email, senha }),
  logout: () => tokenStorage.remove(),
}

export const ChapaService = {
  listar: (qOrFilters = '') => {
    if (typeof qOrFilters === 'string') {
      return get(`/chapas${qOrFilters ? `?q=${encodeURIComponent(qOrFilters)}` : ''}`)
    }
    return get(`/chapas${toQueryString(qOrFilters)}`)
  },
  listarDisponiveis: () => get('/chapas/disponiveis'),
  buscar: (id) => get(`/chapas/${id}`),
  stats: () => get('/chapas/stats'),
  criar: (data) => post('/chapas', data),
  atualizar: (id,data) => put(`/chapas/${id}`, data),
  // Endpoint legado: no backend executa inativação lógica, não DELETE físico.
  excluir: (id) => del(`/chapas/${id}`),
}

export const RetalhoService = {
  listar: (qOrFilters = '') => {
    if (typeof qOrFilters === 'string') {
      return get(`/retalhos${qOrFilters ? `?q=${encodeURIComponent(qOrFilters)}` : ''}`)
    }
    return get(`/retalhos${toQueryString(qOrFilters)}`)
  },
  buscar: (id) => get(`/retalhos/${id}`),
  stats: () => get('/retalhos/stats'),
  criar: (data) => post('/retalhos', data),
  atualizar: (id,data) => put(`/retalhos/${id}`, data),
  marcarReservado: (id) => patch(`/retalhos/${id}/reservar`, {}),
  liberarReserva: (id) => patch(`/retalhos/${id}/liberar`, {}),
  marcarConsumido: (id) => patch(`/retalhos/${id}/consumir`, {}),
  marcarDescartado: (id) => patch(`/retalhos/${id}/descartar`, {}),
  // Legado; backend converte para descarte lógico.
  excluir: (id) => del(`/retalhos/${id}`),
}

export const CorteService = {
  registrar: (data) => post('/cortes', data),
  listar: (filters = {}) => get(`/cortes${toQueryString(filters)}`),
  stats: () => get('/cortes/stats'),
}

export const UsuarioService = {
  listar: (q='') => get(`/usuarios${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  buscar: (id) => get(`/usuarios/${id}`),
  criar: (data) => post('/usuarios', data),
  atualizar: (id,data) => put(`/usuarios/${id}`, data),
  toggleStatus: (id) => patch(`/usuarios/${id}/toggle`, {}),
  atualizarPermissoes: (id,perms) => patch(`/usuarios/${id}/permissoes`, { permissoes:perms }),
  resetarPermissoes: (id) => patch(`/usuarios/${id}/reset-permissoes`, {}),
  // Legado; backend converte para inativação lógica.
  excluir: (id) => del(`/usuarios/${id}`),
  meuPerfil: () => get('/me'),
  atualizarMeuPerfil: (data) => patch('/me/perfil', data),
  alterarSenha: (senhaAtual,novaSenha) => patch('/me/senha', { senhaAtual, novaSenha }),
}

export const EmpresaService = {
  buscar: () => get('/empresa'),
  atualizar: (data) => put('/empresa', data),
}
