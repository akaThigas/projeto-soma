import { useCallback, useMemo } from 'react';

import {
  distritosSP,
  MAPA_CAPITAL_ALTURA,
  MAPA_CAPITAL_LARGURA,
} from '../data/mapaCalor/distritosSP';
import {
  FONTE_VIOLENCIA_CAPITAL,
  IndicadorDistrito,
  violenciaMulherCapital,
} from '../data/mapaCalor/violenciaMulherCapital';
import { CORES_MAPA, FaixaLegenda } from './MapaCalorSP';
import {
  FormaMapa,
  MapaInterativo,
  MarcadorMapa,
  vistaDaForma,
  vistaInteira,
} from './MapaInterativo';

const formatar = (valor: number, casas: number) =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

/**
 * Faixas do coeficiente (vítimas por 10 mil mulheres de 20 a 59 anos).
 * O segundo limite é a média dos distritos, para a legenda mostrar
 * o que está acima ou abaixo dela.
 */
const LIMITES = [150, FONTE_VIOLENCIA_CAPITAL.mediaDistritos, 300, 500];

export function faixaDoDistrito(indicador: IndicadorDistrito): number {
  const posicao = LIMITES.findIndex((limite) => indicador.taxa <= limite);
  return posicao === -1 ? LIMITES.length : posicao;
}

export function legendaDaCapital(): FaixaLegenda[] {
  const [a, media, c, d] = LIMITES;

  return [
    { cor: CORES_MAPA[0], rotulo: `Até ${formatar(a, 0)}` },
    {
      cor: CORES_MAPA[1],
      rotulo: `${formatar(a, 0)} a ${formatar(media, 2)} (média dos distritos)`,
    },
    { cor: CORES_MAPA[2], rotulo: `${formatar(media, 2)} a ${formatar(c, 0)}` },
    { cor: CORES_MAPA[3], rotulo: `${formatar(c, 0)} a ${formatar(d, 0)}` },
    { cor: CORES_MAPA[4], rotulo: `Acima de ${formatar(d, 0)}` },
  ];
}

const indicadorPorId = new Map(
  violenciaMulherCapital.map((item) => [item.id, item])
);

const formaPorId = new Map(distritosSP.map((item) => [item.id, item]));

// Posição de cada distrito, do maior para o menor coeficiente.
const posicaoPorId = new Map(
  [...violenciaMulherCapital]
    .sort((a, b) => b.taxa - a.taxa)
    .map((item, indice) => [item.id, indice + 1])
);

export function indicadorDoDistrito(id: string) {
  const indicador = indicadorPorId.get(id);
  const forma = formaPorId.get(id);

  if (!indicador || !forma) {
    return undefined;
  }

  return {
    ...indicador,
    subprefeitura: forma.subprefeitura,
    posicao: posicaoPorId.get(id) ?? 0,
  };
}

export function textoDoValor(taxa: number) {
  return `${formatar(taxa, 2)} por 10 mil mulheres`;
}

/** Área que junta os distritos da Subprefeitura Sé (centro). */
const CENTRO: FormaMapa = (() => {
  const centro = distritosSP.filter((d) => d.subprefeitura === 'Sé');
  const bbox: [number, number, number, number] = [
    Math.min(...centro.map((d) => d.bbox[0])),
    Math.min(...centro.map((d) => d.bbox[1])),
    Math.max(...centro.map((d) => d.bbox[2])),
    Math.max(...centro.map((d) => d.bbox[3])),
  ];

  return { id: 'centro', nome: 'Centro', d: '', bbox, lx: 0, ly: 0 };
})();

export type EnquadramentoCapital =
  | { tipo: 'cidade' }
  | { tipo: 'centro' }
  | { tipo: 'distrito'; id: string }
  /** Aproxima o mapa de um ponto (em unidades do mapa), ex.: um serviço. */
  | { tipo: 'ponto'; x: number; y: number };

type Props = {
  enquadramento: EnquadramentoCapital;
  selecionadoId?: string;
  onSelect: (id: string) => void;
  /** Ícones dos serviços de apoio (aparecem com o mapa aproximado). */
  marcadores?: MarcadorMapa[];
  marcadorSelecionadoId?: string;
  onMarcador?: (id: string) => void;
  onMarcadoresVisiveis?: (visiveis: boolean) => void;
};

/** Mapa de calor dos 96 distritos do Município de São Paulo. */
export function MapaCalorCapital({
  enquadramento,
  selecionadoId,
  onSelect,
  marcadores,
  marcadorSelecionadoId,
  onMarcador,
  onMarcadoresVisiveis,
}: Props) {
  const vista = useMemo(() => {
    if (enquadramento.tipo === 'cidade') {
      return vistaInteira(MAPA_CAPITAL_LARGURA);
    }

    if (enquadramento.tipo === 'ponto') {
      const { x, y } = enquadramento;
      const ponto: FormaMapa = {
        id: 'ponto',
        nome: 'Serviço',
        d: '',
        bbox: [x - 1, y - 1, x + 1, y + 1],
        lx: 0,
        ly: 0,
      };

      return vistaDaForma(
        ponto,
        MAPA_CAPITAL_LARGURA,
        MAPA_CAPITAL_ALTURA,
        1,
        MAPA_CAPITAL_LARGURA / 6
      );
    }

    const alvo =
      enquadramento.tipo === 'centro'
        ? CENTRO
        : formaPorId.get(enquadramento.id);

    if (!alvo) {
      return vistaInteira(MAPA_CAPITAL_LARGURA);
    }

    return vistaDaForma(
      alvo,
      MAPA_CAPITAL_LARGURA,
      MAPA_CAPITAL_ALTURA,
      enquadramento.tipo === 'centro' ? 1.6 : 2.6,
      90
    );
  }, [enquadramento]);

  const corDe = useCallback((id: string) => {
    const indicador = indicadorPorId.get(id);
    return CORES_MAPA[indicador ? faixaDoDistrito(indicador) : 0];
  }, []);

  const valorDe = useCallback((id: string) => {
    const indicador = indicadorPorId.get(id);
    return indicador ? textoDoValor(indicador.taxa) : 'Sem dado';
  }, []);

  return (
    <MapaInterativo
      formas={distritosSP}
      larguraMapa={MAPA_CAPITAL_LARGURA}
      alturaMapa={MAPA_CAPITAL_ALTURA}
      corDe={corDe}
      chaveCores="capital"
      valorDe={valorDe}
      vista={vista}
      selecionadoId={selecionadoId}
      onSelect={onSelect}
      descricao="Mapa de calor dos distritos da cidade de São Paulo. Use a busca para consultar um distrito."
      zoomMaximo={8}
      marcadores={marcadores}
      marcadorSelecionadoId={marcadorSelecionadoId}
      onMarcador={onMarcador}
      onMarcadoresVisiveis={onMarcadoresVisiveis}
    />
  );
}
