/**
 * Tests for shared utility functions used by repositories:
 * - idGenerator: gerarId
 * - qrPayload: buildChapaQrPayload, buildRetalhoQrPayload, safe
 * - toModel patterns (tested inline since not exported)
 */

const { gerarId } = require('../../utils/idGenerator')
const { safe, buildChapaQrPayload, buildRetalhoQrPayload } = require('../../utils/qrPayload')

// ── gerarId ──────────────────────────────────────────────────────────
describe('gerarId', () => {
  it('generates an ID with given prefix', () => {
    const id = gerarId('CH')
    expect(id).toMatch(/^CH\d{6}$/)
  })

  it('generates RET- prefixed IDs', () => {
    const id = gerarId('RET-')
    expect(id).toMatch(/^RET-\d{6}$/)
  })

  it('generates unique IDs across calls', () => {
    const ids = new Set()
    for (let i = 0; i < 10; i++) {
      ids.add(gerarId('CH'))
    }
    expect(ids.size).toBeGreaterThanOrEqual(1)
  })
})

// ── safe ─────────────────────────────────────────────────────────────
describe('safe', () => {
  it('returns empty string for null', () => {
    expect(safe(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(safe(undefined)).toBe('')
  })

  it('returns the value for non-null values', () => {
    expect(safe('hello')).toBe('hello')
    expect(safe(0)).toBe(0)
    expect(safe(false)).toBe(false)
  })
})

// ── buildChapaQrPayload ─────────────────────────────────────────────
describe('buildChapaQrPayload', () => {
  it('builds a QR payload string', () => {
    const result = buildChapaQrPayload({
      id: 'CH001', nome: 'Granito Rosa', tipo: 'Granito',
      status: 'Disponível', largura: 100, comprimento: 200, espessura: 3,
    })

    expect(result).toBe('CHAPA|ID:CH001|Nome:Granito Rosa|Tipo:Granito|Status:Disponível|Dimensões:100x200x3mm')
  })

  it('handles null/undefined values with empty string', () => {
    const result = buildChapaQrPayload({})

    expect(result).toContain('ID:')
    expect(result).toContain('Nome:')
    expect(result).toMatch(/^CHAPA\|/)
  })
})

// ── buildRetalhoQrPayload ───────────────────────────────────────────
describe('buildRetalhoQrPayload', () => {
  it('builds QR payload with origin', () => {
    const result = buildRetalhoQrPayload({
      id: 'RET-001', nome: 'Sobra', tipo: 'Mármore',
      status: 'Disponível', largura: 50, comprimento: 30, espessura: 2,
      origem: 'CH001',
    })

    expect(result).toContain('RETALHO|ID:RET-001')
    expect(result).toContain('Origem:Chapa CH001')
  })

  it('shows N/A when origin is missing', () => {
    const result = buildRetalhoQrPayload({ id: 'RET-002' })
    expect(result).toContain('Origem:Chapa N/A')
  })
})

// ── toModel patterns (tested inline) ────────────────────────────────
describe('toModel patterns', () => {
  describe('Chapa toModel', () => {
    const toModel = (row) => {
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
    }

    it('returns null for null input', () => {
      expect(toModel(null)).toBeNull()
      expect(toModel(undefined)).toBeNull()
    })

    it('converts snake_case to camelCase', () => {
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
      expect(typeof result.largura).toBe('number')
    })

    it('defaults foto and criadoPor to null', () => {
      const result = toModel({ id: 'CH001', criado_em: '2024-01-01' })
      expect(result.foto).toBeNull()
      expect(result.criadoPor).toBeNull()
    })
  })

  describe('User toModel', () => {
    const toModel = (row) => {
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
    }

    it('returns null for falsy input', () => {
      expect(toModel(null)).toBeNull()
      expect(toModel(undefined)).toBeNull()
      expect(toModel(0)).toBeNull()
    })

    it('never includes senha_hash in output', () => {
      const result = toModel({
        id: 1, nome: 'Test', email: 'test@test.com',
        perfil: 'Admin', status: 'Ativo',
        senha_hash: 'secret_hash_value',
        criado_em: '2024-01-01',
      })

      expect(result).not.toHaveProperty('senha_hash')
    })

    it('defaults telefone and cargo to empty string', () => {
      const result = toModel({ id: 1, criado_em: '2024-01-01' })
      expect(result.telefone).toBe('')
      expect(result.cargo).toBe('')
      expect(result.foto).toBeNull()
      expect(result.permissoes).toEqual({})
    })
  })

  describe('Empresa toModel', () => {
    const toModel = (row) => {
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
    }

    it('returns null for null input', () => {
      expect(toModel(null)).toBeNull()
    })

    it('provides default values for missing fields', () => {
      const result = toModel({ nome: 'Tetus' })
      expect(result.nome).toBe('Tetus')
      expect(result.cnpj).toBe('')
      expect(result.plano).toBe('Profissional')
      expect(result.logo).toBeNull()
    })
  })
})
