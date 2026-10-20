import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  StyleSheet,
  Text as RNText,
  TextProps,
  TextStyle,
} from 'react-native';

/**
 * Texto do SOMA.
 *
 * Funciona como o `Text` do React Native, mas aplica o tamanho de texto
 * escolhido em Configurações → Acessibilidade → Tamanho do texto.
 * A escolha fica salva só neste aparelho (AsyncStorage).
 *
 * Todas as telas importam `Text` daqui, e não de 'react-native'.
 */

export const TEXT_SCALE_STORAGE_KEY = '@soma:text-scale';

export type EscalaTextoId = 'normal' | 'grande' | 'muito-grande';

export const ESCALAS_TEXTO: {
  id: EscalaTextoId;
  rotulo: string;
  fator: number;
}[] = [
  { id: 'normal', rotulo: 'Normal', fator: 1 },
  { id: 'grande', rotulo: 'Grande', fator: 1.15 },
  { id: 'muito-grande', rotulo: 'Muito grande', fator: 1.3 },
];

/** Tamanho padrão do React Native quando o estilo não define fontSize. */
const TAMANHO_PADRAO = 14;

function fatorDe(id: EscalaTextoId) {
  return ESCALAS_TEXTO.find((e) => e.id === id)?.fator ?? 1;
}

/** Lê a escala salva; qualquer valor desconhecido volta para "normal". */
export async function carregarEscalaTexto(): Promise<EscalaTextoId> {
  try {
    const salvo = await AsyncStorage.getItem(TEXT_SCALE_STORAGE_KEY);
    return ESCALAS_TEXTO.some((e) => e.id === salvo)
      ? (salvo as EscalaTextoId)
      : 'normal';
  } catch {
    return 'normal';
  }
}

type ContextoEscala = {
  escala: EscalaTextoId;
  fator: number;
  /** Troca a escala e salva a escolha. */
  definirEscala: (id: EscalaTextoId) => Promise<void>;
};

const EscalaContext = createContext<ContextoEscala>({
  escala: 'normal',
  fator: 1,
  definirEscala: async () => {},
});

// Texto dentro de outro Texto herda o tamanho do pai quando não define o seu.
const AninhadoContext = createContext(false);

export function TextScaleProvider({
  inicial = 'normal',
  children,
}: {
  inicial?: EscalaTextoId;
  children: ReactNode;
}) {
  const [escala, setEscala] = useState<EscalaTextoId>(inicial);

  const definirEscala = useCallback(async (id: EscalaTextoId) => {
    setEscala(id);

    try {
      if (id === 'normal') {
        await AsyncStorage.removeItem(TEXT_SCALE_STORAGE_KEY);
      } else {
        await AsyncStorage.setItem(TEXT_SCALE_STORAGE_KEY, id);
      }
    } catch (error) {
      console.warn('Erro ao salvar o tamanho do texto:', error);
    }
  }, []);

  const valor = useMemo(
    () => ({ escala, fator: fatorDe(escala), definirEscala }),
    [escala, definirEscala]
  );

  return (
    <EscalaContext.Provider value={valor}>{children}</EscalaContext.Provider>
  );
}

export function useEscalaTexto() {
  return useContext(EscalaContext);
}

export function Text({ style, ...props }: TextProps) {
  const { fator } = useContext(EscalaContext);
  const aninhado = useContext(AninhadoContext);

  const estilo = useMemo(() => {
    if (fator === 1) {
      return style;
    }

    const plano = StyleSheet.flatten(style) ?? {};
    const tamanho = plano.fontSize ?? (aninhado ? undefined : TAMANHO_PADRAO);
    const escalado: TextStyle = {};

    if (tamanho !== undefined) {
      escalado.fontSize = Math.round(tamanho * fator * 10) / 10;
    }

    if (plano.lineHeight !== undefined) {
      escalado.lineHeight = Math.round(plano.lineHeight * fator * 10) / 10;
    }

    return [style, escalado];
  }, [style, fator, aninhado]);

  return (
    <AninhadoContext.Provider value>
      <RNText {...props} style={estilo} />
    </AninhadoContext.Provider>
  );
}
