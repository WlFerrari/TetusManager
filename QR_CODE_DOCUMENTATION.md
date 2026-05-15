# 📱 QR Code - Geração e Visualização

## ✅ Implementação Concluída

A funcionalidade de geração e visualização de QR codes foi implementada com sucesso no sistema TetusManager.

## 🎯 Características

### 1. **Componente QRCodeModal**
- Localização: `frontend/src/views/components/QRCodeModal.jsx`
- Componente reutilizável para exibir QR codes em um modal
- Suporta chapas e retalhos

### 2. **Funcionalidades do Modal**
- ✅ Gera QR code com dados do item (ID, Nome, Tipo, Status, Dimensões)
- ✅ **Download**: Baixar imagem PNG do QR code
- ✅ **Impressão**: Imprimir QR code com informações do item
- ✅ **Fechamento**: Botão para fechar o modal
- ✅ **Design responsivo**: Modal centralizado com backdrop escuro

### 3. **Integração nas Pages**

#### ChapasPage
- Botão "QR" adicionado aos cards de chapas
- Atalho rápido entre os botões "Ver", "Editar" e "Deletar"
- Cor roxa (#7c3aed) para destacar a ação

#### RetalhosPage
- Botão "QR" adicionado à lista de retalhos
- Mesmo padrão de design e comportamento
- Integrado seamlessly com outros botões de ação

## 🔧 Tecnologias Utilizadas

| Biblioteca | Versão | Propósito |
|-----------|--------|----------|
| `qrcode.react` | ^1.0.1 | Gerar e renderizar QR codes |
| `html2canvas` | ^1.4.1 | Capturar elementos para download em PNG |

### Instalação
```bash
npm install qrcode.react html2canvas
```

## 📊 Dados Codificados no QR Code

### Chapas
```
CHAPA|ID:123|Nome:Preto São Gabriel|Tipo:Granito|Status:Disponível|Dimensões:300x200x2mm
```

### Retalhos
```
RETALHO|ID:456|Nome:Retalho A|Tipo:Granito|Status:Disponível|Dimensões:100x50x2mm|Origem:Chapa 123
```

## 🎨 Design

- **Modal**: Fundo branco com sombra suave, 420px max-width
- **Cores**:
  - Botão Baixar: Azul (#3b82f6)
  - Botão Imprimir: Cinza (#e5e7eb)
  - Botão Fechar: Cinza claro (#f3f4f6)
- **QR Code**: Tamanho 256x256, nível HIGH de correção de erro

## 💻 Como Usar

### 1. **Gerar QR Code**
- Navegar para "Chapas Brutas" ou "Retalhos"
- Clicar no botão "QR" no card/linha do item
- O modal abrirá com o QR code gerado

### 2. **Baixar QR Code**
- Clique no botão "Baixar" (ícone de download)
- Uma imagem PNG será salva no seu dispositivo
- Nomeada como: `qrcode-{tipo}-{id}-{timestamp}.png`

### 3. **Imprimir QR Code**
- Clique no botão "Imprimir"
- Uma janela de impressão abrirá
- Customize as opções de impressão e print

### 4. **Fechar Modal**
- Clique no botão "Fechar"
- Ou clique fora do modal (no backdrop)
- Ou clique no "X" no canto superior direito

## 🔄 Fluxo de Dados

```
ChapasPage / RetalhosPage
    ↓
Clique em botão "QR"
    ↓
setQrCodeItem(item)
    ↓
QRCodeModal renderiza
    ↓
Gera dados e cria QR code
    ↓
User: Download / Imprimir / Fechar
```

## 📦 Arquivos Modificados

1. **frontend/package.json**
   - Adicionadas dependências: `qrcode.react` e `html2canvas`

2. **frontend/src/views/components/QRCodeModal.jsx** (NOVO)
   - Componente principal do QR code

3. **frontend/src/views/pages/ChapasPage.jsx**
   - Importação do QRCodeModal
   - Estado `qrCodeItem`
   - Botão "QR" nos cards
   - Renderização do modal

4. **frontend/src/views/pages/RetalhosPage.jsx**
   - Importação do QRCodeModal
   - Estado `qrCodeItem`
   - Botão "QR" na lista
   - Renderização do modal

## 🚀 Próximas Melhorias (Sugestões)

- [ ] Adicionar QR code em relatórios impressos
- [ ] Gerar rótulos em lote com QR codes
- [ ] Integração com scanner de QR codes (leitura)
- [ ] Adicionar logo personalizado ao QR code
- [ ] Histórico de QR codes gerados
- [ ] Customização de tamanho e cores do QR code

## ⚠️ Observações

- O QR code codifica até ~2953 bytes de dados
- Para os dados atuais (ID, Nome, Tipo, etc.), não há limite de tamanho
- A qualidade de impressão depende da configuração da impressora
- O download funciona em navegadores modernos (Chrome, Firefox, Safari, Edge)

---

**Última atualização**: 09 de Maio de 2026
**Status**: ✅ Funcional e Pronto para Uso
