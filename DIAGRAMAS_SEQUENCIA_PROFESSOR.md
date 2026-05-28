# Diagramas de Sequencia (Requisitos do Professor)

## Caso de Uso: Gerenciar Chapas Brutas

```plantuml
@startuml
title Caso de Uso: Gerenciar Chapas BrutasGerenciar Chapas Brutas
actor Usuario
boundary UI as "TelaChapasUI"
control ChapasCtrl as "ChapasController"
entity ChapaRepo as "ChapaRepository"
activate UI
== Listar chapas ==
Usuario -> UI: acessarTelaChapas()
activate Usuario
UI -> ChapasCtrl: listarChapas()
activate ChapasCtrl
ChapasCtrl -> ChapaRepo: listar()
activate ChapaRepo
ChapaRepo --> ChapasCtrl: chapas[]
deactivate ChapaRepo
ChapasCtrl --> UI: chapas[]
deactivate ChapasCtrl
deactivate Usuario
== Cadastrar chapa ==
Usuario -> UI: informarDadosChapa()
activate Usuario
UI -> ChapasCtrl: gravarChapa(dados)
activate ChapasCtrl
ChapasCtrl -> ChapaRepo: inserir(dados)
activate ChapaRepo
ChapaRepo --> ChapasCtrl: chapaGravada
deactivate ChapaRepo
ChapasCtrl --> UI: chapaGravada
deactivate ChapasCtrl
deactivate Usuario
== Atualizar chapa ==
Usuario -> UI: alterarDadosChapa()
activate Usuario
UI -> ChapasCtrl: atualizarChapa(dados)
activate ChapasCtrl
ChapasCtrl -> ChapaRepo: atualizar(dados)
activate ChapaRepo
ChapaRepo --> ChapasCtrl: chapaAtualizada
deactivate ChapaRepo
ChapasCtrl --> UI: chapaAtualizada
deactivate ChapasCtrl
deactivate Usuario
== Excluir chapa ==
Usuario -> UI: solicitarExclusaoChapa(id)
activate Usuario
UI -> ChapasCtrl: excluirChapa(id)
activate ChapasCtrl
ChapasCtrl -> ChapaRepo: remover(id)
activate ChapaRepo
ChapaRepo --> ChapasCtrl: ok
deactivate ChapaRepo
ChapasCtrl --> UI: ok
deactivate ChapasCtrl
deactivate Usuario
== Consultar detalhes ==
Usuario -> UI: selecionarChapa(id)
activate Usuario
UI -> ChapasCtrl: consultarChapa(id)
activate ChapasCtrl
ChapasCtrl -> ChapaRepo: buscarPorId(id)
activate ChapaRepo
ChapaRepo --> ChapasCtrl: chapa
deactivate ChapaRepo
ChapasCtrl --> UI: chapa
deactivate ChapasCtrl
deactivate Usuario
deactivate UI
@enduml
```

## Caso de Uso: Registrar Corte e Gerar Retalho

```plantuml
@startuml
title Caso de Uso: Registrar Corte e Gerar Retalho
actor Usuario
boundary UI as "TelaCorteUI"
control ChapasCtrl as "ChapasController"
control RetalhosCtrl as "RetalhosController"
entity ChapaRepo as "ChapaRepository"
entity RetalhoRepo as "RetalhoRepository"
activate UI
== Listar chapas disponiveis ==
Usuario -> UI: acessarTelaRegistrarCorte()
activate Usuario
UI -> ChapasCtrl: listarChapasDisponiveis()
activate ChapasCtrl
ChapasCtrl -> ChapaRepo: listarDisponiveis()
activate ChapaRepo
ChapaRepo --> ChapasCtrl: chapas[]
deactivate ChapaRepo
ChapasCtrl --> UI: chapas[]
deactivate ChapasCtrl
deactivate Usuario
== Informar corte ==
Usuario -> UI: selecionarChapaOrigem(id)
activate Usuario
Usuario -> UI: informarMedidasCorte()
UI -> UI: calcularRetalhoGerado()
deactivate Usuario
== Gravar retalho ==
Usuario -> UI: confirmarSalvarGerarQRCode()
activate Usuario
UI -> RetalhosCtrl: gravarRetalho(dados)
activate RetalhosCtrl
RetalhosCtrl -> ChapaRepo: buscarPorId(id)
activate ChapaRepo
ChapaRepo --> RetalhosCtrl: chapa
deactivate ChapaRepo
RetalhosCtrl -> RetalhoRepo: inserir(dados)
activate RetalhoRepo
RetalhoRepo --> RetalhosCtrl: retalhoGravado
deactivate RetalhoRepo
RetalhosCtrl --> UI: retalhoGravado
deactivate RetalhosCtrl
deactivate Usuario
Usuario -> UI: sairTelaCorte()
deactivate UI
@enduml
```

````
This is the description of what the code block changes:
<changeDescription>
Adiciona uma ação explícita de saída da tela para finalizar a UI no caso de corte e manter a vela de vida coerente.
</changeDescription>

