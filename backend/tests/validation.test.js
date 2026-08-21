const test = require('node:test')
const assert = require('node:assert/strict')

const {
  imageDataUrl,
  validCnpj,
  validateChapa,
  validateRetalho,
  validateUser,
} = require('../utils/validation')

test('rejeita medidas negativas ou zeradas em chapas', () => {
  const base = {
    nome:'Chapa teste', tipo:'Granito', cor:'#112233',
    largura:100, comprimento:200, espessura:2, status:'Disponível',
  }

  assert.match(validateChapa({ ...base, largura:-1 }), /maior que 0/)
  assert.match(validateChapa({ ...base, comprimento:0 }), /maior que 0/)
  assert.match(validateChapa({ ...base, espessura:-2 }), /maior que 0/)
})

test('rejeita tipo e estado desconhecidos', () => {
  const base = {
    nome:'Peça teste', tipo:'Granito', cor:'#112233', largura:30,
    comprimento:40, espessura:2, status:'Disponível', origemTipo:'MANUAL',
  }

  assert.match(validateRetalho({ ...base, tipo:'Madeira' }), /material inválido/)
  assert.match(validateRetalho({ ...base, status:'Apagado' }), /Status do retalho inválido/)
})

test('retalho automático exige chapa de origem', () => {
  const msg = validateRetalho({
    nome:'Retalho', tipo:'Granito', cor:'#112233', largura:30,
    comprimento:40, espessura:2, status:'Disponível',
    origemTipo:'AUTOMATICA', origem:null,
  })

  assert.match(msg, /chapa de origem/)
})

test('valida CNPJ pelos dígitos verificadores', () => {
  assert.equal(validCnpj('12.345.678/0001-95'), true)
  assert.equal(validCnpj('12.345.678/0001-90'), false)
  assert.equal(validCnpj('11.111.111/1111-11'), false)
})

test('rejeita payload de arquivo que não seja imagem permitida', () => {
  assert.match(imageDataUrl('data:text/plain;base64,SGVsbG8='), /JPG, PNG ou WEBP/)
})

test('rejeita MIME de imagem com conteúdo incompatível', () => {
  const fake = `data:image/png;base64,${Buffer.from('isto nao e png').toString('base64')}`
  assert.match(imageDataUrl(fake), /não corresponde/)
})

test('valida campos de usuário', () => {
  const user = {
    nome:'Usuário Teste', email:'teste@tetus.com', perfil:'Estoquista',
    status:'Ativo', telefone:'(43) 99999-9999', cargo:'Estoquista', senha:'123456',
  }

  assert.equal(validateUser(user, { requirePassword:true }), null)
  assert.match(validateUser({ ...user, email:'email-invalido' }), /E-mail inválido/)
  assert.match(validateUser({ ...user, perfil:'Root' }), /Perfil de usuário inválido/)
})
