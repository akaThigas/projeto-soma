"""Gera src/data/mapaCalor/lugaresSP.ts: lugares conhecidos da capital para a busca.

Entrada: scripts/mapa-calor/dados/osm_lugares_capital.json (OpenStreetMap,
via Overpass API; ver README) e os contornos das áreas de delegacia.

Cada lugar recebe a área de delegacia (DP) em que está. Lugares fora da cidade
de São Paulo são descartados. A busca do app usa essa lista sem internet:
nada do que a pessoa digita sai do aparelho.

Uso (na raiz do projeto): python3 scripts/mapa-calor/gerar_lugares.py
"""

import json
import math
import unicodedata
from pathlib import Path

from shapely.geometry import Point, shape
from shapely.strtree import STRtree

RAIZ = Path(__file__).resolve().parents[2]
DADOS = RAIZ / 'scripts/mapa-calor/dados'
SAIDA = RAIZ / 'src/data/mapaCalor/lugaresSP.ts'

TIPOS = {
    'bairro': 'Bairro',
    'metro': 'Estação de metrô',
    'trem': 'Estação de trem',
    'metro-trem': 'Estação de metrô e trem',
    'monotrilho': 'Estação de monotrilho',
    'estacao': 'Estação',
    'parque': 'Parque',
    'estadio': 'Estádio',
    'hospital': 'Hospital',
    'universidade': 'Universidade',
}

# Apelidos populares que não estão no OpenStreetMap (os nomes alternativos e
# antigos do OSM já entram automaticamente). Chave: nome no OSM.
APELIDOS = {
    'Nubank Parque': ['Estádio do Palmeiras', 'Palestra Itália'],
    'Neo Química Arena': ['Estádio do Corinthians', 'Itaquerão'],
    'MorumBIS': ['Estádio do São Paulo'],
    'Estádio Doutor Osvaldo Teixeira Duarte': ['Estádio da Portuguesa'],
    'Estádio Conde Rodolfo Crespi': ['Estádio do Juventus'],
}


def chave(texto):
    t = unicodedata.normalize('NFD', texto)
    return ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower().strip()


def chave_dup(texto):
    # para achar repetidos: ignora espaços, hífens e pontuação
    return ''.join(c for c in chave(texto) if c.isalnum())


def tipo_de(categoria, sub):
    if categoria == 'bairros':
        return 'bairro'
    if categoria == 'estacoes':
        return {'subway': 'metro', 'train': 'trem', 'monorail': 'monotrilho'}.get(sub, 'estacao' if sub == '' else None)
    return {'parques': 'parque', 'estadios': 'estadio', 'hospitais': 'hospital', 'universidades': 'universidade'}[categoria]


def distancia_m(a, b):
    dlat = (a[0] - b[0]) * 111_320
    dlon = (a[1] - b[1]) * 111_320 * math.cos(math.radians(a[0]))
    return math.hypot(dlat, dlon)


def main():
    osm = json.loads((DADOS / 'osm_lugares_capital.json').read_text(encoding='utf-8'))
    dps = json.loads((DADOS / 'delegacias_cem_2021_simplificado.geojson').read_text(encoding='utf-8'))

    formas = [shape(f['geometry']).buffer(0) for f in dps['features']]
    numeros = [str(f['properties']['NUM_DP']) for f in dps['features']]
    arvore = STRtree(formas)

    def area_de(lat, lon):
        p = Point(lon, lat)
        for i in arvore.query(p):
            if formas[i].contains(p):
                return numeros[i]
        return None

    lugares = []
    fora = 0
    for categoria, sub, nome, alternativos, lat, lon, _osm in osm['itens']:
        tipo = tipo_de(categoria, sub)
        if tipo is None or not nome:
            continue
        dp = area_de(lat, lon)
        if dp is None:
            fora += 1
            continue
        apelidos = [a for a in alternativos if chave(a) != chave(nome)]
        apelidos += APELIDOS.get(nome, [])
        lugares.append({'nome': nome, 'tipo': tipo, 'dp': dp, 'lat': round(lat, 4), 'lon': round(lon, 4), 'apelidos': apelidos})

    # Junta repetidos: mesmo nome e mesmo tipo a menos de 1 km; estações de
    # metrô e de trem com o mesmo nome a menos de 600 m viram uma só.
    unicos = []
    for l in lugares:
        igual = None
        for u in unicos:
            if chave_dup(u['nome']) != chave_dup(l['nome']):
                continue
            d = distancia_m((u['lat'], u['lon']), (l['lat'], l['lon']))
            if u['tipo'] == l['tipo'] and d < 1000:
                igual = u
                break
            if {u['tipo'], l['tipo']} == {'metro', 'trem'} and d < 600:
                u['tipo'] = 'metro-trem'
                igual = u
                break
        if igual:
            for a in l['apelidos']:
                if a not in igual['apelidos']:
                    igual['apelidos'].append(a)
        else:
            unicos.append(l)

    faltando = [n for n in APELIDOS if not any(u['nome'] == n for u in unicos)]
    assert not faltando, f'apelidos sem lugar: {faltando}'

    unicos.sort(key=lambda u: (u['tipo'], chave(u['nome'])))
    linhas = []
    for u in unicos:
        tupla = [u['nome'], u['tipo'], u['dp'], u['lat'], u['lon']]
        if u['apelidos']:
            tupla.append(u['apelidos'])
        linhas.append('  ' + json.dumps(tupla, ensure_ascii=False, separators=(',', ':')))

    contagem = {}
    for u in unicos:
        contagem[u['tipo']] = contagem.get(u['tipo'], 0) + 1

    SAIDA.write_text(
        '// Gerado por scripts/mapa-calor/gerar_lugares.py. Não edite à mão.\n'
        f"// Lugares da cidade de São Paulo para a busca, sem internet. Fonte: OpenStreetMap\n"
        f"// (© contribuidores do OpenStreetMap, licença ODbL), dados de {osm['base'][:10]}.\n\n"
        'export type TipoLugar =\n' + '\n'.join(f"  | '{t}'" for t in TIPOS) + ';\n\n'
        'export const NOMES_TIPOS_LUGAR: Record<TipoLugar, string> = '
        + json.dumps(TIPOS, ensure_ascii=False, indent=2) + ';\n\n'
        'export type Lugar = {\n  nome: string;\n  tipo: TipoLugar;\n  dp: string; // área de delegacia\n  lat: number;\n  lon: number;\n  apelidos?: string[];\n};\n\n'
        f"export const FONTE_LUGARES = 'OpenStreetMap (© contribuidores do OpenStreetMap, licença ODbL), dados de {osm['base'][:10]}';\n\n"
        '// [nome, tipo, área de delegacia, lat, lon, apelidos?]\n'
        'type LinhaLugar = [string, TipoLugar, string, number, number, string[]?];\n\n'
        'const LINHAS: LinhaLugar[] = [\n' + ',\n'.join(linhas) + '\n];\n\n'
        'export const lugaresSP: Lugar[] = LINHAS.map(([nome, tipo, dp, lat, lon, apelidos]) => ({\n'
        '  nome,\n  tipo,\n  dp,\n  lat,\n  lon,\n  apelidos,\n}));\n',
        encoding='utf-8',
    )
    print('ok', len(unicos), 'lugares;', fora, 'fora da cidade;', contagem)


if __name__ == '__main__':
    main()
