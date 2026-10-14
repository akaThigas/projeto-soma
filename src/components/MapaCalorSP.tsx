import { memo, useEffect, useMemo, useRef, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import {
  LayoutChangeEvent,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

import { colors } from '../constants/theme';
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
const COR_NOME = '#2A1530';

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

type Vista = {
  x: number;
  y: number;
  largura: number; // largura visível, em unidades do mapa
};

const PROPORCAO = MAPA_SP_ALTURA / MAPA_SP_LARGURA;

// Zoom máximo: 1/25 da largura do estado.
const LARGURA_MINIMA = MAPA_SP_LARGURA / 25;

/** Mantém a vista dentro do mapa e dentro dos limites de zoom. */
function limitarVista(vista: Vista): Vista {
  const largura = Math.min(
    MAPA_SP_LARGURA,
    Math.max(LARGURA_MINIMA, vista.largura)
  );
  const altura = largura * PROPORCAO;

  return {
    largura,
    x: Math.min(Math.max(vista.x, 0), MAPA_SP_LARGURA - largura),
    y: Math.min(Math.max(vista.y, 0), MAPA_SP_ALTURA - altura),
  };
}

function vistaPara(enquadramento: Enquadramento): Vista {
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

  // A capital mostra também os municípios vizinhos (Grande SP).
  const margem = enquadramento.tipo === 'capital' ? 3.2 : 2.6;

  const largura = Math.max(
    70,
    (x1 - x0) * margem,
    ((y1 - y0) * margem) / PROPORCAO
  );

  return limitarVista({
    x: (x0 + x1) / 2 - largura / 2,
    y: (y0 + y1) / 2 - (largura * PROPORCAO) / 2,
    largura,
  });
}

/** Aproxima ou afasta mantendo fixo o ponto (fx, fy) do mapa. */
function zoomEm(vista: Vista, fator: number, fx?: number, fy?: number): Vista {
  const novaLargura = Math.min(
    MAPA_SP_LARGURA,
    Math.max(LARGURA_MINIMA, vista.largura / fator)
  );
  const escala = novaLargura / vista.largura;

  const focoX = fx ?? vista.x + vista.largura / 2;
  const focoY = fy ?? vista.y + (vista.largura * PROPORCAO) / 2;

  return limitarVista({
    largura: novaLargura,
    x: focoX - (focoX - vista.x) * escala,
    y: focoY - (focoY - vista.y) * escala,
  });
}

// Nomes: municípios do mais populoso para o menos populoso.
const municipiosPorPopulacao = [...municipiosSP].sort(
  (a, b) =>
    (indicadorPorId.get(b.id)?.populacao ?? 0) -
    (indicadorPorId.get(a.id)?.populacao ?? 0)
);

const TAMANHO_NOME = 11; // em pixels na tela
const MAXIMO_NOMES = 45;

// Fonte sem serifa também na Web (o padrão do SVG no navegador é serifado).
const FONTE_NOME = Platform.select({
  web: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  default: undefined,
});

// Área dos botões de zoom (canto superior direito), onde não entram nomes.
const AREA_BOTOES = { largura: 54, altura: 134 };

/**
 * População mínima para mostrar o nome: 200 mil no estado inteiro,
 * diminuindo conforme o zoom aumenta.
 */
function populacaoMinima(vista: Vista) {
  return 200000 * Math.pow(vista.largura / MAPA_SP_LARGURA, 1.5);
}

type Nome = {
  id: string;
  nome: string;
  x: number;
  y: number;
  destaque: boolean;
};

/**
 * Escolhe quais nomes cabem na tela sem se sobrepor.
 * Os maiores municípios (e o selecionado) têm prioridade;
 * quanto mais perto, mais nomes aparecem.
 */
function escolherNomes(
  vista: Vista,
  pixelsPorUnidade: number,
  larguraTela: number,
  selecionadoId?: string
): Nome[] {
  const alturaTela = larguraTela * PROPORCAO;
  const minimo = populacaoMinima(vista);

  const ocupados: [number, number, number, number][] = [
    [larguraTela - AREA_BOTOES.largura, 0, larguraTela, AREA_BOTOES.altura],
  ];
  const nomes: Nome[] = [];
  const alturaVista = vista.largura * PROPORCAO;

  const candidatos = selecionadoId
    ? [
        ...municipiosPorPopulacao.filter((m) => m.id === selecionadoId),
        ...municipiosPorPopulacao.filter((m) => m.id !== selecionadoId),
      ]
    : municipiosPorPopulacao;

  for (const municipio of candidatos) {
    if (nomes.length >= MAXIMO_NOMES) break;

    const dentro =
      municipio.lx >= vista.x &&
      municipio.lx <= vista.x + vista.largura &&
      municipio.ly >= vista.y &&
      municipio.ly <= vista.y + alturaVista;

    if (!dentro) continue;

    const destaque = municipio.id === selecionadoId;
    const populacao = indicadorPorId.get(municipio.id)?.populacao ?? 0;

    if (!destaque && populacao < minimo) continue;

    // Posição e tamanho aproximado do nome na tela, em pixels.
    const px = (municipio.lx - vista.x) * pixelsPorUnidade;
    const py = (municipio.ly - vista.y) * pixelsPorUnidade;
    const meiaLargura = (municipio.nome.length * TAMANHO_NOME * 0.56) / 2 + 3;
    const meiaAltura = TAMANHO_NOME / 2 + 3;

    const caixa: [number, number, number, number] = [
      px - meiaLargura,
      py - meiaAltura,
      px + meiaLargura,
      py + meiaAltura,
    ];

    const cortado =
      caixa[0] < 2 ||
      caixa[1] < 2 ||
      caixa[2] > larguraTela - 2 ||
      caixa[3] > alturaTela - 2;

    if (cortado) continue;

    const colide = ocupados.some(
      (o) =>
        caixa[0] < o[2] && caixa[2] > o[0] && caixa[1] < o[3] && caixa[3] > o[1]
    );

    if (colide) continue;

    ocupados.push(caixa);
    nomes.push({
      id: municipio.id,
      nome: municipio.nome,
      x: municipio.lx,
      y: municipio.ly,
      destaque,
    });
  }

  return nomes;
}

type CamadaProps = {
  modo: ModoMapa;
  onSelect: (id: string) => void;
};

/**
 * Camada com os 645 municípios. Fica memorizada e as bordas não
 * mudam de espessura com o zoom (non-scaling-stroke), então ela
 * só é redesenhada quando o modo muda — não a cada movimento.
 */
const CamadaMunicipios = memo(function CamadaMunicipios({
  modo,
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
            strokeWidth={0.7}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
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
  const [larguraTela, setLarguraTela] = useState(0);
  const [vista, setVista] = useState<Vista>(() => vistaPara(enquadramento));

  // Vista no início de um gesto (arraste ou pinça).
  const inicioGesto = useRef<Vista>(vista);

  // Ao escolher "Estado inteiro", "Capital" ou um município da busca,
  // o mapa volta para o enquadramento pedido.
  useEffect(() => {
    setVista(vistaPara(enquadramento));
  }, [enquadramento]);

  const pixelsPorUnidade = larguraTela > 0 ? larguraTela / vista.largura : 1;

  const nomes = useMemo(
    () =>
      larguraTela > 0
        ? escolherNomes(vista, pixelsPorUnidade, larguraTela, selecionadoId)
        : [],
    [vista, pixelsPorUnidade, selecionadoId, larguraTela]
  );

  const selecionado = selecionadoId
    ? municipiosSP.find((m) => m.id === selecionadoId)
    : undefined;

  const arrastar = Gesture.Pan()
    .minDistance(6)
    .runOnJS(true)
    .onStart(() => {
      inicioGesto.current = vista;
    })
    .onUpdate((evento) => {
      const inicio = inicioGesto.current;
      const unidadesPorPixel = inicio.largura / larguraTela;

      setVista(
        limitarVista({
          largura: inicio.largura,
          x: inicio.x - evento.translationX * unidadesPorPixel,
          y: inicio.y - evento.translationY * unidadesPorPixel,
        })
      );
    });

  const pinca = Gesture.Pinch()
    .runOnJS(true)
    .onStart(() => {
      inicioGesto.current = vista;
    })
    .onUpdate((evento) => {
      const inicio = inicioGesto.current;
      const unidadesPorPixel = inicio.largura / larguraTela;

      setVista(
        zoomEm(
          inicio,
          evento.scale,
          inicio.x + evento.focalX * unidadesPorPixel,
          inicio.y + evento.focalY * unidadesPorPixel
        )
      );
    });

  const gestos = Gesture.Simultaneous(arrastar, pinca);

  function medir(evento: LayoutChangeEvent) {
    setLarguraTela(evento.nativeEvent.layout.width);
  }

  const alturaTela = larguraTela * PROPORCAO;
  const unidadesPorPixel = 1 / pixelsPorUnidade;
  const noZoomMaximo = vista.largura <= LARGURA_MINIMA + 0.01;
  const noZoomMinimo = vista.largura >= MAPA_SP_LARGURA - 0.01;

  return (
    <View
      style={styles.container}
      onLayout={medir}
      accessibilityLabel="Mapa de calor dos municípios de São Paulo. Use a busca para consultar um município."
    >
      {larguraTela > 0 && (
        <GestureDetector gesture={gestos}>
          <View style={styles.area}>
            <Svg
              width={larguraTela}
              height={alturaTela}
              viewBox={`${vista.x} ${vista.y} ${vista.largura} ${vista.largura * PROPORCAO}`}
            >
              <CamadaMunicipios modo={modo} onSelect={onSelect} />

              {selecionado && (
                <Path
                  d={selecionado.d}
                  fill="none"
                  fillRule="evenodd"
                  stroke={COR_DESTAQUE}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* Nomes das cidades: contorno claro por baixo para ler sobre qualquer cor */}
              <G pointerEvents="none">
                {nomes.map((nome) => {
                  const tamanho =
                    (nome.destaque ? TAMANHO_NOME + 1 : TAMANHO_NOME) *
                    unidadesPorPixel;

                  return (
                    <G key={nome.id}>
                      <SvgText
                        x={nome.x}
                        y={nome.y}
                        dy={tamanho * 0.35}
                        fontSize={tamanho}
                        fontWeight={nome.destaque ? '700' : '600'}
                        fontFamily={FONTE_NOME}
                        textAnchor="middle"
                        fill="none"
                        stroke={COR_BORDA}
                        strokeWidth={3 * unidadesPorPixel}
                        strokeLinejoin="round"
                      >
                        {nome.nome}
                      </SvgText>
                      <SvgText
                        x={nome.x}
                        y={nome.y}
                        dy={tamanho * 0.35}
                        fontSize={tamanho}
                        fontWeight={nome.destaque ? '700' : '600'}
                        fontFamily={FONTE_NOME}
                        textAnchor="middle"
                        fill={COR_NOME}
                      >
                        {nome.nome}
                      </SvgText>
                    </G>
                  );
                })}
              </G>
            </Svg>
          </View>
        </GestureDetector>
      )}

      {/* Botões de zoom */}
      <View style={styles.zoomControls}>
        <BotaoZoom
          icone="add"
          rotulo="Aproximar"
          desativado={noZoomMaximo}
          onPress={() => setVista((v) => zoomEm(v, 1.8))}
        />
        <BotaoZoom
          icone="remove"
          rotulo="Afastar"
          desativado={noZoomMinimo}
          onPress={() => setVista((v) => zoomEm(v, 1 / 1.8))}
        />
        <BotaoZoom
          icone="scan-outline"
          rotulo="Ver o estado inteiro"
          desativado={noZoomMinimo}
          onPress={() => setVista(vistaPara({ tipo: 'estado' }))}
        />
      </View>
    </View>
  );
}

function BotaoZoom({
  icone,
  rotulo,
  desativado,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  desativado: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desativado}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: desativado }}
      style={({ pressed }) => [
        styles.zoomButton,
        desativado && styles.zoomButtonDisabled,
        pressed && styles.zoomButtonPressed,
      ]}
    >
      <Ionicons name={icone} size={20} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: MAPA_SP_LARGURA / MAPA_SP_ALTURA,
    borderRadius: 14,
    overflow: 'hidden',
  },

  area: {
    flex: 1,
  },

  zoomControls: {
    position: 'absolute',
    top: 8,
    right: 8,
    gap: 6,
  },

  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E6DDE0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 3,
  },

  zoomButtonDisabled: {
    opacity: 0.4,
  },

  zoomButtonPressed: {
    backgroundColor: '#F6EEF0',
  },
});
