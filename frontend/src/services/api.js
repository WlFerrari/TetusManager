/**
 * SERVIÇO DE API — Frontend
 * ─────────────────────────────────────────────────────────────────────
 * Camada que substitui os repositórios mock por chamadas reais à API REST.
 * Armazena o token JWT no localStorage e o envia em toda requisição.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// ── Gerenciamento do token JWT ────────────────────────────────────────
export const tokenStorage = {
  get:    ()    => localStorage.getItem('tetus_token'),
  set:    (t)   => localStorage.setItem('tetus_token', t),
  remove: ()    => localStorage.removeItem('tetus_token'),
}

// ── Fetch base com autenticação automática ────────────────────────────
async function apiFetch(path, options = {}) {
  const token = tokenStorage.get()

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  const json = await res.json()

  // Token expirado — desloga
  if (res.status === 401) {
    tokenStorage.remove()
    window.location.reload()
  }

  return json  // { ok, data, msg }
}

const get    = (path)         => apiFetch(path)
const post   = (path, body)   => apiFetch(path, { method:'POST',   body: JSON.stringify(body) })
const put    = (path, body)   => apiFetch(path, { method:'PUT',    body: JSON.stringify(body) })
const patch  = (path, body)   => apiFetch(path, { method:'PATCH',  body: JSON.stringify(body) })
const del    = (path)         => apiFetch(path, { method:'DELETE' })

// ════════════════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════════════════
export const AuthService = {
  login:  (email, senha) => post('/auth/login', { email, senha }),
  logout: ()             => tokenStorage.remove(),
}

// ════════════════════════════════════════════════════════════════════════
// CHAPAS
// ════════════════════════════════════════════════════════════════════════
export const ChapaService = {
  listar:   (q = '')  => get(`/chapas${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  buscar:   (id)      => get(`/chapas/${id}`),
  stats:    ()        => get('/chapas/stats'),
  criar:    (data)    => post('/chapas', data),
  atualizar:(id,data) => put(`/chapas/${id}`, data),
  excluir:  (id)      => del(`/chapas/${id}`),
}

// ════════════════════════════════════════════════════════════════════════
// RETALHOS
// ════════════════════════════════════════════════════════════════════════
export const RetalhoService = {
  listar:         (q = '')  => get(`/retalhos${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  buscar:         (id)      => get(`/retalhos/${id}`),
  stats:          ()        => get('/retalhos/stats'),
  criar:          (data)    => post('/retalhos', data),
  atualizar:      (id,data) => put(`/retalhos/${id}`, data),
  marcarConsumido:(id)      => patch(`/retalhos/${id}/consumir`, {}),
  excluir:        (id)      => del(`/retalhos/${id}`),
}

// ════════════════════════════════════════════════════════════════════════
// CORTES
// ════════════════════════════════════════════════════════════════════════
export const CorteService = {
  registrar:(data) => post('/cortes', data),
}

// ════════════════════════════════════════════════════════════════════════
// USUÁRIOS
// ════════════════════════════════════════════════════════════════════════
export const UsuarioService = {
  listar:            (q='')          => get(`/usuarios${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  buscar:            (id)            => get(`/usuarios/${id}`),
  criar:             (data)          => post('/usuarios', data),
  atualizar:         (id,data)       => put(`/usuarios/${id}`, data),
  toggleStatus:      (id)            => patch(`/usuarios/${id}/toggle`, {}),
  atualizarPermissoes:(id,perms)     => patch(`/usuarios/${id}/permissoes`, { permissoes:perms }),
  resetarPermissoes: (id)            => patch(`/usuarios/${id}/reset-permissoes`, {}),
  excluir:           (id)            => del(`/usuarios/${id}`),
  // Perfil do usuário logado
  meuPerfil:         ()              => get('/me'),
  atualizarMeuPerfil:(data)          => patch('/me/perfil', data),
  alterarSenha:      (senhaAtual,novaSenha) => patch('/me/senha', { senhaAtual, novaSenha }),
}

// ════════════════════════════════════════════════════════════════════════
// EMPRESA
// ════════════════════════════════════════════════════════════════════════
export const EmpresaService = {
  buscar:   ()     => get('/empresa'),
  atualizar:(data) => put('/empresa', data),
}
