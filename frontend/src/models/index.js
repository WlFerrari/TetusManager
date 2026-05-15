/**
 * CAMADA DE MODELO (Model)
 * Define o schema (estrutura) de cada entidade do sistema.
 */

// ── Permissões padrão por perfil ──────────────────────────────────────
export const PERMISSOES_PADRAO = {
  Administrador: {
    verDashboard: true, verEstoque: true, editarEstoque: true,
    registrarCorte: true, verRelatorios: true, gerenciarUsuarios: true,
    verConfiguracoes: true, verEmpresa: true,
  },
  Estoquista: {
    verDashboard: true, verEstoque: true, editarEstoque: true,
    registrarCorte: true, verRelatorios: false, gerenciarUsuarios: false,
    verConfiguracoes: true, verEmpresa: false,
  },
  Vendedor: {
    verDashboard: true, verEstoque: true, editarEstoque: false,
    registrarCorte: false, verRelatorios: false, gerenciarUsuarios: false,
    verConfiguracoes: true, verEmpresa: false,
  },
}

export const LABELS_PERMISSOES = {
  verDashboard: 'Ver Dashboard',
  verEstoque: 'Ver Estoque',
  editarEstoque: 'Editar / Criar no Estoque',
  registrarCorte: 'Registrar Cortes',
  verRelatorios: 'Ver Relatórios',
  gerenciarUsuarios: 'Gerenciar Usuários',
  verConfiguracoes: 'Acessar Configurações',
  verEmpresa: 'Ver dados da Empresa',
}

export const mkChapa = (data = {}) => ({
  id: data.id || 'CH' + Date.now().toString().slice(-6),
  nome: String(data.nome || '').trim(),
  tipo: data.tipo || 'Granito',
  cor: data.cor || '#6b7280',
  largura: Number(data.largura) || 0,
  comprimento: Number(data.comprimento) || 0,
  espessura: Number(data.espessura) || 2,
  status: data.status || 'Disponível',
  qrCode: data.qrCode || data.qr_code || '',
  criadoEm: data.criadoEm || new Date().toLocaleDateString('pt-BR'),
})

export const mkRetalho = (data = {}) => ({
  id: data.id || 'RET-' + Date.now().toString().slice(-6),
  origem: data.origem || '',
  nome: String(data.nome || '').trim(),
  tipo: data.tipo || 'Granito',
  cor: data.cor || '#6b7280',
  largura: Number(data.largura) || 0,
  comprimento: Number(data.comprimento) || 0,
  espessura: Number(data.espessura) || 2,
  area: Number(data.area) || 0,
  status: data.status || 'Disponível',
  qrCode: data.qrCode || data.qr_code || '',
  criadoEm: data.criadoEm || new Date().toLocaleDateString('pt-BR'),
})

export const mkUser = (data = {}) => {
  const perfil = data.perfil || 'Vendedor'
  const base = PERMISSOES_PADRAO[perfil] || PERMISSOES_PADRAO['Vendedor']
  const permissoes = data.permissoes ? { ...base, ...data.permissoes } : { ...base }
  return {
    id: data.id || Date.now(),
    nome: String(data.nome || '').trim(),
    email: String(data.email || '').trim().toLowerCase(),
    perfil,
    status: data.status || 'Ativo',
    senha: data.senha || '123456',
    foto: data.foto || null,
    telefone: data.telefone || '',
    cargo: data.cargo || '',
    permissoes,
    criadoEm: data.criadoEm || new Date().toLocaleDateString('pt-BR'),
  }
}

export const mkEmpresa = (data = {}) => ({
  nome: data.nome || 'Tetus Marmoraria',
  cnpj: data.cnpj || '12.345.678/0001-90',
  email: data.email || 'contato@tetusmarmoraria.com.br',
  telefone: data.telefone || '(43) 3333-4444',
  endereco: data.endereco || 'Rua das Pedras, 100 — Londrina, PR',
  logo: data.logo || null,
  plano: data.plano || 'Profissional',
  fundacao: data.fundacao || '2015',
})

export const TIPOS_ROCHA    = ['Granito', 'Mármore', 'Quartzito', 'Ardósia', 'Pedra Sabão']
export const PERFIS_USUARIO = ['Administrador', 'Estoquista', 'Vendedor']
export const STATUS_CHAPA   = ['Disponível', 'Em uso', 'Esgotado']
export const STATUS_RETALHO = ['Disponível', 'Reservado', 'Consumido']
