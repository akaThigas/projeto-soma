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

