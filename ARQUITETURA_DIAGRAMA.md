# 🏗️ Diagrama de Arquitetura — TetusManager v4

## 📊 Arquitetura Geral do Sistema

```mermaid
graph TB
    User["👤 Usuário"]
    Browser["🌐 Browser"]
    React["⚛️ React 18<br/>Frontend"]
    Vite["⚡ Vite<br/>Dev Server"]
    API["🔌 API REST<br/>Express.js"]
    DB["🗄️ PostgreSQL<br/>Database"]
    
    User -->|Acessa| Browser
    Browser -->|http://localhost:3000| Vite
    Vite -->|Renderiza| React
    React -->|HTTP Requests| API
    API -->|SQL Queries| DB
    DB -->|Resultados| API
```

---

## 🎯 Fluxo de Requisição (Registrar Corte)

```mermaid
sequenceDiagram
    participant User as 👤 Usuário
    participant Page as 📄 CortePage
    participant Ctrl as 🎮 Controllers
    participant Repo as 💾 Repository
    participant API as 🔌 API REST
    participant Backend as 🏢 Backend
    participant DB as 🗄️ PostgreSQL
    
    User->>Page: Seleciona chapa + dimensões
    Page->>Ctrl: chapaCtrl.calcularCorte()
    Ctrl-->>Page: { ok, retalho }
    
    User->>Page: Clica "Salvar e Gerar QR Code"
    Page->>Ctrl: retalhoCtrl.criar(retalho)
    Ctrl->>Repo: retalhoRepo.insert(data)
    Repo->>API: POST /api/retalhos
    
    API->>Backend: authMiddleware + validation
    Backend->>Backend: RetalhoRepository.insert()
    Backend->>DB: INSERT INTO retalhos
    DB-->>Backend: ID + dados inseridos
    Backend-->>API: { ok: true, data }
    API-->>Repo: Response JSON
    Repo-->>Ctrl: Parsed data
    Ctrl-->>Page: { ok: 1, data }
    Page->>User: ✅ Sucesso! Retalho criado
```

---

## 🗂️ Estrutura de Pastas & Responsabilidades

```mermaid
graph TB
    Project["tetusmanager-v4"]
    
    Frontend["📁 frontend/"]
    Backend["📁 backend/"]
    
    FrontSrc["src/"]
    BackDB["database/"]
    BackMid["middleware/"]
    BackModel["models/"]
    BackRepo["repositories/"]
    BackRoute["routes/"]
    
    Views["📁 views/"]
    Pages["📁 pages/"]
    Components["📁 components/"]
    Services["📁 services/"]
    Models["📁 models/"]
    Repos["📁 repositories/"]
    Controllers["📁 controllers/"]
    Contexts["📁 contexts/"]
    
    Project --> Frontend
    Project --> Backend
    
    Frontend --> FrontSrc
    FrontSrc --> Views
    FrontSrc --> Services
    FrontSrc --> Models
    FrontSrc --> Repos
    FrontSrc --> Controllers
    FrontSrc --> Contexts
    
    Views --> Pages
    Views --> Components
    
    Backend --> BackDB
    Backend --> BackMid
    Backend --> BackModel
    Backend --> BackRepo
    Backend --> BackRoute
    
    Pages -->|Componentes UI| Components
    Controllers -->|Lógica de Negócio| Models
    Repos -->|Chama Services| Services
    Services -->|HTTP/API| BackRoute
    BackRoute -->|Autenticação| BackMid
    BackRoute -->|Queries| BackRepo
    BackRepo -->|SQL| BackDB
```

---

## 🗄️ Modelo de Dados (ER - Entity Relationship)

```mermaid
erDiagram
    USUARIOS ||--o{ CHAPAS : "cria"
    USUARIOS ||--o{ RETALHOS : "cria"
    CHAPAS ||--o{ RETALHOS : "origem"
    EMPRESA ||--o{ USUARIOS : "pertence"
    
    USUARIOS {
        int id PK
        string nome
        string email UK
        string senha_hash
        string perfil
        string status
        string telefone
        string cargo
        text foto
        jsonb permissoes
        timestamp criado_em
    }
    
    CHAPAS {
        string id PK
        string nome
        string tipo
        string cor
        numeric largura
        numeric comprimento
        numeric espessura
        string status
        text qr_code
        timestamp criado_em
    }
    
    RETALHOS {
        string id PK
        string origem FK
        string nome
        string tipo
        string cor
        numeric largura
        numeric comprimento
        numeric espessura
        numeric area
        string status
        text qr_code
        timestamp criado_em
    }
    
    EMPRESA {
        int id PK
        string nome
        string cnpj
        string email
        string telefone
        text endereco
        text logo
        string plano
    }
```

---

## 🔑 Autenticação & Permissões

```mermaid
flowchart LR
    Login["🔐 Login<br/>POST /api/auth/login"]
    Token["🔑 JWT Token<br/>8h expiração"]
    Storage["💾 localStorage<br/>tetus_token"]
    Request["📤 HTTP Request<br/>Authorization: Bearer"]
    Middleware["✅ AuthMiddleware<br/>Validação JWT"]
    Permissions["🛡️ requirePerm()"]
    Route["🔌 Rota Protegida"]
    
    Login -->|Senha OK| Token
    Token -->|Armazena| Storage
    Storage -->|Envia em cada| Request
    Request -->|Middleware valida| Middleware
    Middleware -->|Verifica| Permissions
    Permissions -->|Acesso OK| Route
```

---

## 📋 Fluxo CRUD — Retalhos

```mermaid
graph TD
    R["RETALHO"]
    C["CREATE<br/>POST /api/retalhos<br/>CortePage"]
    U["UPDATE<br/>PUT /api/retalhos/:id<br/>RetalhosPage"]
    D1["DELETE Lógico<br/>PATCH /api/retalhos/:id/consumir<br/>Soft Delete"]
    D2["DELETE Físico<br/>DELETE /api/retalhos/:id<br/>Hard Delete"]
    L["READ ALL<br/>GET /api/retalhos<br/>RetalhosPage"]
    
    R --> C
    R --> L
    R --> U
    R --> D1
    R --> D2
    
    C -->|RetalhoRepository.insert| DB1["INSERT INTO retalhos"]
    L -->|RetalhoRepository.findAll| DB2["SELECT * FROM retalhos"]
    U -->|RetalhoRepository.update| DB3["UPDATE retalhos WHERE id"]
    D1 -->|RetalhoRepository.marcarConsumido| DB4["UPDATE status='Consumido'"]
    D2 -->|RetalhoRepository.delete| DB5["DELETE FROM retalhos"]
```

---

## 🎮 Controllers & Repositories Stack

```mermaid
graph TB
    ChapaCtrl["ChapaController"]
    RetalhoCtrl["RetalhoController"]
    UserCtrl["UserController"]
    EmpresaCtrl["EmpresaController"]
    
    ChapaRepo["ChapaRepository"]
    RetalhoRepo["RetalhoRepository"]
    UserRepo["UserRepository"]
    EmpresaRepo["EmpresaRepository"]
    
    Pool["Connection Pool<br/>pg"]
    
    ChapaCtrl --> ChapaRepo
    RetalhoCtrl --> RetalhoRepo
    UserCtrl --> UserRepo
    EmpresaCtrl --> EmpresaRepo
    
    ChapaRepo --> Pool
    RetalhoRepo --> Pool
    UserRepo --> Pool
    EmpresaRepo --> Pool
    
    Pool --> DB["🗄️ PostgreSQL<br/>tetusmanager"]
```

---

## 👥 Papéis & Permissões

```mermaid
graph TB
    Admin["👨‍💼 Administrador"]
    Estoquista["📦 Estoquista"]
    Vendedor["💼 Vendedor"]
    
    AdminPerms["✅ Ver Dashboard<br/>✅ Ver/Editar Estoque<br/>✅ Registrar Cortes<br/>✅ Ver Relatórios<br/>✅ Gerenciar Usuários<br/>✅ Ver Configurações<br/>✅ Ver Empresa"]
    
    EstoquePerms["✅ Ver Dashboard<br/>✅ Ver/Editar Estoque<br/>✅ Registrar Cortes<br/>❌ Ver Relatórios<br/>❌ Gerenciar Usuários<br/>✅ Ver Configurações<br/>❌ Ver Empresa"]
    
    VendedorPerms["✅ Ver Dashboard<br/>✅ Ver Estoque<br/>❌ Editar Estoque<br/>❌ Registrar Cortes<br/>❌ Ver Relatórios<br/>❌ Gerenciar Usuários<br/>✅ Ver Configurações<br/>❌ Ver Empresa"]
    
    Admin --> AdminPerms
    Estoquista --> EstoquePerms
    Vendedor --> VendedorPerms
```

---

## 🔌 Endpoints da API

```mermaid
graph TB
    API["🔌 /api"]
    
    AUTH["🔐 Auth"]
    CHAPAS["📊 Chapas"]
    CORTES["✂️ Cortes"]
    RETALHOS["📦 Retalhos"]
    USUARIOS["👥 Usuários"]
    EMPRESA["🏢 Empresa"]
    ME["👤 Me"]
    
    API --> AUTH
    API --> CHAPAS
    API --> CORTES
    API --> RETALHOS
    API --> USUARIOS
    API --> EMPRESA
    API --> ME
    
    AUTH -->|POST /auth/login| Login["Login"]
    
    CHAPAS -->|GET| GetChapas["Listar"]
    CHAPAS -->|POST| CreateChapa["Criar"]
    CHAPAS -->|PUT /:id| UpdateChapa["Atualizar"]
    CHAPAS -->|DELETE /:id| DeleteChapa["Excluir"]
    
    CORTES -->|POST| RegisterCorte["Registrar Corte"]
    
    RETALHOS -->|GET| GetRetalhos["Listar"]
    RETALHOS -->|POST| CreateRetalho["Criar"]
    RETALHOS -->|PUT /:id| UpdateRetalho["Atualizar"]
    RETALHOS -->|PATCH /:id/consumir| ConsumeRetalho["Soft Delete"]
    RETALHOS -->|DELETE /:id| DeleteRetalho["Hard Delete"]
    
    USUARIOS -->|GET| GetUsers["Listar"]
    USUARIOS -->|POST| CreateUser["Criar"]
    USUARIOS -->|PATCH /:id/toggle| ToggleUser["Ativar/Inativar"]
    USUARIOS -->|PATCH /:id/permissoes| UpdatePerms["Alterar Permissões"]
    USUARIOS -->|DELETE /:id| DeleteUser["Excluir"]
    
    EMPRESA -->|GET| GetEmpresa["Buscar"]
    EMPRESA -->|PUT| UpdateEmpresa["Atualizar"]
    
    ME -->|GET| GetMe["Meu Perfil"]
    ME -->|PATCH /perfil| UpdateMe["Atualizar Perfil"]
    ME -->|PATCH /senha| ChangePwd["Alterar Senha"]
```

---

## 🧩 Componentes React

```mermaid
graph TB
    App["App.jsx<br/>Router Principal"]
    
    Sidebar["Sidebar.jsx<br/>Menu"]
    UI["UI.jsx<br/>Componentes Base"]
    QRCodeModal["QRCodeModal.jsx<br/>Modal QR Code"]
    ThemeContext["ThemeContext.jsx<br/>Tema Global"]
    
    DashboardPage["DashboardPage<br/>📊 Dashboard"]
    ChapasPage["ChapasPage<br/>📊 Gerenciar Chapas"]
    CortePage["CortePage<br/>✂️ Registrar Corte"]
    RetalhosPage["RetalhosPage<br/>📦 Gerenciar Retalhos"]
    UsuariosPage["UsuariosPage<br/>👥 Gerenciar Usuários"]
    ConfiguracoesPage["ConfiguracoesPage<br/>⚙️ Configurações"]
    LoginPage["LoginPage<br/>🔐 Login"]
    
    App --> Sidebar
    App --> DashboardPage
    App --> ChapasPage
    App --> CortePage
    App --> RetalhosPage
    App --> UsuariosPage
    App --> ConfiguracoesPage
    App --> LoginPage
    App --> ThemeContext
    
    DashboardPage --> UI
    ChapasPage --> UI
    CortePage --> UI
    RetalhosPage --> UI
    UsuariosPage --> UI
    ConfiguracoesPage --> UI
    
    CortePage --> QRCodeModal
    RetalhosPage --> QRCodeModal
```

---

## 🔄 Ciclo de Vida — Criar Retalho (Registrar Corte)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant P as CortePage.jsx
    participant C as ChapaCtrl
    participant R as RetalhoCtrl
    participant S as RetalhoService
    participant API as Backend API
    participant DB as PostgreSQL
    
    U->>P: Seleciona chapa + medidas
    P->>C: calcularCorte(chapaId, cc, lc, nome)
    Note over C: Calcula area local<br/>(sem salvar)
    C-->>P: { ok: 1, retalho }
    
    U->>P: Clica "Salvar"
    P->>R: criar(retalho)
    Note over R: Valida dados<br/>Calcula area novamente<br/>Gera QR Code
    R->>S: RetalhoService.criar(data)
    S->>API: POST /api/retalhos<br/>(com Bearer token)
    
    API->>API: authMiddleware (JWT)
    API->>API: requirePerm('editarEstoque')
    API->>API: Validações
    API->>DB: INSERT INTO retalhos
    
    Note over DB: ID: RET-...<br/>origem: CH005<br/>nome: "CH005 - Projeto ABC"<br/>tipo: "Granito"<br/>area: 0.0004 m²<br/>status: "Disponível"
    
    DB-->>API: RETURNING *
    API-->>S: { ok: true, data: {...} }
    S-->>R: parsed response
    R-->>P: { ok: 1, data: {...} }
    
    Note over P: Exibe mensagem sucesso<br/>Mostra dados do retalho
    P->>U: ✅ "Retalho 'CH005 - Projeto ABC' criado!"
```

---

## 📁 Pastas & Responsabilidades Detalhadas

```mermaid
mindmap
  root((TetusManager))
    Backend (Node.js + Express)
      Routes (/api/*)
        Auth
        Chapas
        Retalhos
        Cortes
        Usuários
        Empresa
      Middleware
        authMiddleware (JWT)
        requirePerm (Permissões)
      Repositories
        ChapaRepository (CRUD)
        RetalhoRepository (CRUD)
        UserRepository (CRUD)
        EmpresaRepository (CRUD)
      Database
        Migrations (CREATE TABLE)
        Seed (Dados iniciais)
        Connection (Pool PostgreSQL)
      Models
        Permissões padrão
    Frontend (React 18 + Vite)
      Views
        Pages
          DashboardPage
          ChapasPage
          CortePage
          RetalhosPage
          UsuariosPage
          ConfiguracoesPage
          LoginPage
        Components
          Sidebar (Menu)
          UI (Botões, Inputs, etc)
          QRCodeModal
      Services
        api.js (Fetch com Auth)
      Repositories
        Chamadas aos Services
      Controllers
        ChapaController
        RetalhoController
        UserController
        EmpresaController
      Models
        Schemas (mkChapa, mkRetalho, etc)
```

---

## 🎯 Fluxos Principais

### 1️⃣ **Registrar Corte (CortePage)**
```
Usuário seleciona chapa → calcularCorte() → Visualiza sobra
→ Clica "Salvar" → criar() → API POST /api/retalhos
→ PostgreSQL INSERT → Sucesso!
```

### 2️⃣ **Listar Retalhos (RetalhosPage)**
```
Usuário acessa página → retalhoCtrl.listar()
→ RetalhoService.listar() → GET /api/retalhos
→ PostgreSQL SELECT * → Mapeia para mkRetalho()
→ Renderiza grid
```

### 3️⃣ **Login (LoginPage)**
```
Usuário insere email/senha → api.login()
→ POST /api/auth/login → Backend valida senha (bcrypt)
→ Gera JWT com permissões → localStorage.setItem('tetus_token')
→ Redireciona para Dashboard
```

### 4️⃣ **Consumir Retalho (Soft Delete)**
```
Usuário marca retalho como "Consumido"
→ marcarConsumido() → PATCH /api/retalhos/:id/consumir
→ UPDATE status='Consumido' (não deleta, apenas marca)
```

---

## 🔐 Segurança

```mermaid
graph TB
    Request["📤 HTTP Request"]
    
    Auth["JWT Validation"]
    Perm["Permission Check"]
    Valid["Data Validation"]
    SQL["Prepared Statement<br/>(Prevent SQL Injection)"]
    DB["Safe Query Execution"]
    
    Request --> Auth
    Auth -->|Token válido?| Perm
    Perm -->|User tem permissão?| Valid
    Valid -->|Dados válidos?| SQL
    SQL -->|Parameterized| DB
```

---

**Gerado em:** 2026-05-15
**Stack:** React 18 + Node.js/Express + PostgreSQL
**Versão:** 4.0

