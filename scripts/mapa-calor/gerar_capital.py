"""Gera src/data/mapaCalor/violenciaMulherCapital.ts.

Entrada: dados/mapa_desigualdade_2025_violencia_mulher.json (tabela copiada do
site do Mapa da Desigualdade 2025, sem nenhuma alteração nos valores).

Uso: python3 scripts/mapa-calor/gerar_capital.py   (a partir da raiz do projeto)

O script confere:
- 96 distritos, cada um casado com um contorno de src/data/mapaCalor/distritosSP.ts;
- soma e média dos valores (a média publicada pela fonte é 212,78);
- melhor e pior valor publicados (Vila Andrade 103,35; Sé 772,15).
"""

import json
import re
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
ENTRADA = RAIZ / 'scripts/mapa-calor/dados/mapa_desigualdade_2025_violencia_mulher.json'
DISTRITOS = RAIZ / 'src/data/mapaCalor/distritosSP.ts'
SAIDA = RAIZ / 'src/data/mapaCalor/violenciaMulherCapital.ts'

# Grafias diferentes entre a fonte e o GeoSampa.
GRAFIAS = {
    'mooca': 'mooca',  # fonte: "Moóca"
}


def chave(nome: str) -> str:
    sem = unicodedata.normalize('NFD', nome)
    sem = ''.join(c for c in sem if unicodedata.category(c) != 'Mn').lower().strip()
    return GRAFIAS.get(sem, sem)


def main() -> None:
    fonte = json.loads(ENTRADA.read_text(encoding='utf-8'))
    tabela = [(nome, float(valor.replace(',', '.'))) for nome, valor in fonte['tabela']]

    texto = DISTRITOS.read_text(encoding='utf-8')
    formas = re.findall(r'\{"id":"(\d+)","nome":"([^"]+)","subprefeitura":"([^"]+)"', texto)
    assert len(formas) == 96, len(formas)
    por_chave = {chave(nome): (id_, nome, sub) for id_, nome, sub in formas}

    assert len(tabela) == 96, len(tabela)
    linhas = []
    usados = set()
    for nome_fonte, taxa in tabela:
        k = chave(nome_fonte)
        assert k in por_chave, f'sem contorno: {nome_fonte}'
        assert k not in usados, f'repetido: {nome_fonte}'
        usados.add(k)
        id_, nome, _ = por_chave[k]
        linhas.append({'id': id_, 'nome': nome, 'taxa': taxa})

    soma = sum(t for _, t in tabela)
    media = round(soma / 96, 2)
    assert media == fonte['valores_publicados']['media_dos_distritos'], media
    menor = min(tabela, key=lambda x: x[1])
    maior = max(tabela, key=lambda x: x[1])
    assert list(menor) == fonte['valores_publicados']['melhor'], menor
    assert list(maior) == fonte['valores_publicados']['pior'], maior

    linhas.sort(key=lambda x: int(x['id']))
    corpo = ',\n'.join(
        '  {"id": "%s", "nome": "%s", "taxa": %s}' % (l['id'], l['nome'], repr(l['taxa']))
        for l in linhas
    )

    SAIDA.write_text(
        f"""// Violência contra a mulher por distrito do Município de São Paulo (ano-base 2024).
// Gerado por scripts/mapa-calor/gerar_capital.py a partir de
// scripts/mapa-calor/dados/mapa_desigualdade_2025_violencia_mulher.json (ver README de lá).
// Os valores são os publicados pela fonte, sem recálculo.

export type IndicadorDistrito = {{
  id: string; // código do distrito (o mesmo de distritosSP.ts)
  nome: string;
  taxa: number; // mulheres vítimas por 10 mil mulheres de 20 a 59 anos
}};

export const FONTE_VIOLENCIA_CAPITAL = {{
  indicador: 'Violência contra a mulher (todas as categorias)',
  anoBase: '2024',
  publicacao: 'Mapa da Desigualdade 2025 — Rede Nossa São Paulo e Instituto Cidades Sustentáveis (lançado em junho de 2026)',
  fontesOriginais: 'SSP-SP (Secretaria da Segurança Pública do Estado de São Paulo) e Fundação Seade',
  formula:
    'Número de mulheres vítimas de violência no distrito ÷ população feminina de 20 a 59 anos do distrito × 10 mil',
  tipos:
    'Física (homicídio, tentativa de homicídio, lesão corporal, maus-tratos), psicológica (constrangimento ilegal, ameaça), moral (calúnia, difamação, injúria), sexual (estupro) e patrimonial (invasão de domicílio, dano)',
  ocorrenciasUnicas: 65266,
  percentualSemLocalizacao: 33.5,
  // Média simples dos 96 distritos, publicada pela fonte (conferida pelo script).
  mediaDistritos: {media},
  link: 'https://institutocidadessustentaveis.shinyapps.io/mapadesigualdadesaopaulo2025/',
}};

export const violenciaMulherCapital: IndicadorDistrito[] = [
{corpo},
];
""",
        encoding='utf-8',
    )
    print(f'ok: 96 distritos, média {media}, menor {menor}, maior {maior} -> {SAIDA.relative_to(RAIZ)}')


if __name__ == '__main__':
    main()
