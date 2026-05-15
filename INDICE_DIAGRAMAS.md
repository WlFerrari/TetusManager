# 📚 Índice Completo de Diagramas — TetusManager v4

Bem-vindo! Este é um guia de todos os diagramas e documentações geradas para o projeto TetusManager. Use este arquivo como referência para navegar entre as diferentes visualizações da arquitetura.

---

## 📑 Índice de Documentos

### **1️⃣ DIAGRAMA DE CLASSES** 📊
**Arquivo:** `DIAGRAMA_CLASSES.md`

**Conteúdo:**
- ✅ Diagrama UML completo com todas as classes
- ✅ Atributos e métodos de cada classe
- ✅ Relacionamentos entre classes (herança, composição, agregação)
- ✅ Controllers (Frontend)
- ✅ Repositories (Frontend & Backend)
- ✅ Services (Frontend)
- ✅ Pages (React Components)
- ✅ Models & Data Classes
- ✅ Database Layer
- ✅ Authentication & Middleware

**Quando usar:**
- Entender estrutura geral do projeto
- Visualizar como as classes se relacionam
- Ver assinatura de métodos
- Entender padrões de design

**Visualização:**
```
IntelliJ → Abrir DIAGRAMA_CLASSES.md → Tab Preview
```

---

### **2️⃣ DIAGRAMAS DE SEQUÊNCIA** 🔄
**Arquivo:** `FLUXOS_SEQUENCIA.md`

**Conteúdo:**
- ✅ Fluxo: Registrar Corte (criar retalho)
- ✅ Fluxo: Login e Autenticação
- ✅ Fluxo: Listar e Filtrar Retalhos
- ✅ Fluxo: Consumir Retalho (Soft Delete)
- ✅ Fluxo: Dashboard - Carregamento de Stats
- ✅ Fluxo: Gerenciar Usuários & Permissões

**Detalhes de cada fluxo:**
- Mensagens trocadas entre componentes
- Decisões e branches (if/else)
- Chamadas síncronas vs assíncronas
- Validações em cada etapa
- Estados do banco de dados

**Quando usar:**
- Entender fluxo completo de uma operação
- Debug de erros em fluxos específicos
- Treinar novos desenvolvedores
- Documentar comportamento do sistema

**Visualização:**
```
IntelliJ → Abrir FLUXOS_SEQUENCIA.md → Tab Preview
```

---

### **3️⃣ DIAGRAMA ER (BANCO DE DADOS)** 🗄️
**Arquivo:** `DIAGRAMA_ER_BANCO_DADOS.md`

**Conteúdo:**
- ✅ Diagrama Entidade-Relacionamento (ER)
- ✅ Estrutura detalhada de cada tabela
- ✅ Tipos de dados de cada coluna
- ✅ Constraints e validações
- ✅ Foreign Keys e relacionamentos
- ✅ Triggers automatizados
- ✅ Índices para performance
- ✅ Estados válidos (enums)
- ✅ Exemplos de dados reais
- ✅ Queries SQL comuns
- ✅ Integridade referencial
- ✅ Segurança (bcrypt, JSONB)

**Quando usar:**
- Entender schema do banco de dados
- Escrever queries SQL
- Debugar problemas de integridade
- Planificar migrações
- Otimizar performance

**Visualização:**
```
IntelliJ → Abrir DIAGRAMA_ER_BANCO_DADOS.md → Tab Preview
```

---

### **4️⃣ ARQUITETURA GERAL** 🏗️
**Arquivo:** `ARQUITETURA_DIAGRAMA.md`

**Conteúdo:**
- ✅ Arquitetura geral (Frontend + Backend + Database)
- ✅ Stack de tecnologias
- ✅ Modelo de dados simplificado
- ✅ Endpoints da API REST
- ✅ Autenticação & Permissões
- ✅ Componentes React (árvore)
- ✅ Controllers & Repositories Stack
- ✅ Papéis & Permissões por perfil
- ✅ Fluxos principais (resumidos)
- ✅ Estrutura de pastas

**Quando usar:**
- Entender overview do sistema
- Apresentar projeto para stakeholders
- Onboarding de novos desenvolvedores
- Planejar novas features

**Visualização:**
```
IntelliJ → Abrir ARQUITETURA_DIAGRAMA.md → Tab Preview
```

---

## 🎯 Guia Rápido: Por Onde Começar?

### **Sou um novo desenvolvedor, por onde começo?**

1. Leia **ARQUITETURA_DIAGRAMA.md** — Entenda o overview
2. Estude **DIAGRAMA_CLASSES.md** — Veja como tudo é organizado
3. Explore **FLUXOS_SEQUENCIA.md** — Entenda como as operações funcionam
4. Consulte **DIAGRAMA_ER_BANCO_DADOS.md** — Conheça o banco de dados

**Tempo estimado:** 2-3 horas

---

### **Preciso debugar um erro no fluxo de "Registrar Corte"**

1. Abra **FLUXOS_SEQUENCIA.md**
2. Procure por "Registrar Corte"
3. Identifique em qual etapa o erro ocorre
4. Use **DIAGRAMA_CLASSES.md** para entender as classes envolvidas
5. Consulte **DIAGRAMA_ER_BANCO_DADOS.md** se o erro for no banco

---

### **Preciso entender o banco de dados**

1. Abra **DIAGRAMA_ER_BANCO_DADOS.md**
2. Veja a estrutura das tabelas
3. Entenda os relacionamentos
4. Estude as queries SQL de exemplo

---

### **Vou adicionar uma nova feature, o que verificar?**

1. **ARQUITETURA_DIAGRAMA.md** — Onde a feature se encaixa?
2. **DIAGRAMA_CLASSES.md** — Que classes preciso modificar/criar?
3. **FLUXOS_SEQUENCIA.md** — Qual é o novo fluxo?
4. **DIAGRAMA_ER_BANCO_DADOS.md** — Preciso de novas tabelas/campos?

---

## 📊 Comparação de Diagramas

| Aspecto | Classes | Sequência | ER | Arquitetura |
|---------|---------|-----------|----|-----------  |
| **Estrutura** | ✅✅✅ | ❌ | ✅✅ | ✅ |
| **Fluxo de Execução** | ❌ | ✅✅✅ | ❌ | ❌ |
| **Banco de Dados** | ❌ | ❌ | ✅✅✅ | ✅ |
| **Overview** | ❌ | ❌ | ❌ | ✅✅✅ |
| **Detalhes de Métodos** | ✅✅ | ❌ | ❌ | ❌ |
| **Permissões & Autenticação** | ✅ | ✅ | ❌ | ✅ |
| **Performance Optimization** | ❌ | ❌ | ✅ | ❌ |

---

## 🔗 Mapeamento Entre Diagramas

### **Class → Sequence**
```
RetalhoController (classe)
    ↓
Fluxo "Registrar Corte" (sequência)
    ↓ (usa método criar())
    ↓
RetalhoService.criar() (classe)
```

### **Class → ER**
```
RetalhoController (classe)
    ↓ (chama)
RetalhoRepository (classe)
    ↓ (executa SQL em)
Tabela RETALHOS (ER)
```

### **Sequence → ER**
```
Fluxo "Registrar Corte" (sequência)
    ↓ (envolve)
INSERT INTO retalhos (ER)
    ↓ (e busca)
SELECT * FROM chapas (ER)
```

---

## 🎨 Legenda dos Diagramas

### **Notação UML (Classes)**
```
┌─────────────────────────────┐
│      NomeDaClasse           │
├─────────────────────────────┤
│ - atributo1: tipo           │ (privado)
│ + atributo2: tipo           │ (público)
├─────────────────────────────┤
│ + metodo1(): tipo           │
│ - metodo2(param): tipo      │
└─────────────────────────────┘

Relacionamentos:
  → Dependência
  ◆ Agregação
  ◇ Composição
  │ Herança
```

### **Notação ER**
```
USUARIO ||--o{ CHAPAS : "um para muitos"
  ││ = relaçao obrigatória (1)
  o{ = relacionamento opcional (0..*)

PK = Primary Key (chave primária)
FK = Foreign Key (chave estrangeira)
UK = Unique Key (chave única)
CHECK() = Constraint de validação
```

### **Notação Sequência**
```
participant → ...→ participant : mensagem
participant ->> participant : async
participant -->> participant : retorno
alt / else → decisões
par → execução paralela
Note over actor : Anotação
```

---

## 🚀 Visualizando Diagramas

### **No IntelliJ Ultimate**

1. Abra qualquer arquivo `.md` com diagrama
2. Clique na aba **"Preview"** no topo direito
3. IntelliJ renderiza Mermaid automaticamente

### **Online (sem instalação)**

1. Acesse [Mermaid Live](https://mermaid.live)
2. Copie o conteúdo do bloco ` ```mermaid ... ``` `
3. Cole na editor do Mermaid Live
4. Veja em tempo real

### **Exportar como Imagem**

No Mermaid Live:
- Clique botão **"Download"** 
- Escolha formato: SVG, PNG, PDF

---

## 📈 Tamanho & Complexidade

```
├─ DIAGRAMA_CLASSES.md
│  ├─ 30+ Classes
│  ├─ 100+ Métodos
│  ├─ 6 Padrões de Design
│  └─ Complexidade: Alta
│
├─ FLUXOS_SEQUENCIA.md
│  ├─ 6 Fluxos Principais
│  ├─ 40+ Etapas por fluxo
│  ├─ Branches & Decisões
│  └─ Complexidade: Muito Alta
│
├─ DIAGRAMA_ER_BANCO_DADOS.md
│  ├─ 4 Tabelas
│  ├─ 50+ Colunas
│  ├─ 5 Índices
│  ├─ 3 Triggers
│  └─ Complexidade: Alta
│
└─ ARQUITETURA_DIAGRAMA.md
   ├─ 10+ Diagramas
   ├─ Overview + Detalhes
   ├─ Stack Completo
   └─ Complexidade: Média
```

---

## 🔐 Segurança nos Diagramas

Os diagramas ilustram as seguintes proteções:

✅ **Autenticação JWT** — Token 8h, Bearer token em headers  
✅ **Autorização por Permissões** — Verificação em cada endpoint  
✅ **Password Hashing** — bcryptjs com 10 rounds  
✅ **SQL Injection Prevention** — Prepared statements ($1, $2, ...)  
✅ **Soft Delete** — Dados nunca são permanentemente deletados  
✅ **Foreign Key Constraints** — Integridade referencial  
✅ **JSONB para Permissões** — Flexível e indexável  

---

## 📞 Dúvidas Frequentes

### **P: Onde começar a ler?**
R: Comece por **ARQUITETURA_DIAGRAMA.md** para overview.

### **P: Como entender um fluxo específico?**
R: Veja **FLUXOS_SEQUENCIA.md** para sequência passo-a-passo.

### **P: Como escrever queries SQL?**
R: Consulte **DIAGRAMA_ER_BANCO_DADOS.md** para schema e exemplos.

### **P: Qual é a estrutura de pastas?**
R: Veja **ARQUITETURA_DIAGRAMA.md** seção "Estrutura de Pastas".

### **P: Como adicionar um novo endpoint?**
R: 
1. Adicione rota em `backend/routes/index.js`
2. Crie método em `backend/repositories/NovaRepository.js`
3. Atualize `DIAGRAMA_CLASSES.md` e `FLUXOS_SEQUENCIA.md`

### **P: Posso exportar os diagramas?**
R: Sim! Use [Mermaid Live](https://mermaid.live) para exportar PNG/PDF.

---

## 📚 Recursos Adicionais

### **Ferramentas Usadas**
- **Mermaid** — Diagramas em Markdown
- **PostgreSQL** — Banco de dados
- **Node.js + Express** — Backend
- **React 18** — Frontend

### **Documentação Oficial**
- [Mermaid Documentation](https://mermaid.js.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)

### **Atalhos Úteis**
- `Ctrl+F` — Buscar texto nos diagramas
- `Ctrl+Shift+V` — Preview no IntelliJ
- `Cmd+Click` — Abrir links em Preview

---

## 🎯 Próximos Passos

1. ✅ Leia todos os 4 diagramas
2. ✅ Clone o repositório
3. ✅ Instale as dependências (`npm install`)
4. ✅ Configure `.env` com credenciais
5. ✅ Rode as migrations (`npm run migrate`)
6. ✅ Inicie o servidor (`npm run dev`)
7. ✅ Estude o código seguindo os diagramas

---

## 📝 Atualizações

Quando adicionar novas features, atualize:

1. **ARQUITETURA_DIAGRAMA.md** — Se mudar estrutura geral
2. **DIAGRAMA_CLASSES.md** — Se adicionar/modificar classes
3. **FLUXOS_SEQUENCIA.md** — Se adicionar novos fluxos
4. **DIAGRAMA_ER_BANCO_DADOS.md** — Se adicionar tabelas/colunas
5. **Este arquivo** — Mantenha links e índice atualizados

---

**Gerado em:** 2026-05-15  
**Stack:** React 18 + Node.js + PostgreSQL  
**Versão:** 4.0  
**Arquivos de Documentação:** 4  
**Total de Diagramas:** 25+  
**Padrões de Design:** 6

---

## 🎉 Bem-vindo ao TetusManager!

Esperamos que estes diagramas ajudem você a entender a arquitetura do projeto. Boa codificação! 🚀

