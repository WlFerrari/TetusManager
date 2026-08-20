/**
 * SEED — Popula o banco com dados iniciais alinhados à documentação v1.2
 * Execute: node database/seed.js
 */

require('dotenv').config()
const { query } = require('./connection')
const bcrypt = require('bcryptjs')

const PERMISSOES = {
  Administrador: {
    verDashboard:true, verEstoque:true, editarEstoque:true,
    registrarCorte:true, verRelatorios:true, gerenciarUsuarios:true,
    verConfiguracoes:true, verEmpresa:true,
  },
  Estoquista: {
    verDashboard:true, verEstoque:true, editarEstoque:true,
    registrarCorte:true, verRelatorios:false, gerenciarUsuarios:false,
    verConfiguracoes:true, verEmpresa:false,
  },
  Vendedor: {
    verDashboard:true, verEstoque:true, editarEstoque:false,
    registrarCorte:false, verRelatorios:false, gerenciarUsuarios:false,
    verConfiguracoes:true, verEmpresa:false,
  },
}

const buildChapaQrPayload = (id) => `TETUS|CHAPA|${id}`
const buildRetalhoQrPayload = (id) => `TETUS|RETALHO|${id}`

async function seed() {
  console.log('🌱 Iniciando seed...')

  await query(`
    INSERT INTO empresa (id, nome, cnpj, email, telefone, endereco, plano, fundacao)
    VALUES (1, 'Tetus Marmoraria', '12.345.678/0001-90',
            'contato@tetusmarmoraria.com.br', '(43) 3333-4444',
            'Rua das Pedras, 100 — Londrina, PR', 'Profissional', '2015')
    ON CONFLICT (id) DO NOTHING
  `)
  console.log('Empresa inserida')

  const usuarios = [
    { nome:'João Silva', email:'joao.silva@tetus.com', perfil:'Administrador', cargo:'Sócio Administrador' },
    { nome:'Maria Santos', email:'maria.santos@tetus.com', perfil:'Estoquista', cargo:'Controladora de Estoque' },
    { nome:'Pedro Costa', email:'pedro.costa@tetus.com', perfil:'Vendedor', cargo:'Vendedor / Orçamentista' },
    { nome:'Ana Oliveira', email:'ana.oliveira@tetus.com', perfil:'Estoquista', cargo:'Auxiliar de Estoque', status:'Inativo' },
    { nome:'Carlos Mendes', email:'carlos.mendes@tetus.com', perfil:'Vendedor', cargo:'Orçamentista' },
  ]

  for (const u of usuarios) {
    const hash = await bcrypt.hash('123456', 10)
    await query(`
      INSERT INTO usuarios (nome, email, senha_hash, perfil, status, cargo, permissoes)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (email) DO NOTHING
    `, [u.nome, u.email, hash, u.perfil, u.status || 'Ativo', u.cargo, JSON.stringify(PERMISSOES[u.perfil])])
  }
  console.log('Usuários inseridos')

  const { rows:[adminUser] } = await query(
    'SELECT id FROM usuarios WHERE email=$1 LIMIT 1', ['joao.silva@tetus.com']
  )
  const createdById = adminUser ? adminUser.id : null

  const chapas = [
    ['CH001','Preto São Gabriel','Granito','#1a1a2e',120,60,2,'Disponível','Pátio A - Cavalete 01'],
    ['CH002','Branco Siena','Mármore','#e0d8c8',180,90,2,'Disponível','Pátio A - Cavalete 02'],
    ['CH003','Cinza Corumbá','Granito','#6b7280',140,70,3,'Disponível','Pátio A - Cavalete 03'],
    ['CH004','Verde Ubatuba','Granito','#166534',120,60,2,'Em uso','Produção'],
    ['CH005','Azul Bahia','Granito','#1d4ed8',160,80,3,'Disponível','Pátio B - Cavalete 01'],
    ['CH006','Amarelo Ornamental','Quartzito','#d97706',200,100,2,'Disponível','Pátio B - Cavalete 02'],
    ['CH007','Vermelho Brasília','Granito','#991b1b',120,60,2,'Disponível','Pátio B - Cavalete 03'],
    ['CH008','Marrom Imperial','Granito','#78350f',160,90,3,'Em uso','Produção'],
  ]

  for (const [id,nome,tipo,cor,largura,comprimento,espessura,status,localizacao] of chapas) {
    await query(`
      INSERT INTO chapas (
        id,nome,tipo,cor,largura,comprimento,espessura,status,localizacao,qr_code,criado_por
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (id) DO NOTHING
    `, [id,nome,tipo,cor,largura,comprimento,espessura,status,localizacao,buildChapaQrPayload(id),createdById])
  }
  console.log('Chapas inseridas')

  const retalhos = [
    ['RET-001','CH001','AUTOMATICA','Preto São Gabriel','Granito','#1a1a2e',60,40,2,0.24,'Disponível','Retalhos A - 01'],
    ['RET-002','CH002','AUTOMATICA','Branco Siena','Mármore','#e0d8c8',80,45,2,0.36,'Disponível','Retalhos A - 02'],
    ['RET-003','CH005','AUTOMATICA','Azul Bahia','Granito','#1d4ed8',70,50,3,0.35,'Reservado','Retalhos A - 03'],
    ['RET-004','CH006','AUTOMATICA','Amarelo Ornamental','Quartzito','#d97706',55,30,2,0.165,'Disponível','Retalhos B - 01'],
    ['RET-005',null,'MANUAL','Vermelho Brasília - legado','Granito','#991b1b',45,35,2,0.1575,'Disponível','Retalhos Legados - 01'],
  ]

  for (const [id,origem,origemTipo,nome,tipo,cor,largura,comprimento,espessura,area,status,localizacao] of retalhos) {
    await query(`
      INSERT INTO retalhos (
        id,origem,origem_tipo,nome,tipo,cor,largura,comprimento,espessura,
        area,status,localizacao,qr_code,criado_por
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (id) DO NOTHING
    `, [
      id,origem,origemTipo,nome,tipo,cor,largura,comprimento,espessura,
      area,status,localizacao,buildRetalhoQrPayload(id),createdById,
    ])
  }
  console.log('Retalhos inseridos')

  console.log('\nSeed concluído com sucesso!')
  process.exit(0)
}

seed().catch(err => {
  console.error('Erro no seed:', err.message)
  process.exit(1)
})
