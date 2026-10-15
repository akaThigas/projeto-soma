"""Gera os dados do relatório por área de delegacia da cidade de São Paulo.

Saídas (em src/data/mapaCalor/):
- delegaciasSP.ts           contornos das 93 áreas de delegacia (DP), na mesma
                            projeção do mapa dos distritos
- violenciaDelegacias.ts    números da SSP por área, ano e tipo de crime
- servicosMulherSP.ts       serviços de apoio (Prefeitura), com localização aproximada
- distritoParaDelegacia.ts  quais áreas de delegacia cobrem cada distrito

Uso (na raiz do projeto):
    python3 scripts/mapa-calor/gerar_delegacias.py CAMINHO/distritos-sp.geojson

O arquivo de distritos é o original de github.com/codigourbano/distritos-sp
(o mesmo usado em distritosSP.ts). Precisa de: pip install shapely
"""

import json
import math
import sys
from pathlib import Path

from shapely.geometry import shape
from shapely.ops import polylabel, unary_union

RAIZ = Path(__file__).resolve().parents[2]
DADOS = RAIZ / 'scripts/mapa-calor/dados'
SAIDA = RAIZ / 'src/data/mapaCalor'

# Projeção do mapa da capital (a mesma de distritosSP.ts): equirretangular,
# com o eixo x corrigido pelo cosseno da latitude média.
LON0 = -46.82625158715326
LON1 = -46.36509960037899
LAT0 = -24.008125453473752
LAT1 = -23.356585227755446
LARGURA = 600
KX = LARGURA / (LON1 - LON0)
KY = KX / math.cos(math.radians((LAT0 + LAT1) / 2))
ALTURA = round((LAT1 - LAT0) * KY, 1)


def proj(lon, lat):
    return ((lon - LON0) * KX, (LAT1 - lat) * KY)


def caminho(geom):
    polys = [geom] if geom.geom_type == 'Polygon' else list(geom.geoms)
    partes = []
    for p in polys:
        for anel in [p.exterior, *p.interiors]:
            pts = [proj(x, y) for x, y in anel.coords]
            partes.append('M' + 'L'.join(f'{x:.1f} {y:.1f}' for x, y in pts[:-1]) + 'Z')
    return ''.join(partes)


def projetar(geom):
    import numpy as np
    import shapely
    return shapely.transform(
        geom, lambda c: np.column_stack([(c[:, 0] - LON0) * KX, (LAT1 - c[:, 1]) * KY])
    )


TIPOS = {
    'AMEAÇA': 'ameaca',
    'LESÃO CORPORAL DOLOSA': 'lesao',
    'CALÚNIA - DIFAMAÇÃO - INJÚRIA': 'injuria',
    'PERSEGUIR': 'perseguicao',
    'DESCUMPRIMENTO DE MEDIDA PROTETIVA DE URGÊNCIA': 'medidaProtetiva',
    'DANO': 'dano',
    'VIOLÊNCIA PSICOLÓGICA CONTRA A MULHER': 'psicologica',
    'INVASÃO DE DOMICÍLIO': 'invasao',
    'OUTROS C/C/ DIGNIDADE SEXUAL': 'dignidadeSexual',
    'DIVULGAÇÃO DE FOTOS/VIDEOS ÍNTIMOS': 'imagensIntimas',
    'MAUS TRATOS': 'mausTratos',
    'CONSTRANGIMENTO ILEGAL': 'constrangimento',
}


def ts(valor):
    return json.dumps(valor, ensure_ascii=False, separators=(',', ':'))


def main():
    distritos_geo = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
    dps_geo = json.loads((DADOS / 'delegacias_cem_2021_simplificado.geojson').read_text(encoding='utf-8'))
    ssp = json.loads((DADOS / 'ssp_violencia_mulher_capital_agregado.json').read_text(encoding='utf-8'))
    painel = json.loads((DADOS / 'ssp_painel_capital_outros_tipos.json').read_text(encoding='utf-8'))
    servicos = json.loads((DADOS / 'servicos_mulher_capital.json').read_text(encoding='utf-8'))

    # ---------- contornos das delegacias ----------
    formas = []
    geoms_dp = {}
    for f in dps_geo['features']:
        num = str(f['properties']['NUM_DP'])
        g = shape(f['geometry']).buffer(0)
        geoms_dp[num] = g
        gp = projetar(g)
        maior = gp if gp.geom_type == 'Polygon' else max(gp.geoms, key=lambda p: p.area)
        ponto = polylabel(maior, tolerance=0.2)
        # ponto da etiqueta de volta em graus, para calcular distâncias
        lon = LON0 + ponto.x / KX
        lat = LAT1 - ponto.y / KY
        x0, y0, x1, y1 = gp.bounds
        formas.append({
            'id': num,
            'nome': f"{num}º DP – {f['properties']['NM_DP']}",
            'bairro': f['properties']['NM_DP'],
            'd': caminho(g),
            'bbox': [round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)],
            'lx': round(ponto.x, 1),
            'ly': round(ponto.y, 1),
            'lat': round(lat, 5),
            'lon': round(lon, 5),
        })
    formas.sort(key=lambda f: int(f['id']))
    assert len(formas) == 93

    # ---------- números por área ----------
    assert set(ssp['dp']) == set(geoms_dp), 'números de DP diferentes entre SSP e CEM'
    anos = ['2024', '2025', '2026']
    por_dp = []
    soma_casos = 0
    for num in sorted(ssp['dp'], key=int):
        d = ssp['dp'][num]
        tipos = {}
        for ano in anos:
            tipos[ano] = {TIPOS[k]: v for k, v in d['anoNat'].get(ano, {}).items()}
            soma_casos += sum(tipos[ano].values())
        por_dp.append({'id': num, 'vitimas': {a: d['anoVitimas'].get(a, 0) for a in anos}, 'casos': tipos})

    sem_area = sum(sum(v.values()) for v in ssp['semArea'].values())
    total_cidade = sum(sum(o.values()) for o in ssp['cidadeMesNat'].values())
    assert soma_casos + sem_area == total_cidade == ssp['linhasCapital']

    cidade_ano_tipo = {a: {} for a in anos}
    cidade_mes = {}
    for am, o in ssp['cidadeMesNat'].items():
        ano = am[:4]
        for k, v in o.items():
            cidade_ano_tipo[ano][TIPOS[k]] = cidade_ano_tipo[ano].get(TIPOS[k], 0) + v
        cidade_mes[am] = sum(o.values())

    vitimas_2025 = [p['vitimas']['2025'] for p in por_dp]
    media_2025 = round(sum(vitimas_2025) / len(vitimas_2025), 1)

    outros = {
        'feminicidio': painel['FEMINICÍDIO'],
        'tentativaHomicidio': painel['TENTATIVA DE HOMICÍDIO'],
        'estupro': {a: painel['ESTUPRO CONSUMADO'][a] + painel['ESTUPRO TENTADO'][a] for a in anos},
        'estuproVulneravel': {a: painel['ESTUPRO DE VULNERÁVEL CONSUMADO'][a] + painel['ESTUPRO DE VULNERÁVEL TENTADO'][a] for a in anos},
    }

    # ---------- distrito -> áreas de delegacia ----------
    nomes_distrito = {}
    mapa_distrito = {}
    for f in distritos_geo['features']:
        did = str(int(f['properties']['ds_codigo']))
        gd = shape(f['geometry']).buffer(0)
        area = gd.area
        partes = []
        for num, gdp in geoms_dp.items():
            if not gd.intersects(gdp):
                continue
            fr = gd.intersection(gdp).area / area
            if fr >= 0.05:
                partes.append((num, round(fr, 2)))
        partes.sort(key=lambda x: -x[1])
        mapa_distrito[did] = [{'dp': n, 'parte': p} for n, p in partes]
        nomes_distrito[did] = f['properties']['ds_nome']
    assert len(mapa_distrito) == 96 and all(mapa_distrito.values())

    # ---------- serviços ----------
    lista = [s for s in servicos['servicos']]

    # ---------- escrever ----------
    cab = '// Gerado por scripts/mapa-calor/gerar_delegacias.py. Não edite à mão.\n'

    (SAIDA / 'delegaciasSP.ts').write_text(
        cab
        + "// Contornos: Centro de Estudos da Metrópole (CEM/USP), base 'Distritos e Delegacias Policiais' 2021\n"
        + '// (fonte original SSP-SP, DOI 10.55881/CEM.db.dpo001, CC BY 4.0), simplificados com mapshaper.\n\n'
        + "import type { FormaMapa } from '../../components/MapaInterativo';\n\n"
        + 'export type DelegaciaForma = FormaMapa & {\n  bairro: string;\n  lat: number; // ponto da etiqueta, em graus\n  lon: number;\n};\n\n'
        + f'export const MAPA_DELEGACIAS_LARGURA = {LARGURA};\nexport const MAPA_DELEGACIAS_ALTURA = {ALTURA};\n\n'
        + '// Projeção (graus -> unidades do mapa): x = (lon - lon0) * kx; y = (lat1 - lat) * ky\n'
        + f'export const PROJECAO_CAPITAL = {{ lon0: {LON0}, lat1: {LAT1}, kx: {KX}, ky: {KY} }};\n\n'
        + '// id: número da delegacia (DP)\nexport const delegaciasSP: DelegaciaForma[] = [\n'
        + ',\n'.join('  ' + ts(f) for f in formas)
        + '\n];\n',
        encoding='utf-8',
    )

    (SAIDA / 'violenciaDelegacias.ts').write_text(
        cab
        + '// Fonte: SSP-SP, base de dados "Violência Contra a Mulher (dados a partir de 2024)".\n'
        + '// Ver scripts/mapa-calor/README.md para a regra de contagem e a conferência com o painel.\n\n'
        + 'export type TipoCrime =\n'
        + '\n'.join(f"  | '{v}'" for v in TIPOS.values()) + ';\n\n'
        + 'export type AnoDados = \'2024\' | \'2025\' | \'2026\';\n\n'
        + 'export type IndicadorDelegacia = {\n  id: string;\n  vitimas: Record<AnoDados, number>;\n  casos: Record<AnoDados, Partial<Record<TipoCrime, number>>>;\n};\n\n'
        + 'export const FONTE_DELEGACIAS = {\n'
        + "  fonte: 'Secretaria da Segurança Pública do Estado de São Paulo (SSP-SP) — base de dados Violência Contra a Mulher (dados a partir de 2024)',\n"
        + "  arquivo: 'Base_Violência contra mulher.xlsx (versão de 07/10/2026)',\n"
        + "  periodo: 'janeiro de 2024 a agosto de 2026',\n"
        + "  anoCompleto: '2025' as AnoDados,\n"
        + "  anoParcial: '2026' as AnoDados,\n"
        + "  mesesAnoParcial: 'janeiro a agosto',\n"
        + f"  mediaVitimas2025: {media_2025},\n"
        + f"  casosSemArea: {sem_area},\n"
        + f"  casosCidade: {total_cidade},\n"
        + "  link: 'https://www.ssp.sp.gov.br/estatistica/violencia-contra-a-mulher',\n"
        + '};\n\n'
        + 'export const NOMES_TIPOS: Record<TipoCrime, string> = {\n'
        + "  ameaca: 'Ameaça',\n  lesao: 'Lesão corporal (agressão)',\n  injuria: 'Calúnia, difamação ou injúria',\n"
        + "  perseguicao: 'Perseguição (stalking)',\n  medidaProtetiva: 'Descumprimento de medida protetiva',\n"
        + "  dano: 'Dano a bens',\n  psicologica: 'Violência psicológica',\n  invasao: 'Invasão de domicílio',\n"
        + "  dignidadeSexual: 'Outros crimes contra a dignidade sexual',\n  imagensIntimas: 'Divulgação de fotos ou vídeos íntimos',\n"
        + "  mausTratos: 'Maus-tratos',\n  constrangimento: 'Constrangimento ilegal',\n};\n\n"
        + f'export const cidadeVitimasPorAno: Record<AnoDados, number> = {ts(ssp["cidadeAnoVitimas"])};\n\n'
        + f'export const cidadeCasosPorAnoETipo: Record<AnoDados, Partial<Record<TipoCrime, number>>> = {ts(cidade_ano_tipo)};\n\n'
        + '// Casos por mês na cidade (todos os tipos da base), AAAA-MM\n'
        + f'export const cidadeCasosPorMes: Record<string, number> = {ts(dict(sorted(cidade_mes.items())))};\n\n'
        + '// Tipos que não vêm por delegacia na base: totais da cidade, do painel da SSP\n'
        + f'export const cidadeOutrosTipos = {ts(outros)};\n\n'
        + 'export const violenciaDelegacias: IndicadorDelegacia[] = [\n'
        + ',\n'.join('  ' + ts(p) for p in por_dp)
        + '\n];\n',
        encoding='utf-8',
    )

    (SAIDA / 'servicosMulherSP.ts').write_text(
        cab
        + '// Fonte: Prefeitura de São Paulo (SMDHC). Localização aproximada (OpenStreetMap).\n\n'
        + "export type TipoServico = 'ddm' | 'casa-brasileira' | 'casa' | 'cdcm' | 'saude' | 'defensoria';\n\n"
        + 'export type ServicoMulher = {\n  id: string;\n  tipo: TipoServico;\n  nome: string;\n  endereco: string;\n  telefone: string;\n  horario: string;\n  lat: number | null;\n  lon: number | null;\n  precisao: string;\n  fonte: string;\n  nota?: string;\n};\n\n'
        + f'export const FONTES_SERVICOS = {ts(servicos["fontes"])};\n\n'
        + 'export const servicosMulherSP: ServicoMulher[] = [\n'
        + ',\n'.join('  ' + ts(s) for s in lista)
        + '\n];\n',
        encoding='utf-8',
    )

    (SAIDA / 'distritoParaDelegacia.ts').write_text(
        cab
        + '// Quais áreas de delegacia cobrem cada distrito (fração da área do distrito, mínimo 5%).\n'
        + '// Calculado com os contornos de distritosSP (GeoSampa) e delegaciasSP (CEM/USP).\n\n'
        + 'export const distritoParaDelegacia: Record<string, { dp: string; parte: number }[]> = '
        + ts(mapa_distrito) + ';\n',
        encoding='utf-8',
    )

    print('ok', len(formas), 'áreas; média 2025', media_2025, '; sem área', sem_area, '; cidade', total_cidade)
    print('altura', ALTURA)


if __name__ == '__main__':
    main()
