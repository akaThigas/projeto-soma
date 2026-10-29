"""
Agrega a base de 2023 (SPJ) recebida pelo Fala.SP (protocolo FALASP 2026092522204826).

Uso (na raiz do projeto):
    python3 scripts/mapa-calor/agregar_falasp_2023.py "CAMINHO/FALASP 2026092522204826 - SPJ 2023.xlsx"

O arquivo tem uma linha por vítima mulher e natureza, com endereço, coordenadas e dados
pessoais. Nada disso sai daqui: o script lê só as colunas usadas nas contagens e grava
apenas totais em scripts/mapa-calor/dados/falasp_spj_2023_agregado.json.

Regra (a mesma da base "Violência Contra a Mulher (dados a partir de 2024)" da SSP):
  - mesmos 12 tipos da base; lesão, ameaça, calúnia/difamação/injúria, dano, invasão,
    maus-tratos, constrangimento, imagens íntimas e outros crimes contra a dignidade sexual
    só quando o boletim marca violência doméstica; perseguição, violência psicológica e
    descumprimento de medida protetiva entram com ou sem essa marca (nota técnica da SSP);
  - casos = linhas por natureza (RUBRICA); vítimas = pessoas únicas
    (ID_DELEGACIA + ANO_BO + NUM_BO + CONT_PESSOA);
  - local = NOME_MUNICIPIO_CIRC (município do fato) e, na capital, o número do DP em
    NOME_DELEGACIA_CIRC;
  - ano/mês = data do registro do boletim (DATAHORA_REGISTRO_BO) — critério do pedido;
  - estupro e estupro de vulnerável (todos, como no painel) só como total da cidade.

Dependências: pip install openpyxl
"""
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

import openpyxl

RAIZ = Path(__file__).resolve().parents[2]
SAIDA = RAIZ / 'scripts/mapa-calor/dados/falasp_spj_2023_agregado.json'
MUNICIPIOS_TS = RAIZ / 'src/data/mapaCalor/municipiosSP.ts'

# RUBRICA (texto exato do arquivo) -> tipo do app. 'sempre' = entra com ou sem violência doméstica.
TIPOS = {
    'Ameaça (art. 147)': 'ameaca',
    'Lesão corporal (art. 129)': 'lesao',
    'Injúria (art. 140)': 'injuria',
    'Calúnia (art. 138)': 'injuria',
    'Difamação (art. 139)': 'injuria',
    'Perseguir (art. 147-A)': 'perseguicao',
    'Descumprimento de medida protetiva de urgência (art. 24-A)': 'medidaProtetiva',
    'Dano (art. 163)': 'dano',
    'Violência psicológica contra a mulher (Art. 147-B)': 'psicologica',
    'Violação de domicílio (art. 150)': 'invasao',
    'Maus-tratos (art. 136)': 'mausTratos',
    'Constrangimento ilegal (art. 146)': 'constrangimento',
    'Divulgação de cena de estupro e imagens de nudez, sexo ou pornografia(Art.218-C)': 'imagensIntimas',
    # outros crimes contra a dignidade sexual (Título VI do Código Penal, exceto 213, 217-A e 218-C)
    'Art. 215 - Violação sexual mediante fraude': 'dignidadeSexual',
    'Art. 215A - Importunação Sexual': 'dignidadeSexual',
    'Art. 216A - Assedio Sexual': 'dignidadeSexual',
    'Art.216B -Produzir, fotografar, filmar ou registrar, por qualquer meio, conteúdo': 'dignidadeSexual',
    'Corrupção de menores (art.218)': 'dignidadeSexual',
    'Satisfação de lascivia mediante presença de criança ou adolescente (art.218-A)': 'dignidadeSexual',
    'Favorecimento da prostituição ou outra forma de exploração sexual de vulnerável': 'dignidadeSexual',
    'Mediação para servir a lascívia de outrem (art.227)': 'dignidadeSexual',
    'Favorecimento de prostituição ou outra forma de exploração sexual (art.228)': 'dignidadeSexual',
    'Casa de prostituição (art.229)': 'dignidadeSexual',
    'Rufianismo (art.230)': 'dignidadeSexual',
    'Ato obsceno (art.233)': 'dignidadeSexual',
    'Escrito ou objeto obsceno (art.234)': 'dignidadeSexual',
}
SEMPRE = {'perseguicao', 'psicologica', 'medidaProtetiva'}
OUTROS = {'Estupro - Art. 213': 'estupro', 'Estupro de vulneravel (art.217-A)': 'estuproVulneravel'}

COLS = ['ID_DELEGACIA', 'ANO_BO', 'NUM_BO', 'CONT_PESSOA', 'NOME_DELEGACIA_CIRC', 'NOME_MUNICIPIO_CIRC',
        'DATAHORA_REGISTRO_BO', 'RUBRICA', 'VIOLENCIA_DOMESTICA', 'SEXO_PESSOA']


def norm(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().upper()
    return re.sub(r'[^A-Z0-9]+', ' ', s).strip()


def municipios_ibge():
    texto = MUNICIPIOS_TS.read_text(encoding='utf-8')
    return {norm(n): i for i, n in re.findall(r'"id":"(\d{7})","nome":"([^"]+)"', texto)}


# nomes da SSP que não se resolvem só trocando abreviações -> nome do IBGE
ALIAS = {
    'CAMPINA MONTE ALEGRE': 'CAMPINA DO MONTE ALEGRE',
    'ESPIRITO STO PINHAL': 'ESPIRITO SANTO DO PINHAL',
    'EUCLIDES DA CUNHA PTA': 'EUCLIDES DA CUNHA PAULISTA',
    'FLORINIA': 'FLORINEA',
    'MIRANTE PARANAPANEMA': 'MIRANTE DO PARANAPANEMA',
    'PIRAPORA BOM JESUS': 'PIRAPORA DO BOM JESUS',
    'RIBEIRAO INDIOS': 'RIBEIRAO DOS INDIOS',
    'S ANTONIO DE ARACANGUA': 'SANTO ANTONIO DO ARACANGUA',
    'S JOAO DUAS PONTES': 'SAO JOAO DAS DUAS PONTES',
    'S RITA PASSA QUATRO': 'SANTA RITA DO PASSA QUATRO',
}


def codigo_ibge(nome_ssp, ibge):
    if norm(nome_ssp) in ALIAS:
        return ibge[ALIAS[norm(nome_ssp)]]
    base = nome_ssp.replace("D OESTE", "D'OESTE")
    candidatos = {base}
    for a, opcoes in (('S.', ['SAO ', 'SANTO ', 'SANTA ', 'SANTANA ']), ('STO.', ['SANTO ']), ('STA.', ['SANTA ']),
                      ('JDIM', ['JARDIM'])):
        novos = set()
        for c in candidatos:
            if a in c:
                novos |= {c.replace(a, o, 1) for o in opcoes}
        candidatos |= novos
    achados = {ibge[norm(c)] for c in candidatos if norm(c) in ibge}
    # "S." pode ser São, Santo, Santa ou Santana: só aceita se der um único município
    assert len(achados) <= 1, (nome_ssp, achados)
    return achados.pop() if achados else None


def main():
    caminho = sys.argv[1]
    ibge = municipios_ibge()
    wb = openpyxl.load_workbook(caminho, read_only=True)
    ws = wb.worksheets[0]
    linhas = ws.iter_rows(values_only=True)
    cab = list(next(linhas))
    pos = {c: cab.index(c) for c in COLS}

    total = 0
    excluidas = Counter()
    sexo = Counter()
    cap_casos_tipo = Counter()
    cap_casos_mes = Counter()
    cap_vitimas = set()
    cap_outros = Counter()
    dp_casos = defaultdict(Counter)
    dp_vitimas = defaultdict(set)
    sem_area_casos = Counter()
    sem_area_vitimas = set()
    mun_casos = defaultdict(Counter)
    mun_vitimas = defaultdict(set)
    nomes_ssp = {}

    for row in linhas:
        total += 1
        v = {c: ('' if row[i] is None else str(row[i]).strip()) for c, i in pos.items()}
        sexo[v['SEXO_PESSOA']] += 1
        rub = v['RUBRICA']
        mun = v['NOME_MUNICIPIO_CIRC']
        capital = mun == 'S.PAULO'
        if rub in OUTROS:
            if capital:
                cap_outros[OUTROS[rub]] += 1
            continue
        tipo = TIPOS.get(rub)
        vd = 'DOM' in v['VIOLENCIA_DOMESTICA'].upper()
        if tipo is None:
            excluidas[rub] += 1
            continue
        if tipo not in SEMPRE and not vd:
            excluidas['(sem marca de violência doméstica) ' + tipo] += 1
            continue
        pessoa = '|'.join((v['ID_DELEGACIA'], v['ANO_BO'], v['NUM_BO'], v['CONT_PESSOA']))
        mun_casos[mun][tipo] += 1
        mun_vitimas[mun].add(pessoa)
        if capital:
            cap_casos_tipo[tipo] += 1
            cap_casos_mes[v['DATAHORA_REGISTRO_BO'][:7]] += 1
            cap_vitimas.add(pessoa)
            m = re.match(r'^0*(\d+)[ºª°]?\s*D\.?P\.?', v['NOME_DELEGACIA_CIRC'])
            if m:
                dp_casos[m.group(1)][tipo] += 1
                dp_vitimas[m.group(1)].add(pessoa)
            else:
                sem_area_casos[v['NOME_DELEGACIA_CIRC']] += 1
                sem_area_vitimas.add(pessoa)

    municipios = {}
    sem_codigo = []
    for mun in sorted(mun_casos):
        cod = codigo_ibge(mun, ibge)
        if cod is None:
            sem_codigo.append(mun)
            continue
        assert cod not in municipios, (mun, cod)
        municipios[cod] = {'nomeSSP': mun, 'vitimas': len(mun_vitimas[mun]), 'casos': dict(mun_casos[mun])}
        nomes_ssp[mun] = cod

    soma_dp = sum(sum(c.values()) for c in dp_casos.values())
    assert soma_dp + sum(sem_area_casos.values()) == sum(cap_casos_tipo.values())

    saida = {
        'fonte': 'SSP-SP, resposta ao pedido de acesso à informação Fala.SP nº FALASP 2026092522204826 — '
                 'base do Sistema de Polícia Judiciária (SPJ), vítimas do sexo feminino, 2023',
        'arquivo': Path(caminho).name,
        'regra': __doc__.split('Regra')[1].split('Dependências')[0].strip(),
        'periodo': 'registros de 01/01/2023 a 31/12/2023 (data do registro do boletim)',
        'linhasArquivo': total,
        'sexo': dict(sexo),
        'excluidas': dict(excluidas.most_common()),
        'capital': {
            'vitimas': len(cap_vitimas),
            'casosPorTipo': dict(cap_casos_tipo),
            'casosPorMes': dict(sorted(cap_casos_mes.items())),
            'outrosTipos': dict(cap_outros),
            'dp': {d: {'vitimas': len(dp_vitimas[d]), 'casos': dict(dp_casos[d])} for d in sorted(dp_casos, key=int)},
            'semArea': {'casos': sum(sem_area_casos.values()), 'vitimas': len(sem_area_vitimas),
                        'porDelegacia': dict(sem_area_casos.most_common())},
        },
        'municipios': municipios,
        'municipiosSemCodigo': sem_codigo,
    }
    SAIDA.write_text(json.dumps(saida, ensure_ascii=False, indent=1), encoding='utf-8')
    print('linhas', total, '| capital vítimas', len(cap_vitimas), '| DPs', len(dp_casos),
          '| municípios', len(municipios), '| sem código', sem_codigo)


if __name__ == '__main__':
    main()
