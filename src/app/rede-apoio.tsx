import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useMemo, useState } from 'react';

import { MapaDestaque } from '../components/MapaDestaque';
import {
  CATEGORIAS,
  CategoriaServico,
  categoriaDe,
  NOME_TIPO,
  TODAS_CATEGORIAS,
} from '../components/ServicosNoMapa';
import { colors } from '../constants/theme';
import {
  ServicoMulher,
  servicosMulherSP,
} from '../data/mapaCalor/servicosMulherSP';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/**
 * Lista da rede de apoio da cidade de São Paulo, com os mesmos dados
 * (oficiais) que aparecem como ícones no mapa.
 */

type Filtro = 'todos' | CategoriaServico;

const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: 'todos', rotulo: 'Todos' },
  { id: 'delegacia', rotulo: 'Delegacias' },
  { id: 'centro', rotulo: 'Casas e centros' },
  { id: 'saude', rotulo: 'Saúde' },
  { id: 'defensoria', rotulo: 'Defensoria' },
];

const POR_PAGINA = 10;

const semAcento = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

// Delegacias primeiro, depois casas e centros, saúde e defensoria;
// dentro de cada tipo, a ordem da fonte.
const servicos: ServicoMulher[] = TODAS_CATEGORIAS.flatMap((categoria) =>
  servicosMulherSP.filter((s) => categoriaDe(s.tipo) === categoria)
);

const contagem = servicos.reduce(
  (acc, s) => {
    acc[categoriaDe(s.tipo)] += 1;
    return acc;
  },
  { delegacia: 0, centro: 0, saude: 0, defensoria: 0 } as Record<
    CategoriaServico,
    number
  >
);

const textoBusca = new Map(
  servicos.map((s) => [
    s.id,
    semAcento(`${s.nome} ${s.endereco} ${NOME_TIPO[s.tipo]}`),
  ])
);

/** Primeiro número do campo (alguns serviços têm mais de um telefone). */
const telefoneParaLigar = (telefone: string) =>
  telefone.split('/')[0].replace(/[^0-9]/g, '');

export default function RedeApoioScreen() {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [limite, setLimite] = useState(POR_PAGINA);

  const {
    isCompactPhone,
    isPhone,
    horizontalPadding,
    topPadding,
    contentMaxWidth,
  } = useResponsiveLayout();

  const resultados = useMemo(() => {
    const termo = semAcento(busca.trim());

    return servicos.filter((s) => {
      const doFiltro = filtro === 'todos' || categoriaDe(s.tipo) === filtro;
      const daBusca = !termo || (textoBusca.get(s.id) ?? '').includes(termo);
      return doFiltro && daBusca;
    });
  }, [busca, filtro]);

  const visiveis = resultados.slice(0, limite);
  const restantes = resultados.length - visiveis.length;

  function mudarBusca(texto: string) {
    setBusca(texto);
    setLimite(POR_PAGINA);
  }

  function mudarFiltro(novo: Filtro) {
    setFiltro(novo);
    setLimite(POR_PAGINA);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: topPadding },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={26} color={colors.primary} />
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>

          <Text
            accessibilityRole="header"
            style={[styles.title, { fontSize: isCompactPhone ? 30 : 36 }]}
          >
            Rede de apoio
          </Text>

          <Text
            style={[styles.subtitle, { fontSize: isCompactPhone ? 15 : 18 }]}
          >
            Serviços de orientação, acolhimento, proteção e atendimento na
            cidade de São Paulo.
          </Text>

          {/* O mapa é o caminho principal */}
          <MapaDestaque
            texto="Veja todos os serviços da lista abaixo no mapa da cidade e encontre o mais perto de você."
            botao="Ver no mapa de São Paulo"
          />

          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={22} color="#80777D" />

            <TextInput
              style={styles.searchInput}
              value={busca}
              onChangeText={mudarBusca}
              placeholder="Buscar por nome, bairro ou rua"
              placeholderTextColor="#918991"
              autoCorrect={false}
              accessibilityLabel="Buscar serviço"
            />

            {busca.length > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={() => mudarBusca('')}
                accessibilityLabel="Limpar busca"
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={21} color="#918991" />
              </Pressable>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {FILTROS.map((item) => {
              const ativo = item.id === filtro;
              const total =
                item.id === 'todos' ? servicos.length : contagem[item.id];

              return (
                <Pressable
                  key={item.id}
                  style={[
                    styles.filterButton,
                    ativo && styles.filterButtonActive,
                  ]}
                  onPress={() => mudarFiltro(item.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                >
                  <Text
                    style={[styles.filterText, ativo && styles.filterTextActive]}
                  >
                    {item.rotulo} ({total})
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.resultCount}>
            {resultados.length}{' '}
            {resultados.length === 1
              ? 'serviço encontrado'
              : 'serviços encontrados'}
          </Text>

          <View style={styles.cards}>
            {visiveis.map((servico) => (
              <CartaoServico
                key={servico.id}
                servico={servico}
                largura={isPhone ? '100%' : '48.5%'}
                compacto={isCompactPhone}
              />
            ))}
          </View>

          {restantes > 0 && (
            <Pressable
              style={({ pressed }) => [
                styles.moreButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setLimite((atual) => atual + POR_PAGINA)}
              accessibilityRole="button"
            >
              <Text style={styles.moreButtonText}>
                Mostrar mais ({restantes}{' '}
                {restantes === 1 ? 'restante' : 'restantes'})
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.primary} />
            </Pressable>
          )}

          {resultados.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={42} color={colors.pink} />
              <Text style={styles.emptyTitle}>Nenhum serviço encontrado</Text>
              <Text style={styles.emptyText}>Tente outro termo ou filtro.</Text>
            </View>
          )}

          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={25}
              color={colors.primary}
            />

            <Text style={styles.noticeText}>
              Endereços e telefones vêm de páginas oficiais da Prefeitura de
              São Paulo e da Defensoria Pública, consultadas em setembro e
              outubro de 2026. Antes de ir, confirme o horário por telefone.
              Em perigo agora, ligue 190. Para orientação, ligue 180.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function CartaoServico({
  servico,
  largura,
  compacto,
}: {
  servico: ServicoMulher;
  largura: '100%' | '48.5%';
  compacto: boolean;
}) {
  const categoria = CATEGORIAS[categoriaDe(servico.tipo)];
  const telefone = telefoneParaLigar(servico.telefone);
  const tamanhoIcone = compacto ? 50 : 58;

  return (
    <View style={[styles.card, { width: largura }]}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconContainer,
            {
              width: tamanhoIcone,
              height: tamanhoIcone,
              borderRadius: tamanhoIcone / 2,
            },
          ]}
        >
          <Ionicons
            name={categoria.icone}
            size={compacto ? 26 : 30}
            color={categoria.cor}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={[styles.serviceType, { color: categoria.cor }]}>
            {NOME_TIPO[servico.tipo]}
          </Text>

          <Text
            style={[styles.serviceName, { fontSize: compacto ? 16 : 18 }]}
          >
            {servico.nome}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={19} color={colors.primary} />
        <Text style={styles.infoText}>{servico.endereco}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="time-outline" size={19} color={colors.primary} />
        <Text style={styles.infoText}>{servico.horario}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={19} color={colors.primary} />
        <Text style={styles.infoText}>{servico.telefone}</Text>
      </View>

      {servico.tipo === 'saude' && (
        <Text style={styles.cardNote}>
          Atende vítimas de violência sexual. Não é preciso boletim de
          ocorrência.
        </Text>
      )}

      {servico.tipo === 'defensoria' && (
        <Text style={styles.cardNote}>
          Orientação jurídica gratuita e pedido de medida protetiva. É
          preciso agendar antes.
        </Text>
      )}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          style={styles.mapButton}
          onPress={() =>
            router.push({ pathname: '/mapa', params: { servico: servico.id } })
          }
          accessibilityLabel={`Ver ${servico.nome} no mapa`}
        >
          <Ionicons name="map-outline" size={18} color={colors.primary} />
          <Text style={styles.mapButtonText}>Ver no mapa</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={styles.callButton}
          onPress={() => Linking.openURL(`tel:${telefone}`)}
          accessibilityLabel={`Ligar para ${servico.nome}`}
        >
          <Ionicons name="call-outline" size={18} color={colors.white} />
          <Text style={styles.callButtonText}>Ligar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    alignItems: 'center',
    paddingBottom: 60,
  },

  content: {
    width: '100%',
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 28,
  },

  backText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  title: {
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 10,
  },

  subtitle: {
    color: colors.text,
    lineHeight: 26,
    maxWidth: 650,
    marginBottom: 24,
  },

  searchContainer: {
    minHeight: 55,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#D8CFD1',
    borderRadius: 18,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  searchInput: {
    flex: 1,
    marginLeft: 9,
    color: colors.text,
    fontSize: 16,
  },

  filters: {
    gap: 9,
    paddingBottom: 4,
  },

  filterButton: {
    minHeight: 40,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D6C9CD',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  filterTextActive: {
    color: colors.white,
  },

  resultCount: {
    color: '#756B72',
    fontSize: 13,
    marginVertical: 18,
  },

  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },

  card: {
    minHeight: 230,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E4DADC',
    borderRadius: 22,
    padding: 17,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },

  iconContainer: {
    backgroundColor: colors.lightPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerText: {
    flex: 1,
  },

  serviceType: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 3,
  },

  serviceName: {
    color: colors.primary,
    fontWeight: '700',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },

  infoText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },

  cardNote: {
    color: '#6E6170',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 'auto',
    paddingTop: 10,
  },

  mapButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  mapButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  callButton: {
    flex: 1,
    minHeight: 44,
    backgroundColor: colors.primary,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  callButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },

  moreButton: {
    minHeight: 48,
    marginTop: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  moreButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.7,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 45,
  },

  emptyTitle: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: '700',
    marginTop: 12,
  },

  emptyText: {
    color: colors.text,
    fontSize: 14,
    marginTop: 5,
  },

  notice: {
    marginTop: 25,
    backgroundColor: '#EFE7EF',
    borderRadius: 20,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  noticeText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
});
