import { useCallback, useMemo } from 'react';

import {
  feminicidiosSP,
  FONTE_FEMINICIDIO_SP,
  IndicadorMunicipio,
} from '../data/mapaCalor/feminicidioSP';
import {
  IndicadorVCM,
  violenciaMulherSP2023,
  FONTE_VCM_SP,
} from '../data/mapaCalor/violenciaMulherSP2023';
import {
  MAPA_SP_ALTURA,
  MAPA_SP_LARGURA,
  municipiosSP,
} from '../data/mapaCalor/municipiosSP';
import {
  MapaInterativo,
  vistaDaForma,
  vistaInteira,
} from './MapaInterativo';

export type ModoMapa = 'taxa' | 'vitimas';

/** O que o mapa do estado mostra. */
export type IndicadorEstado = 'vcm' | 'feminicidio';

export type FaixaLegenda = {
  cor: string;
  rotulo: string;
};

/**
 * Cores das faixas, da mais clara (nenhum registro)
 * para a mais escura (valores mais altos).
 */
export const CORES_MAPA = [
  '#EFE6E8',
  '#E8C8CA',
  '#CF879E',
  '#8A4A70',
  '#3D1E45',
];

const formatarTaxa = (valor: number) =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

/**
 * Faixas da taxa: o primeiro limite é a média do estado,
 * para que a legenda mostre o que está acima ou abaixo dela.
 */
const LIMITES_TAXA = [FONTE_FEMINICIDIO_SP.taxaEstado, 0.8, 1.8];
const LIMITES_VITIMAS = [1, 4, 14];

export function faixaDoMunicipio(
  indicador: IndicadorMunicipio,
  modo: ModoMapa
): number {
  if (indicador.feminicidios === 0) {
    return 0;
  }

  const valor = modo === 'taxa' ? indicador.taxa : indicador.feminicidios;
  const limites = modo === 'taxa' ? LIMITES_TAXA : LIMITES_VITIMAS;

  if (valor <= limites[0]) return 1;
  if (valor <= limites[1]) return 2;
  if (valor <= limites[2]) return 3;
  return 4;
}

export function legendaDoMapa(modo: ModoMapa): FaixaLegenda[] {
  if (modo === 'taxa') {
    const [a, b, c] = LIMITES_TAXA;

    return [
      { cor: CORES_MAPA[0], rotulo: 'Nenhum registro' },
      { cor: CORES_MAPA[1], rotulo: `Até ${formatarTaxa(a)} (média do estado)` },
      { cor: CORES_MAPA[2], rotulo: `${formatarTaxa(a)} a ${formatarTaxa(b)}` },
      { cor: CORES_MAPA[3], rotulo: `${formatarTaxa(b)} a ${formatarTaxa(c)}` },
      { cor: CORES_MAPA[4], rotulo: `Acima de ${formatarTaxa(c)}` },
    ];
  }

  return [
    { cor: CORES_MAPA[0], rotulo: 'Nenhuma vítima' },
    { cor: CORES_MAPA[1], rotulo: '1 vítima' },
    { cor: CORES_MAPA[2], rotulo: '2 a 4 vítimas' },
    { cor: CORES_MAPA[3], rotulo: '5 a 14 vítimas' },
    { cor: CORES_MAPA[4], rotulo: '15 vítimas ou mais' },
  ];
}

const indicadorPorId = new Map(
  feminicidiosSP.map((item) => [item.id, item])
);

export function indicadorDoMunicipio(id: string) {
  return indicadorPorId.get(id);
}

/* ---------- violência contra a mulher, 2023 ---------- */

/** Abaixo disso o número aparece como "menos de 5", para não expor casos isolados. */
export const MINIMO_EXIBIDO_VCM = 5;

/** Faixas da taxa: o primeiro limite é a média do estado. */
const LIMITES_TAXA_VCM = [FONTE_VCM_SP.taxaEstado, 550, 700];
const LIMITES_VITIMAS_VCM = [4, 49, 499];

const vcmPorId = new Map(violenciaMulherSP2023.map((item) => [item.id, item]));

export function vcmDoMunicipio(id: string) {
  return vcmPorId.get(id);
}

export function faixaVCM(indicador: IndicadorVCM, modo: ModoMapa): number {
  if (indicador.vitimas === 0) return 0;
  const valor = modo === 'taxa' ? indicador.taxa : indicador.vitimas;
  const limites = modo === 'taxa' ? LIMITES_TAXA_VCM : LIMITES_VITIMAS_VCM;
  if (valor <= limites[0]) return 1;
  if (valor <= limites[1]) return 2;
  if (valor <= limites[2]) return 3;
  return 4;
}

const inteiro = (valor: number) => valor.toLocaleString('pt-BR');

export function legendaVCM(modo: ModoMapa): FaixaLegenda[] {
  if (modo === 'taxa') {
    const [a, b, c] = LIMITES_TAXA_VCM;
    return [
      { cor: CORES_MAPA[1], rotulo: `Até ${formatarTaxa(a)} (média do estado)` },
      { cor: CORES_MAPA[2], rotulo: `${formatarTaxa(a)} a ${inteiro(b)}` },
      { cor: CORES_MAPA[3], rotulo: `${inteiro(b)} a ${inteiro(c)}` },
      { cor: CORES_MAPA[4], rotulo: `Acima de ${inteiro(c)}` },
    ];
  }
  return [
    { cor: CORES_MAPA[1], rotulo: 'Menos de 5 vítimas' },
    { cor: CORES_MAPA[2], rotulo: '5 a 49 vítimas' },
    { cor: CORES_MAPA[3], rotulo: '50 a 499 vítimas' },
    { cor: CORES_MAPA[4], rotulo: '500 vítimas ou mais' },
  ];
}

/** Texto curto da etiqueta do mapa (respeita o "menos de 5"). */
export function textoVCM(indicador: IndicadorVCM, modo: ModoMapa) {
  if (indicador.vitimas < MINIMO_EXIBIDO_VCM) {
    return `Menos de 5 vítimas em ${FONTE_VCM_SP.ano}`;
  }
  if (modo === 'taxa') {
    return `${formatarTaxa(indicador.taxa)} vítimas por 100 mil hab. em ${FONTE_VCM_SP.ano}`;
  }
  return `${inteiro(indicador.vitimas)} vítimas em ${FONTE_VCM_SP.ano}`;
}

export type Enquadramento =
  | { tipo: 'estado' }
  | { tipo: 'capital' }
  | { tipo: 'municipio'; id: string };

const ID_CAPITAL = '3550308';

type Props = {
  indicador?: IndicadorEstado;
  modo: ModoMapa;
  enquadramento: Enquadramento;
  selecionadoId?: string;
  onSelect: (id: string) => void;
};

/** Mapa de calor dos 645 municípios do Estado de São Paulo. */
export function MapaCalorSP({
  indicador: indicadorMapa = 'feminicidio',
  modo,
  enquadramento,
  selecionadoId,
  onSelect,
}: Props) {
  const vista = useMemo(() => {
    if (enquadramento.tipo === 'estado') {
      return vistaInteira(MAPA_SP_LARGURA);
    }

    const alvoId =
      enquadramento.tipo === 'capital' ? ID_CAPITAL : enquadramento.id;
    const alvo = municipiosSP.find((m) => m.id === alvoId);

    if (!alvo) {
      return vistaInteira(MAPA_SP_LARGURA);
    }

    // A capital mostra também os municípios vizinhos (Grande SP).
    return vistaDaForma(
      alvo,
      MAPA_SP_LARGURA,
      MAPA_SP_ALTURA,
      enquadramento.tipo === 'capital' ? 3.2 : 2.6,
      70
    );
  }, [enquadramento]);

  const corDe = useCallback(
    (id: string) => {
      if (indicadorMapa === 'vcm') {
        const v = vcmPorId.get(id);
        return CORES_MAPA[v ? faixaVCM(v, modo) : 0];
      }
      const indicador = indicadorPorId.get(id);
      return CORES_MAPA[indicador ? faixaDoMunicipio(indicador, modo) : 0];
    },
    [modo, indicadorMapa]
  );

  const valorDe = useCallback(
    (id: string) => {
      if (indicadorMapa === 'vcm') {
        const v = vcmPorId.get(id);
        return v ? textoVCM(v, modo) : 'Sem dado';
      }
      const indicador = indicadorPorId.get(id);

      if (!indicador || indicador.feminicidios === 0) {
        return 'Nenhum registro (2019–2023)';
      }

      if (modo === 'taxa') {
        return `${indicador.taxa.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} por 100 mil hab./ano`;
      }

      return indicador.feminicidios === 1
        ? '1 vítima (2019–2023)'
        : `${indicador.feminicidios.toLocaleString('pt-BR')} vítimas (2019–2023)`;
    },
    [modo, indicadorMapa]
  );

  return (
    <MapaInterativo
      formas={municipiosSP}
      larguraMapa={MAPA_SP_LARGURA}
      alturaMapa={MAPA_SP_ALTURA}
      corDe={corDe}
      chaveCores={`${indicadorMapa}-${modo}`}
      valorDe={valorDe}
      vista={vista}
      selecionadoId={selecionadoId}
      onSelect={onSelect}
      descricao="Mapa de calor dos municípios de São Paulo. Use a busca para consultar um município."
    />
  );
}
