import { memo, useMemo, useState } from 'react';

import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

import {
  feminicidiosSP,
  FONTE_FEMINICIDIO_SP,
  IndicadorMunicipio,
} from '../data/mapaCalor/feminicidioSP';
import {
  MAPA_SP_ALTURA,
  MAPA_SP_LARGURA,
  municipiosSP,
} from '../data/mapaCalor/municipiosSP';

export type ModoMapa = 'taxa' | 'vitimas';

export type FaixaLegenda = {
  cor: string;
  rotulo: string;
};

/**
 * Cores das faixas, da mais clara (nenhum registro)
 * para a mais escura (valores mais altos).
 */
const CORES = ['#EFE6E8', '#E8C8CA', '#CF879E', '#8A4A70', '#3D1E45'];

const COR_DESTAQUE = '#F2B134';
const COR_BORDA = '#FFFDF1';

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
      { cor: CORES[0], rotulo: 'Nenhum registro' },
      { cor: CORES[1], rotulo: `Até ${formatarTaxa(a)} (média do estado)` },
      { cor: CORES[2], rotulo: `${formatarTaxa(a)} a ${formatarTaxa(b)}` },
      { cor: CORES[3], rotulo: `${formatarTaxa(b)} a ${formatarTaxa(c)}` },
      { cor: CORES[4], rotulo: `Acima de ${formatarTaxa(c)}` },
    ];
  }

  return [
    { cor: CORES[0], rotulo: 'Nenhuma vítima' },
    { cor: CORES[1], rotulo: '1 vítima' },
    { cor: CORES[2], rotulo: '2 a 4 vítimas' },
    { cor: CORES[3], rotulo: '5 a 14 vítimas' },
    { cor: CORES[4], rotulo: '15 vítimas ou mais' },
  ];
}

const indicadorPorId = new Map(
  feminicidiosSP.map((item) => [item.id, item])
);

export function indicadorDoMunicipio(id: string) {
  return indicadorPorId.get(id);
}

export type Enquadramento =
  | { tipo: 'estado' }
  | { tipo: 'capital' }
  | { tipo: 'municipio'; id: string };

const PROPORCAO = MAPA_SP_ALTURA / MAPA_SP_LARGURA;

function viewBoxPara(enquadramento: Enquadramento) {
  if (enquadramento.tipo === 'estado') {
    return { x: 0, y: 0, largura: MAPA_SP_LARGURA };
  }

  const alvoId =
    enquadramento.tipo === 'capital' ? '3550308' : enquadramento.id;

  const alvo = municipiosSP.find((m) => m.id === alvoId);

  if (!alvo) {
    return { x: 0, y: 0, largura: MAPA_SP_LARGURA };
  }

  const [x0, y0, x1, y1] = alvo.bbox;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  // A capital mostra também os municípios vizinhos (Grande SP).
  const margem = enquadramento.tipo === 'capital' ? 3.2 : 2.6;

  const largura = Math.min(
    MAPA_SP_LARGURA,
    Math.max(70, (x1 - x0) * margem, ((y1 - y0) * margem) / PROPORCAO)
  );

  return {
    x: cx - largura / 2,
    y: cy - (largura * PROPORCAO) / 2,
    largura,
  };
}

type CamadaProps = {
  modo: ModoMapa;
  espessura: number;
  onSelect: (id: string) => void;
};

/**
 * Camada com os 645 municípios. Fica memorizada para não
 * redesenhar tudo a cada toque: só muda quando o modo muda.
 */
const CamadaMunicipios = memo(function CamadaMunicipios({
  modo,
  espessura,
  onSelect,
}: CamadaProps) {
  return (
    <G>
      {municipiosSP.map((municipio) => {
        const indicador = indicadorPorId.get(municipio.id);
        const faixa = indicador ? faixaDoMunicipio(indicador, modo) : 0;

        return (
          <Path
            key={municipio.id}
            d={municipio.d}
            fill={CORES[faixa]}
            fillRule="evenodd"
            stroke={COR_BORDA}
            strokeWidth={espessura}
            strokeLinejoin="round"
            onPress={() => onSelect(municipio.id)}
          />
        );
      })}
    </G>
  );
});

type Props = {
  modo: ModoMapa;
  enquadramento: Enquadramento;
  selecionadoId?: string;
  onSelect: (id: string) => void;
};

export function MapaCalorSP({
  modo,
  enquadramento,
  selecionadoId,
  onSelect,
}: Props) {
  const [largura, setLargura] = useState(0);

  const caixa = useMemo(
    () => viewBoxPara(enquadramento),
    [enquadramento]
  );

  const escala = caixa.largura / MAPA_SP_LARGURA;

  const selecionado = selecionadoId
    ? municipiosSP.find((m) => m.id === selecionadoId)
    : undefined;

  function medir(evento: LayoutChangeEvent) {
    setLargura(evento.nativeEvent.layout.width);
  }

  const altura = largura * PROPORCAO;

  return (
    <View
      style={styles.container}
      onLayout={medir}
      accessibilityLabel="Mapa de calor dos municípios de São Paulo. Use a busca para consultar um município."
    >
      {largura > 0 && (
        <Svg
          width={largura}
          height={altura}
          viewBox={`${caixa.x} ${caixa.y} ${caixa.largura} ${caixa.largura * PROPORCAO}`}
        >
          <CamadaMunicipios
            modo={modo}
            espessura={0.6 * escala}
            onSelect={onSelect}
          />

          {selecionado && (
            <Path
              d={selecionado.d}
              fill="none"
              fillRule="evenodd"
              stroke={COR_DESTAQUE}
              strokeWidth={2.4 * escala}
              strokeLinejoin="round"
            />
          )}
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: MAPA_SP_LARGURA / MAPA_SP_ALTURA,
  },
});
