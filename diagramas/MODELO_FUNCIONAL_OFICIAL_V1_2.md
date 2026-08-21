# Diagramas oficiais — TetusManager v1.2

Este arquivo consolida a versão dos diagramas compatível com as especificações UC01–UC08 revisadas. Os blocos PlantUML podem ser importados/replicados no Astah mantendo os mesmos participantes e mensagens.

## 1. Diagrama geral de casos de uso

```plantuml
@startuml
left to right direction
actor "Vendedor / Orçamentista" as V
actor Estoquista as E
actor Administrador as A

E --|> V
A --|> E

rectangle TetusManager {
  usecase "UC01\nGerenciar Usuários" as UC01
  usecase "UC02\nVisualizar Dashboard\ne Relatórios" as UC02
  usecase "UC03\nGerenciar Chapas Brutas" as UC03
  usecase "UC04\nRegistrar Corte\ne Gerar Retalho" as UC04
  usecase "UC05\nGerar e Disponibilizar\nQR Code" as UC05
  usecase "UC06\nConsultar Estoque" as UC06
  usecase "UC07\nVisualizar Detalhes\nda Peça" as UC07
  usecase "UC08\nGerenciar Retalhos" as UC08

  A -- UC01
  A -- UC02
  E -- UC03
  E -- UC04
  E -- UC08
  V -- UC06
  V -- UC07

  UC04 .> UC05 : <<include>>\n[quando gera retalho]
  UC07 .> UC06 : <<extend>>
}
@enduml
```

## 2. Diagrama de estados — Chapa

```plantuml
@startuml
[*] --> Disponivel
Disponivel --> EmUso : iniciarProcessamento()
Disponivel --> Inativa : registrarCorte()
Disponivel --> Inativa : inativarChapa()
EmUso --> Inativa : concluirCorte()
EmUso --> Inativa : inativarChapa()
Inativa --> Disponivel : reativarChapa()\n[sem corte registrado]
@enduml
```

> Ao concluir o UC04, a chapa de origem termina em `Inativa`. Quando existe sobra reutilizável, apenas o novo retalho representa a área física restante no estoque.

## 3. Diagrama de estados — Retalho

```plantuml
@startuml
[*] --> Disponivel
Disponivel --> Reservado : reservar()
Reservado --> Disponivel : liberarReserva()
Disponivel --> Consumido : consumir()
Reservado --> Consumido : consumir()
Disponivel --> Descartado : descartar()
Reservado --> Descartado : descartar()
Consumido --> [*]
Descartado --> [*]
@enduml
```

## 4. Sequência UC01 — Gerenciar Usuários

```plantuml
@startuml
actor Administrador
boundary UsuariosPage
control UsuariosController
entity UserRepository

== Listar usuários ==
Administrador -> UsuariosPage : acessarUsuarios()
UsuariosPage -> UsuariosController : listarUsuarios()
UsuariosController -> UserRepository : findAll()
UserRepository --> UsuariosController : usuarios[]
UsuariosController --> UsuariosPage : usuarios[]

== Cadastrar usuário ==
Administrador -> UsuariosPage : informarDadosUsuario()
UsuariosPage -> UsuariosController : criarUsuario(dados)
UsuariosController -> UserRepository : insert(dados, senhaHash)
UserRepository --> UsuariosController : usuarioCriado
UsuariosController --> UsuariosPage : usuarioCriado

== Editar / ativar / inativar ==
Administrador -> UsuariosPage : alterarUsuario(id, dados)
UsuariosPage -> UsuariosController : atualizarUsuario(id, dados)
UsuariosController -> UserRepository : update(id, dados)
UserRepository --> UsuariosController : usuarioAtualizado
UsuariosController --> UsuariosPage : usuarioAtualizado
@enduml
```

## 5. Sequência UC02 — Visualizar Dashboard e Relatórios

```plantuml
@startuml
actor Administrador
boundary DashboardPage
control DashboardController
entity Repositories

Administrador -> DashboardPage : acessarDashboard()
DashboardPage -> DashboardController : carregarIndicadores(filtros)
DashboardController -> Repositories : consultarChapasRetalhosCortes()
Repositories --> DashboardController : dadosAgregados
DashboardController -> DashboardController : calcularKPIs()
DashboardController --> DashboardPage : indicadores

note over DashboardPage
Relatórios permanece módulo em evolução.
O Dashboard representa o fluxo implementado.
end note
@enduml
```

## 6. Sequência UC03 — Gerenciar Chapas Brutas

```plantuml
@startuml
actor Estoquista
boundary TelaChapasUI
control ChapasController
entity ChapaRepository

== Listar chapas ==
Estoquista -> TelaChapasUI : acessarTelaChapas()
TelaChapasUI -> ChapasController : listarChapas(filtros)
ChapasController -> ChapaRepository : findAll(filtros)
ChapaRepository --> ChapasController : chapas[]
ChapasController --> TelaChapasUI : chapas[]

== Cadastrar chapa ==
Estoquista -> TelaChapasUI : informarDadosChapa()
TelaChapasUI -> ChapasController : gravarChapa(dados)
ChapasController -> ChapaRepository : insert(dados)
ChapaRepository --> ChapasController : chapaGravada
ChapasController --> TelaChapasUI : chapaGravada

== Atualizar / inativar ==
Estoquista -> TelaChapasUI : alterarChapa(id, dados)
TelaChapasUI -> ChapasController : atualizarChapa(id, dados)
ChapasController -> ChapaRepository : update(id, dados/status)
ChapaRepository --> ChapasController : chapaAtualizada
ChapasController --> TelaChapasUI : chapaAtualizada
@enduml
```

## 7. Sequência UC04 — Registrar Corte e Gerar Retalho

```plantuml
@startuml
actor Estoquista
boundary TelaCorteUI
control CortesController
entity ChapaRepository
entity CorteRepository
entity RetalhoRepository

Estoquista -> TelaCorteUI : acessarRegistrarCorte()
TelaCorteUI -> ChapaRepository : listarDisponiveis()
ChapaRepository --> TelaCorteUI : chapas[]

Estoquista -> TelaCorteUI : selecionarChapaEInformarMedidas()
TelaCorteUI -> TelaCorteUI : calcularSobraRetangular()
Estoquista -> TelaCorteUI : confirmarSalvar()
TelaCorteUI -> CortesController : registrarCorte(dados)
CortesController -> ChapaRepository : buscarPorId(chapaId)
ChapaRepository --> CortesController : chapa

alt há sobra reutilizável
  CortesController -> RetalhoRepository : insert(retalho AUTOMATICA)
  RetalhoRepository --> CortesController : retalhoGravado
  CortesController -> CorteRepository : insert(corte, retalhoId)
  CortesController -> ChapaRepository : setStatus(Inativa)
  CortesController --> TelaCorteUI : corte + retalho + QR
else sem sobra reutilizável
  CortesController -> CorteRepository : insert(corte, retalhoId=null)
  CortesController -> ChapaRepository : setStatus(Inativa)
  CortesController --> TelaCorteUI : corte registrado
end
@enduml
```

## 8. Sequência UC05 — Gerar e Disponibilizar QR Code

```plantuml
@startuml
actor Estoquista
boundary QRCodeModal
control QRCodeController
entity PecaRepository

Estoquista -> QRCodeModal : abrirQRCode(pecaId)
QRCodeModal -> QRCodeController : obterQRCode(pecaId)
QRCodeController -> PecaRepository : buscarPeca(pecaId)
PecaRepository --> QRCodeController : peca
QRCodeController -> QRCodeController : gerarIdentificadorPersistente()
QRCodeController --> QRCodeModal : qrCode + dadosMinimos
Estoquista -> QRCodeModal : imprimirOuReimprimir()
@enduml
```

## 9. Sequência UC06 — Consultar Estoque

```plantuml
@startuml
actor "Vendedor / Orçamentista" as V
boundary EstoquePage
control EstoqueController
entity Repositories

V -> EstoquePage : acessarEstoque()
EstoquePage -> EstoqueController : consultar(filtros)
EstoqueController -> Repositories : buscarCompativeis(filtros)
Repositories --> EstoqueController : itens[]
EstoqueController --> EstoquePage : resultados[]
@enduml
```

## 10. Sequência UC07 — Visualizar Detalhes da Peça

```plantuml
@startuml
actor "Vendedor / Orçamentista" as V
boundary EstoquePage
control DetalhesController
entity Repositories

V -> EstoquePage : selecionarPeca(id)
EstoquePage -> DetalhesController : consultarDetalhes(id)
DetalhesController -> Repositories : buscarPecaEHistorico(id)
Repositories --> DetalhesController : peca + rastreabilidade
DetalhesController --> EstoquePage : detalhesCompletos
V -> EstoquePage : fecharDetalhes()
@enduml
```

## 11. Sequência UC08 — Gerenciar Retalhos

```plantuml
@startuml
actor Estoquista
boundary RetalhosPage
control RetalhosController
entity RetalhoRepository

== Listar ==
Estoquista -> RetalhosPage : acessarRetalhos()
RetalhosPage -> RetalhosController : listarRetalhos(filtros)
RetalhosController -> RetalhoRepository : findAll(filtros)
RetalhoRepository --> RetalhosController : retalhos[]
RetalhosController --> RetalhosPage : retalhos[]

== Cadastrar legado ==
Estoquista -> RetalhosPage : informarDadosRetalho()
RetalhosPage -> RetalhosController : criarRetalho(dados, origem=MANUAL)
RetalhosController -> RetalhoRepository : insert(dados)
RetalhoRepository --> RetalhosController : retalhoCriado
RetalhosController --> RetalhosPage : retalhoCriado

== Ciclo de vida ==
Estoquista -> RetalhosPage : reservar/liberar/consumir/descartar(id)
RetalhosPage -> RetalhosController : alterarStatus(id, status)
RetalhosController -> RetalhoRepository : updateStatus(id, status)
RetalhoRepository --> RetalhosController : retalhoAtualizado
RetalhosController --> RetalhosPage : retalhoAtualizado
@enduml
```

## 12. DER lógico atualizado

```mermaid
erDiagram
    USUARIOS ||--o{ CHAPAS : cria
    USUARIOS ||--o{ RETALHOS : cria
    USUARIOS ||--o{ CORTES : registra
    CHAPAS ||--o{ CORTES : recebe
    CHAPAS o|--o{ RETALHOS : origem
    RETALHOS o|--o{ CORTES : resultado

    CHAPAS {
      varchar id PK
      varchar nome
      varchar tipo
      numeric largura
      numeric comprimento
      numeric espessura
      varchar status
      text localizacao
      text qr_code
    }

    RETALHOS {
      varchar id PK
      varchar origem FK
      varchar origem_tipo
      varchar nome
      numeric largura
      numeric comprimento
      numeric area
      varchar status
      text localizacao
      text qr_code
    }

    CORTES {
      serial id PK
      varchar os_numero
      varchar chapa_id FK
      varchar retalho_id FK
      numeric comprimento_consumido
      numeric largura_consumida
      numeric area_consumida
      numeric area_retalho
    }
```

## 13. Implantação

```plantuml
@startuml
node "Computador / Smartphone" <<device>> {
  artifact "Browser"
  artifact "React UI"
}
node "Cloud / Web Server" <<server>> {
  artifact "Frontend Vite"
  artifact "Node.js / Express API"
  artifact "JWT Middleware"
}
database "PostgreSQL" as DB

"Computador / Smartphone" --> "Cloud / Web Server" : HTTPS
"Cloud / Web Server" --> DB : PostgreSQL / TLS
@enduml
```
