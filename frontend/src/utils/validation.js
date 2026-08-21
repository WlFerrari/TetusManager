const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
const MAX_SOURCE_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_STORED_IMAGE_BYTES = 500 * 1024
const MAX_IMAGE_DIMENSION = 1280
const TIPOS_ROCHA = ['Granito', 'Mármore', 'Quartzito', 'Ardósia', 'Pedra Sabão']

export const LIMITS = {
  nome:120,
  localizacao:160,
  observacao:500,
  osNumero:60,
  telefone:30,
  cargo:80,
  endereco:220,
}

const dataUrlBytes = dataUrl => {
  const base64 = String(dataUrl || '').split(',')[1] || ''
  return Math.ceil(base64.length * 3 / 4)
}

export function requiredText(value, label, max=120) {
  const text = String(value ?? '').trim()
  if (!text) return `${label} é obrigatório.`
  if (text.length > max) return `${label} deve ter no máximo ${max} caracteres.`
  return null
}

export function optionalText(value, label, max=120) {
  const text = String(value ?? '').trim()
  if (text.length > max) return `${label} deve ter no máximo ${max} caracteres.`
  return null
}

export function positiveNumber(value, label, { max=10000, allowZero=false }={}) {
  if (value === '' || value === null || value === undefined) return `${label} é obrigatório.`
  const n = Number(value)
  if (!Number.isFinite(n)) return `${label} deve ser um número válido.`
  if (allowZero ? n < 0 : n <= 0) return `${label} deve ser ${allowZero ? 'maior ou igual a 0' : 'maior que 0'}.`
  if (n > max) return `${label} excede o limite permitido (${max}).`
  return null
}

export function nonNegativeFilter(value, label) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return `${label} não pode ser negativo.`
  return null
}

export function email(value, required=true) {
  const text = String(value ?? '').trim().toLowerCase()
  if (!text) return required ? 'E-mail é obrigatório.' : null
  if (text.length > 160) return 'E-mail deve ter no máximo 160 caracteres.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'E-mail inválido.'
  return null
}

export function phone(value) {
  const text = String(value ?? '').trim()
  if (!text) return null
  if (text.length > LIMITS.telefone) return `Telefone deve ter no máximo ${LIMITS.telefone} caracteres.`
  const digits = text.replace(/\D/g, '')
  if (digits.length < 8 || digits.length > 15) return 'Telefone inválido.'
  return null
}

export function password(value, label='Senha') {
  const text = String(value ?? '')
  if (!text) return `${label} é obrigatória.`
  if (text.length < 6) return `${label} deve ter pelo menos 6 caracteres.`
  if (text.length > 72) return `${label} deve ter no máximo 72 caracteres.`
  return null
}

export function hexColor(value) {
  if (!/^#[0-9a-fA-F]{6}$/.test(String(value || ''))) return 'Cor inválida.'
  return null
}

export function validCnpj(value) {
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

export function imageDataUrl(value) {
  if (!value) return null
  const match = String(value).match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/)
  if (!match) return 'A imagem enviada está em formato inválido. Use JPG, PNG ou WEBP.'
  if (dataUrlBytes(value) > MAX_STORED_IMAGE_BYTES) return 'A imagem deve ter no máximo 500 KB após a compressão.'
  return null
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('O arquivo não contém uma imagem válida.'))
      img.onload = () => resolve(img)
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

export async function prepareImageFile(file) {
  if (!file) return { ok:false, msg:'Nenhum arquivo selecionado.' }

  const extension = String(file.name || '').split('.').pop().toLowerCase()
  if (!IMAGE_TYPES.includes(file.type) || !IMAGE_EXTENSIONS.includes(extension)) {
    return { ok:false, msg:'Arquivo inválido. Selecione somente uma imagem JPG, PNG ou WEBP.' }
  }
  if (file.size <= 0) return { ok:false, msg:'O arquivo selecionado está vazio.' }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) return { ok:false, msg:'A imagem original deve ter no máximo 8 MB.' }

  try {
    const img = await fileToImage(file)
    let width = img.naturalWidth
    let height = img.naturalHeight
    if (!width || !height) return { ok:false, msg:'Não foi possível identificar as dimensões da imagem.' }

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height))
    width = Math.max(1, Math.round(width * scale))
    height = Math.max(1, Math.round(height * scale))

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return { ok:false, msg:'Seu navegador não conseguiu processar a imagem.' }

    let currentWidth = width
    let currentHeight = height
    let dataUrl = ''

    for (let pass=0; pass<5; pass+=1) {
      canvas.width = currentWidth
      canvas.height = currentHeight
      ctx.clearRect(0,0,currentWidth,currentHeight)
      ctx.drawImage(img,0,0,currentWidth,currentHeight)

      for (const quality of [0.82,0.72,0.62,0.52]) {
        dataUrl = canvas.toDataURL('image/webp', quality)
        if (dataUrlBytes(dataUrl) <= MAX_STORED_IMAGE_BYTES) return { ok:true, data:dataUrl }
      }

      currentWidth = Math.max(1, Math.round(currentWidth * 0.82))
      currentHeight = Math.max(1, Math.round(currentHeight * 0.82))
    }

    return { ok:false, msg:'A imagem não pôde ser reduzida para menos de 500 KB. Escolha outra imagem.' }
  } catch (err) {
    return { ok:false, msg:err.message || 'Imagem inválida.' }
  }
}

export function validateChapa(data) {
  return requiredText(data.nome, 'Nome', LIMITS.nome)
    || (!TIPOS_ROCHA.includes(data.tipo) ? 'Tipo de material inválido.' : null)
    || positiveNumber(data.largura, 'Largura')
    || positiveNumber(data.comprimento, 'Comprimento')
    || positiveNumber(data.espessura, 'Espessura', { max:100 })
    || optionalText(data.localizacao, 'Localização', LIMITS.localizacao)
    || hexColor(data.cor)
    || (!['Disponível','Em uso','Inativa'].includes(data.status || 'Disponível') ? 'Status da chapa inválido.' : null)
    || imageDataUrl(data.foto)
}

export function validateRetalho(data) {
  const origemTipo = data.origemTipo || data.origem_tipo || (data.origem ? 'AUTOMATICA' : 'MANUAL')
  return requiredText(data.nome, 'Nome', LIMITS.nome)
    || (!TIPOS_ROCHA.includes(data.tipo) ? 'Tipo de material inválido.' : null)
    || positiveNumber(data.largura, 'Largura')
    || positiveNumber(data.comprimento, 'Comprimento')
    || positiveNumber(data.espessura, 'Espessura', { max:100 })
    || optionalText(data.localizacao, 'Localização', LIMITS.localizacao)
    || optionalText(data.origem, 'Chapa de origem', 80)
    || (!['AUTOMATICA','MANUAL'].includes(origemTipo) ? 'Tipo de origem do retalho inválido.' : null)
    || (origemTipo === 'AUTOMATICA' && !String(data.origem || '').trim() ? 'Retalho automático deve possuir chapa de origem.' : null)
    || hexColor(data.cor)
    || (!['Disponível','Reservado','Consumido','Descartado'].includes(data.status || 'Disponível') ? 'Status do retalho inválido.' : null)
    || imageDataUrl(data.foto)
}

export function validateCorte(data, chapa) {
  return requiredText(data.osNumero, 'Número da OS', LIMITS.osNumero)
    || requiredText(data.chapaId, 'Chapa de origem', 80)
    || positiveNumber(data.cc, 'Comprimento consumido')
    || positiveNumber(data.lc, 'Largura consumida')
    || optionalText(data.obs, 'Observações', LIMITS.observacao)
    || (chapa && Number(data.cc) > Number(chapa.comprimento) ? 'O comprimento consumido é maior que o comprimento da chapa.' : null)
    || (chapa && Number(data.lc) > Number(chapa.largura) ? 'A largura consumida é maior que a largura da chapa.' : null)
}

export function validateUser(data, { requirePassword=false }={}) {
  return requiredText(data.nome, 'Nome', LIMITS.nome)
    || email(data.email)
    || phone(data.telefone)
    || optionalText(data.cargo, 'Cargo', LIMITS.cargo)
    || (!['Administrador','Estoquista','Vendedor'].includes(data.perfil) ? 'Perfil de usuário inválido.' : null)
    || (!['Ativo','Inativo'].includes(data.status || 'Ativo') ? 'Status de usuário inválido.' : null)
    || (requirePassword ? password(data.senha, 'Senha inicial') : null)
}

export function validateProfile(data) {
  return requiredText(data.nome, 'Nome', LIMITS.nome)
    || phone(data.telefone)
    || optionalText(data.cargo, 'Cargo', LIMITS.cargo)
    || imageDataUrl(data.foto)
}

export function validateCompany(data) {
  return requiredText(data.nome, 'Nome da empresa', LIMITS.nome)
    || (!validCnpj(data.cnpj) ? 'CNPJ inválido.' : null)
    || email(data.email)
    || phone(data.telefone)
    || optionalText(data.endereco, 'Endereço', LIMITS.endereco)
    || imageDataUrl(data.logo)
}
