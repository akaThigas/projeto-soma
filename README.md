# 🦋 Projeto SOMA

**Segurança • Orientação • Monitoramento • Apoio**

O **Projeto SOMA** é uma plataforma digital desenvolvida com foco na orientação e no apoio a mulheres em situação de violência doméstica.

A proposta do projeto é facilitar o acesso a informações, canais oficiais de atendimento e serviços da rede de proteção, utilizando uma interface simples, discreta, acessível e responsiva.

> Este projeto está sendo desenvolvido como um MVP acadêmico.

---

## 📱 Sobre o projeto

Mulheres em situação de violência doméstica podem enfrentar dificuldades para identificar o tipo de violência sofrida, compreender seus direitos ou saber qual serviço procurar.

O SOMA busca reduzir essas barreiras oferecendo uma experiência centralizada de orientação.

A plataforma permite:

- conhecer diferentes tipos de violência;
- identificar sinais de situações abusivas;
- consultar canais oficiais de atendimento;
- acessar rapidamente opções de emergência;
- visualizar serviços da rede de apoio;
- consultar conteúdos educativos;
- acessar orientações sobre segurança digital;
- visualizar informações territoriais por meio do módulo de mapa;
- utilizar o aplicativo em diferentes tamanhos de tela.

O SOMA **não recebe, registra ou armazena denúncias**.

Quando necessário, a plataforma direciona o usuário para canais e serviços oficiais.

---

# 🎯 Objetivo

Criar uma plataforma mobile e web que permita orientar mulheres em situação de violência doméstica de forma:

- simples;
- segura;
- acessível;
- discreta;
- responsiva;
- centralizada.

O objetivo é reduzir a dificuldade de encontrar informações e facilitar o acesso à rede oficial de proteção.

---

# 🌎 ODS relacionadas

O projeto está relacionado principalmente aos seguintes Objetivos de Desenvolvimento Sustentável:

### ODS 5 — Igualdade de Gênero

Promover a igualdade de gênero e contribuir para o enfrentamento da violência contra mulheres.

### ODS 16 — Paz, Justiça e Instituições Eficazes

Facilitar o acesso a instituições e serviços públicos de proteção e justiça.

### ODS 10 — Redução das Desigualdades

A acessibilidade e a simplificação das informações também buscam reduzir barreiras de acesso aos serviços públicos.

---

# 🛠️ Tecnologias utilizadas

O projeto utiliza:

| Tecnologia | Utilização |
|---|---|
| TypeScript | Linguagem principal |
| React Native | Desenvolvimento da interface |
| Expo | Plataforma de desenvolvimento e build |
| Expo Router | Navegação entre telas |
| React Native Web | Execução no navegador |
| AsyncStorage | Persistência de preferências locais |
| Expo Vector Icons | Ícones da interface |
| Expo Linear Gradient | Gradientes visuais |
| React Native SVG | Desenho do mapa de calor |
| Expo Location | Botão "Usar minha localização" (só no aparelho) |
| Safe Area Context | Adaptação às áreas seguras dos dispositivos |
| EAS Build | Compilação do aplicativo Android |
| EAS Hosting | Publicação da versão Web/PWA |
| Git | Versionamento |
| GitHub | Repositório e colaboração |

Atualmente o projeto utiliza o **Expo SDK 57**.

---

# 📦 Plataformas

O SOMA foi estruturado para funcionar em múltiplas plataformas.

### Android

Disponível através de builds geradas pelo EAS Build.

```bash
npx eas-cli@latest build --platform android --profile preview
```

A configuração atual gera um **APK de distribuição interna**, permitindo instalação direta em dispositivos Android.

---

### iOS

Durante o desenvolvimento pode ser executado através do **Expo Go**.

Também é possível utilizar a versão Web/PWA instalada na Tela de Início do iPhone.

---

### Web

A aplicação pode ser exportada através de:

```bash
npx expo export --platform web
```

A versão web pode ser publicada utilizando:

```bash
npx eas-cli@latest deploy --prod
```

---

### PWA / Web App

O SOMA possui estrutura para instalação como Web App.

No iPhone:

```text
Safari
→ Compartilhar
→ Adicionar à Tela de Início
→ Abrir como App da Web
```

A estrutura da PWA está localizada em:

```text
public/
├── manifest.json
├── icon-192.png
├── icon-512.png
├── apple-touch-icon.png
└── social-share.png
```

---

# 🚀 Como executar o projeto

## Pré-requisitos

Antes de iniciar, instale:

- Node.js
- npm
- Git
- VS Code ou outra IDE
- Expo Go, caso queira testar em dispositivo físico

Versão utilizada durante o desenvolvimento:

```text
Node.js 22+
```

Verifique:

```bash
node --version
```

```bash
npm --version
```

```bash
git --version
```

---

# 📥 Clonando o projeto

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
```

Entre na pasta:

```bash
cd soma
```

Instale as dependências:

```bash
npm install
```

---

# ▶️ Executando

Inicie o Expo:

```bash
npx expo start
```

O terminal exibirá um QR Code e opções de execução.

---

## 🌐 Web

Pressione:

```text
w
```

ou execute:

```bash
npx expo start --web
```

---

## 📱 Expo Go

Abra o Expo Go no celular e escaneie o QR Code.

Se o dispositivo não conseguir acessar o servidor pela rede local:

```bash
npx expo start --tunnel
```

Para limpar o cache:

```bash
npx expo start --clear
```

ou:

```bash
npx expo start --tunnel --clear
```

---

# 📂 Estrutura do projeto

Estrutura simplificada:

```text
soma/
│
├── assets/
│   └── images/
│       ├── logo-soma.png
│       ├── icon-soma.png
│       └── adaptive-icon-soma.png
│
├── public/
│   ├── manifest.json
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── apple-touch-icon.png
│   └── social-share.png
│
├── src/
│   │
│   ├── app/
│   │   ├── conteudo/
│   │   │   └── [id].tsx
│   │   │
│   │   ├── _layout.tsx
│   │   ├── +html.tsx
│   │   ├── index.tsx
│   │   ├── onboarding.tsx
│   │   ├── home.tsx
│   │   ├── tipos-violencia.tsx
│   │   ├── denunciar.tsx
│   │   ├── rede-apoio.tsx
│   │   ├── emergencia.tsx
│   │   ├── explorar.tsx
│   │   ├── mapa.tsx
│   │   ├── mais.tsx
│   │   └── configuracoes.tsx
│   │
│   ├── components/
│   │   ├── HomeShortcutCard.tsx
│   │   ├── QuickExitButton.tsx
│   │   ├── BottomNavigation.tsx
│   │   ├── MapaInterativo.tsx
│   │   ├── MapaCalorSP.tsx
│   │   └── MapaCalorCapital.tsx
│   │
│   ├── constants/
│   │   └── theme.ts
│   │
│   ├── data/
│   │   ├── conteudos.ts
│   │   ├── canaisDenuncia.ts
│   │   ├── servicosApoio.ts
│   │   └── tiposViolencia.ts
│   │
│   └── hooks/
│       └── useResponsiveLayout.ts
│
├── app.json
├── eas.json
├── package.json
├── package-lock.json
└── README.md
```

---

# 🧭 Navegação

A navegação é feita através do **Expo Router**.

Cada arquivo dentro de:

```text
src/app/
```

representa uma rota.

Exemplo:

```text
src/app/home.tsx
```

gera:

```text
/home
```

Enquanto:

```text
src/app/emergencia.tsx
```

gera:

```text
/emergencia
```

---

# 📄 Rotas dinâmicas

Os conteúdos educativos utilizam uma rota dinâmica.

Arquivo:

```text
src/app/conteudo/[id].tsx
```

Exemplos:

```text
/conteudo/seguranca-digital
/conteudo/medida-protetiva
/conteudo/ajudar-outra-pessoa
```

Os conteúdos são definidos em:

```text
src/data/conteudos.ts
```

Isso evita a criação de uma página diferente para cada conteúdo.

---

# 📱 Telas implementadas

Atualmente estão disponíveis:

### Splash Screen

Tela inicial com identidade visual do SOMA.

Existe também uma splash nativa configurada através do:

```text
expo-splash-screen
```

Isso permite que a identidade visual seja exibida antes mesmo do carregamento completo do React Native.

---

### Onboarding

Apresentação inicial das principais funcionalidades.

Possui a opção:

```text
Não mostrar esta tela novamente
```

A preferência é armazenada localmente através de:

```text
AsyncStorage
```

Chave utilizada:

```text
@soma:hide-onboarding
```

---

### Home

Tela principal da aplicação.

Contém atalhos para:

- Tipos de Violência;
- Como denunciar;
- Mapa;
- Rede de Apoio;
- Emergência;
- Mais.

O botão **Emergência** possui destaque visual próprio.

---

### Tipos de Violência

Apresenta informações sobre:

- violência física;
- violência psicológica;
- violência sexual;
- violência patrimonial;
- violência moral;
- violência vicária.

---

### Como buscar ajuda

Centraliza diferentes canais de atendimento.

Entre os canais demonstrados estão:

- Ligue 180;
- Polícia Militar — 190;
- Delegacia da Mulher;
- canais digitais de denúncia;
- rede de apoio.

O SOMA apenas direciona o usuário para esses canais.

---

### Emergência

Tela simplificada destinada a situações de risco imediato.

Permite abrir diretamente a chamada para:

```text
190
```

O SOMA não realiza despacho policial nem envia pedidos de socorro.

---

### Saída rápida

Botão **Sair**, fixo no canto superior direito de todas as telas (exceto a splash).

Serve para esconder o SOMA imediatamente caso outra pessoa se aproxime.

Ao ser acionado, o SOMA é substituído por uma página neutra (pesquisa de previsão do tempo):

| Plataforma | Comportamento |
|---|---|
| Web / PWA | Abre a página neutra em uma nova aba e substitui a aba atual por ela |
| Web / PWA | Atalho pelo teclado: tecla **Esc** |
| Android | Volta o app para a Home, abre a página neutra no navegador e fecha o app |
| iOS | Volta o app para a Home e abre a página neutra no navegador |

Arquivos:

```text
src/components/QuickExitButton.tsx   → botão e atalho Esc
src/utils/quickExit.ts               → lógica de saída e URL neutra
```

A página neutra pode ser alterada na constante `QUICK_EXIT_URL`.

Limitação: a saída rápida não apaga o histórico do navegador. Orientações sobre como limpar o histórico podem ser incluídas nos conteúdos de segurança digital.

---

### Menu inferior

Menu fixo na parte de baixo de todas as telas (exceto a splash e o onboarding), com **Home**, **Explorar**, **Mapa** e **Canais**. O item da tela atual fica destacado; os conteúdos educativos (`/conteudo/...`) destacam **Explorar**.

O menu fica fora da área de rolagem: o conteúdo de cada tela rola acima dele, sem ficar escondido.

Arquivos:

```text
src/components/BottomNavigation.tsx   → menu inferior
src/app/_layout.tsx                   → exibe o menu abaixo das telas
```

---

### Rede de Apoio

Apresenta serviços de:

- delegacia;
- defensoria;
- centros de apoio;
- saúde;
- acolhimento.

A versão atual utiliza alguns dados demonstrativos.

---

### Explorar

Central de conteúdos educativos.

Possui:

- pesquisa;
- conteúdos por categoria;
- navegação para artigos;
- acesso aos canais de ajuda.

---

### Mais

Centraliza funcionalidades secundárias do aplicativo.

Contém:

- segurança digital;
- orientação para ajudar outra pessoa;
- tipos de violência;
- rede de apoio;
- configurações;
- informações sobre o SOMA;
- informações de privacidade.

---

### Configurações

Tela destinada às preferências do aplicativo.

Atualmente implementado:

- visualizar novamente o onboarding;
- mostrar onboarding na próxima abertura;
- limpar preferências locais.

Funcionalidades previstas:

- tamanho de texto;
- alto contraste;
- notificações discretas;
- modo discreto.

---

### Mapa

Tela do **Mapa de Calor do SOMA** (detalhes na seção abaixo).

Também mantém o atalho para buscar Delegacias da Mulher no Google Maps e o acesso à Rede de Apoio.

---

# 🗺️ Mapa de Calor

A tela tem dois mapas, escolhidos no topo: **Estado de SP** e **Cidade de São Paulo**. Os dois usam apenas **dados públicos e agregados** e o mesmo componente de mapa (`MapaInterativo`).

## Estado de SP

Mostra as **vítimas de feminicídio por município do Estado de São Paulo, de 2019 a 2023**.

- mapa dos 645 municípios paulistas, colorido em cinco faixas;
- dois modos: **taxa por 100 mil habitantes** (média anual) e **número de vítimas**;
- toque em um município para ver vítimas, taxa, população e comparação com a média do estado (0,40);
- busca de município pelo nome, com aproximação no mapa;
- visão do estado inteiro ou da capital e região;
- lista dos municípios com mais vítimas;
- explicação de como ler o mapa e as fontes dos dados.

| Dado | Fonte |
|---|---|
| Feminicídios por município | Ministério da Justiça e Segurança Pública — Sinesp VDE (via pacote BrazilCrime 0.2.1) |
| População por município | Estimativas do Ministério da Saúde/RIPSA (DATASUS) |
| Contornos dos municípios | Malha municipal do IBGE (simplificada) |

## Cidade de São Paulo

Mostra **mulheres vítimas de violência por distrito do Município de São Paulo, em 2024**, somando todos os tipos de violência registrados (física, psicológica, moral, sexual e patrimonial — de ameaça e lesão corporal a estupro e feminicídio).

- mapa dos 96 distritos, colorido em cinco faixas (uma delas marca a média dos distritos, 212,78);
- toque em um distrito para ver o nome e o coeficiente; o cartão mostra subprefeitura, coeficiente, posição entre os 96 distritos e comparação com a média;
- busca de distrito pelo nome, com aproximação no mapa;
- visão da cidade inteira ou do centro;
- lista dos distritos com os maiores coeficientes;
- notas de leitura (subnotificação, contagem pelo local do crime, ocorrências sem localização) e fontes na tela.

| Dado | Fonte |
|---|---|
| Violência contra a mulher por distrito (ano-base 2024) | Mapa da Desigualdade 2025 — Rede Nossa São Paulo e Instituto Cidades Sustentáveis, lançado em junho de 2026 (na imprensa, "Mapa da Desigualdade 2026"). Fontes originais: SSP-SP e Fundação Seade |
| Contornos dos distritos | Prefeitura de São Paulo — GeoSampa (simplificados) |

**Cálculo (feito pela fonte):** número de mulheres vítimas de violência no distrito ÷ população feminina de 20 a 59 anos do distrito × 10 mil. As ocorrências são contadas pelo distrito onde o crime aconteceu. Os valores são os publicados, sem recálculo; o script confere a média (212,78), o menor valor (Vila Andrade, 103,35) e o maior (Sé, 772,15).

### Relatório por área (Cidade de São Paulo)

Na aba **Cidade de São Paulo**, o botão **Relatório por área** mostra os dados da própria SSP-SP por **área de delegacia** (93 áreas que cobrem a cidade inteira), de janeiro de 2024 a agosto de 2026.

- busca por bairro, distrito, estação de metrô ou trem, parque, estádio, hospital, universidade ou número da delegacia, com nomes alternativos (por exemplo, "estádio do Palmeiras" acha o Nubank Parque, antigo Allianz Parque); um distrito aponta para a área que cobre a maior parte dele;
- botão **Usar minha localização**: o app descobre a área no próprio aparelho, sem enviar nem salvar a localização;
- **ícones dos serviços no mapa**, com os mesmos ícones da Rede de Apoio: Delegacias da Mulher, centros de referência (Casa da Mulher Brasileira, Casas da Mulher e CDCMs), hospitais de referência para violência sexual e unidades da Defensoria Pública. Os ícones aparecem quando o mapa é aproximado ou depois de uma busca (com um pino vermelho no lugar buscado); tocar em um ícone mostra endereço, horário e telefone. Abaixo do mapa, o filtro **Mostrar no mapa** liga e desliga cada tipo (com a quantidade de cada um) e tem a opção de mostrar ou esconder todos. O pino vermelho também entra na legenda ("Lugar buscado: nome" ou "Sua localização"), a etiqueta da área se afasta do pino para não cobri-lo e tocar no pino mostra o nome do lugar e a área de delegacia em que ele fica. Também valem para o mapa por distrito;
- mapa das áreas, colorido pelo número de mulheres vítimas em 2025;
- relatório da área: **total de mulheres vítimas e crimes por tipo** (ameaça, lesão corporal, injúria, perseguição, descumprimento de medida protetiva etc.), **evolução** de 2024 a 2026 e **comparação com a média** das 93 áreas;
- **onde buscar atendimento perto dali**: os três serviços mais próximos (Delegacias da Mulher, Casa da Mulher Brasileira, Casas da Mulher, CDCMs), com endereço, horário e telefone, além dos serviços 24 horas, da Defensoria Pública e dos telefones 180 e 190;
- aviso dentro de cada relatório: estupro, feminicídio e tentativa de homicídio não aparecem na lista da área porque a SSP não publica esses números por delegacia; o aviso mostra os totais da cidade no ano escolhido;
- notas de leitura e fontes na tela.

O relatório **não diz se um lugar é seguro ou perigoso**: mostra boletins registrados, com as ressalvas (subnotificação, contagem pelo local do fato, número de vítimas e não taxa). Contagens de 1 a 4 aparecem como "menos de 5".

| Dado | Fonte |
|---|---|
| Vítimas e tipos de crime por área | SSP-SP — base de dados Violência Contra a Mulher (dados a partir de 2024), conferida mês a mês com o painel da SSP |
| Áreas das delegacias | CEM/USP — Distritos e Delegacias Policiais 2021 (fonte original SSP-SP) |
| Serviços de apoio | Prefeitura de São Paulo — Secretaria Municipal de Direitos Humanos e Cidadania |
| Lugares da busca | OpenStreetMap (© contribuidores do OpenStreetMap, licença ODbL) |

O passo a passo, os cálculos e as limitações dos dois mapas estão em `scripts/mapa-calor/README.md`.

Arquivos:

```text
src/app/mapa.tsx                              → tela (alternância Estado / Cidade)
src/components/MapaInterativo.tsx            → mapa genérico: zoom, arraste, pinça e etiqueta ao tocar
src/components/MapaCalorSP.tsx               → mapa do estado (municípios)
src/components/MapaCalorCapital.tsx          → mapa da cidade (distritos)
src/components/MapaCalorDelegacias.tsx       → mapa das áreas de delegacia, busca e serviços próximos
src/components/PainelDelegacias.tsx          → relatório por área
src/components/ServicosNoMapa.tsx            → ícones dos serviços no mapa, legenda e cartão
src/data/mapaCalor/feminicidioSP.ts           → números por município e fontes
src/data/mapaCalor/municipiosSP.ts            → contornos dos municípios
src/data/mapaCalor/violenciaMulherCapital.ts  → números por distrito e fontes
src/data/mapaCalor/distritosSP.ts             → contornos dos distritos
src/data/mapaCalor/delegaciasSP.ts            → contornos das áreas de delegacia
src/data/mapaCalor/violenciaDelegacias.ts     → números da SSP por área, ano e tipo
src/data/mapaCalor/servicosMulherSP.ts        → serviços de apoio (delegacias, centros, saúde e Defensoria)
src/data/mapaCalor/distritoParaDelegacia.ts   → distritos × áreas de delegacia
src/data/mapaCalor/lugaresSP.ts               → lugares conhecidos para a busca (OpenStreetMap)
src/utils/areaDoPonto.ts                      → descobre a área de delegacia de uma coordenada, no aparelho
scripts/mapa-calor/                           → scripts, dados de origem e documentação
```

### Princípios

O mapa não:

- apresenta localização individual de vítimas;
- exibe endereços específicos de ocorrências;
- utiliza relatos de usuários como pontos públicos;
- indica que uma região é individualmente segura ou perigosa.

Os nomes das áreas não ficam escritos sobre o mapa: aparecem só na etiqueta, ao tocar. A etiqueta tem um botão **×** para fechá-la sem fechar o relatório; ela volta ao tocar de novo em uma área. Vale para o mapa do estado e para os da cidade.

### Limitações e próximos passos

- Estado: na base do Sinesp, os registros de estupro de SP não têm município, por isso o mapa do estado mostra apenas feminicídio.
- Cidade: o indicador do Mapa da Desigualdade junta todos os tipos de violência em um único número; a separação por tipo está no relatório por área (dados da SSP).
- Cidade: 33,5% das ocorrências usadas pela fonte não tinham localização e ficaram de fora.
- Relatório por área: feminicídio e estupro não vêm por delegacia na base da SSP; aparecem só como totais da cidade.
- Também poderá exibir os serviços da rede de apoio.

---

# 📐 Responsividade

A aplicação possui uma estrutura de responsividade centralizada em:

```text
src/hooks/useResponsiveLayout.ts
```

Os principais breakpoints utilizados são:

```text
< 350px
Celulares extremamente compactos

< 390px
Celulares compactos

390px – 767px
Celulares

768px – 1179px
Tablets

>= 1180px
Desktop
```

A interface utiliza principalmente:

```text
flex
flexWrap
width: 100%
maxWidth
minHeight
useWindowDimensions
```

em vez de depender exclusivamente de dimensões fixas.

---

# 📱 Safe Area

O projeto utiliza:

```text
react-native-safe-area-context
```

Isso permite respeitar áreas ocupadas por elementos do sistema operacional.

Exemplos:

### Android com navegação por botões

```text
SOMA
─────────────
Menu do SOMA
─────────────
◀   ●   ■
```

### Android com gestos

```text
SOMA
─────────────
Menu do SOMA
      ─
```

### iPhone

Também é respeitada a área do indicador Home.

Dessa forma não é necessário detectar manualmente se o usuário utiliza gestos ou botões de navegação.

---

# 🎨 Identidade visual

Paleta principal:

```text
Roxo principal
#3D1E45

Roxo escuro
#28152F

Rosa
#CF879E

Rosa claro
#E8C8CA

Lavanda
#BBA8CC

Fundo
#FFFDF1
```

As cores estão centralizadas em:

```text
src/constants/theme.ts
```

---

# 🦋 Identidade do aplicativo

Os principais assets estão em:

```text
assets/images/
```

### Logo

```text
logo-soma.png
```

Utilizada dentro do aplicativo e na Splash Screen.

### Ícone padrão

```text
icon-soma.png
```

### Adaptive Icon Android

```text
adaptive-icon-soma.png
```

O Adaptive Icon permite que launchers Android apliquem diferentes formatos ao ícone sem cortar a identidade principal.

---

# 💾 Persistência local

Preferências simples são armazenadas utilizando:

```text
@react-native-async-storage/async-storage
```

Atualmente é utilizado principalmente para controlar a exibição do onboarding.

Nenhum banco de dados foi implementado nesta etapa.

---

# 🗄️ Backend

O MVP atual **não possui backend**.

Dados utilizados nas telas são armazenados localmente em arquivos TypeScript.

Exemplo:

```text
src/data/
```

Uma futura evolução poderá utilizar:

```text
Node.js
TypeScript
API REST
PostgreSQL
```

caso seja necessário persistir conteúdos ou integrar fontes externas.

---

# 🔐 Privacidade

O SOMA foi pensado para minimizar a coleta de informações sensíveis.

Entre os princípios do projeto estão:

- evitar armazenamento desnecessário de dados pessoais;
- evitar armazenamento de denúncias;
- utilizar canais oficiais;
- reduzir rastros desnecessários;
- priorizar segurança e discrição;
- fornecer informações claras antes de redirecionamentos.

---

# ♿ Acessibilidade

O projeto considera requisitos como:

- linguagem simples;
- botões com áreas de toque adequadas;
- textos legíveis;
- contraste;
- navegação simplificada;
- interface responsiva;
- compatibilidade futura com ajustes de fonte;
- modo de alto contraste planejado.

---

# 🌐 Build Web

Para gerar a versão web:

```bash
npx expo export --platform web
```

O resultado será criado em:

```text
dist/
```

Para publicar através do EAS Hosting:

```bash
npx eas-cli@latest deploy --prod
```

---

# 🤖 Build Android

O projeto utiliza EAS Build.

Arquivo:

```text
eas.json
```

Para gerar um APK de preview:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Esse APK pode ser instalado diretamente em dispositivos Android.

---

# 📲 Atualizações

Existem diferentes tipos de atualização.

### Web / PWA

Alterações podem ser publicadas utilizando:

```bash
npx expo export --platform web
npx eas-cli@latest deploy --prod
```

A URL de produção permanece a mesma.

### Android

Mudanças que afetam o código nativo podem exigir uma nova build.

```bash
npx eas-cli@latest build --platform android --profile preview
```

O uso de **EAS Update** poderá ser configurado futuramente para atualizações compatíveis sem necessidade de gerar um novo APK.

---

# 🌿 Estratégia de branches

A branch:

```text
main
```

deve conter a versão estável do projeto.

Não desenvolver diretamente na `main`.

Antes de iniciar uma funcionalidade:

```bash
git checkout main
```

Atualize:

```bash
git pull origin main
```

Crie uma branch:

```bash
git checkout -b feat/nome-da-funcionalidade
```

Exemplo:

```bash
git checkout -b feat/mapa-calor
```

---

# 💾 Commit

Depois de desenvolver:

```bash
git status
```

```bash
git add .
```

```bash
git commit -m "feat: implementa funcionalidade"
```

Primeiro push da branch:

```bash
git push -u origin feat/nome-da-funcionalidade
```

Depois abra um **Pull Request** no GitHub:

```text
feat/nome-da-funcionalidade
              ↓
             main
```

---

# 📝 Padrão de commits

Preferencialmente utilizar mensagens simples seguindo Conventional Commits.

### Nova funcionalidade

```bash
git commit -m "feat: implementa mapa de calor"
```

### Correção

```bash
git commit -m "fix: corrige responsividade da home"
```

### Refatoração

```bash
git commit -m "refactor: reorganiza componentes"
```

### Documentação

```bash
git commit -m "docs: atualiza README"
```

### Estilo

```bash
git commit -m "style: ajusta espaçamento dos cards"
```

---

# 🔄 Mantendo sua branch atualizada

Enquanto estiver desenvolvendo, outras alterações podem entrar na `main`.

Atualize primeiro:

```bash
git checkout main
git pull origin main
```

Depois retorne à sua branch:

```bash
git checkout feat/minha-feature
```

E integre a versão atual da main conforme a estratégia definida pelo grupo.

---

# 🧪 Testes recomendados

Antes de abrir um Pull Request, testar:

### Web

Viewports recomendados:

```text
320px
360px
390px
430px
768px
1024px
1366px
1920px
```

### Mobile

Quando possível:

- Android com navegação por gestos;
- Android com navegação por botões;
- iPhone;
- dispositivo com tela menor;
- dispositivo com tela maior.

### Fluxos

Validar pelo menos:

```text
Splash
→ Onboarding
→ Home
→ Tipos de Violência

Home
→ Como denunciar

Home
→ Emergência

Home
→ Rede de Apoio

Home
→ Explorar
→ Conteúdo

Home
→ Mais
→ Configurações

Home
→ Mapa
```

---

# ⚠️ Dados demonstrativos

Algumas informações presentes no MVP são utilizadas apenas para demonstração da experiência.

Isso inclui principalmente:

- serviços exibidos na Rede de Apoio;
- conteúdos territoriais.

Esses dados deverão ser substituídos ou validados antes de qualquer utilização fora do contexto do protótipo.

---

# 🔮 Roadmap

Próximas evoluções previstas:

- [x] Implementação do mapa de calor;
- [x] integração com fontes públicas de dados;
- [x] visualização territorial por distrito (cidade de São Paulo);
- [x] serviços oficiais próximos no relatório por área;
- [ ] melhoria da rede de apoio;
- [ ] validação de dados de atendimento;
- [ ] modo discreto;
- [ ] alto contraste;
- [ ] ajuste de tamanho de texto;
- [ ] revisão de acessibilidade;
- [ ] melhorias de segurança digital;
- [ ] configuração de EAS Update;
- [ ] refinamento da PWA;
- [ ] revisão geral de conteúdos;
- [ ] testes com diferentes dispositivos.

---

# 🚨 Aviso importante

O Projeto SOMA é uma plataforma de orientação.

Ele **não substitui serviços policiais, jurídicos, médicos ou de emergência**.

Em situações de perigo imediato, devem ser utilizados os canais oficiais de emergência.

No Brasil:

```text
Polícia Militar
190
```

Para orientação e atendimento à mulher:

```text
Ligue 180
```

---

# 👥 Equipe

Projeto desenvolvido como atividade acadêmica.

Os integrantes da equipe podem ser adicionados nesta seção:

```text
Nome — função / área
Nome — função / área
Nome — função / área
```

---

# 📌 Status

```text
🟢 MVP navegável
🟢 Android
🟢 Web
🟢 PWA
🟢 Responsividade inicial
🟢 Mapa de calor (estado e cidade de São Paulo)
```

---

# 🦋 SOMA

> **Segurança, Orientação, Monitoramento e Apoio**

Tecnologia utilizada como instrumento para facilitar o acesso à informação, orientação e rede de proteção.