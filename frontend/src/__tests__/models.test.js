import { describe, it, expect } from 'vitest'
import {
  PERMISSOES_PADRAO,
  LABELS_PERMISSOES,
  mkChapa,
  mkRetalho,
  mkCorte,
  mkUser,
  mkEmpresa,
  TIPOS_ROCHA,
  PERFIS_USUARIO,
  STATUS_CHAPA,
  STATUS_RETALHO,
} from '../models/index.js'

// ── Constants ───────────────────────────────────────────────────────
describe('Constants', () => {
  it('TIPOS_ROCHA has expected types', () => {
    expect(TIPOS_ROCHA).toContain('Granito')
    expect(TIPOS_ROCHA).toContain('Mármore')
    expect(TIPOS_ROCHA).toHaveLength(5)
  })

  it('PERFIS_USUARIO has three profiles', () => {
    expect(PERFIS_USUARIO).toEqual(['Administrador', 'Estoquista', 'Vendedor'])
  })

  it('STATUS_CHAPA has expected statuses', () => {
    expect(STATUS_CHAPA).toEqual(['Disponível', 'Em uso', 'Esgotado'])
  })

  it('STATUS_RETALHO has expected statuses', () => {
    expect(STATUS_RETALHO).toEqual(['Disponível', 'Reservado', 'Consumido', 'Descartado'])
  })

  it('LABELS_PERMISSOES has label for each permission key', () => {
    const permKeys = Object.keys(PERMISSOES_PADRAO['Administrador'])
    permKeys.forEach((key) => {
      expect(LABELS_PERMISSOES).toHaveProperty(key)
      expect(typeof LABELS_PERMISSOES[key]).toBe('string')
    })
  })
})

// ── PERMISSOES_PADRAO ───────────────────────────────────────────────
describe('PERMISSOES_PADRAO', () => {
  it('has three profiles', () => {
    expect(Object.keys(PERMISSOES_PADRAO)).toHaveLength(3)
  })

  it('Administrador has all permissions true', () => {
    Object.values(PERMISSOES_PADRAO['Administrador']).forEach((v) => {
      expect(v).toBe(true)
    })
  })

  it('Vendedor has limited permissions', () => {
    const p = PERMISSOES_PADRAO['Vendedor']
    expect(p.editarEstoque).toBe(false)
    expect(p.registrarCorte).toBe(false)
    expect(p.gerenciarUsuarios).toBe(false)
    expect(p.verDashboard).toBe(true)
    expect(p.verEstoque).toBe(true)
  })
})

// ── mkChapa ─────────────────────────────────────────────────────────
describe('mkChapa', () => {
  it('creates a chapa with defaults', () => {
    const c = mkChapa()
    expect(c.id).toMatch(/^CH/)
    expect(c.tipo).toBe('Granito')
    expect(c.cor).toBe('#6b7280')
    expect(c.espessura).toBe(2)
    expect(c.status).toBe('Disponível')
    expect(c.largura).toBe(0)
    expect(c.comprimento).toBe(0)
    expect(c.foto).toBeNull()
  })

  it('overrides defaults with provided data', () => {
    const c = mkChapa({
      id: 'CH999', nome: 'Custom', tipo: 'Mármore',
      cor: '#ff0000', largura: 150, comprimento: 300,
      espessura: 5, status: 'Em uso',
    })
    expect(c.id).toBe('CH999')
    expect(c.nome).toBe('Custom')
    expect(c.tipo).toBe('Mármore')
    expect(c.largura).toBe(150)
    expect(c.espessura).toBe(5)
  })

  it('trims the nome', () => {
    const c = mkChapa({ nome: '  Granito Rosa  ' })
    expect(c.nome).toBe('Granito Rosa')
  })

  it('converts string dimensions to numbers', () => {
    const c = mkChapa({ largura: '100', comprimento: '200' })
    expect(typeof c.largura).toBe('number')
    expect(c.largura).toBe(100)
  })

  it('handles qr_code snake_case field', () => {
    const c = mkChapa({ qr_code: 'QR123' })
    expect(c.qrCode).toBe('QR123')
  })
})

// ── mkRetalho ───────────────────────────────────────────────────────
describe('mkRetalho', () => {
  it('creates a retalho with defaults', () => {
    const r = mkRetalho()
    expect(r.id).toMatch(/^RET-/)
    expect(r.origem).toBe('')
    expect(r.tipo).toBe('Granito')
    expect(r.status).toBe('Disponível')
    expect(r.consumidoEm).toBeNull()
    expect(r.descartadoEm).toBeNull()
  })

  it('overrides with provided data', () => {
    const r = mkRetalho({
      id: 'RET-999', nome: 'Custom', origem: 'CH001',
      area: 5.5, status: 'Consumido',
    })
    expect(r.id).toBe('RET-999')
    expect(r.nome).toBe('Custom')
    expect(r.origem).toBe('CH001')
    expect(r.area).toBe(5.5)
  })

  it('converts dimensions to numbers', () => {
    const r = mkRetalho({ largura: '50', comprimento: '80', espessura: '3' })
    expect(typeof r.largura).toBe('number')
    expect(r.espessura).toBe(3)
  })
})

// ── mkCorte ─────────────────────────────────────────────────────────
describe('mkCorte', () => {
  it('creates corte with defaults', () => {
    const c = mkCorte()
    expect(c.osNumero).toBe('')
    expect(c.chapaId).toBe('')
    expect(c.comprimentoConsumido).toBe(0)
    expect(c.observacao).toBe('')
  })

  it('maps snake_case fields', () => {
    const c = mkCorte({
      os_numero: 'OS-001',
      chapa_id: 'CH001',
      retalho_id: 'RET-001',
      comprimento_consumido: 100,
      largura_consumida: 50,
      area_consumida: 0.5,
      area_retalho: 0.15,
    })
    expect(c.osNumero).toBe('OS-001')
    expect(c.chapaId).toBe('CH001')
    expect(c.comprimentoConsumido).toBe(100)
  })

  it('prefers camelCase over snake_case', () => {
    const c = mkCorte({
      osNumero: 'OS-CAMEL',
      os_numero: 'OS-SNAKE',
    })
    expect(c.osNumero).toBe('OS-CAMEL')
  })
})

// ── mkUser ──────────────────────────────────────────────────────────
describe('mkUser', () => {
  it('creates user with Vendedor defaults', () => {
    const u = mkUser()
    expect(u.perfil).toBe('Vendedor')
    expect(u.status).toBe('Ativo')
    expect(u.senha).toBe('123456')
    expect(u.permissoes.editarEstoque).toBe(false)
    expect(u.permissoes.verDashboard).toBe(true)
  })

  it('uses Admin permissions for Admin profile', () => {
    const u = mkUser({ perfil: 'Administrador' })
    expect(u.permissoes.gerenciarUsuarios).toBe(true)
    expect(u.permissoes.editarEstoque).toBe(true)
  })

  it('merges custom permissions over defaults', () => {
    const u = mkUser({
      perfil: 'Vendedor',
      permissoes: { editarEstoque: true },
    })
    expect(u.permissoes.editarEstoque).toBe(true)
    expect(u.permissoes.verDashboard).toBe(true) // still has default
  })

  it('lowercases and trims email', () => {
    const u = mkUser({ email: '  Admin@Test.COM  ' })
    expect(u.email).toBe('admin@test.com')
  })

  it('trims the nome', () => {
    const u = mkUser({ nome: '  John Doe  ' })
    expect(u.nome).toBe('John Doe')
  })

  it('falls back to Vendedor permissions for unknown profile', () => {
    const u = mkUser({ perfil: 'Unknown' })
    expect(u.permissoes.editarEstoque).toBe(false)
    expect(u.permissoes.verDashboard).toBe(true)
  })
})

// ── mkEmpresa ───────────────────────────────────────────────────────
describe('mkEmpresa', () => {
  it('creates empresa with defaults', () => {
    const e = mkEmpresa()
    expect(e.nome).toBe('Tetus Marmoraria')
    expect(e.cnpj).toBe('12.345.678/0001-90')
    expect(e.plano).toBe('Profissional')
    expect(e.logo).toBeNull()
  })

  it('overrides with provided data', () => {
    const e = mkEmpresa({
      nome: 'Custom Co.',
      cnpj: '00.000.000/0001-00',
      plano: 'Enterprise',
    })
    expect(e.nome).toBe('Custom Co.')
    expect(e.plano).toBe('Enterprise')
  })
})
