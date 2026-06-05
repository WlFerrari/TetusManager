const { PERMISSOES_PADRAO } = require('../../models/index')

describe('PERMISSOES_PADRAO', () => {
  it('defines three profiles', () => {
    expect(Object.keys(PERMISSOES_PADRAO)).toEqual(
      expect.arrayContaining(['Administrador', 'Estoquista', 'Vendedor'])
    )
    expect(Object.keys(PERMISSOES_PADRAO)).toHaveLength(3)
  })

  it('Administrador has all permissions enabled', () => {
    const perms = PERMISSOES_PADRAO['Administrador']
    Object.values(perms).forEach((v) => {
      expect(v).toBe(true)
    })
  })

  it('Administrador has all expected permission keys', () => {
    const expectedKeys = [
      'verDashboard', 'verEstoque', 'editarEstoque',
      'registrarCorte', 'verRelatorios', 'gerenciarUsuarios',
      'verConfiguracoes', 'verEmpresa',
    ]
    expect(Object.keys(PERMISSOES_PADRAO['Administrador'])).toEqual(
      expect.arrayContaining(expectedKeys)
    )
  })

  it('Estoquista cannot manage users or see reports', () => {
    const perms = PERMISSOES_PADRAO['Estoquista']
    expect(perms.gerenciarUsuarios).toBe(false)
    expect(perms.verRelatorios).toBe(false)
    expect(perms.verEmpresa).toBe(false)
  })

  it('Estoquista can edit stock and register cuts', () => {
    const perms = PERMISSOES_PADRAO['Estoquista']
    expect(perms.editarEstoque).toBe(true)
    expect(perms.registrarCorte).toBe(true)
    expect(perms.verEstoque).toBe(true)
  })

  it('Vendedor has minimal permissions', () => {
    const perms = PERMISSOES_PADRAO['Vendedor']
    expect(perms.verDashboard).toBe(true)
    expect(perms.verEstoque).toBe(true)
    expect(perms.verConfiguracoes).toBe(true)
    expect(perms.editarEstoque).toBe(false)
    expect(perms.registrarCorte).toBe(false)
    expect(perms.verRelatorios).toBe(false)
    expect(perms.gerenciarUsuarios).toBe(false)
    expect(perms.verEmpresa).toBe(false)
  })
})
