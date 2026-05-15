# 🔄 Diagramas de Sequência — TetusManager v4

## 📊 Fluxos Detalhados com Diagramas de Sequência

### 1️⃣ Registrar Corte (Criar Retalho a partir de Chapa)

```mermaid
sequenceDiagram
    participant User as 👤 Usuário
    participant React as ⚛️ CortePage.jsx
    participant Ctrl as 🎮 RetalhoCtrl
    participant Repo as 💾 Repo_Front
    participant Service as 🔌 RetalhoService
    participant API as 🔌 Backend API
    participant Middleware as 🔐 Auth
    participant Handler as 📝 POST Handler
    participant DB as 🗄️ PostgreSQL
    
    User->>React: 1. Seleciona chapa de origem
    User->>React: 2. Insere comprimento/largura consumidos
    React->>React: 3. Calcula área localmente
    React->>React: 4. Exibe pré-visualização da sobra
    
    User->>React: 5. Clica "Salvar e Gerar QR Code"
    React->>Ctrl: 6. retalhoCtrl.criar(retalho)
    
    Ctrl->>Ctrl: 7. Valida dados (nome, dimensões)
    Ctrl->>Ctrl: 8. Calcula área novamente
    Ctrl->>Ctrl: 9. Gera payload com QR Code
    
    Ctrl->>Repo: 10. retalhoRepo.insert(payload)
    Repo->>Service: 11. RetalhoService.criar(payload)
    
    Service->>Service: 12. Monta request com Bearer token
    Service->>API: 13. POST /api/retalhos
    Note over Service,API: Content-Type: application/json<br/>Authorization: Bearer TOKEN
    
    API->>Middleware: 14. authMiddleware(req, res, next)
    Middleware->>Middleware: 15. Extrai JWT do header
    Middleware->>Middleware: 16. jwt.verify(token)
    Middleware->>Middleware: 17. Decodifica user: { id, email, perfil, permissoes }
    Middleware->>Middleware: 18. Valida token (não expirado?)
    
    alt Token inválido ou expirado
        Middleware-->>API: 401 Unauthorized
        API-->>Service: { ok: false, msg: "Token expirado" }
        Service-->>Repo: Error
        Repo-->>Ctrl: Error
        Ctrl-->>React: { ok: 0, msg: "Sessão expirada, faça login" }
        React->>User: ❌ Erro & Redireciona para login
    end
    
    Middleware->>Handler: 19. next()
    Handler->>Handler: 20. Extrai { nome, origem, tipo, cor, largura, comprimento }
    Handler->>Handler: 21. Validações: nome?.trim(), dimensões > 0
    
    alt Validação falha
        Handler-->>API: 400 Bad Request
        API-->>Service: { ok: false, msg: "Validação falhou" }
        Service-->>React: Error
        React->>User: ⚠️ Mensagem de erro
    end
    
    Handler->>Handler: 22. Busca chapa origem no DB
    Handler->>DB: 23. SELECT * FROM chapas WHERE id = $1
    DB-->>Handler: Chapa encontrada ✓
    
    Handler->>DB: 24. Gera ID do retalho: RET-{timestamp}
    Handler->>DB: 25. Calcula area = (comprimento * largura) / 10000
    Handler->>DB: 26. INSERT INTO retalhos (id, origem, nome, tipo, cor, largura, comprimento, espessura, area, status, qr_code)
    Handler->>DB: VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    
    DB->>DB: 27. Trigger: set_updated_at()
    DB->>DB: 28. Valida constraints: largura > 0, comprimento >= 0, status IN (...)
    DB->>DB: 29. Insere registro
    DB-->>Handler: RETURNING * (dados inseridos)
    
    Handler->>Handler: 30. Mapeia row para Retalho { id, origem, nome, area, ... }
    Handler-->>API: 31. ok(res, data, msg)
    API-->>Service: 32. { ok: true, data: Retalho, msg: "Retalho criado!" }
    
    Service-->>Repo: 33. Parsed JSON response
    Repo->>Ctrl: 34. Retorna resultado
    Ctrl->>Ctrl: 35. Mapeia com mkRetalho(data)
    Ctrl-->>React: 36. { ok: 1, data: Retalho, msg: "Sucesso!" }
    
    React->>React: 37. setDone(r.data)
    React->>React: 38. setForm({ chapaId: '', cc: '', lc: '', obs: '' })
    React->>React: 39. onUpdate(r.msg, 'ok')
    
    React->>User: 40. ✅ Exibe banner de sucesso com dados do retalho
    React->>User: 41. IDs: RET-XXXXX · Dimensões: 2×2cm · Área: 0.0004m² · Status: Disponível
```

---

### 2️⃣ Login e Autenticação

```mermaid
sequenceDiagram
    participant User as 👤 Usuário
    participant React as ⚛️ LoginPage.jsx
    participant Service as 🔌 AuthService
    participant API as 🔌 Backend API
    participant Repo as 💾 UserRepository
    participant DB as 🗄️ PostgreSQL
    participant Crypto as 🔐 bcryptjs
    participant JWT as 🔑 jsonwebtoken
    participant Storage as 💾 localStorage
    
    User->>React: 1. Insere email e senha
    React->>React: 2. Valida formato (email válido?)
    
    User->>React: 3. Clica "Entrar"
    React->>React: 4. Desabilita button (loading)
    
    React->>Service: 5. AuthService.login(email, senha)
    Service->>API: 6. POST /api/auth/login { email, senha }
    
    API->>API: 7. Extrai email e senha do body
    API->>API: 8. Valida: email e senha fornecidos?
    
    alt Email ou senha vazio
        API-->>Service: 400 Bad Request
        Service-->>React: { ok: false, msg: "Email e senha obrigatórios" }
        React->>User: ⚠️ Exibe erro
    end
    
    API->>Repo: 9. UserRepository.findByEmail(email)
    Repo->>DB: 10. SELECT * FROM usuarios WHERE email = $1
    DB-->>Repo: Retorna usuário ou null
    
    alt Usuário não existe
        API-->>Service: 401 Unauthorized
        Service-->>React: { ok: false, msg: "Usuário não encontrado" }
        React->>User: ❌ Acesso negado
    end
    
    alt Usuário inativo
        API-->>Service: 401 Unauthorized
        Service-->>React: { ok: false, msg: "Conta inativa" }
        React->>User: ❌ Acesso negado
    end
    
    Repo->>Repo: 11. row = { id, email, senha_hash, perfil, permissoes, ... }
    API->>Crypto: 12. bcrypt.compare(senha, row.senha_hash)
    Crypto->>Crypto: 13. Haseia senha fornecida
    Crypto->>Crypto: 14. Compara com hash armazenado
    Crypto-->>API: 15. true ou false
    
    alt Senha incorreta
        API-->>Service: 401 Unauthorized
        Service-->>React: { ok: false, msg: "Senha incorreta" }
        React->>User: ❌ Acesso negado
    end
    
    API->>API: 16. Senha correta! ✓
    API->>API: 17. Monta payload do JWT
    API->>API: Payload = {
    API->>API: "  id": row.id,
    API->>API: "  email": row.email,
    API->>API: "  nome": row.nome,
    API->>API: "  perfil": row.perfil,
    API->>API: "  permissoes": row.permissoes,
    API->>API: "  foto": row.foto
    API->>API: }
    
    API->>JWT: 18. jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
    JWT->>JWT: 19. Codifica payload com secret
    JWT->>JWT: 20. Cria assinatura HMAC
    JWT-->>API: 21. token = "eyJh..."
    
    API->>API: 22. Monta response
    API-->>Service: 23. { ok: true, token, user: { id, email, nome, perfil, permissoes } }
    
    Service-->>React: 24. Parsed { ok: true, ... }
    React->>Storage: 25. localStorage.setItem('tetus_token', token)
    React->>React: 26. setState({ user, token })
    React->>React: 27. Redireciona para /dashboard
    React->>User: 28. ✅ Bem-vindo! Carregando dashboard...
    
    React->>API: 29. GET /api/chapas (com Bearer token)
    React->>API: 30. GET /api/retalhos (com Bearer token)
    React->>API: 31. GET /api/retalhos/stats (com Bearer token)
    
    API->>Api: 32. authMiddleware valida token em cada request
    
    User->>User: ✅ Logado com sucesso!
```

---

### 3️⃣ Listar e Filtrar Retalhos

```mermaid
sequenceDiagram
    participant User as 👤 Usuário
    participant React as ⚛️ RetalhosPage.jsx
    participant Ctrl as 🎮 RetalhoCtrl
    participant Repo as 💾 Repo_Front
    participant Service as 🔌 RetalhoService
    participant API as 🔌 Backend API
    participant Middleware as 🔐 Middleware
    participant DB as 🗄️ PostgreSQL
    
    User->>React: 1. Acessa página de retalhos
    React->>React: 2. setState({ loading: true })
    
    React->>Ctrl: 3. retalhoCtrl.listar(filtro)
    Ctrl->>Repo: 4. retalhoRepo.findAll(filtro)
    Repo->>Service: 5. RetalhoService.listar(q)
    
    Service->>Service: 6. Monta URL: /retalhos?q=encodeURIComponent(filtro)
    Service->>API: 7. GET /retalhos?q=search_term
    Note over Service,API: Authorization: Bearer TOKEN
    
    API->>Middleware: 8. authMiddleware(req, res, next)
    Middleware->>Middleware: 9. Valida JWT
    Middleware->>API: 10. next()
    
    API->>Middleware: 11. requirePerm('verEstoque')
    Middleware->>Middleware: 12. req.user.permissoes.verEstoque === true?
    
    alt Sem permissão
        Middleware-->>API: 403 Forbidden
        API-->>Service: { ok: false, msg: "Sem permissão" }
        Service-->>React: Error
        React->>User: ❌ Acesso negado
    end
    
    Middleware->>API: 13. next()
    API->>API: 14. Extrai query param: q = req.query.q
    
    alt Filtro fornecido
        API->>DB: 15. SELECT * FROM retalhos
        API->>DB:      WHERE nome ILIKE $1 OR id ILIKE $1 OR status ILIKE $1
        API->>DB:      ORDER BY criado_em DESC
        DB-->>API: Retalhos filtrados
    else Sem filtro
        API->>DB: 16. SELECT * FROM retalhos ORDER BY criado_em DESC
        DB-->>API: Todos os retalhos
    end
    
    API->>API: 17. Mapeia rows com toModel(row)
    Note over API: { id, origem, nome, largura,<br/>comprimento, espessura, area,<br/>status, qrCode, criadoEm }
    
    API-->>Service: 18. { ok: true, data: Retalho[] }
    Service-->>Repo: 19. Parsed response
    Repo->>Ctrl: 20. Retorna resultado
    
    Ctrl->>Ctrl: 21. data.map(mkRetalho)
    Note over Ctrl: Normaliza cada retalho<br/>com schema padrão
    
    Ctrl-->>React: 22. { ok: 1, data: Retalho[] }
    React->>React: 23. setState({ retalhos: data, loading: false })
    React->>React: 24. Renderiza grid de retalhos
    
    React->>User: 25. Exibe tabela com:
    React->>User: ├─ ID do retalho
    React->>User: ├─ Chapa de origem
    React->>User: ├─ Dimensões (largura × comprimento)
    React->>User: ├─ Área (m²)
    React->>User: ├─ Status
    React->>User: └─ Ações (editar, consumir, deletar, QR Code)
    
    User->>React: 26. Insere filtro "Projeto ABC"
    React->>React: 27. listar("Projeto ABC")
    React->>API: 28. GET /retalhos?q=Projeto%20ABC
    
    API->>DB: 29. ILIKE %Projeto ABC%
    DB-->>API: Retalhos contendo "Projeto ABC"
    
    API-->>React: 30. { ok: true, data: Retalho[] }
    React->>React: 31. setState({ retalhos: data })
    React->>User: 32. ✅ Exibe apenas retalhos filtrados
```

---

### 4️⃣ Consumir Retalho (Soft Delete)

```mermaid
sequenceDiagram
    participant User as 👤 Usuário
    participant React as ⚛️ RetalhosPage.jsx
    participant Ctrl as 🎮 RetalhoCtrl
    participant Repo as 💾 Repo_Front
    participant Service as 🔌 RetalhoService
    participant API as 🔌 Backend API
    participant DB as 🗄️ PostgreSQL
    
    User->>React: 1. Clica ícone "Consumir" em um retalho
    React->>React: 2. Abre modal: "Tem certeza?"
    
    User->>React: 3. Confirma
    React->>Ctrl: 4. retalhoCtrl.marcarConsumido(retalhoId)
    Ctrl->>Repo: 5. retalhoRepo.marcarConsumido(id)
    Repo->>Service: 6. RetalhoService.marcarConsumido(id)
    
    Service->>API: 7. PATCH /retalhos/{id}/consumir {}
    Note over Service,API: Authorization: Bearer TOKEN
    
    API->>API: 8. authMiddleware + requirePerm('editarEstoque')
    API->>API: 9. Valida autenticação ✓
    
    api->>DB: 10. UPDATE retalhos SET status='Consumido' WHERE id=$1
    API->>DB: RETURNING *
    
    DB->>DB: 11. Trigger: set_updated_at()
    DB->>DB: 12. Define atualizado_em = NOW()
    DB-->>API: 13. Retorna retalho atualizado
    
    API->>API: 14. Mapeia resultado com toModel()
    API-->>Service: 15. { ok: true, data: Retalho }
    
    Service-->>Repo: 16. Parsed response
    Repo->>Ctrl: 17. Retorna resultado
    Ctrl->>Ctrl: 18. mkRetalho(data)
    Ctrl-->>React: 19. { ok: 1, data: RetalhoAtualizado }
    
    React->>React: 20. De-marca load
    React->>React: 21. Encontra retalho na list e atualiza status
    React->>React: 22. setState({ retalhos: newList })
    
    React->>User: 23. ✅ "Retalho marcado como consumido!"
    React->>User: 24. Retalho desaparece ou muda cor (status = Consumido)
    
    Note over DB: Nota: Dados não são deletados!<br/>Apenas status = 'Consumido'<br/>Histórico preservado ✓
```

---

### 5️⃣ Dashboard — Carregamento de Stats

```mermaid
sequenceDiagram
    participant User as 👤 Usuário
    participant React as ⚛️ DashboardPage.jsx
    participant ChapaCtrl as 🎮 ChapaCtrl
    participant RetalhoCtrl as 🎮 RetalhoCtrl
    participant Service as 🔌 ChapaService
    participant Service2 as 🔌 RetalhoService
    participant API as 🔌 Backend API
    participant DB as 🗄️ PostgreSQL
    
    User->>React: 1. Acessa Dashboard
    React->>React: 2. componentDidMount()
    React->>React: 3. setState({ loading: true })
    
    React->>ChapaCtrl: 4. chapaCtrl.stats()
    ChapaCtrl->>Service: 5. ChapaService.stats()
    Service->>API: 6. GET /chapas/stats
    
    React->>RetalhoCtrl: 7. retalhoCtrl.stats()
    RetalhoCtrl->>Service2: 8. RetalhoService.stats()
    Service2->>API: 9. GET /retalhos/stats
    
    par Execução Paralela
        API->>DB: 10a. SELECT COUNT(*), COUNT(FILTER status='Disponível'), ...
        API->>DB:      FROM chapas
        DB-->>API: { total, disponiveis, emUso, esgotadas }
    and
        API->>DB: 10b. SELECT COUNT(*), COUNT(FILTER status), SUM(area)
        API->>DB:      FROM retalhos
        DB-->>API: { total, disponiveis, reservados, consumidos, areaTotal }
    end
    
    API-->>Service: 11a. { ok: true, data: ChapaStats }
    API-->>Service2: 11b. { ok: true, data: RetalhoStats }
    
    Service-->>ChapaCtrl: 12a. ChapaStats
    Service2-->>RetalhoCtrl: 12b. RetalhoStats
    
    ChapaCtrl-->>React: 13a. { total, disponiveis, emUso, esgotadas }
    RetalhoCtrl-->>React: 13b. { total, disponiveis, reservados, consumidos, areaTotal }
    
    React->>React: 14. setState({
    React->>React:      chapasTotal: x,
    React->>React:      retalhosTotal: y,
    React->>React:      areaTotal: z,
    React->>React:      loading: false
    React->>React: })
    
    React->>React: 15. Renderiza cards:
    React->>React: ├─ 📊 Total de Chapas
    React->>React: ├─ 📦 Total de Retalhos
    React->>React: ├─ 📐 Área Total em m²
    React->>React: ├─ 🟢 Disponíveis
    React->>React: ├─ 🟡 Reservados
    React->>React: └─ 🔴 Consumidos
    
    React->>User: 16. ✅ Dashboard carregado com todos os dados!
```

---

### 6️⃣ Gerenciar Usuários & Permissões

```mermaid
sequenceDiagram
    participant User as 👤 Admin
    participant React as ⚛️ UsuariosPage.jsx
    participant Ctrl as 🎮 UserCtrl
    participant Service as 🔌 UsuarioService
    participant API as 🔌 Backend API
    participant Repo as 💾 UserRepository
    participant DB as 🗄️ PostgreSQL
    participant Crypto as 🔐 bcryptjs
    
    User->>React: 1. Acessa "Gerenciar Usuários"
    React->>React: 2. Carrega lista de usuários
    
    User->>React: 3. Clica "Criar novo usuário"
    React->>React: 4. Abre modal com formulário
    
    User->>React: 5. Preenche: nome, email, perfil (Admin/Estoquista/Vendedor)
    User->>React: 6. Clica "Criar"
    
    React->>Ctrl: 7. userCtrl.criar({ nome, email, perfil })
    Ctrl->>Ctrl: 8. Valida: nome?.trim(), email válido?
    Ctrl->>Service: 9. UsuarioService.criar(data)
    
    Service->>API: 10. POST /api/usuarios { nome, email, perfil }
    Note over Service,API: Authorization: Bearer TOKEN<br/>(User é Admin)
    
    API->>API: 11. authMiddleware + requirePerm('gerenciarUsuarios')
    alt Sem permissão
        API-->>Service: 403 Forbidden
        Service-->>React: Error
        React->>User: ❌ "Você não tem permissão"
    end
    
    API->>API: 12. Validações: nome, email, perfil válido?
    API->>Repo: 13. UserRepository.findByEmail(email)
    Repo->>DB: 14. SELECT * FROM usuarios WHERE email = $1
    DB-->>Repo: null ou usuário
    
    alt Email já existe
        API-->>Service: 400 Bad Request
        Service-->>React: { ok: false, msg: "Email já cadastrado" }
        React->>User: ⚠️ Email duplicado
    end
    
    API->>Crypto: 15. Gera senha padrão: "TetusManager123"
    Crypto->>Crypto: 16. bcrypt.hash(senha, 10)
    Crypto-->>API: 17. senhaHash = "$2a$10$..."
    
    API->>API: 18. Monta permissões padrão do perfil
    Note over API: Se perfil = 'Estoquista':<br/>permissoes = {<br/>  verEstoque: true,<br/>  editarEstoque: true,<br/>  registrarCorte: true,<br/>  ...<br/>}
    
    API->>Repo: 19. UserRepository.insert({
    API->>Repo:      nome, email, senha_hash, perfil,<br/>      permissoes, status: 'Ativo'
    API->>Repo: })
    
    Repo->>DB: 20. INSERT INTO usuarios (nome, email, senha_hash, perfil, permissoes, status, criado_em)
    Repo->>DB: VALUES ($1, $2, $3, $4, $5, $6, NOW())
    
    DB->>DB: 21. Trigger: set_updated_at()
    DB-->>Repo: 22. RETURNING *
    
    Repo->>Repo: 23. toModel(row)
    Repo-->>API: 24. Usuario criado
    
    API-->>Service: 25. { ok: true, data: Usuario }
    Service-->>Ctrl: 26. Parsed response
    Ctrl->>Ctrl: 27. mkUser(data)
    Ctrl-->>React: 28. { ok: 1, data: Usuario }
    
    React->>React: 29. Atualiza lista de usuários
    React->>User: 30. ✅ "Usuário criado com sucesso!"
    React->>User: 31. Exibe: Nome, Email, Perfil, Status
    
    Note over User: Usuário pode agora:<br/>- Fazer login com email<br/>- Senha padrão será alterada no 1º login<br/>- Terá permissões conforme perfil
```

---

## 🔑 Padrões de Response

Toda resposta da API segue o padrão:

```javascript
// Sucesso
{ 
  ok: true, 
  data: { ... }, 
  msg: "Operação realizada com sucesso!" 
}

// Erro
{ 
  ok: false, 
  msg: "Descrição do erro",
  status: 400 // ou 401, 403, 404, 500
}
```

---

## ⏱️ Timeouts & Performance

- **JWT Expira em:** 8 horas
- **Timeout de Requisição:** 30 segundos
- **Pool de Conexões:** 20 conexões simultâneas
- **Cache de Dados**: localStorage (token)

---

**Gerado em:** 2026-05-15  
**Total de Fluxos Documentados:** 6  
**Complexidade:** Alta

