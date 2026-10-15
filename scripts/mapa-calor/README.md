# Dados do mapa de calor

Como foram gerados os arquivos de `src/data/mapaCalor/`. A tela tem dois mapas:

- **Estado de SP** — feminicídios por município (`feminicidioSP.ts`, `municipiosSP.ts`);
- **Cidade de São Paulo** — violência contra a mulher por distrito (`violenciaMulherCapital.ts`, `distritosSP.ts`).

# Mapa do estado

## Fontes

| Dado | Fonte |
|---|---|
| Vítimas de feminicídio por município, 2019 a 2023 | Ministério da Justiça e Segurança Pública — Sinesp, Validador de Dados Estatísticos (VDE). Obtido pelo pacote R [BrazilCrime 0.2.1](https://github.com/igorlaltuf/BrazilCrime), arquivo `R/sysdata.rda`, evento `Feminicídio`, coluna `total_vitimas` |
| População por município, 2019 a 2023 | Estimativas do Ministério da Saúde/RIPSA (DATASUS), compiladas em [lsbastos/popBR_mun](https://github.com/lsbastos/popBR_mun), arquivo `popBR2000-2025.long.csv` |
| Contornos dos municípios | Malha municipal do IBGE, via [tbrugz/geodata-br](https://github.com/tbrugz/geodata-br), arquivo `geojson/geojs-35-mun.json` |

## Passo a passo

1. Separar cada contorno da malha em um polígono próprio (alguns municípios do litoral vêm com ilhas gravadas como "buracos").
2. Simplificar com [mapshaper](https://mapshaper.org): `mapshaper geo.json -simplify 10% keep-shapes -o precision=0.0001 geo35_s10.json`.
3. Rodar `python3 gerar_dados.py geo35_s10.json sysdata.rda popBR2000-2025.long.csv saida.json`.
4. Converter `saida.json` nos arquivos `municipiosSP.ts` e `feminicidioSP.ts`.
5. Calcular o ponto do nome de cada município (`lx`, `ly`) com `shapely.ops.polylabel` no maior polígono do município, já na projeção do mapa. É o ponto mais "central" dentro do território, mesmo em formatos irregulares.

## Cálculo

- **Vítimas**: soma de 2019 a 2023 (5 anos, para reduzir a oscilação em municípios pequenos).
- **Taxa**: vítimas ÷ soma das populações de 2019 a 2023 × 100 mil. Resultado: média anual por 100 mil habitantes. Média do estado: 0,40.
- A taxa usa a população total, porque a base de população por município não separa por sexo.
- Quatro municípios têm grafias diferentes entre as bases e foram associados manualmente: Embu das Artes, Florínea, Mogi Mirim e São Luiz do Paraitinga.

## Limitações

- Na base do Sinesp, os registros de **estupro** de SP não têm município ("não informado"), por isso o mapa mostra apenas feminicídio.
- Dados de violência doméstica por município (lesão corporal, ameaça etc.) são publicados pela SSP-SP no portal de estatísticas e podem ser incorporados no futuro.
- 2024 está incompleto na versão 0.2.1 do pacote (só janeiro a abril), por isso o período termina em 2023.

# Mapa da cidade de São Paulo

## Fonte

| Dado | Fonte |
|---|---|
| Violência contra a mulher por distrito, ano-base 2024 | **Mapa da Desigualdade 2025**, Rede Nossa São Paulo e Instituto Cidades Sustentáveis. Lançado em 23/06/2026 — a imprensa chamou de "Mapa da Desigualdade 2026", mas a edição se chama 2025 no site oficial. Indicador "Violência contra a mulher (todas)", tema Direitos Humanos. Fontes originais: SSP-SP e Fundação Seade. Elaboração: Cézar Luquine |
| Contornos dos 96 distritos | Prefeitura de São Paulo — GeoSampa, via [codigourbano/distritos-sp](https://github.com/codigourbano/distritos-sp), simplificados com mapshaper (4% dos vértices) |

Onde está o dado: [site completo do Mapa da Desigualdade 2025](https://institutocidadessustentaveis.shinyapps.io/mapadesigualdadesaopaulo2025/) → Mapa → Mapa da desigualdade → Tema "DIREITOS HUMANOS" → Indicador "Violência contra a mulher (todas)" → aba Tabela. A planilha aberta da edição 2025 (`mapa_da_desigualdade_2025_dados.xlsx`, no site da Rede Nossa São Paulo) traz só 12 indicadores e **não** tem este; por isso a tabela foi copiada do site, sem alterar nenhum valor.

## Passo a passo

1. Copiar a tabela dos 96 distritos para `dados/mapa_desigualdade_2025_violencia_mulher.json` (junto com a descrição, a fórmula e as observações da fonte). Consultado em 14/10/2026.
2. Rodar, na raiz do projeto: `python3 scripts/mapa-calor/gerar_capital.py`.
3. O script casa cada distrito com o contorno de `distritosSP.ts` pelo nome (sem acento; a fonte escreve "Moóca") e gera `violenciaMulherCapital.ts`.

O script para com erro se algum distrito ficar sem contorno ou repetido, e confere os números publicados pela fonte: média dos distritos **212,78**, menor valor **Vila Andrade (103,35)**, maior valor **Sé (772,15)**. Também foi conferido, no próprio site, que a tabela tem 96 linhas e soma 20.427,06.

## Cálculo (feito pela fonte, não recalculado aqui)

- **Coeficiente** = número de mulheres vítimas de violência no distrito ÷ população feminina de 20 a 59 anos do distrito × 10 mil.
- **Tipos incluídos** (classificação da Lei Maria da Penha usada pela fonte): física (homicídio, tentativa de homicídio, lesão corporal, maus-tratos), psicológica (constrangimento ilegal, ameaça), moral (calúnia, difamação, injúria), sexual (estupro) e patrimonial (invasão de domicílio, dano).
- As ocorrências são contadas pelo **local do crime** (para preservar o anonimato da vítima), mas o denominador é a população **residente**. Distritos centrais, com muita circulação de pessoas (Sé, República, Pari, Brás), ficam com coeficientes mais altos.
- **Média dos distritos** (212,78) = média simples dos 96 coeficientes, como publicada.

## Faixas do mapa

Até 150 · 150 a 212,78 (média dos distritos) · 212,78 a 300 · 300 a 500 · acima de 500.

## Limitações

- Das 65.266 ocorrências únicas usadas pela fonte, **33,5% não puderam ser localizadas** por falta de informação espacial e ficaram fora do cálculo.
- O indicador junta todos os tipos de violência em um único número; não há separação por tipo.
- Violência contra a mulher é subnotificada: o mapa mostra registros, não a violência que de fato acontece. Cores claras não indicam que um distrito seja seguro.
- O mesmo site traz um indicador de feminicídio por distrito (2024), que não foi usado: em 80 dos 96 distritos o valor é zero e, com tão poucos casos em um ano, a comparação entre distritos fica instável.


# Relatório por área de delegacia (cidade de São Paulo)

Na aba **Cidade de São Paulo → Relatório por área**, a pessoa busca um distrito, bairro ou delegacia e vê, para a área da delegacia (DP) correspondente:

1. o total de mulheres vítimas e a divisão por tipo de crime;
2. a evolução de 2024 a 2026 e a comparação com a média das 93 áreas;
3. os serviços de apoio mais próximos (Delegacias da Mulher, Casa da Mulher Brasileira, Casas da Mulher, CDCMs) e os canais da cidade toda (Defensoria, 180, 190).

## Por que área de delegacia, e não distrito

A base da SSP registra, para cada caso, a **delegacia da área onde o fato aconteceu** (`NOME_DELEGACIA_CIRC`), em 98,5% dos registros da capital. Não há coluna de distrito. Latitude e longitude existem em só **36%** dos registros da capital (74.228 de 207.715; 130.440 sem coordenada), então montar o relatório por distrito a partir das coordenadas deixaria de fora quase dois terços dos casos. Por isso o relatório usa as 93 áreas de delegacia, que cobrem a cidade inteira.

As áreas de delegacia não coincidem com os distritos. A busca por distrito indica a área que cobre a maior parte dele (por exemplo, o distrito de Pirituba fica 72% na área do 87º DP), e o relatório lista os distritos que cada área cobre (`distritoParaDelegacia.ts`, calculado pela sobreposição dos contornos).

## Fontes

| Dado | Fonte |
|---|---|
| Vítimas e tipos de crime por área | SSP-SP — [base de dados Violência Contra a Mulher (dados a partir de 2024)](https://www.ssp.sp.gov.br/estatistica/violencia-contra-a-mulher), arquivo `Base_Violência contra mulher.xlsx`, aba `BASE_VD`, versão de 07/10/2026 (janeiro de 2024 a agosto de 2026) |
| Feminicídio, tentativa de homicídio e estupro (só cidade inteira) | Painel da SSP-SP, coluna Capital (`dados/ssp_painel_capital_outros_tipos.json`) |
| Contornos das 93 áreas de delegacia | Centro de Estudos da Metrópole (CEM/USP), base [Distritos e Delegacias Policiais](https://centrodametropole.fflch.usp.br/pt-br/node/9956) 2021, arquivo `DISTPOL2021_MSP_CEM_V1`, fonte original SSP-SP, DOI 10.55881/CEM.db.dpo001, CC BY 4.0 |
| Serviços de apoio | Prefeitura de São Paulo, Secretaria Municipal de Direitos Humanos e Cidadania: [Delegacias de Defesa da Mulher](https://prefeitura.sp.gov.br/web/direitos_humanos/w/mulheres/rede_de_protecao/seguranca_e_justica/357715) (29/09/2026), [Casa da Mulher e CDCM](https://prefeitura.sp.gov.br/web/direitos_humanos/mulheres/rede_de_protecao/casas_da_mulher/) (25/09 e 01/10/2026), [Defensoria/NUDEM](https://prefeitura.sp.gov.br/web/direitos_humanos/w/mulheres/rede_de_protecao/359280) |
| Localização dos serviços | OpenStreetMap (Nominatim), a partir dos endereços oficiais, em 14/10/2026 |

## Passo a passo

1. **Agregar a base da SSP** (`agregar_ssp_navegador.js`). O xlsx tem ~309 MB e cerca de 2,3 GB descompactado, com dados pessoais, endereço e coordenadas de cada caso. Para não baixar nem guardar isso, o script roda no console do navegador, na página do painel da SSP, lê o arquivo em partes, descompacta em fluxo e baixa só as contagens: `dados/ssp_violencia_mulher_capital_agregado.json`.
2. **Contornos das delegacias**: extrair `DISTPOL2021_MSP_CEM_V1` do zip do CEM, converter para GeoJSON e simplificar com mapshaper:
   `mapshaper dp.geojson -simplify 12% keep-shapes -o precision=0.00001 delegacias_cem_2021_simplificado.geojson`
3. **Serviços**: copiar os endereços oficiais para `dados/servicos_mulher_capital.json` e localizar cada endereço no OpenStreetMap. O campo `precisao` diz se foi encontrado o número (`endereco`), só a rua (`rua`) ou um ponto do bairro (`bairro`).
4. Rodar, na raiz do projeto: `python3 scripts/mapa-calor/gerar_delegacias.py CAMINHO/distritos-sp.geojson` (o GeoJSON original de [codigourbano/distritos-sp](https://github.com/codigourbano/distritos-sp)). Gera `delegaciasSP.ts`, `violenciaDelegacias.ts`, `servicosMulherSP.ts` e `distritoParaDelegacia.ts`, na mesma projeção do mapa dos distritos.

O gerador confere que os 93 números de DP são os mesmos na SSP e no CEM, e que casos nas áreas (204.648) + casos sem área (3.067) = total da capital (207.715).

## Regra de contagem

- **Capital**: `NOME_MUNICIPIO_CIRC = S.PAULO` (município do local do fato).
- **Casos por tipo**: uma linha da base por natureza (`NATUREZA_APURADA`) — a mesma contagem do painel.
- **Vítimas**: pessoas únicas (`ID_DELEGACIA` + `ANO_BO` + `NUM_BO` + `CONT_PESSOA`) no ano. Uma vítima pode ter mais de um crime no mesmo boletim, então a soma dos tipos é maior que o número de vítimas.
- **Ano**: `ANO_ESTATISTICA` (ano em que o caso entrou na estatística oficial). 2026 vai só de janeiro a agosto.
- **Violência doméstica**: segundo a nota técnica da SSP, desde 2024 a base traz lesão corporal, ameaça, injúria, dano etc. só quando o boletim os liga à violência doméstica; perseguição, violência psicológica e descumprimento de medida protetiva entram com ou sem essa ligação. O relatório usa a base como ela vem.
- **Sexo**: cerca de 0,5% dos registros têm a vítima marcada com outro sexo (M: 1.019; I: 18). Foram mantidos, como no painel.

## Conferência com o painel da SSP

Os totais da capital calculados a partir da base foram comparados, mês a mês (jan/2024 a ago/2026), com a coluna Capital do painel (`/v1/ViolenciaMulher/RecuperaDadosPorAno`):

- **Batem em todos os meses**: ameaça (58.178), calúnia/difamação/injúria (52.787), lesão corporal (43.321), descumprimento de medida protetiva (7.297), dano (6.100), invasão de domicílio (1.791), outros crimes contra a dignidade sexual (765), divulgação de fotos/vídeos íntimos (680), maus-tratos (570), constrangimento ilegal (96).
- **Diferem**: perseguição (base 33.658; painel 25.348) e violência psicológica (base 2.472; painel 2.053). De fev/2024 a jun/2026, o painel mostra para esses dois tipos só os casos marcados como violência doméstica (bate em 29 dos 32 meses); em jan/2024, jul/2026 e ago/2026, mostra todos. O relatório segue a nota técnica e a base (todos os casos).
- Feminicídio, homicídio, tentativa de homicídio e estupro **não estão na base** por delegacia; aparecem só como totais da cidade, copiados do painel.

## Privacidade

- Nada de endereço, coordenada, dado pessoal ou caso individual sai do navegador: só contagens por área, tipo e ano.
- No app, contagens de 1 a 4 aparecem como "menos de 5".
- O relatório não diz que uma área é segura ou perigosa.

## Limitações

- O mapa mostra **número** de vítimas, não taxa: não há população por área de delegacia sem estimativa.
- Os contornos do CEM são de 2021; se a SSP mudou alguma área depois, a diferença não aparece.
- 3.067 casos (1,5%) foram registrados em delegacias especializadas sem área (DDMs, Delegacia da Mulher Online etc.) e ficam só no total da cidade.
- A distância até os serviços é em linha reta, a partir do centro da área, e a localização de vários serviços é aproximada (só a rua). A Casa da Mulher Maria de Lourdes Rodrigues não foi localizada e não entra na lista dos mais próximos.
- A página da Prefeitura escreve o endereço da 2ª DDM como "Avenida Onze de julho, 89"; o OpenStreetMap registra o prédio (16º DP e 2ª DDM) na **Avenida Onze de Junho, 89**, que é o endereço usado no app.

# Busca por lugares e "usar minha localização"

## Lugares (`lugaresSP.ts`)

A busca do relatório por área acha, além de distritos e delegacias, **1.209 lugares** da capital: 555 bairros, 149 estações (metrô, trem e monotrilho), 141 parques, 14 estádios, 223 hospitais e 127 universidades. Cada lugar já vem ligado à área de delegacia em que está, então a busca funciona **sem internet**: o que a pessoa digita não sai do aparelho.

- **Fonte**: OpenStreetMap (© contribuidores do OpenStreetMap, licença ODbL), consultado pela Overpass API em 14/10/2026 (`dados/osm_lugares_capital.json`). Consulta por retângulo da capital (`-24.01,-46.83,-23.35,-46.36`): `place=suburb|neighbourhood|quarter` (só nós), `railway=station`, `leisure=park` (só nomes que começam com "Parque"), `leisure=stadium`, `amenity=hospital`, `amenity=university`, com `out center tags`.
- **Gerar**: `python3 scripts/mapa-calor/gerar_lugares.py`. O script descarta o que fica fora da cidade (1.579 itens dos municípios vizinhos), liga cada lugar à área de delegacia pelos contornos do CEM e junta repetidos (mesmo nome e tipo a menos de 1 km; estação de metrô e de trem com o mesmo nome a menos de 600 m vira "metrô e trem").
- **Apelidos**: os nomes alternativos, antigos e oficiais do OpenStreetMap (`alt_name`, `old_name`, `official_name`, `short_name`) entram na busca. Por exemplo, o estádio do Palmeiras está no OSM como **Nubank Parque**, com "Allianz Parque" e "Arena do Palmeiras" como alternativos. O script acrescenta poucos apelidos populares que não estão no OSM ("Estádio do Palmeiras", "Palestra Itália", "Estádio do Corinthians", "Itaquerão", "Estádio do São Paulo", "Estádio da Portuguesa", "Estádio do Juventus").
- Quando a pessoa escolhe um lugar, os serviços de apoio são ordenados pela distância **a partir desse lugar** (e não do centro da área).
- Limitação: só acha o que está na lista. Endereços com rua e número não são buscados, porque isso exigiria mandar o texto para um serviço de mapas externo.

## Usar minha localização

- Usa `expo-location` (Expo SDK 57): `requestForegroundPermissionsAsync` e `getCurrentPositionAsync` com precisão `Balanced`. Na web, usa a localização do navegador.
- A área é calculada no aparelho (`src/utils/areaDoPonto.ts`): a coordenada é convertida para a projeção do mapa (`PROJECAO_CAPITAL`, gerada por `gerar_delegacias.py`) e testada contra os contornos das áreas de delegacia que já vêm no app.
- A localização **não é enviada nem salva**: fica só na memória da tela enquanto o relatório está aberto. Também não é desenhada no mapa.
- Fora da cidade, sem permissão ou com erro, o app mostra um aviso e sugere a busca pelo nome.
- O texto do pedido de permissão no iOS está em `app.json` (plugin `expo-location`) e entra na próxima build do app (EAS). No Expo Go e na web, aparece o pedido padrão do sistema.

# Ícones dos serviços no mapa

Os mapas da cidade (por distrito e por área de delegacia) mostram os serviços da rede de apoio com os mesmos ícones da tela Rede de Apoio (`src/app/rede-apoio.tsx`):

| Ícone (Ionicons) | Categoria | Serviços | Fonte |
|---|---|---|---|
| `business-outline` | Delegacia da Mulher | 9 DDMs | Prefeitura de SP (SMDHC), 29/09/2026 |
| `heart-outline` | Centro de referência | Casa da Mulher Brasileira, 11 Casas da Mulher (CRCM) e 15 CDCMs | Prefeitura de SP (SMDHC), 25/09 e 01/10/2026 |
| `medkit-outline` | Saúde | 6 hospitais de referência para violência sexual e aborto legal (5 municipais e o Hospital da Mulher, estadual) | [Prefeitura de SP (SMDHC), 29/09/2026](https://prefeitura.sp.gov.br/web/direitos_humanos/w/mulheres/rede_de_protecao/saude/357170) |
| `scale-outline` | Defensoria Pública | Núcleo da Mulher (NUDEM), Atendimento Inicial Cível e 12 unidades regionais da capital | [Defensoria Pública de SP — Endereços e Telefones](https://www.defensoria.sp.def.br/institucional/enderecos-e-telefones), 15/10/2026 |

- Na Defensoria ficaram de fora as salas de fórum e as unidades criminais (júri, execução penal etc.), que não fazem atendimento ao público em geral. O atendimento é só com agendamento, e o cartão avisa isso.
- A Prefeitura informa que todas as UBS têm Núcleos de Prevenção à Violência; elas não foram colocadas no mapa (são centenas de unidades).
- A posição de cada serviço vem do OpenStreetMap a partir do endereço oficial (campo `precisao`: `endereco`, `rua` ou `bairro`). Quando não é o número exato, o cartão diz "posição no mapa aproximada".
- A Casa da Mulher Maria de Lourdes Rodrigues não foi localizada e não aparece no mapa.
- Os ícones aparecem quando o mapa está aproximado (largura visível menor que 60% da cidade) ou quando uma busca leva o mapa até uma área; na visão da cidade inteira, a legenda pede para aproximar. O lugar buscado (ou a localização atual) aparece como um pino vermelho. O pino aparece na legenda do filtro ("Lugar buscado: nome" ou "Sua localização"), só enquanto existe um lugar buscado. A etiqueta da área vai para cima ou para baixo do ponto tocado, para o lado onde não cobre o pino. Tocar no pino abre um cartão com o nome do lugar e a área de delegacia.
- A lista "Onde buscar atendimento perto daqui" do relatório continua com Delegacias da Mulher e centros de referência; hospitais e Defensoria aparecem pelos ícones.
- **Filtro**: abaixo do mapa, cada tipo é um botão que liga e desliga os ícones, com a quantidade no mapa (Delegacia da Mulher 9, Centro de referência 26, Saúde 6, Defensoria 14). O pino do lugar buscado não é afetado pelo filtro. Se o tipo do serviço aberto for desligado, o cartão fecha.
- A 1ª DDM fica dentro da Casa da Mulher Brasileira (mesmo ponto). Com os dois tipos ligados, aparece o ícone da Casa por cima; com só "Delegacia" ligado, aparece o da 1ª DDM.

