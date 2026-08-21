/**
 * SEED — Popula todas as tabelas do TetusManager com dados coerentes
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
    verDashboard:false, verEstoque:true, editarEstoque:true,
    registrarCorte:true, verRelatorios:false, gerenciarUsuarios:false,
    verConfiguracoes:true, verEmpresa:false,
  },
  Vendedor: {
    verDashboard:false, verEstoque:true, editarEstoque:false,
    registrarCorte:false, verRelatorios:false, gerenciarUsuarios:false,
    verConfiguracoes:true, verEmpresa:false,
  },
}

const buildChapaQrPayload = id => `TETUS|CHAPA|${id}`
const buildRetalhoQrPayload = id => `TETUS|RETALHO|${id}`

async function seed() {
  console.log('Iniciando seed completo...')

  await query(`
    INSERT INTO empresa (id, nome, cnpj, email, telefone, endereco, plano, fundacao)
    VALUES (1, 'Tetus Marmoraria', '12.345.678/0001-95',
            'contato@tetusmarmoraria.com.br', '(43) 3333-4444',
            'Rua das Pedras, 100 — Londrina, PR', 'Profissional', '2015')
    ON CONFLICT (id) DO NOTHING
  `)
  console.log('[ok] empresa')

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
  console.log('[ok] usuarios')

  const { rows:[adminUser] } = await query(
    'SELECT id FROM usuarios WHERE email=$1 LIMIT 1', ['joao.silva@tetus.com']
  )
  const { rows:[estoquistaUser] } = await query(
    'SELECT id FROM usuarios WHERE email=$1 LIMIT 1', ['maria.santos@tetus.com']
  )
  const createdById = adminUser?.id || null
  const operatorId = estoquistaUser?.id || createdById

  const chapas = [
    ['CH001','Preto São Gabriel','Granito','#1a1a2e',120,60,2,'Em uso','Pátio A - Cavalete 01'],
    ['CH002','Branco Siena','Mármore','#e0d8c8',180,90,2,'Em uso','Pátio A - Cavalete 02'],
    ['CH003','Cinza Corumbá','Granito','#6b7280',140,70,3,'Disponível','Pátio A - Cavalete 03'],
    ['CH004','Verde Ubatuba','Granito','#166534',120,60,2,'Inativa','Arquivo - consumida'],
    ['CH005','Azul Bahia','Granito','#1d4ed8',160,80,3,'Em uso','Pátio B - Cavalete 01'],
    ['CH006','Amarelo Ornamental','Quartzito','#d97706',200,100,2,'Em uso','Pátio B - Cavalete 02'],
    ['CH007','Vermelho Brasília','Granito','#991b1b',120,60,2,'Em uso','Pátio B - Cavalete 03'],
    ['CH008','Marrom Imperial','Granito','#78350f',160,90,3,'Em uso','Produção'],
    ['CH009','Branco Paraná','Quartzito','#e5e7eb',190,95,2,'Disponível','Pátio C - Cavalete 01'],
    ['CH010','Bege Bahia','Mármore','#c4a484',170,85,2,'Disponível','Pátio C - Cavalete 02'],
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
  console.log('[ok] chapas')

  const retalhos = [
    ['RET-001','CH001','AUTOMATICA','Preto São Gabriel','Granito','#1a1a2e',60,40,2,0.24,'Disponível','Retalhos A - 01',null,null],
    ['RET-002','CH002','AUTOMATICA','Branco Siena','Mármore','#e0d8c8',80,45,2,0.36,'Disponível','Retalhos A - 02',null,null],
    ['RET-003','CH005','AUTOMATICA','Azul Bahia','Granito','#1d4ed8',70,50,3,0.35,'Reservado','Retalhos A - 03',null,null],
    ['RET-004','CH006','AUTOMATICA','Amarelo Ornamental','Quartzito','#d97706',55,30,2,0.165,'Disponível','Retalhos B - 01',null,null],
    ['RET-005',null,'MANUAL','Vermelho Brasília - legado','Granito','#991b1b',45,35,2,0.1575,'Disponível','Retalhos Legados - 01',null,null],
    ['RET-006','CH007','AUTOMATICA','Vermelho Brasília','Granito','#991b1b',50,30,2,0.15,'Consumido','Arquivo - consumidos',operatorId,null],
    ['RET-007','CH008','AUTOMATICA','Marrom Imperial','Granito','#78350f',65,35,3,0.2275,'Descartado','Arquivo - descartados',null,operatorId],
  ]

  for (const [id,origem,origemTipo,nome,tipo,cor,largura,comprimento,espessura,area,status,localizacao,consumidoPor,descartadoPor] of retalhos) {
    await query(`
      INSERT INTO retalhos (
        id,origem,origem_tipo,nome,tipo,cor,largura,comprimento,espessura,
        area,status,localizacao,qr_code,criado_por,
        consumido_por,consumido_em,descartado_por,descartado_em
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
        $15,CASE WHEN $15::integer IS NOT NULL THEN NOW() - INTERVAL '2 days' ELSE NULL END,
        $16,CASE WHEN $16::integer IS NOT NULL THEN NOW() - INTERVAL '1 day' ELSE NULL END
      )
      ON CONFLICT (id) DO NOTHING
    `, [
      id,origem,origemTipo,nome,tipo,cor,largura,comprimento,espessura,
      area,status,localizacao,buildRetalhoQrPayload(id),createdById,
      consumidoPor,descartadoPor,
    ])
  }
  console.log('[ok] retalhos')

  const cortes = [
    ['OS-1001','CH001','RET-001',60,20,0.12,0.24,'Corte inicial da bancada'],
    ['OS-1002','CH002','RET-002',80,30,0.24,0.36,'Peça para cozinha'],
    ['OS-1003','CH005','RET-003',70,25,0.175,0.35,'Retalho reservado para orçamento'],
    ['OS-1004','CH006','RET-004',55,20,0.11,0.165,'Corte de acabamento'],
    ['OS-1005','CH004',null,120,60,0.72,0,'Consumo integral da chapa'],
    ['OS-1006','CH007','RET-006',50,25,0.125,0.15,'Retalho posteriormente consumido'],
    ['OS-1007','CH008','RET-007',65,30,0.195,0.2275,'Retalho posteriormente descartado'],
  ]

  for (const [osNumero,chapaId,retalhoId,comprimentoConsumido,larguraConsumida,areaConsumida,areaRetalho,observacao] of cortes) {
    await query(`
      INSERT INTO cortes (
        os_numero,chapa_id,retalho_id,comprimento_consumido,largura_consumida,
        area_consumida,area_retalho,observacao,criado_por
      )
      SELECT $1,$2,$3,$4,$5,$6,$7,$8,$9
      WHERE NOT EXISTS (
        SELECT 1 FROM cortes
        WHERE os_numero=$1 AND chapa_id=$2 AND retalho_id IS NOT DISTINCT FROM $3
      )
    `, [
      osNumero,chapaId,retalhoId,comprimentoConsumido,larguraConsumida,
      areaConsumida,areaRetalho,observacao,operatorId,
    ])
  }
  console.log('[ok] cortes')

  console.log('\nSeed concluído: empresa, usuarios, chapas, retalhos e cortes populados.')
  console.log('Login de teste: joao.silva@tetus.com / 123456')
  process.exit(0)
}

seed().catch(err => {
  console.error('Erro no seed:', err.message)
  process.exit(1)
})
