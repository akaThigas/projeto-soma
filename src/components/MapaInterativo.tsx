import { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { G, Path } from 'react-native-svg';

import { colors } from '../constants/theme';

/**
 * Mapa coroplético genérico, usado pelo mapa do estado (municípios)
 * e pelo mapa da capital (distritos).
 *
 * - zoom com botões + / −, arraste e pinça;
 * - toque em uma área mostra uma etiqueta com o nome e um valor;
 * - as cores de cada área vêm de quem usa o componente.
 */

export type FormaMapa = {
  id: string;
  nome: string;
  d: string; // caminho SVG
  bbox: [number, number, number, number]; // xMin, yMin, xMax, yMax
  lx: number; // ponto da etiqueta (dentro da área)
  ly: number;
};

/** Ícone sobre o mapa (ex.: serviço de apoio), em unidades do mapa. */
export type MarcadorMapa = {
  id: string;
  x: number;
  y: number;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
  rotulo: string; // para leitores de tela
  /** Aparece mesmo sem zoom (ex.: o lugar buscado). */
  sempreVisivel?: boolean;
};

export type VistaMapa = {
  x: number;
  y: number;
  largura: number; // largura visível, em unidades do mapa
};

const COR_DESTAQUE = '#F2B134';
const COR_BORDA = '#FFFDF1';

const TAMANHO_MARCADOR = 28;

// Área ocupada pelos botões de zoom (canto superior direito), em pixels.
const AREA_BOTOES = { largura: 52, altura: 134 };

export function vistaInteira(larguraMapa: number): VistaMapa {
  return { x: 0, y: 0, largura: larguraMapa };
}

function limitar(
  vista: VistaMapa,
  larguraMapa: number,
  alturaMapa: number,
  larguraMinima: number
): VistaMapa {
  const proporcao = alturaMapa / larguraMapa;
  const largura = Math.min(larguraMapa, Math.max(larguraMinima, vista.largura));

  return {
    largura,
    x: Math.min(Math.max(vista.x, 0), larguraMapa - largura),
    y: Math.min(Math.max(vista.y, 0), alturaMapa - largura * proporcao),
  };
}

/** Vista centrada em uma área, com uma margem ao redor. */
export function vistaDaForma(
  forma: FormaMapa,
  larguraMapa: number,
  alturaMapa: number,
  margem = 2.6,
  larguraMinima = larguraMapa / 14
): VistaMapa {
  const proporcao = alturaMapa / larguraMapa;
  const [x0, y0, x1, y1] = forma.bbox;
  const largura = Math.max(
    larguraMinima,
    (x1 - x0) * margem,
    ((y1 - y0) * margem) / proporcao
  );

  return limitar(
    {
      x: (x0 + x1) / 2 - largura / 2,
      y: (y0 + y1) / 2 - (largura * proporcao) / 2,
      largura,
    },
    larguraMapa,
    alturaMapa,
    0
  );
}

type CamadaProps = {
  formas: FormaMapa[];
  corDe: (id: string) => string;
  chaveCores: string;
  onSelect: (id: string) => void;
};

/**
 * Camada com todas as áreas. Fica memorizada e as bordas não mudam
 * de espessura com o zoom (non-scaling-stroke): só é redesenhada
 * quando as cores mudam (chaveCores), não a cada movimento.
 */
const Camada = memo(
  function Camada({ formas, corDe, onSelect }: CamadaProps) {
    return (
      <G>
        {formas.map((forma) => (
          <Path
            key={forma.id}
            d={forma.d}
            fill={corDe(forma.id)}
            fillRule="evenodd"
            stroke={COR_BORDA}
            strokeWidth={0.7}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            onPress={() => onSelect(forma.id)}
          />
        ))}
      </G>
    );
  },
  (antes, depois) =>
    antes.formas === depois.formas &&
    antes.chaveCores === depois.chaveCores &&
    antes.onSelect === depois.onSelect
);

type Props = {
  formas: FormaMapa[];
  larguraMapa: number;
  alturaMapa: number;
  corDe: (id: string) => string;
  /** Muda sempre que as cores mudam (ex.: o modo do mapa). */
  chaveCores: string;
  /** Segunda linha da etiqueta (ex.: o valor do indicador). */
  valorDe: (id: string) => string;
  /** Ao mudar (novo objeto), o mapa vai para esta vista. */
  vista: VistaMapa;
  selecionadoId?: string;
  onSelect: (id: string) => void;
  descricao: string;
  /** Quantas vezes é possível aproximar em relação ao mapa inteiro. */
  zoomMaximo?: number;
  /** Ícones sobre o mapa; aparecem quando o mapa está aproximado. */
  marcadores?: MarcadorMapa[];
  /** Fração da largura do mapa abaixo da qual os ícones aparecem. */
  zoomMarcadores?: number;
  marcadorSelecionadoId?: string;
  onMarcador?: (id: string) => void;
  /** Avisa quem usa o mapa se os ícones estão visíveis. */
  onMarcadoresVisiveis?: (visiveis: boolean) => void;
};

export function MapaInterativo({
  formas,
  larguraMapa,
  alturaMapa,
  corDe,
  chaveCores,
  valorDe,
  vista: vistaPedida,
  selecionadoId,
  onSelect,
  descricao,
  zoomMaximo = 25,
  marcadores = [],
  zoomMarcadores = 0.6,
  marcadorSelecionadoId,
  onMarcador,
  onMarcadoresVisiveis,
}: Props) {
  const proporcao = alturaMapa / larguraMapa;
  const larguraMinima = larguraMapa / zoomMaximo;

  const [larguraTela, setLarguraTela] = useState(0);
  const [vista, setVista] = useState<VistaMapa>(vistaPedida);

  // Tamanho da etiqueta com o nome, medido depois de desenhada.
  const [etiqueta, setEtiqueta] = useState({ largura: 140, altura: 46 });

  // Vista no início de um gesto (arraste ou pinça).
  const inicioGesto = useRef<VistaMapa>(vista);

  // Momento do último arraste: o toque que encerra um arraste
  // não deve selecionar a área que estava sob o dedo.
  const ultimoArraste = useRef(0);

  const selecionar = useCallback(
    (id: string) => {
      if (Date.now() - ultimoArraste.current < 350) return;
      onSelect(id);
    },
    [onSelect]
  );

  useEffect(() => {
    setVista(vistaPedida);
  }, [vistaPedida]);

  const ajustar = (v: VistaMapa) =>
    limitar(v, larguraMapa, alturaMapa, larguraMinima);

  /** Aproxima ou afasta mantendo fixo o ponto (fx, fy) do mapa. */
  const zoomEm = (v: VistaMapa, fator: number, fx?: number, fy?: number) => {
    const novaLargura = Math.min(
      larguraMapa,
      Math.max(larguraMinima, v.largura / fator)
    );
    const escala = novaLargura / v.largura;
    const focoX = fx ?? v.x + v.largura / 2;
    const focoY = fy ?? v.y + (v.largura * proporcao) / 2;

    return ajustar({
      largura: novaLargura,
      x: focoX - (focoX - v.x) * escala,
      y: focoY - (focoY - v.y) * escala,
    });
  };

  const arrastar = Gesture.Pan()
    .minDistance(6)
    .runOnJS(true)
    .onStart(() => {
      inicioGesto.current = vista;
    })
    .onUpdate((evento) => {
      ultimoArraste.current = Date.now();
      const inicio = inicioGesto.current;
      const unidadesPorPixel = inicio.largura / larguraTela;

      setVista(
        ajustar({
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
      ultimoArraste.current = Date.now();
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

  const alturaTela = larguraTela * proporcao;
  const pixelsPorUnidade = larguraTela > 0 ? larguraTela / vista.largura : 1;

  const selecionado = selecionadoId
    ? formas.find((f) => f.id === selecionadoId)
    : undefined;

  // Etiqueta da área tocada: posição do ponto na tela, em pixels.
  const pontoX = selecionado ? (selecionado.lx - vista.x) * pixelsPorUnidade : 0;
  const pontoY = selecionado ? (selecionado.ly - vista.y) * pixelsPorUnidade : 0;
  const pontoVisivel =
    !!selecionado &&
    pontoX >= 0 &&
    pontoX <= larguraTela &&
    pontoY >= 0 &&
    pontoY <= alturaTela;

  // A etiqueta fica acima do ponto; se não couber, vai para baixo.
  const etiquetaEmCima = pontoY - etiqueta.altura - 12 >= 4;
  const etiquetaTopo = etiquetaEmCima
    ? pontoY - etiqueta.altura - 12
    : pontoY + 12;

  // Não deixa a etiqueta ficar embaixo dos botões de zoom.
  const sobreBotoes = etiquetaTopo < AREA_BOTOES.altura;
  const limiteDireito = sobreBotoes
    ? larguraTela - AREA_BOTOES.largura
    : larguraTela - 6;
  const etiquetaEsquerda = Math.max(
    Math.min(pontoX - etiqueta.largura / 2, limiteDireito - etiqueta.largura),
    6
  );

  // Ícones só com o mapa aproximado, para não poluir a visão da cidade inteira.
  const marcadoresVisiveis = vista.largura <= larguraMapa * zoomMarcadores;

  useEffect(() => {
    onMarcadoresVisiveis?.(marcadoresVisiveis);
  }, [marcadoresVisiveis, onMarcadoresVisiveis]);

  const marcadoresNaTela = marcadores
    .filter((m) => m.sempreVisivel || marcadoresVisiveis)
    .map((m) => ({
      ...m,
      px: (m.x - vista.x) * pixelsPorUnidade,
      py: (m.y - vista.y) * pixelsPorUnidade,
    }))
    .filter(
      (m) =>
        m.px >= -TAMANHO_MARCADOR &&
        m.px <= larguraTela + TAMANHO_MARCADOR &&
        m.py >= -TAMANHO_MARCADOR &&
        m.py <= alturaTela + TAMANHO_MARCADOR
    );

  function desenharMarcador(m: (typeof marcadoresNaTela)[number]) {
    const selecionadoAgora = m.id === marcadorSelecionadoId;
    const tamanho = selecionadoAgora ? TAMANHO_MARCADOR + 8 : TAMANHO_MARCADOR;
    return (
      <Pressable
        key={m.id}
        onPress={() => onMarcador?.(m.id)}
        accessibilityRole="button"
        accessibilityLabel={m.rotulo}
        hitSlop={6}
        style={[
          styles.marcador,
          {
            left: m.px - tamanho / 2,
            top: m.py - tamanho / 2,
            width: tamanho,
            height: tamanho,
            borderRadius: tamanho / 2,
            borderColor: m.cor,
            backgroundColor: selecionadoAgora ? m.cor : colors.white,
          },
        ]}
      >
        <Ionicons
          name={m.icone}
          size={selecionadoAgora ? 18 : 15}
          color={selecionadoAgora ? colors.white : m.cor}
        />
      </Pressable>
    );
  }

  const noZoomMaximo = vista.largura <= larguraMinima + 0.01;
  const noZoomMinimo = vista.largura >= larguraMapa - 0.01;

  return (
    <View
      style={[styles.container, { aspectRatio: larguraMapa / alturaMapa }]}
      onLayout={medir}
      accessibilityLabel={descricao}
    >
      {larguraTela > 0 && (
        <GestureDetector gesture={gestos}>
          <View style={styles.area}>
            <Svg
              width={larguraTela}
              height={alturaTela}
              viewBox={`${vista.x} ${vista.y} ${vista.largura} ${vista.largura * proporcao}`}
            >
              <Camada
                formas={formas}
                corDe={corDe}
                chaveCores={chaveCores}
                onSelect={selecionar}
              />

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
            </Svg>
          </View>
        </GestureDetector>
      )}

      {/* Ícones dos serviços */}
      {marcadoresNaTela.filter((m) => !m.sempreVisivel).map(desenharMarcador)}

      {/* Etiqueta com o nome da área tocada */}
      {pontoVisivel && selecionado && (
        <>
          <View
            pointerEvents="none"
            style={[styles.ponto, { left: pontoX - 5, top: pontoY - 5 }]}
          />
          <View
            pointerEvents="none"
            accessibilityLiveRegion="polite"
            onLayout={(evento) => {
              const { width, height } = evento.nativeEvent.layout;
              if (
                Math.abs(width - etiqueta.largura) > 1 ||
                Math.abs(height - etiqueta.altura) > 1
              ) {
                setEtiqueta({ largura: width, altura: height });
              }
            }}
            style={[
              styles.etiqueta,
              { left: etiquetaEsquerda, top: etiquetaTopo },
            ]}
          >
            <Text style={styles.etiquetaNome} numberOfLines={1}>
              {selecionado.nome}
            </Text>
            <Text style={styles.etiquetaValor} numberOfLines={1}>
              {valorDe(selecionado.id)}
            </Text>
          </View>
        </>
      )}

      {/* Pino do lugar buscado: por cima da etiqueta */}
      {marcadoresNaTela.filter((m) => m.sempreVisivel).map(desenharMarcador)}

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
          rotulo="Ver o mapa inteiro"
          desativado={noZoomMinimo}
          onPress={() => setVista(vistaInteira(larguraMapa))}
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
    borderRadius: 14,
    overflow: 'hidden',
  },

  area: {
    flex: 1,
  },

  ponto: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COR_DESTAQUE,
    borderWidth: 2,
    borderColor: colors.white,
  },

  etiqueta: {
    position: 'absolute',
    maxWidth: 200,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },

  etiquetaNome: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  etiquetaValor: {
    color: '#F2E8ED',
    fontSize: 12,
    marginTop: 1,
  },

  marcador: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 4,
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
