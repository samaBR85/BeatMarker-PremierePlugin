# Instalação — BeatMarker

Guia passo a passo para instalar o BeatMarker no Adobe Premiere Pro.

## Requisitos

- **Adobe Premiere Pro 25.0** ou superior (Creative Cloud 2025+)
- **Windows 10/11** ou **macOS** — o mesmo arquivo `.ccx` funciona nos dois sistemas
- Arquivo de áudio em formato **WAV** (qualquer sample rate, 8/16/24/32 bits)

> 💡 **Ainda na versão antiga do Premiere?** Atualize pelo Adobe Creative Cloud Desktop antes de prosseguir. Verifique sua versão em **Help → About Premiere Pro**.

## Passo a passo

### 1. Baixe o plugin

Acesse a [página de Releases](https://github.com/samaBR85/BeatMarker-PremierePlugin/releases) e baixe o arquivo `.ccx` da versão mais recente.

### 2. Feche o Premiere Pro

Se ele estiver aberto, feche completamente antes de instalar. Isso evita conflitos durante a instalação.

### 3. Instale o plugin

**Forma mais simples — duplo clique:**

Dê duplo clique no arquivo `.ccx` baixado. O **Creative Cloud Desktop** abre automaticamente e pergunta se deseja instalar. Confirme e aguarde a mensagem de sucesso.

**Forma alternativa — pelo Creative Cloud Desktop:**

- Abra o **Adobe Creative Cloud Desktop**
- Vá em **Stock e Marketplace** → **Plugins** → **Gerenciar plugins**
- Clique em **"Instalar plugin do arquivo"** e selecione o `.ccx` baixado

### 4. Abra o Premiere Pro

Inicie o Premiere normalmente.

### 5. Abra o painel do BeatMarker

No menu superior: **Window (Janela)** → **Extensions (Extensões)** → **BeatMarker**

O painel pode ser encaixado em qualquer posição da interface, como qualquer outro painel do Premiere. A interface detecta automaticamente o idioma do sistema (português ou inglês).

## Como usar

1. Importe seu arquivo **WAV** no painel de mídia do Premiere
2. Selecione o clipe de áudio no Project panel
3. No painel do BeatMarker, clique em **"Analisar clipe"**
4. Aguarde a análise — os markers coloridos aparecerão no clipe fonte:
   - 🔴 **Vermelho** — batida 1 (início do compasso)
   - 🔵 **Azul** — batidas 2 e 4
   - 🟡 **Amarelo** — batida 3
5. Dê play e confira se o "1" caiu no tempo certo. Se não, use os botões **◀ ▶** para ajustar a fase sem precisar refazer a análise
6. Para limpar, clique em **"Remover markers"** — só os markers do BeatMarker são removidos, seus markers manuais ficam intactos

## Desinstalação

- Abra o **Adobe Creative Cloud Desktop**
- Vá em **Stock e Marketplace** → **Plugins** → **Gerenciar plugins**
- Localize **BeatMarker** na lista e clique em **Desinstalar**

## Problemas comuns

**"O plugin não aparece em Window → Extensions"**
Reinicie o Premiere após a instalação. Se persistir, confirme em **Help → About Premiere Pro** se sua versão é 25.0 ou superior.

**"Não consigo analisar meu arquivo MP3"**
Esta versão suporta apenas arquivos **WAV**. Para converter um MP3 para WAV, use o próprio Premiere: **File → Export → Media**, escolha formato WAV, exporte, e importe o resultado.

**"A batida 1 está no tempo errado"**
Use os botões **◀ ▶** no painel para ajustar a fase. Cada clique desloca a numeração em uma batida — o ajuste é instantâneo, sem precisar reanalisar o áudio.

**"A análise está demorando muito"**
Arquivos longos (músicas inteiras) podem levar alguns segundos para processar. A interface fica bloqueada durante a análise — isso é normal. Um WAV de 3–4 minutos geralmente termina em menos de 30 segundos.

**"O arquivo .ccx não abre ao dar duplo clique"**
Confirme que o Creative Cloud Desktop está instalado e atualizado. Se ainda não funcionar, use a forma alternativa de instalação pelo próprio Creative Cloud.

## Suporte

Encontrou um problema ou tem sugestões? Abra uma [Issue](https://github.com/samaBR85/BeatMarker-PremierePlugin/issues) incluindo:

- Sistema operacional (Windows ou macOS + versão)
- Versão do Premiere Pro
- Versão do BeatMarker
- Descrição do problema e passos para reproduzir
