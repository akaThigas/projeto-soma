# Dados do mapa de calor

Como foram gerados os arquivos de `src/data/mapaCalor/`.

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
