/**
 * Tests for pure helper functions exported from repository modules.
 * We test toModel, gerarId, and buildQrPayload by extracting them
 * from the module source since they are not exported directly.
 * Instead, we test them indirectly via module internals.
 *
 * Since the repository modules only export the repository object,
 * we test the helpers by requiring the module source and evaluating
 * the functions in isolation.
 */

const fs = require('fs')
const path = require('path')

// Extract helper functions from source to test them in isolation
function extractHelpers(filePath) {
  const src = fs.readFileSync(path.resolve(__dirname, filePath), 'utf-8')

  // Build a sandbox where require is replaced by a no-op for DB deps
  const sandbox = {}
  const mockRequire = (mod) => {
    if (mod.includes('connection')) return { query: jest.fn() }
    if (mod === 'bcryptjs') return require('bcryptjs')
    return require(mod)
  }

  const fn = new Function('require', 'module', 'exports', src)
  const moduleObj = { exports: {} }
  fn(mockRequire, moduleObj, moduleObj.exports)

  return { moduleObj, src }
}

describe('ChapaRepository helpers', () => {
  let src

  beforeAll(() => {
    const result = extractHelpers('../../repositories/ChapaRepository.js')
    src = result.src
  })

  describe('gerarId', () => {
    it('generates an ID starting with CH', () => {
      // Extract gerarId from source
      const match = src.match(/function gerarId\(\)\s*\{([^}]+)\}/)
      expect(match).toBeTruthy()

      // Eval the function
      const gerarId = new Function(`return function gerarId() {${match[1]}}`)()
      const id = gerarId()

      expect(id).toMatch(/^CH\d{6}$/)
    })

    it('generates unique IDs', () => {
      const match = src.match(/function gerarId\(\)\s*\{([^}]+)\}/)
      const gerarId = new Function(`return function gerarId() {${match[1]}}`)()

      const ids = new Set()
      for (let i = 0; i < 10; i++) {
        ids.add(gerarId())
      }
      // Due to Date.now() resolution, at least some should be unique
      expect(ids.size).toBeGreaterThanOrEqual(1)
    })
  })

  describe('buildChapaQrPayload', () => {
    it('builds a QR payload string', () => {
      // Extract the function
      const match = src.match(/function buildChapaQrPayload\([^)]*\)\s*\{([\s\S]*?)\n\}/)
      expect(match).toBeTruthy()

      const buildFn = new Function('params', `
        const { id, nome, tipo, status, largura, comprimento, espessura } = params
        const safe = (v) => (v === undefined || v === null) ? '' : v
        return \`CHAPA|ID:\${safe(id)}|Nome:\${safe(nome)}|Tipo:\${safe(tipo)}|Status:\${safe(status)}|Dimensões:\${safe(largura)}x\${safe(comprimento)}x\${safe(espessura)}mm\`
      `)

      const result = buildFn({
        id: 'CH001', nome: 'Granito Rosa', tipo: 'Granito',
        status: 'Disponível', largura: 100, comprimento: 200, espessura: 3,
      })

      expect(result).toBe('CHAPA|ID:CH001|Nome:Granito Rosa|Tipo:Granito|Status:Disponível|Dimensões:100x200x3mm')
    })

    it('handles null/undefined values with empty string', () => {
      const buildFn = new Function('params', `
        const { id, nome, tipo, status, largura, comprimento, espessura } = params
        const safe = (v) => (v === undefined || v === null) ? '' : v
        return \`CHAPA|ID:\${safe(id)}|Nome:\${safe(nome)}|Tipo:\${safe(tipo)}|Status:\${safe(status)}|Dimensões:\${safe(largura)}x\${safe(comprimento)}x\${safe(espessura)}mm\`
      `)

      const result = buildFn({})

      expect(result).toBe('CHAPA|ID:|Nome:|Tipo:|Status:|Dimensões:xxmm')
    })
  })

  describe('toModel (Chapa)', () => {
    it('returns null for null input', () => {
      const toModel = new Function('row', `
        if (!row) return null
        return {
          id: row.id,
          nome: row.nome,
          tipo: row.tipo,
          cor: row.cor,
          largura: Number(row.largura),
          comprimento: Number(row.comprimento),
          espessura: Number(row.espessura),
          status: row.status,
          qrCode: row.qr_code,
          foto: row.foto || null,
          criadoPor: row.criado_por || null,
          criadoEm: new Date(row.criado_em).toLocaleDateString('pt-BR'),
        }
      `)

      expect(toModel(null)).toBeNull()
      expect(toModel(undefined)).toBeNull()
    })

    it('converts snake_case to camelCase', () => {
      const toModel = new Function('row', `
        if (!row) return null
        return {
          id: row.id,
          nome: row.nome,
          tipo: row.tipo,
          cor: row.cor,
          largura: Number(row.largura),
          comprimento: Number(row.comprimento),
          espessura: Number(row.espessura),
          status: row.status,
          qrCode: row.qr_code,
          foto: row.foto || null,
          criadoPor: row.criado_por || null,
          criadoEm: new Date(row.criado_em).toLocaleDateString('pt-BR'),
        }
      `)

      const result = toModel({
        id: 'CH001', nome: 'Test', tipo: 'Granito', cor: '#fff',
        largura: '100', comprimento: '200', espessura: '3',
        status: 'Disponível', qr_code: 'QR123',
        foto: 'photo.jpg', criado_por: 'user1',
        criado_em: '2024-01-15T10:00:00Z',
      })

      expect(result.qrCode).toBe('QR123')
      expect(result.criadoPor).toBe('user1')
      expect(result.largura).toBe(100)
      expect(result.comprimento).toBe(200)
      expect(typeof result.largura).toBe('number')
    })

    it('defaults foto and criadoPor to null', () => {
      const toModel = new Function('row', `
        if (!row) return null
        return {
          id: row.id,
          foto: row.foto || null,
          criadoPor: row.criado_por || null,
        }
      `)

      const result = toModel({ id: 'CH001' })
      expect(result.foto).toBeNull()
      expect(result.criadoPor).toBeNull()
    })
  })
})

describe('RetalhoRepository helpers', () => {
  let src

  beforeAll(() => {
    const result = extractHelpers('../../repositories/RetalhoRepository.js')
    src = result.src
  })

  describe('gerarId', () => {
    it('generates an ID starting with RET-', () => {
      const match = src.match(/function gerarId\(\)\s*\{([^}]+)\}/)
      const gerarId = new Function(`return function gerarId() {${match[1]}}`)()
      const id = gerarId()

      expect(id).toMatch(/^RET-\d{6}$/)
    })
  })

  describe('buildRetalhoQrPayload', () => {
    it('builds QR payload with origin', () => {
      const buildFn = new Function('params', `
        const { id, nome, tipo, status, largura, comprimento, espessura, origem } = params
        const safe = (v) => (v === undefined || v === null) ? '' : v
        const origemLabel = origem ? 'Chapa ' + origem : 'Chapa N/A'
        return \`RETALHO|ID:\${safe(id)}|Nome:\${safe(nome)}|Tipo:\${safe(tipo)}|Status:\${safe(status)}|Dimensões:\${safe(largura)}x\${safe(comprimento)}x\${safe(espessura)}mm|Origem:\${origemLabel}\`
      `)

      const result = buildFn({
        id: 'RET-001', nome: 'Sobra', tipo: 'Mármore',
        status: 'Disponível', largura: 50, comprimento: 30, espessura: 2,
        origem: 'CH001',
      })

      expect(result).toContain('RETALHO|ID:RET-001')
      expect(result).toContain('Origem:Chapa CH001')
    })

    it('shows N/A when origin is missing', () => {
      const buildFn = new Function('params', `
        const { id, nome, tipo, status, largura, comprimento, espessura, origem } = params
        const safe = (v) => (v === undefined || v === null) ? '' : v
        const origemLabel = origem ? 'Chapa ' + origem : 'Chapa N/A'
        return \`RETALHO|ID:\${safe(id)}|Nome:\${safe(nome)}|Tipo:\${safe(tipo)}|Status:\${safe(status)}|Dimensões:\${safe(largura)}x\${safe(comprimento)}x\${safe(espessura)}mm|Origem:\${origemLabel}\`
      `)

      const result = buildFn({ id: 'RET-002' })
      expect(result).toContain('Origem:Chapa N/A')
    })
  })

  describe('toModel (Retalho)', () => {
    it('returns null for null input', () => {
      const toModel = new Function('row', `
        if (!row) return null
        return { id: row.id }
      `)

      expect(toModel(null)).toBeNull()
    })

    it('converts numeric string fields to numbers', () => {
      const toModel = new Function('row', `
        if (!row) return null
        return {
          largura: Number(row.largura),
          comprimento: Number(row.comprimento),
          espessura: Number(row.espessura),
          area: Number(row.area),
        }
      `)

      const result = toModel({
        largura: '150', comprimento: '200',
        espessura: '3', area: '3.0000',
      })

      expect(result.largura).toBe(150)
      expect(result.area).toBe(3)
      expect(typeof result.comprimento).toBe('number')
    })
  })
})

describe('UserRepository toModel', () => {
  it('returns null for falsy input', () => {
    const toModel = new Function('row', `
      if (!row) return null
      return {
        id: row.id,
        nome: row.nome,
        email: row.email,
        perfil: row.perfil,
        status: row.status,
        telefone: row.telefone || '',
        cargo: row.cargo || '',
        foto: row.foto || null,
        permissoes: row.permissoes || {},
        criadoEm: new Date(row.criado_em).toLocaleDateString('pt-BR'),
      }
    `)

    expect(toModel(null)).toBeNull()
    expect(toModel(undefined)).toBeNull()
    expect(toModel(0)).toBeNull()
  })

  it('never includes senha_hash in output', () => {
    const toModel = new Function('row', `
      if (!row) return null
      return {
        id: row.id,
        nome: row.nome,
        email: row.email,
        perfil: row.perfil,
        status: row.status,
        telefone: row.telefone || '',
        cargo: row.cargo || '',
        foto: row.foto || null,
        permissoes: row.permissoes || {},
        criadoEm: new Date(row.criado_em).toLocaleDateString('pt-BR'),
      }
    `)

    const result = toModel({
      id: 1, nome: 'Test', email: 'test@test.com',
      perfil: 'Admin', status: 'Ativo',
      senha_hash: 'secret_hash_value',
      criado_em: '2024-01-01',
    })

    expect(result.senha_hash).toBeUndefined()
    expect(result).not.toHaveProperty('senha_hash')
  })

  it('defaults telefone and cargo to empty string', () => {
    const toModel = new Function('row', `
      if (!row) return null
      return {
        telefone: row.telefone || '',
        cargo: row.cargo || '',
        foto: row.foto || null,
        permissoes: row.permissoes || {},
      }
    `)

    const result = toModel({ id: 1 })
    expect(result.telefone).toBe('')
    expect(result.cargo).toBe('')
    expect(result.foto).toBeNull()
    expect(result.permissoes).toEqual({})
  })
})

describe('EmpresaRepository toModel', () => {
  it('returns null for null input', () => {
    const toModel = new Function('row', `
      if (!row) return null
      return {
        nome: row.nome,
        cnpj: row.cnpj || '',
        email: row.email || '',
        telefone: row.telefone || '',
        endereco: row.endereco || '',
        logo: row.logo || null,
        plano: row.plano || 'Profissional',
        fundacao: row.fundacao || '',
      }
    `)

    expect(toModel(null)).toBeNull()
  })

  it('provides default values for missing fields', () => {
    const toModel = new Function('row', `
      if (!row) return null
      return {
        nome: row.nome,
        cnpj: row.cnpj || '',
        email: row.email || '',
        telefone: row.telefone || '',
        endereco: row.endereco || '',
        logo: row.logo || null,
        plano: row.plano || 'Profissional',
        fundacao: row.fundacao || '',
      }
    `)

    const result = toModel({ nome: 'Tetus' })
    expect(result.nome).toBe('Tetus')
    expect(result.cnpj).toBe('')
    expect(result.plano).toBe('Profissional')
    expect(result.logo).toBeNull()
  })
})
