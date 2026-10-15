import { Ionicons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import {
  ServicoMulher,
  servicosMulherSP,
  TipoServico,
} from '../data/mapaCalor/servicosMulherSP';
import { projetar } from '../utils/areaDoPonto';
import type { MarcadorMapa } from './MapaInterativo';

/**
 * Serviços da rede de apoio desenhados sobre o mapa da cidade, com os
 * mesmos ícones da tela Rede de Apoio.
 */

export type CategoriaServico = 'delegacia' | 'centro' | 'saude' | 'defensoria';

export const CATEGORIAS: Record<
  CategoriaServico,
  { nome: string; icone: keyof typeof Ionicons.glyphMap; cor: string }
> = {
  delegacia: { nome: 'Delegacia da Mulher', icone: 'business-outline', cor: '#3D1E45' },
  centro: { nome: 'Centro de referência', icone: 'heart-outline', cor: '#B03A6A' },
  saude: { nome: 'Saúde (violência sexual)', icone: 'medkit-outline', cor: '#1F7A6B' },
  defensoria: { nome: 'Defensoria Pública', icone: 'scale-outline', cor: '#9A6418' },
};

export function categoriaDe(tipo: TipoServico): CategoriaServico {
  if (tipo === 'ddm') return 'delegacia';
  if (tipo === 'saude') return 'saude';
  if (tipo === 'defensoria') return 'defensoria';
  return 'centro';
}

const NOME_TIPO: Record<TipoServico, string> = {
  ddm: 'Delegacia de Defesa da Mulher',
  'casa-brasileira': 'Casa da Mulher Brasileira',
  casa: 'Casa da Mulher (centro de referência)',
  cdcm: 'Centro de Defesa e Convivência da Mulher',
  saude: 'Hospital de referência para violência sexual',
  defensoria: 'Defensoria Pública',
};

const servicoPorId = new Map(servicosMulherSP.map((s) => [s.id, s]));

export function servicoDoMarcador(id: string) {
  return servicoPorId.get(id.replace(/^servico-/, ''));
}

/** Marcadores fixos de todos os serviços com localização. */
export const marcadoresServicos: MarcadorMapa[] = servicosMulherSP
  .filter((s) => s.lat !== null && s.lon !== null)
  // a 1ª DDM fica dentro da Casa da Mulher Brasileira: um ícone só
  .filter((s) => s.id !== 'ddm1')
  .map((s) => {
    const { x, y } = projetar(s.lat as number, s.lon as number);
    const categoria = CATEGORIAS[categoriaDe(s.tipo)];
    return {
      id: `servico-${s.id}`,
      x,
      y,
      icone: categoria.icone,
      cor: categoria.cor,
      rotulo: `${categoria.nome}: ${s.nome}`,
    };
  });

/** Pino do lugar buscado ou da localização atual. */
export function marcadorOrigem(nome: string, lat: number, lon: number): MarcadorMapa {
  const { x, y } = projetar(lat, lon);
  return {
    id: 'origem',
    x,
    y,
    icone: 'location',
    cor: '#C0392B',
    rotulo: `Ponto buscado: ${nome}`,
    sempreVisivel: true,
  };
}

export function LegendaServicos({ visiveis }: { visiveis: boolean }) {
  return (
    <View style={styles.legend}>
      <View style={styles.legendRow}>
        {(Object.keys(CATEGORIAS) as CategoriaServico[]).map((c) => (
          <View key={c} style={styles.legendItem}>
            <View style={[styles.legendIcon, { borderColor: CATEGORIAS[c].cor }]}>
              <Ionicons name={CATEGORIAS[c].icone} size={12} color={CATEGORIAS[c].cor} />
            </View>
            <Text style={styles.legendText}>{CATEGORIAS[c].nome}</Text>
          </View>
        ))}
      </View>
      {!visiveis && (
        <Text style={styles.legendHint}>
          Aproxime o mapa (+ ou pinça) ou busque um lugar para ver os serviços.
        </Text>
      )}
    </View>
  );
}

export function CartaoServicoMapa({
  servico,
  onFechar,
}: {
  servico: ServicoMulher;
  onFechar: () => void;
}) {
  const categoria = CATEGORIAS[categoriaDe(servico.tipo)];
  const telefone = servico.telefone.split('/')[0].replace(/[^0-9]/g, '');
  const aproximado = servico.precisao !== 'endereco';

  return (
    <View style={[styles.card, { borderLeftColor: categoria.cor }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: categoria.cor }]}>
          <Ionicons name={categoria.icone} size={18} color={colors.white} />
        </View>
        <View style={styles.cardTitleBox}>
          <Text style={[styles.cardType, { color: categoria.cor }]}>
            {NOME_TIPO[servico.tipo]}
          </Text>
          <Text style={styles.cardName}>{servico.nome}</Text>
        </View>
        <Pressable onPress={onFechar} accessibilityLabel="Fechar" hitSlop={8}>
          <Ionicons name="close" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <Text style={styles.cardText}>{servico.endereco}</Text>
      <Text style={styles.cardText}>Horário: {servico.horario}</Text>
      {servico.id === 'cmb' && (
        <Text style={styles.cardText}>
          No mesmo endereço: 1ª DDM – Centro (24 horas).
        </Text>
      )}
      {servico.tipo === 'saude' && (
        <Text style={styles.cardNote}>
          Atende vítimas de violência sexual (profilaxia de IST/HIV,
          contracepção de emergência e aborto legal). Não é preciso boletim de
          ocorrência.
        </Text>
      )}
      {servico.tipo === 'defensoria' && (
        <Text style={styles.cardNote}>
          Orientação jurídica gratuita e pedido de medida protetiva. É preciso
          agendar antes pelo site ou telefone da Defensoria.
        </Text>
      )}
      {servico.nota && <Text style={styles.cardNote}>{servico.nota}</Text>}
      {aproximado && (
        <Text style={styles.cardMeta}>Posição no mapa aproximada.</Text>
      )}

      <Pressable
        style={styles.callButton}
        onPress={() => Linking.openURL(`tel:${telefone}`)}
        accessibilityLabel={`Ligar para ${servico.nome}`}
      >
        <Ionicons name="call-outline" size={16} color={colors.primary} />
        <Text style={styles.callText}>{servico.telefone}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { gap: 6, marginTop: 10 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendIcon: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white,
  },
  legendText: { color: colors.text, fontSize: 12 },
  legendHint: { color: '#6E6170', fontSize: 12, lineHeight: 17 },

  card: {
    backgroundColor: colors.white, borderRadius: 16, padding: 14, gap: 4,
    borderWidth: 1, borderColor: '#E6DDE0', borderLeftWidth: 4, marginTop: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 4 },
  cardIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  cardTitleBox: { flex: 1, gap: 1 },
  cardType: { fontSize: 12, fontWeight: '700' },
  cardName: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  cardText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  cardNote: { color: '#6E6170', fontSize: 12, lineHeight: 17, marginTop: 2 },
  cardMeta: { color: '#857A82', fontSize: 11, marginTop: 2 },
  callButton: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
    marginTop: 6, borderWidth: 1, borderColor: '#D9CBD0', borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  callText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
});
