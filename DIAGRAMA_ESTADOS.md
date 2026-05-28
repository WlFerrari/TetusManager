# Diagramas de Estado (PlantUML)

## Versao 1 — Chapa (inclui corte/retalho como transicao)

```plantuml
@startuml
title Diagrama de Estados — Chapa
[*] --> Disponivel

Disponivel --> EmCorte : registrarCorte()
EmCorte --> Disponivel : corteParcial()
EmCorte --> Inativa : chapaEsgotada()

Disponivel --> Inativa : excluirChapa()
Inativa --> Disponivel : reativarChapa()

state Disponivel {
  [*] --> Listada
  Listada --> Selecionada : consultarDetalhes()
  Selecionada --> Listada : voltarLista()
}

@enduml
```

## Versao 2 — Retalho (gerado a partir da chapa)

```plantuml
@startuml
title Diagrama de Estados — Retalho
[*] --> NaoExiste

NaoExiste --> Disponivel : gerarRetalho()
Disponivel --> Reservado : reservarRetalho()
Reservado --> Disponivel : cancelarReserva()
Disponivel --> Consumido : consumirRetalho()
Reservado --> Consumido : consumirRetalho()

Consumido --> [*]

@enduml
```

## Versao 3 — Unificado (Chapa + Retalho em um unico diagrama)

```plantuml
@startuml
title Diagrama de Estados — Chapa e Retalho

state Chapa {
  [*] --> Chapa_Disponivel
  Chapa_Disponivel --> Chapa_EmCorte : registrarCorte()
  Chapa_EmCorte --> Chapa_Disponivel : corteParcial()
  Chapa_EmCorte --> Chapa_Inativa : chapaEsgotada()
  Chapa_Disponivel --> Chapa_Inativa : excluirChapa()
  Chapa_Inativa --> Chapa_Disponivel : reativarChapa()
}

state Retalho {
  [*] --> Retalho_NaoExiste
  Retalho_NaoExiste --> Retalho_Disponivel : gerarRetalho()
  Retalho_Disponivel --> Retalho_Reservado : reservarRetalho()
  Retalho_Reservado --> Retalho_Disponivel : cancelarReserva()
  Retalho_Disponivel --> Retalho_Consumido : consumirRetalho()
  Retalho_Reservado --> Retalho_Consumido : consumirRetalho()
  Retalho_Consumido --> [*]
}

Chapa_EmCorte --> Retalho_NaoExiste : iniciarCorte()
Chapa_EmCorte --> Retalho_Disponivel : retalhoGerado()

@enduml
```
