"""
Gera src/data/mapaCalor/violenciaMulherSP2023.ts: violência contra a mulher por município, 2023.

Uso (na raiz do projeto, depois de agregar_falasp_2023.py):
    python3 scripts/mapa-calor/gerar_estado_2023.py

Entradas:
  - scripts/mapa-calor/dados/falasp_spj_2023_agregado.json (contagens por município)
  - src/data/mapaCalor/feminicidioSP.ts (população estimada de 2023 por município, a mesma do
    mapa de feminicídio: Ministério da Saúde/RIPSA via DATASUS)

Taxa = vítimas em 2023 / população total estimada em 2023 × 100 mil.
"""
import json
import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
DADOS = RAIZ / 'scripts/mapa-calor/dados/falasp_spj_2023_agregado.json'
POP = RAIZ / 'src/data/mapaCalor/feminicidioSP.ts'
SAIDA = RAIZ / 'src/data/mapaCalor/violenciaMulherSP2023.ts'


def main():
    ag = json.loads(DADOS.read_text(encoding='utf-8'))
    texto = POP.read_text(encoding='utf-8')
    pop = {i: (n, int(p)) for i, n, p in re.findall(r'"id": "(\d{7})", "nome": "([^"]+)", "populacao": (\d+)', texto)}
    assert len(pop) == 645 and set(ag['municipios']) == set(pop), 'municípios diferentes'

    lista = []
    for cod in sorted(pop):
        nome, populacao = pop[cod]
        m = ag['municipios'][cod]
        lista.append({
            'id': cod,
            'nome': nome,
            'populacao': populacao,
            'vitimas': m['vitimas'],
            'taxa': round(m['vitimas'] / populacao * 100000, 1),
            'casos': dict(sorted(m['casos'].items(), key=lambda kv: -kv[1])),
        })

    total_vit = sum(x['vitimas'] for x in lista)
    total_pop = sum(x['populacao'] for x in lista)
    taxa_estado = round(total_vit / total_pop * 100000, 1)
    casos_tipo = {}
    for x in lista:
        for t, v in x['casos'].items():
            casos_tipo[t] = casos_tipo.get(t, 0) + v

    ts = lambda v: json.dumps(v, ensure_ascii=False, separators=(',', ':'))
    SAIDA.write_text(
        '// Gerado por scripts/mapa-calor/gerar_estado_2023.py. Não edite à mão.\n'
        '// Violência contra a mulher por município do Estado de São Paulo, 2023.\n'
        '// Fonte: SSP-SP, base do SPJ recebida pelo Fala.SP (FALASP 2026092522204826).\n\n'
        "import type { TipoCrime } from './violenciaDelegacias';\n\n"
        'export type IndicadorVCM = {\n'
        '  id: string; // código IBGE (7 dígitos)\n'
        '  nome: string;\n'
        '  populacao: number; // população total estimada em 2023\n'
        '  vitimas: number; // mulheres vítimas (pessoas únicas) em 2023\n'
        '  taxa: number; // vítimas por 100 mil habitantes\n'
        '  casos: Partial<Record<TipoCrime, number>>;\n'
        '};\n\n'
        'export const FONTE_VCM_SP = {\n'
        "  ano: '2023',\n"
        "  fonte: 'SSP-SP, resposta ao pedido de acesso à informação Fala.SP nº FALASP 2026092522204826 — base do Sistema de Polícia Judiciária (SPJ), vítimas do sexo feminino, registros de 2023',\n"
        "  fontePopulacao: 'Estimativas populacionais por município de 2023 (Ministério da Saúde/RIPSA, disponíveis no DATASUS) — as mesmas do mapa de feminicídio.',\n"
        "  criterio: 'município onde o fato aconteceu; ano de registro do boletim',\n"
        f'  totalVitimas: {total_vit},\n'
        f'  taxaEstado: {taxa_estado},\n'
        f'  casosPorTipo: {ts(dict(sorted(casos_tipo.items(), key=lambda kv: -kv[1])))} as Partial<Record<TipoCrime, number>>,\n'
        '};\n\n'
        'export const violenciaMulherSP2023: IndicadorVCM[] = [\n'
        + ',\n'.join('  ' + ts(x) for x in lista)
        + '\n];\n',
        encoding='utf-8',
    )
    taxas = sorted(x['taxa'] for x in lista)
    q = lambda p: taxas[int(p * (len(taxas) - 1))]
    print('municípios', len(lista), '| vítimas', total_vit, '| taxa estado', taxa_estado,
          '| quartis taxa', q(.25), q(.5), q(.75), q(.9), '| máx', taxas[-1],
          '| com 0:', sum(1 for x in lista if x['vitimas'] == 0), '| 1–4:', sum(1 for x in lista if 0 < x['vitimas'] < 5))


if __name__ == '__main__':
    main()
