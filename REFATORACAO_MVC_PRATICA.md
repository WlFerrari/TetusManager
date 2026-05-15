# 🔧 Guia de Refatoração MVC — Implementação Prática

## 📋 Resumo Executivo

**Status Atual:** 7/10 ✅ (Bom, mas não perfeito)

```
❌ PROBLEMA PRINCIPAL:
   routes/index.js tem 349 linhas com toda a lógica de negócio
   Isso dificulta manutenção, teste e escalabilidade

✅ SOLUÇÃO:
   Criar controllers/ e separar rotas
   Resultado: Código mais limpo, testável e profissional
```

---

## 🎯 Passo 1: Criar Estrutura de Controllers

### **Criar nova pasta:**
```
backend/
├── controllers/       ← 🆕 NOVO
│   ├── AuthController.js
│   ├── ChapasController.js
│   ├── RetalhosController.js
│   ├── UsuariosController.js
│   └── EmpresaController.js
└── routes/ (será atualizado)
```

---

## 🔨 Passo 2: Extrair AuthController

### **Criar: backend/controllers/AuthController.js**

```javascript
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const UserRepo = require('../repositories/UserRepository')

class AuthController {
  async login(req, res, next) {
    try {
      const { email, senha } = req.body

      // Validar
      if (!email || !senha) {
        return res.status(400).json({
          ok: false,
          msg: 'E-mail e senha são obrigatórios.'
        })
      }

      // Buscar usuário
      const row = await UserRepo.findByEmail(email)
      if (!row) {
        return res.status(401).json({
          ok: false,
          msg: 'Usuário não encontrado ou conta inativa.'
        })
      }

      if (row.status !== 'Ativo') {
        return res.status(401).json({
          ok: false,
          msg: 'Conta inativa.'
        })
      }

      // Validar senha
      const valid = await bcrypt.compare(senha, row.senha_hash)
      if (!valid) {
        return res.status(401).json({
          ok: false,
          msg: 'Senha incorreta.'
        })
      }

      // Gerar JWT
      const payload = {
        id: row.id,
        nome: row.nome,
        email: row.email,
        perfil: row.perfil,
        permissoes: row.permissoes,
        foto: row.foto,
        telefone: row.telefone,
        cargo: row.cargo,
      }
      
      const token = jwt.sign(
        payload, 
        process.env.JWT_SECRET, 
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      )

      res.json({
        ok: true,
        data: { token, user: payload },
        msg: 'Login realizado com sucesso!'
      })

    } catch (e) {
      next(e)
    }
  }
}

module.exports = new AuthController()
```

---

## 🔨 Passo 3: Extrair ChapasController

### **Criar: backend/controllers/ChapasController.js**

```javascript
const ChapaRepo = require('../repositories/ChapaRepository')

class ChapasController {
  async list(req, res, next) {
    try {
      const data = await ChapaRepo.findAll(req.query.q || '')
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async show(req, res, next) {
    try {
      const data = await ChapaRepo.findById(req.params.id)
      if (!data) {
        return res.status(404).json({
          ok: false,
          msg: 'Chapa não encontrada.'
        })
      }
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async stats(req, res, next) {
    try {
      const data = await ChapaRepo.stats()
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async create(req, res, next) {
    try {
      const { nome, largura, comprimento } = req.body

      // Validar
      if (!nome?.trim()) {
        return res.status(400).json({
          ok: false,
          msg: 'Nome é obrigatório.'
        })
      }
      if (!(+largura > 0)) {
        return res.status(400).json({
          ok: false,
          msg: 'Largura inválida.'
        })
      }
      if (!(+comprimento > 0)) {
        return res.status(400).json({
          ok: false,
          msg: 'Comprimento inválido.'
        })
      }

      const data = await ChapaRepo.insert(req.body)
      res.status(201).json({
        ok: true,
        data,
        msg: `Chapa "${data.nome}" cadastrada!`
      })
    } catch (e) { next(e) }
  }

  async update(req, res, next) {
    try {
      if (!req.body.nome?.trim()) {
        return res.status(400).json({
          ok: false,
          msg: 'Nome é obrigatório.'
        })
      }
      
      const data = await ChapaRepo.update(req.params.id, req.body)
      res.json({
        ok: true,
        data,
        msg: `Chapa "${data.nome}" atualizada!`
      })
    } catch (e) { next(e) }
  }

  async delete(req, res, next) {
    try {
      const data = await ChapaRepo.delete(req.params.id)
      res.json({
        ok: true,
        data,
        msg: `Chapa "${data.nome}" excluída!`
      })
    } catch (e) { next(e) }
  }
}

module.exports = new ChapasController()
```

---

## 🔨 Passo 4: Extrair RetalhosController

### **Criar: backend/controllers/RetalhosController.js**

```javascript
const ChapaRepo = require('../repositories/ChapaRepository')
const RetalhoRepo = require('../repositories/RetalhoRepository')

class RetalhosController {
  async list(req, res, next) {
    try {
      const data = await RetalhoRepo.findAll(req.query.q || '')
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async show(req, res, next) {
    try {
      const data = await RetalhoRepo.findById(req.params.id)
      if (!data) {
        return res.status(404).json({
          ok: false,
          msg: 'Retalho não encontrado.'
        })
      }
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async stats(req, res, next) {
    try {
      const data = await RetalhoRepo.stats()
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async create(req, res, next) {
    try {
      const { nome, comprimento, largura, origem } = req.body

      // Validações
      if (!nome?.trim()) {
        return res.status(400).json({
          ok: false,
          msg: 'Nome é obrigatório.'
        })
      }
      if (!(+comprimento > 0 && +largura > 0)) {
        return res.status(400).json({
          ok: false,
          msg: 'Dimensões inválidas.'
        })
      }

      // Validar chapa origem (se informada)
      if (origem) {
        const chapa = await ChapaRepo.findById(origem)
        if (!chapa) {
          return res.status(404).json({
            ok: false,
            msg: `Chapa "${origem}" não encontrada.`
          })
        }
      }

      // Garantir valores padrão
      const data = await RetalhoRepo.insert({
        ...req.body,
        tipo: req.body.tipo || 'Granito',
        cor: req.body.cor || '#6b7280',
        espessura: req.body.espessura || 2
      })

      res.status(201).json({
        ok: true,
        data,
        msg: `Retalho "${data.id}" cadastrado!`
      })
    } catch (e) { next(e) }
  }

  async update(req, res, next) {
    try {
      const data = await RetalhoRepo.update(req.params.id, req.body)
      res.json({
        ok: true,
        data,
        msg: `Retalho "${data.id}" atualizado!`
      })
    } catch (e) { next(e) }
  }

  async consume(req, res, next) {
    try {
      const data = await RetalhoRepo.marcarConsumido(req.params.id)
      res.json({
        ok: true,
        data,
        msg: 'Retalho marcado como consumido!'
      })
    } catch (e) { next(e) }
  }

  async delete(req, res, next) {
    try {
      const data = await RetalhoRepo.delete(req.params.id)
      res.json({
        ok: true,
        data,
        msg: `Retalho "${data.id}" excluído!`
      })
    } catch (e) { next(e) }
  }
}

module.exports = new RetalhosController()
```

---

## 🔨 Passo 5: Extrair UsuariosController

### **Criar: backend/controllers/UsuariosController.js**

```javascript
const bcrypt = require('bcryptjs')
const UserRepo = require('../repositories/UserRepository')
const { PERMISSOES_PADRAO } = require('../models')

class UsuariosController {
  async list(req, res, next) {
    try {
      const data = await UserRepo.findAll(req.query.q || '')
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async show(req, res, next) {
    try {
      const data = await UserRepo.findById(req.params.id)
      if (!data) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuário não encontrado.'
        })
      }
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async create(req, res, next) {
    try {
      const { nome, email, perfil } = req.body

      // Validar
      if (!nome?.trim()) {
        return res.status(400).json({
          ok: false,
          msg: 'Nome é obrigatório.'
        })
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          ok: false,
          msg: 'E-mail inválido.'
        })
      }

      // Verificar duplicata
      const existe = await UserRepo.findByEmail(email)
      if (existe) {
        return res.status(400).json({
          ok: false,
          msg: 'E-mail já cadastrado.'
        })
      }

      // Atribuir permissões padrão
      const permissoes = PERMISSOES_PADRAO[perfil] || PERMISSOES_PADRAO['Vendedor']
      const data = await UserRepo.insert({ ...req.body, permissoes })
      
      res.status(201).json({
        ok: true,
        data,
        msg: `Usuário "${data.nome}" criado!`
      })
    } catch (e) { next(e) }
  }

  async update(req, res, next) {
    try {
      const data = await UserRepo.updateFull(req.params.id, req.body)
      res.json({
        ok: true,
        data,
        msg: `Usuário "${data.nome}" atualizado!`
      })
    } catch (e) { next(e) }
  }

  async updatePermissions(req, res, next) {
    try {
      const user = await UserRepo.findById(req.params.id)
      if (!user) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuário não encontrado.'
        })
      }
      
      if (user.perfil === 'Administrador') {
        return res.status(400).json({
          ok: false,
          msg: 'Permissões do Administrador não podem ser alteradas.'
        })
      }
      
      const data = await UserRepo.updatePermissoes(req.params.id, req.body.permissoes)
      res.json({
        ok: true,
        data,
        msg: 'Permissões atualizadas!'
      })
    } catch (e) { next(e) }
  }

  async resetPermissions(req, res, next) {
    try {
      const user = await UserRepo.findById(req.params.id)
      if (!user) {
        return res.status(404).json({
          ok: false,
          msg: 'Usuário não encontrado.'
        })
      }
      
      if (user.perfil === 'Administrador') {
        return res.status(400).json({
          ok: false,
          msg: 'Permissões do Administrador não podem ser resetadas.'
        })
      }
      
      const defaultPerms = PERMISSOES_PADRAO[user.perfil] || PERMISSOES_PADRAO['Vendedor']
      const data = await UserRepo.updatePermissoes(req.params.id, defaultPerms)
      
      res.json({
        ok: true,
        data,
        msg: 'Permissões resetadas para padrão!'
      })
    } catch (e) { next(e) }
  }

  async toggle(req, res, next) {
    try {
      const data = await UserRepo.toggleStatus(req.params.id)
      res.json({
        ok: true,
        data,
        msg: `Usuário ${data.status === 'Ativo' ? 'ativado' : 'inativado'}!`
      })
    } catch (e) { next(e) }
  }

  async delete(req, res, next) {
    try {
      const data = await UserRepo.delete(req.params.id)
      res.json({
        ok: true,
        data,
        msg: `Usuário "${data.nome}" excluído!`
      })
    } catch (e) { next(e) }
  }

  async me(req, res, next) {
    try {
      const data = await UserRepo.findById(req.user.id)
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async updateProfile(req, res, next) {
    try {
      const { nome, telefone, cargo, foto } = req.body
      if (!nome?.trim()) {
        return res.status(400).json({
          ok: false,
          msg: 'Nome é obrigatório.'
        })
      }
      
      const data = await UserRepo.update(req.user.id, { nome, telefone, cargo, foto })
      res.json({
        ok: true,
        data,
        msg: 'Perfil atualizado!'
      })
    } catch (e) { next(e) }
  }

  async changePassword(req, res, next) {
    try {
      const { senhaAtual, novaSenha } = req.body
      
      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({
          ok: false,
          msg: 'Senhas são obrigatórias.'
        })
      }
      
      if (novaSenha.length < 6) {
        return res.status(400).json({
          ok: false,
          msg: 'Nova senha: mínimo 6 caracteres.'
        })
      }

      const row = await UserRepo.findByEmail(req.user.email)
      const valid = await bcrypt.compare(senhaAtual, row.senha_hash)
      
      if (!valid) {
        return res.status(401).json({
          ok: false,
          msg: 'Senha atual incorreta.'
        })
      }

      await UserRepo.updateSenha(req.user.id, novaSenha)
      
      res.json({
        ok: true,
        msg: 'Senha alterada com sucesso!'
      })
    } catch (e) { next(e) }
  }
}

module.exports = new UsuariosController()
```

---

## 🔨 Passo 6: Extrair EmpresaController

### **Criar: backend/controllers/EmpresaController.js**

```javascript
const EmpresaRepo = require('../repositories/EmpresaRepository')

class EmpresaController {
  async show(req, res, next) {
    try {
      const data = await EmpresaRepo.get()
      res.json({ ok: true, data })
    } catch (e) { next(e) }
  }

  async update(req, res, next) {
    try {
      const data = await EmpresaRepo.update(req.body)
      res.json({
        ok: true,
        data,
        msg: 'Dados da empresa atualizados!'
      })
    } catch (e) { next(e) }
  }
}

module.exports = new EmpresaController()
```

---

## 🛣️ Passo 7: Criar Rotas Separadas

### **Criar: backend/routes/auth.routes.js**

```javascript
const router = require('express').Router()
const AuthController = require('../controllers/AuthController')

router.post('/login', (req, res, next) => AuthController.login(req, res, next))

module.exports = router
```

### **Criar: backend/routes/chapas.routes.js**

```javascript
const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const ChapasController = require('../controllers/ChapasController')

router.get('/', authMiddleware, requirePerm('verEstoque'), (req, res, next) => ChapasController.list(req, res, next))
router.get('/stats', authMiddleware, (req, res, next) => ChapasController.stats(req, res, next))
router.get('/:id', authMiddleware, requirePerm('verEstoque'), (req, res, next) => ChapasController.show(req, res, next))
router.post('/', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => ChapasController.create(req, res, next))
router.put('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => ChapasController.update(req, res, next))
router.delete('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => ChapasController.delete(req, res, next))

module.exports = router
```

### **Criar: backend/routes/retalhos.routes.js**

```javascript
const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const RetalhosController = require('../controllers/RetalhosController')

router.get('/', authMiddleware, requirePerm('verEstoque'), (req, res, next) => RetalhosController.list(req, res, next))
router.get('/stats', authMiddleware, (req, res, next) => RetalhosController.stats(req, res, next))
router.get('/:id', authMiddleware, requirePerm('verEstoque'), (req, res, next) => RetalhosController.show(req, res, next))
router.post('/', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.create(req, res, next))
router.put('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.update(req, res, next))
router.patch('/:id/consumir', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.consume(req, res, next))
router.delete('/:id', authMiddleware, requirePerm('editarEstoque'), (req, res, next) => RetalhosController.delete(req, res, next))

module.exports = router
```

### **Criar: backend/routes/usuarios.routes.js**

```javascript
const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const UsuariosController = require('../controllers/UsuariosController')

router.get('/', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.list(req, res, next))
router.get('/:id', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.show(req, res, next))
router.post('/', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.create(req, res, next))
router.put('/:id', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.update(req, res, next))
router.patch('/:id/permissoes', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.updatePermissions(req, res, next))
router.patch('/:id/reset-permissoes', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.resetPermissions(req, res, next))
router.patch('/:id/toggle', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.toggle(req, res, next))
router.delete('/:id', authMiddleware, requirePerm('gerenciarUsuarios'), (req, res, next) => UsuariosController.delete(req, res, next))

module.exports = router
```

### **Criar: backend/routes/empresa.routes.js**

```javascript
const router = require('express').Router()
const { authMiddleware, requirePerm } = require('../middleware/auth')
const EmpresaController = require('../controllers/EmpresaController')

router.get('/', authMiddleware, (req, res, next) => EmpresaController.show(req, res, next))
router.put('/', authMiddleware, requirePerm('verEmpresa'), (req, res, next) => EmpresaController.update(req, res, next))

module.exports = router
```

### **Criar: backend/routes/me.routes.js**

```javascript
const router = require('express').Router()
const { authMiddleware } = require('../middleware/auth')
const UsuariosController = require('../controllers/UsuariosController')

router.get('/', authMiddleware, (req, res, next) => UsuariosController.me(req, res, next))
router.patch('/perfil', authMiddleware, (req, res, next) => UsuariosController.updateProfile(req, res, next))
router.patch('/senha', authMiddleware, (req, res, next) => UsuariosController.changePassword(req, res, next))

module.exports = router
```

### **Atualizar: backend/routes/index.js**

```javascript
const router = require('express').Router()

router.use('/auth', require('./auth.routes'))
router.use('/chapas', require('./chapas.routes'))
router.use('/retalhos', require('./retalhos.routes'))
router.use('/usuarios', require('./usuarios.routes'))
router.use('/empresa', require('./empresa.routes'))
router.use('/me', require('./me.routes'))

module.exports = router
```

---

## ✅ Resultado Final

### **Antes:**
```
routes/index.js (349 linhas) ← Confuso e difícil de manter
```

### **Depois:**
```
controllers/ ........................ 5 Controllers organizados
├── AuthController.js .............. ~50 linhas
├── ChapasController.js ............ ~80 linhas
├── RetalhosController.js .......... ~100 linhas
├── UsuariosController.js .......... ~120 linhas
└── EmpresaController.js ........... ~40 linhas

routes/ ............................ 6 Rotas limpas
├── auth.routes.js ................. ~5 linhas
├── chapas.routes.js .............. ~10 linhas
├── retalhos.routes.js ............ ~10 linhas
├── usuarios.routes.js ............ ~15 linhas
├── empresa.routes.js ............. ~5 linhas
├── me.routes.js ................... ~5 linhas
└── index.js ........................ ~10 linhas
```

---

## 🎯 Benefícios Imediatos

```
✅ Código mais limpo e legível
✅ Fácil de encontrar lógica específica
✅ Simples de testar (cada controller = fácil testar)
✅ Escalável (adicionar novo recurso = nova rota + novo controller)
✅ Profissional (padrão MVC respeitado)
✅ Manutenível (bug em um recurso = editar seu controller)
```

---

## 🚀 Próximos Passos

1. ✅ Copie os controllers acima para `backend/controllers/`
2. ✅ Copie as rotas acima para `backend/routes/`
3. ✅ Atualize `backend/routes/index.js`
4. ✅ Apague a versão antiga de `routes/index.js`
5. ✅ Teste as rotas: `npm start`
6. ✅ Verifique se tudo funciona igual

**Tempo estimado:** 30 minutos

---

**Resultado:** Arquitetura MVC Correta! ✅ (9-10/10)

Generated: 2026-05-15

