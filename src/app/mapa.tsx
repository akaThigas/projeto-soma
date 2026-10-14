import { useCallback, useMemo, useState } from 'react';

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

import {
  EnquadramentoCapital,
  indicadorDoDistrito,
  legendaDaCapital,
  MapaCalorCapital,
  textoDoValor,
} from '../components/MapaCalorCapital';
import {
  Enquadramento,
  FaixaLegenda,
  indicadorDoMunicipio,
  legendaDoMapa,
  MapaCalorSP,
  ModoMapa,
} from '../components/MapaCalorSP';
import { PainelDelegacias } from '../components/PainelDelegacias';
import { colors } from '../constants/theme';
import {
  feminicidiosSP,
  FONTE_FEMINICIDIO_SP,
} from '../data/mapaCalor/feminicidioSP';
import {
  FONTE_VIOLENCIA_CAPITAL,
  violenciaMulherCapital,
} from '../data/mapaCalor/violenciaMulherCapital';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const GOOGLE_MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Delegacia+da+Mulher+São+Paulo';

const semAcento = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

const numero = (valor: number, casas = 0) =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

/** Filtra por nome, primeiro os que começam com o termo. */
function buscarPorNome<T extends { nome: string }>(lista: T[], busca: string) {
  const termo = semAcento(busca.trim());

  if (termo.length < 2) {
    return [];
  }

  return lista
    .filter((item) => semAcento(item.nome).includes(termo))
    .sort((a, b) => {
      const aComeca = semAcento(a.nome).startsWith(termo) ? 0 : 1;
      const bComeca = semAcento(b.nome).startsWith(termo) ? 0 : 1;
      return aComeca - bComeca || a.nome.localeCompare(b.nome);
    })
    .slice(0, 6);
}

const maisVitimas = [...feminicidiosSP]
  .sort((a, b) => b.feminicidios - a.feminicidios)
  .slice(0, 5);

const maioresCoeficientes = [...violenciaMulherCapital]
  .sort((a, b) => b.taxa - a.taxa)
  .slice(0, 5);

type Area = 'estado' | 'capital';

export default function MapaScreen() {
  const {
    isCompactPhone,
    horizontalPadding,
    topPadding,
    contentMaxWidth,
  } = useResponsiveLayout();

  const [area, setArea] = useState<Area>('estado');

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
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color={colors.primary} />
            <Text style={styles.backText}>Voltar</Text>
          </Pressable>

          <Text
            style={[styles.title, { fontSize: isCompactPhone ? 30 : 36 }]}
          >
            Mapa de calor
          </Text>

          {/* Qual mapa */}
          <View style={styles.areaTabs} accessibilityRole="tablist">
            <AreaButton
              icone="map-outline"
              label="Estado de SP"
              active={area === 'estado'}
              onPress={() => setArea('estado')}
            />
            <AreaButton
              icone="business-outline"
              label="Cidade de São Paulo"
              active={area === 'capital'}
              onPress={() => setArea('capital')}
            />
          </View>

          {area === 'estado' ? (
            <PainelEstado isCompactPhone={isCompactPhone} />
          ) : (
            <PainelCapital isCompactPhone={isCompactPhone} />
          )}

          {/* Atendimento */}
          <Pressable
            style={styles.supportButton}
            onPress={() => router.push('/rede-apoio')}
          >
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Procurando atendimento?</Text>
              <Text style={styles.supportText}>Consulte a Rede de Apoio.</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.white} />
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => Linking.openURL(GOOGLE_MAPS_URL)}
          >
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryButtonText}>
              Ver Delegacias da Mulher no Google Maps
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Estado de SP: feminicídios por município                            */
/* ------------------------------------------------------------------ */

function PainelEstado({ isCompactPhone }: { isCompactPhone: boolean }) {
  const [modo, setModo] = useState<ModoMapa>('taxa');
  const [enquadramento, setEnquadramento] = useState<Enquadramento>({
    tipo: 'estado',
  });
  const [selecionadoId, setSelecionadoId] = useState<string>();
  const [busca, setBusca] = useState('');

  const selecionar = useCallback((id: string) => {
    setSelecionadoId(id);
  }, []);

  const resultados = useMemo(
    () => buscarPorNome(feminicidiosSP, busca),
    [busca]
  );

  function escolherDaBusca(id: string) {
    setSelecionadoId(id);
    setEnquadramento({ tipo: 'municipio', id });
    setBusca('');
  }

  const selecionado = selecionadoId
    ? indicadorDoMunicipio(selecionadoId)
    : undefined;

  const taxaEstado = FONTE_FEMINICIDIO_SP.taxaEstado;

  return (
    <>
      <Text
        style={[styles.subtitle, { fontSize: isCompactPhone ? 15 : 17 }]}
      >
        Vítimas de feminicídio por município do Estado de São Paulo,
        de {FONTE_FEMINICIDIO_SP.periodo}. Os dados são agregados por
        município e não mostram a localização de nenhuma vítima.
      </Text>

      {/* O que o mapa mostra */}
      <View style={styles.segmented} accessibilityRole="tablist">
        <SegmentButton
          label="Taxa por 100 mil hab."
          active={modo === 'taxa'}
          onPress={() => setModo('taxa')}
        />
        <SegmentButton
          label="Número de vítimas"
          active={modo === 'vitimas'}
          onPress={() => setModo('vitimas')}
        />
      </View>

      <CampoBusca
        valor={busca}
        onChange={setBusca}
        rotulo="Buscar município"
      />

      {resultados.length > 0 && (
        <View style={styles.results}>
          {resultados.map((m) => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [
                styles.resultItem,
                pressed && styles.pressed,
              ]}
              onPress={() => escolherDaBusca(m.id)}
            >
              <Text style={styles.resultName}>{m.nome}</Text>
              <Text style={styles.resultValue}>
                {m.feminicidios === 1
                  ? '1 vítima'
                  : `${numero(m.feminicidios)} vítimas`}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {busca.trim().length >= 2 && resultados.length === 0 && (
        <Text style={styles.emptySearch}>
          Nenhum município encontrado com esse nome.
        </Text>
      )}

      {/* Mapa */}
      <View style={styles.mapCard}>
        <MapaCalorSP
          modo={modo}
          enquadramento={enquadramento}
          selecionadoId={selecionadoId}
          onSelect={selecionar}
        />

        <Text style={styles.mapHint}>
          Toque em um município para ver o nome. Arraste para mover e use
          + e − ou o movimento de pinça para aproximar.
        </Text>

        <View style={styles.zoomRow}>
          <ZoomButton
            label="Estado inteiro"
            active={enquadramento.tipo === 'estado'}
            onPress={() => setEnquadramento({ tipo: 'estado' })}
          />
          <ZoomButton
            label="Capital e região"
            active={enquadramento.tipo === 'capital'}
            onPress={() => setEnquadramento({ tipo: 'capital' })}
          />
        </View>
      </View>

      <Legenda
        titulo={
          modo === 'taxa'
            ? 'Vítimas por ano, a cada 100 mil habitantes'
            : `Vítimas de ${FONTE_FEMINICIDIO_SP.periodo}`
        }
        faixas={legendaDoMapa(modo)}
      />

      {/* Município selecionado */}
      {selecionado ? (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailName}>{selecionado.nome}</Text>
            <Pressable
              onPress={() => setSelecionadoId(undefined)}
              accessibilityLabel="Fechar detalhes do município"
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.detailStats}>
            <Stat
              value={numero(selecionado.feminicidios)}
              label={`vítimas de feminicídio (${FONTE_FEMINICIDIO_SP.periodo})`}
            />
            <Stat
              value={numero(selecionado.taxa, 2)}
              label="por 100 mil habitantes, por ano"
            />
          </View>

          <Text style={styles.detailText}>
            População estimada em 2023: {numero(selecionado.populacao)}{' '}
            habitantes.{' '}
            {selecionado.feminicidios === 0
              ? 'Nenhum feminicídio foi registrado no período. Isso não quer dizer que não haja violência contra a mulher no município.'
              : selecionado.taxa > taxaEstado
                ? `A taxa está acima da média do estado (${numero(taxaEstado, 2)}).`
                : `A taxa está igual ou abaixo da média do estado (${numero(taxaEstado, 2)}).`}
          </Text>

          {selecionado.populacao < 20000 && selecionado.feminicidios > 0 && (
            <Text style={styles.detailNote}>
              Em municípios pequenos, um único caso já eleva muito a
              taxa. Compare também o número de vítimas.
            </Text>
          )}

          {enquadramento.tipo === 'municipio' && (
            <Pressable
              style={styles.linkButton}
              onPress={() => setEnquadramento({ tipo: 'estado' })}
            >
              <Ionicons name="expand-outline" size={18} color={colors.primary} />
              <Text style={styles.linkButtonText}>Ver o estado inteiro</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <DicaToque texto="Toque em um município no mapa ou use a busca para ver os números dele." />
      )}

      {/* Ranking */}
      <Text style={styles.sectionTitle}>Municípios com mais vítimas</Text>
      <View style={styles.rankList}>
        {maisVitimas.map((m, indice) => (
          <Pressable
            key={m.id}
            style={({ pressed }) => [
              styles.rankItem,
              indice < maisVitimas.length - 1 && styles.rankDivider,
              pressed && styles.pressed,
            ]}
            onPress={() => escolherDaBusca(m.id)}
          >
            <Text style={styles.rankName}>{m.nome}</Text>
            <Text style={styles.rankValue}>
              {numero(m.feminicidios)} vítimas · {numero(m.taxa, 2)} por
              100 mil
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Como ler */}
      <ComoLer
        itens={[
          'Cores mais claras não significam que um lugar é seguro. A violência contra a mulher é subnotificada e o feminicídio é a forma mais extrema dela.',
          'A taxa é a média anual de vítimas a cada 100 mil habitantes (população total, homens e mulheres) entre 2019 e 2023.',
          'Este mapa usa apenas dados públicos e agregados. Não exibe endereços, ocorrências individuais nem relatos de usuárias.',
        ]}
      />

      {/* Fonte */}
      <View style={styles.sourceBox}>
        <Text style={styles.sourceTitle}>Fontes</Text>
        <Text style={styles.sourceText}>
          Feminicídios: {FONTE_FEMINICIDIO_SP.fonteDados}
        </Text>
        <Text style={styles.sourceText}>
          População: {FONTE_FEMINICIDIO_SP.fontePopulacao}
        </Text>
        <Text style={styles.sourceText}>
          Total no estado: {numero(FONTE_FEMINICIDIO_SP.totalVitimas)}{' '}
          vítimas ({Object.entries(FONTE_FEMINICIDIO_SP.vitimasPorAno)
            .map(([ano, total]) => `${ano}: ${total}`)
            .join(' · ')}).
        </Text>
        <Text style={styles.sourceText}>
          Contornos dos municípios: malha municipal do IBGE, simplificada.
        </Text>
      </View>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Cidade de São Paulo: violência contra a mulher por distrito         */
/* ------------------------------------------------------------------ */

type VisaoCapital = 'distritos' | 'delegacias';

function PainelCapital({ isCompactPhone }: { isCompactPhone: boolean }) {
  const [visao, setVisao] = useState<VisaoCapital>('distritos');

  return (
    <>
      {/* Duas visões da cidade: por distrito ou relatório por área de delegacia */}
      <View style={styles.segmented} accessibilityRole="tablist">
        <SegmentButton
          label="Mapa por distrito"
          active={visao === 'distritos'}
          onPress={() => setVisao('distritos')}
        />
        <SegmentButton
          label="Relatório por área"
          active={visao === 'delegacias'}
          onPress={() => setVisao('delegacias')}
        />
      </View>

      {visao === 'distritos' ? (
        <PainelDistritos isCompactPhone={isCompactPhone} />
      ) : (
        <PainelDelegacias />
      )}
    </>
  );
}

function PainelDistritos({ isCompactPhone }: { isCompactPhone: boolean }) {
  const [enquadramento, setEnquadramento] = useState<EnquadramentoCapital>({
    tipo: 'cidade',
  });
  const [selecionadoId, setSelecionadoId] = useState<string>();
  const [busca, setBusca] = useState('');

  const selecionar = useCallback((id: string) => {
    setSelecionadoId(id);
  }, []);

  const resultados = useMemo(
    () => buscarPorNome(violenciaMulherCapital, busca),
    [busca]
  );

  function escolherDaBusca(id: string) {
    setSelecionadoId(id);
    setEnquadramento({ tipo: 'distrito', id });
    setBusca('');
  }

  const selecionado = selecionadoId
    ? indicadorDoDistrito(selecionadoId)
    : undefined;

  const media = FONTE_VIOLENCIA_CAPITAL.mediaDistritos;

  return (
    <>
      <Text
        style={[styles.subtitle, { fontSize: isCompactPhone ? 15 : 17 }]}
      >
        Mulheres vítimas de violência — todos os tipos registrados, de
        ameaça e agressão a estupro e feminicídio — por distrito da cidade
        de São Paulo, em {FONTE_VIOLENCIA_CAPITAL.anoBase}. Os dados são
        agregados por distrito e não mostram a localização de nenhuma
        vítima.
      </Text>

      <CampoBusca
        valor={busca}
        onChange={setBusca}
        rotulo="Buscar distrito"
      />

      {resultados.length > 0 && (
        <View style={styles.results}>
          {resultados.map((d) => (
            <Pressable
              key={d.id}
              style={({ pressed }) => [
                styles.resultItem,
                pressed && styles.pressed,
              ]}
              onPress={() => escolherDaBusca(d.id)}
            >
              <Text style={styles.resultName}>{d.nome}</Text>
              <Text style={styles.resultValue}>{numero(d.taxa, 2)}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {busca.trim().length >= 2 && resultados.length === 0 && (
        <Text style={styles.emptySearch}>
          Nenhum distrito encontrado com esse nome.
        </Text>
      )}

      {/* Mapa */}
      <View style={styles.mapCard}>
        {/* A cidade é mais alta que larga: limita a largura em telas grandes */}
        <View style={styles.mapCapitalBox}>
          <MapaCalorCapital
            enquadramento={enquadramento}
            selecionadoId={selecionadoId}
            onSelect={selecionar}
          />
        </View>

        <Text style={styles.mapHint}>
          Toque em um distrito para ver o nome. Arraste para mover e use
          + e − ou o movimento de pinça para aproximar.
        </Text>

        <View style={styles.zoomRow}>
          <ZoomButton
            label="Cidade inteira"
            active={enquadramento.tipo === 'cidade'}
            onPress={() => setEnquadramento({ tipo: 'cidade' })}
          />
          <ZoomButton
            label="Centro"
            active={enquadramento.tipo === 'centro'}
            onPress={() => setEnquadramento({ tipo: 'centro' })}
          />
        </View>
      </View>

      <Legenda
        titulo="Mulheres vítimas a cada 10 mil mulheres de 20 a 59 anos"
        faixas={legendaDaCapital()}
      />

      {/* Distrito selecionado */}
      {selecionado ? (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.detailTitleBox}>
              <Text style={styles.detailName}>{selecionado.nome}</Text>
              <Text style={styles.detailSubtitle}>
                Subprefeitura {selecionado.subprefeitura}
              </Text>
            </View>
            <Pressable
              onPress={() => setSelecionadoId(undefined)}
              accessibilityLabel="Fechar detalhes do distrito"
              hitSlop={8}
            >
              <Ionicons name="close" size={22} color={colors.primary} />
            </Pressable>
          </View>

          <View style={styles.detailStats}>
            <Stat
              value={numero(selecionado.taxa, 2)}
              label="vítimas por 10 mil mulheres de 20 a 59 anos"
            />
            <Stat
              value={`${selecionado.posicao}º`}
              label="de 96 distritos (1º = maior coeficiente)"
            />
          </View>

          <Text style={styles.detailText}>
            {selecionado.taxa > media
              ? `O coeficiente está acima da média dos distritos (${numero(media, 2)}).`
              : `O coeficiente está igual ou abaixo da média dos distritos (${numero(media, 2)}). Isso não quer dizer que o distrito seja seguro.`}
          </Text>

          {selecionado.subprefeitura === 'Sé' && (
            <Text style={styles.detailNote}>
              Distrito central: as ocorrências são contadas onde o crime
              aconteceu, mas a conta divide pelas mulheres que moram no
              distrito. Em áreas com muita circulação de pessoas, isso
              tende a elevar o coeficiente.
            </Text>
          )}

          {enquadramento.tipo === 'distrito' && (
            <Pressable
              style={styles.linkButton}
              onPress={() => setEnquadramento({ tipo: 'cidade' })}
            >
              <Ionicons name="expand-outline" size={18} color={colors.primary} />
              <Text style={styles.linkButtonText}>Ver a cidade inteira</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <DicaToque texto="Toque em um distrito no mapa ou use a busca para ver os números dele." />
      )}

      {/* Ranking */}
      <Text style={styles.sectionTitle}>Distritos com os maiores coeficientes</Text>
      <View style={styles.rankList}>
        {maioresCoeficientes.map((d, indice) => (
          <Pressable
            key={d.id}
            style={({ pressed }) => [
              styles.rankItem,
              indice < maioresCoeficientes.length - 1 && styles.rankDivider,
              pressed && styles.pressed,
            ]}
            onPress={() => escolherDaBusca(d.id)}
          >
            <Text style={styles.rankName}>{d.nome}</Text>
            <Text style={styles.rankValue}>{textoDoValor(d.taxa)}</Text>
          </Pressable>
        ))}
      </View>

      {/* Como ler */}
      <ComoLer
        itens={[
          'Cores mais claras não significam que um distrito é seguro. A violência contra a mulher é muito subnotificada: muitos casos nunca chegam a um boletim de ocorrência.',
          `O número soma todos os tipos de violência contra a mulher: ${FONTE_VIOLENCIA_CAPITAL.tipos}.`,
          'As ocorrências são contadas pelo distrito onde o crime aconteceu, e não onde a vítima mora. Distritos centrais, com muita circulação de pessoas, tendem a ter coeficientes mais altos.',
          `Das ${numero(FONTE_VIOLENCIA_CAPITAL.ocorrenciasUnicas)} ocorrências usadas pela fonte, ${numero(FONTE_VIOLENCIA_CAPITAL.percentualSemLocalizacao, 1)}% não tinham informação de local e ficaram fora do mapa.`,
          'Este mapa usa apenas dados públicos e agregados. Não exibe endereços, ocorrências individuais nem relatos de usuárias.',
        ]}
      />

      {/* Fonte */}
      <View style={styles.sourceBox}>
        <Text style={styles.sourceTitle}>Fontes</Text>
        <Text style={styles.sourceText}>
          Dados: {FONTE_VIOLENCIA_CAPITAL.publicacao}, indicador “Violência
          contra a mulher (todas)”, ano-base {FONTE_VIOLENCIA_CAPITAL.anoBase}.
          Fontes originais: {FONTE_VIOLENCIA_CAPITAL.fontesOriginais}.
        </Text>
        <Text style={styles.sourceText}>
          Cálculo (feito pela fonte): {FONTE_VIOLENCIA_CAPITAL.formula}. Média
          dos 96 distritos: {numero(media, 2)}.
        </Text>
        <Text style={styles.sourceText}>
          Contornos dos distritos: Prefeitura de São Paulo — GeoSampa,
          simplificados.
        </Text>
      </View>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Peças comuns                                                         */
/* ------------------------------------------------------------------ */

function CampoBusca({
  valor,
  onChange,
  rotulo,
}: {
  valor: string;
  onChange: (texto: string) => void;
  rotulo: string;
}) {
  return (
    <View style={styles.searchBox}>
      <Ionicons name="search-outline" size={20} color="#857A82" />
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder={rotulo}
        placeholderTextColor="#857A82"
        style={styles.searchInput}
        autoCorrect={false}
        accessibilityLabel={rotulo}
      />
      {valor.length > 0 && (
        <Pressable
          onPress={() => onChange('')}
          accessibilityLabel="Limpar busca"
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={20} color="#857A82" />
        </Pressable>
      )}
    </View>
  );
}

function Legenda({
  titulo,
  faixas,
}: {
  titulo: string;
  faixas: FaixaLegenda[];
}) {
  return (
    <View style={styles.legend}>
      <Text style={styles.legendTitle}>{titulo}</Text>

      {faixas.map((faixa) => (
        <View key={faixa.rotulo} style={styles.legendRow}>
          <View
            style={[styles.legendSwatch, { backgroundColor: faixa.cor }]}
          />
          <Text style={styles.legendText}>{faixa.rotulo}</Text>
        </View>
      ))}
    </View>
  );
}

function DicaToque({ texto }: { texto: string }) {
  return (
    <View style={styles.hintCard}>
      <Ionicons name="hand-left-outline" size={22} color={colors.primary} />
      <Text style={styles.hintText}>{texto}</Text>
    </View>
  );
}

function ComoLer({ itens }: { itens: string[] }) {
  return (
    <View style={styles.infoBox}>
      <Ionicons
        name="information-circle-outline"
        size={25}
        color={colors.primary}
      />
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>Como ler este mapa</Text>
        {itens.map((item) => (
          <Text key={item} style={styles.infoText}>
            • {item}
          </Text>
        ))}
      </View>
    </View>
  );
}

function AreaButton({
  icone,
  label,
  active,
  onPress,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => [
        styles.areaTab,
        active && styles.areaTabActive,
        pressed && !active && styles.pressed,
      ]}
    >
      <Ionicons
        name={icone}
        size={18}
        color={active ? colors.white : colors.primary}
      />
      <Text style={[styles.areaTabText, active && styles.areaTabTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function SegmentButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={[styles.segment, active && styles.segmentActive]}
    >
      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ZoomButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[styles.zoomButton, active && styles.zoomButtonActive]}
    >
      <Text style={[styles.zoomText, active && styles.zoomTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    lineHeight: 25,
    marginBottom: 22,
  },

  segmented: {
    flexDirection: 'row',
    backgroundColor: '#EFE6E8',
    borderRadius: 22,
    padding: 4,
    marginBottom: 14,
  },

  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  segmentActive: {
    backgroundColor: colors.primary,
  },

  segmentText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },

  segmentTextActive: {
    color: colors.white,
  },

  searchBox: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E6DDE0',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
    paddingVertical: 12,
  },

  results: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E6DDE0',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 12,
  },

  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EAEC',
  },

  resultName: {
    flex: 1,
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  resultValue: {
    color: '#6E6170',
    fontSize: 13,
  },

  emptySearch: {
    color: '#6E6170',
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  pressed: {
    opacity: 0.7,
  },

  mapCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6DDE0',
    padding: 10,
    marginTop: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },

  mapCapitalBox: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },

  mapHint: {
    color: '#6E6170',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },

  zoomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },

  zoomButton: {
    minHeight: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6DDE0',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },

  zoomButtonActive: {
    borderColor: colors.primary,
    backgroundColor: '#F6EEF0',
  },

  zoomText: {
    color: '#6E6170',
    fontSize: 13,
    fontWeight: '600',
  },

  zoomTextActive: {
    color: colors.primary,
  },

  legend: {
    gap: 7,
    marginBottom: 18,
  },

  legendTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  legendSwatch: {
    width: 22,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(61,30,69,0.12)',
  },

  legendText: {
    color: colors.text,
    fontSize: 13,
  },

  detailCard: {
    backgroundColor: '#F6EEF0',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    marginBottom: 24,
  },

  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },

  detailName: {
    flex: 1,
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },

  detailTitleBox: {
    flex: 1,
  },

  detailSubtitle: {
    color: '#6E6170',
    fontSize: 13,
    marginTop: 2,
  },

  areaTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },

  areaTab: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
  },

  areaTabActive: {
    backgroundColor: colors.primary,
  },

  areaTabText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  areaTabTextActive: {
    color: colors.white,
  },

  detailStats: {
    flexDirection: 'row',
    gap: 12,
  },

  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
  },

  statValue: {
    color: colors.primary,
    fontSize: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  statLabel: {
    color: '#6E6170',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },

  detailText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },

  detailNote: {
    color: '#6E6170',
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },

  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 4,
  },

  linkButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F6EEF0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
  },

  hintText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },

  sectionTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },

  rankList: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6DDE0',
    marginBottom: 22,
    overflow: 'hidden',
  },

  rankItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  rankDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1EAEC',
  },

  rankName: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  rankValue: {
    color: '#6E6170',
    fontSize: 13,
    marginTop: 2,
  },

  infoBox: {
    borderWidth: 1.5,
    borderColor: colors.pink,
    borderRadius: 19,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 18,
  },

  infoContent: {
    flex: 1,
    gap: 6,
  },

  infoTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },

  infoText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
  },

  sourceBox: {
    gap: 6,
    marginBottom: 22,
    paddingHorizontal: 2,
  },

  sourceTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  sourceText: {
    color: '#6E6170',
    fontSize: 12,
    lineHeight: 18,
  },

  supportButton: {
    minHeight: 85,
    backgroundColor: colors.primary,
    borderRadius: 21,
    paddingHorizontal: 19,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  supportContent: {
    flex: 1,
    paddingRight: 10,
  },

  supportTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 3,
  },

  supportText: {
    color: '#EFE4E8',
    fontSize: 13,
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
});
