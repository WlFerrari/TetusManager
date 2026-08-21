const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_BYTES = 500 * 1024
const TIPOS_ROCHA = ['Granito', 'Mármore', 'Quartzito', 'Ardósia', 'Pedra Sabão']

const LIMITS = {
  nome:120,
  localizacao:160,
  observacao:500,
  osNumero:60,
  telefone:30,
  cargo:80,
  endereco:220,
}

function text(value, label, { required=true, max=120 } = {}) {
  const str = String(value ?? '').trim()
  if (required && !str) return `${label} é obrigatório.`
  if (str.length > max) return `${label} deve ter no máximo ${max} caracteres.`
  return null
}

function positiveNumber(value, label, { max=10000, allowZero=false } = {}) {
  if (value === '' || value === null || value === undefined) return `${label} é obrigatório.`
  const n = Number(value)
  if (!Number.isFinite(n)) return `${label} deve ser um número válido.`
  if (allowZero ? n < 0 : n <= 0) return `${label} deve ser ${allowZero ? 'maior ou igual a 0' : 'maior que 0'}.`
  if (n > max) return `${label} excede o limite permitido (${max}).`
  return null
}

function email(value, required=true) {
  const str = String(value ?? '').trim().toLowerCase()
  if (!str) return required ? 'E-mail é obrigatório.' : null
  if (str.length > 160) return 'E-mail deve ter no máximo 160 caracteres.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return 'E-mail inválido.'
  return null
}

function phone(value) {
  const str = String(value ?? '').trim()
  if (!str) return null
  if (str.length > LIMITS.telefone) return `Telefone deve ter no máximo ${LIMITS.telefone} caracteres.`
  const digits = str.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) return 'Telefone inválido.'
  return null
}

function password(value, label='Senha') {
  const str = String(value ?? '')
  if (!str) return `${label} é obrigatória.`
  if (str.length < 6) return `${label} deve ter pelo menos 6 caracteres.`
  if (str.length > 72) return `${label} deve ter no máximo 72 caracteres.`
  return null
}

function hexColor(value) {
  if (!/^#[0-9a-fA-F]{6}$/.test(String(value || ''))) return 'Cor inválida.'
  return null
}

function validCnpj(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false

  const calc = base => {
    let factor = base.length - 7
    let sum = 0
    for (const char of base) {
      sum += Number(char) * factor--
      if (factor < 2) factor = 9
    }
    const mod = sum % 11
    return mod < 2 ? 0 : 11 - mod
  }

  const d1 = calc(digits.slice(0,12))
  const d2 = calc(digits.slice(0,12) + d1)
  return digits.endsWith(`${d1}${d2}`)
}

function bufferMatchesMime(buffer, mime) {
  if (mime === 'image/jpeg') return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  if (mime === 'image/png') return buffer.length >= 8 && buffer.slice(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
  if (mime === 'image/webp') return buffer.length >= 12 && buffer.slice(0,4).toString() === 'RIFF' && buffer.slice(8,12).toString() === 'WEBP'
  return false
}

function imageDataUrl(value, label='Imagem') {
  if (!value) return null
  if (typeof value !== 'string') return `${label} inválida.`

  const match = value.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
  if (!match || !IMAGE_TYPES.includes(match[1])) return `${label} inválida. Use JPG, PNG ou WEBP.`

  let buffer
  try { buffer = Buffer.from(match[2], 'base64') } catch (_) { return `${label} inválida.` }
  if (!buffer.length) return `${label} está vazia.`
  if (buffer.length > MAX_IMAGE_BYTES) return `${label} deve ter no máximo 500 KB.`
  if (!bufferMatchesMime(buffer, match[1])) return `${label} não corresponde ao tipo de arquivo informado.`
  return null
}

function validateChapa(data={}) {
  const allowedStatus = ['Disponível', 'Em uso', 'Inativa']
  return text(data.nome, 'Nome', { max:LIMITS.nome })
    || (!TIPOS_ROCHA.includes(data.tipo) ? 'Tipo de material inválido.' : null)
    || positiveNumber(data.largura, 'Largura')
    || positiveNumber(data.comprimento, 'Comprimento')
    || positiveNumber(data.espessura, 'Espessura', { max:100 })
    || text(data.localizacao, 'Localização', { required:false, max:LIMITS.localizacao })
    || hexColor(data.cor)
    || (!allowedStatus.includes(data.status || 'Disponível') ? 'Status da chapa inválido.' : null)
    || imageDataUrl(data.foto, 'Foto da chapa')
}

function validateRetalho(data={}) {
  const allowedStatus = ['Disponível', 'Reservado', 'Consumido', 'Descartado']
  const origemTipo = data.origemTipo || data.origem_tipo || (data.origem ? 'AUTOMATICA' : 'MANUAL')
  return text(data.nome, 'Nome', { max:LIMITS.nome })
    || (!TIPOS_ROCHA.includes(data.tipo) ? 'Tipo de material inválido.' : null)
    || positiveNumber(data.largura, 'Largura')
    || positiveNumber(data.comprimento, 'Comprimento')
    || positiveNumber(data.espessura, 'Espessura', { max:100 })
    || text(data.localizacao, 'Localização', { required:false, max:LIMITS.localizacao })
    || text(data.origem, 'Chapa de origem', { required:false, max:80 })
    || (!['AUTOMATICA','MANUAL'].includes(origemTipo) ? 'Tipo de origem do retalho inválido.' : null)
    || (origemTipo === 'AUTOMATICA' && !String(data.origem || '').trim() ? 'Retalho automático deve possuir chapa de origem.' : null)
    || hexColor(data.cor)
    || (!allowedStatus.includes(data.status || 'Disponível') ? 'Status do retalho inválido.' : null)
    || imageDataUrl(data.foto, 'Foto do retalho')
}

function validateCorte(data={}) {
  return text(data.osNumero, 'Número da OS', { max:LIMITS.osNumero })
    || text(data.chapaId, 'Chapa de origem', { max:80 })
    || positiveNumber(data.comprimentoConsumido, 'Comprimento consumido')
    || positiveNumber(data.larguraConsumida, 'Largura consumida')
    || text(data.observacao, 'Observação', { required:false, max:LIMITS.observacao })
}

function validateUser(data={}, { requirePassword=false }={}) {
  const allowedProfiles = ['Administrador', 'Estoquista', 'Vendedor']
  const allowedStatus = ['Ativo', 'Inativo']
  return text(data.nome, 'Nome', { max:LIMITS.nome })
    || email(data.email)
    || phone(data.telefone)
    || text(data.cargo, 'Cargo', { required:false, max:LIMITS.cargo })
    || (!allowedProfiles.includes(data.perfil) ? 'Perfil de usuário inválido.' : null)
    || (!allowedStatus.includes(data.status || 'Ativo') ? 'Status de usuário inválido.' : null)
    || (requirePassword ? password(data.senha, 'Senha inicial') : null)
}

function validateProfile(data={}) {
  return text(data.nome, 'Nome', { max:LIMITS.nome })
    || phone(data.telefone)
    || text(data.cargo, 'Cargo', { required:false, max:LIMITS.cargo })
    || imageDataUrl(data.foto, 'Foto do perfil')
}

function validateCompany(data={}) {
  return text(data.nome, 'Nome da empresa', { max:LIMITS.nome })
    || (!validCnpj(data.cnpj) ? 'CNPJ inválido.' : null)
    || email(data.email)
    || phone(data.telefone)
    || text(data.endereco, 'Endereço', { required:false, max:LIMITS.endereco })
    || imageDataUrl(data.logo, 'Logo da empresa')
}

module.exports = {
  LIMITS,
  TIPOS_ROCHA,
  text,
  positiveNumber,
  email,
  phone,
  password,
  hexColor,
  validCnpj,
  imageDataUrl,
  validateChapa,
  validateRetalho,
  validateCorte,
  validateUser,
  validateProfile,
  validateCompany,
}
