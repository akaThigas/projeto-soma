import { useCallback, useMemo, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../constants/theme';
import { FONTE_LUGARES } from '../data/mapaCalor/lugaresSP';
import { ServicoMulher } from '../data/mapaCalor/servicosMulherSP';
import {
  AnoDados,
  cidadeOutrosTipos,
  cidadeVitimasPorAno,
  FONTE_DELEGACIAS,
  NOMES_TIPOS,
  TipoCrime,
  violenciaDelegacias,
} from '../data/mapaCalor/violenciaDelegacias';
import {
  buscarArea,
  dadosDaDelegacia,
  distritosDaArea,
  EnquadramentoDelegacias,
  legendaDelegacias,
  MapaCalorDelegacias,
  Origem,
  ResultadoBusca,
  servicosProximos,
} from './MapaCalorDelegacias';
import { areaDoPonto } from '../utils/areaDoPonto';
import {
  CartaoServicoMapa,
  CategoriaServico,
  categoriaDoMarcador,
  filtrarMarcadores,
  FiltroServicos,
  TODAS_CATEGORIAS,
  marcadorOrigem,
  marcadoresServicos,
  servicoDoMarcador,
} from './ServicosNoMapa';

/**
 * Relatório por área de delegacia (dados da SSP-SP).
 *
 * Mostra números agregados por área: nunca endereços, ocorrências
 * individuais ou relatos. Contagens de 1 a 4 aparecem como
 * "menos de 5" para não expor casos isolados.
 */

const ANOS: AnoDados[] = ['2024', '2025', '2026'];
const ANO_PADRAO = FONTE_DELEGACIAS.anoCompleto;
const MINIMO_EXIBIDO = 5;
const DEFENSORIA_URL =
  'https://www.defensoria.sp.def.br/atendimento/agende-seu-atendimento';

const numero = (valor: number, casas = 0) =>
  valor.toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

const rotuloAno = (ano: AnoDados) =>
  ano === FONTE_DELEGACIAS.anoParcial ? `${ano} (jan–ago)` : ano;

const contagem = (valor: number) =>
  valor > 0 && valor < MINIMO_EXIBIDO ? 'menos de 5' : numero(valor);

function mediaDoAno(ano: AnoDados) {
  const soma = violenciaDelegacias.reduce((s, d) => s + d.vitimas[ano], 0);
  return soma / violenciaDelegacias.length;
}

function posicaoNoAno(id: string, ano: AnoDados) {
  const ordem = [...violenciaDelegacias].sort(
    (a, b) => b.vitimas[ano] - a.vitimas[ano]
  );
  return ordem.findIndex((d) => d.id === id) + 1;
}

const maisVitimas = [...violenciaDelegacias]
  .sort((a, b) => b.vitimas[ANO_PADRAO] - a.vitimas[ANO_PADRAO])
  .slice(0, 5);

const NOME_TIPO_SERVICO: Record<ServicoMulher['tipo'], string> = {
  ddm: 'Delegacia de Defesa da Mulher',
  'casa-brasileira': 'Casa da Mulher Brasileira',
  casa: 'Casa da Mulher (centro de referência)',
  cdcm: 'Centro de Defesa e Convivência da Mulher',
  saude: 'Hospital de referência para violência sexual',
  defensoria: 'Defensoria Pública',
};

export function PainelDelegacias() {
  const [enquadramento, setEnquadramento] = useState<EnquadramentoDelegacias>(
    { tipo: 'cidade' }
  );
  const [selecionadoId, setSelecionadoId] = useState<string>();
  const [busca, setBusca] = useState('');
  const [ano, setAno] = useState<AnoDados>(ANO_PADRAO);
  // Lugar buscado ou localização atual: fica só na memória da tela.
  const [origem, setOrigem] = useState<Origem>();
  const [localizando, setLocalizando] = useState(false);
  const [avisoLocal, setAvisoLocal] = useState<string>();
  const [servicoId, setServicoId] = useState<string>();
  const [iconesVisiveis, setIconesVisiveis] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaServico[]>(TODAS_CATEGORIAS);

  function mudarCategorias(novas: CategoriaServico[]) {
    setCategorias(novas);
    // fecha o cartão se o tipo do serviço aberto foi escondido
    const aberta = servicoId ? categoriaDoMarcador(servicoId) : undefined;
    if (aberta && !novas.includes(aberta)) setServicoId(undefined);
  }

  const marcadores = useMemo(
    () =>
      origem
        ? [...marcadoresServicos, marcadorOrigem(origem.nome, origem.lat, origem.lon)]
        : marcadoresServicos,
    [origem]
  );
  const servicoTocado = servicoId ? servicoDoMarcador(servicoId) : undefined;

  const selecionar = useCallback((id: string) => {
    setSelecionadoId(id);
    setOrigem(undefined);
    setAvisoLocal(undefined);
  }, []);
  const resultados = useMemo(() => buscarArea(busca), [busca]);

  function abrirArea(id: string, novaOrigem?: Origem) {
    setSelecionadoId(id);
    setEnquadramento({ tipo: 'area', id });
    setOrigem(novaOrigem);
    setBusca('');
  }

  function escolherResultado(r: ResultadoBusca) {
    setAvisoLocal(undefined);
    abrirArea(r.dp, r.origem);
  }

  async function usarMinhaLocalizacao() {
    setAvisoLocal(undefined);
    setLocalizando(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setAvisoLocal(
          'Sem permissão de localização. Você pode buscar pelo nome do bairro, de uma estação ou de um lugar conhecido.'
        );
        return;
      }
      const posicao = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = posicao.coords;
      const area = areaDoPonto(latitude, longitude);
      if (!area) {
        setAvisoLocal(
          'Sua localização parece estar fora da cidade de São Paulo. Este relatório cobre só a capital.'
        );
        return;
      }
      abrirArea(area, { nome: 'sua localização', lat: latitude, lon: longitude });
      setAvisoLocal(
        'Mostrando a área onde você está. A localização foi usada só neste aparelho e não foi salva nem enviada.'
      );
    } catch {
      setAvisoLocal(
        'Não foi possível obter a localização agora. Tente de novo ou busque pelo nome do lugar.'
      );
    } finally {
      setLocalizando(false);
    }
  }

  const legenda = legendaDelegacias();

  return (
    <>
      <Text style={styles.subtitle}>
        Relatório por área de delegacia: quantas mulheres foram vítimas,
        quais crimes foram registrados, como isso mudou com o tempo e onde
        buscar atendimento perto dali. Dados da SSP-SP, de{' '}
        {FONTE_DELEGACIAS.periodo}.
      </Text>

      {/* Busca */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={20} color="#857A82" />
        <TextInput
          value={busca}
          onChangeText={setBusca}
          placeholder="Bairro, estação, lugar ou delegacia"
          placeholderTextColor="#857A82"
          style={styles.searchInput}
          autoCorrect={false}
          accessibilityLabel="Buscar bairro, estação, lugar ou delegacia"
        />
        {busca.length > 0 && (
          <Pressable
            onPress={() => setBusca('')}
            accessibilityLabel="Limpar busca"
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={20} color="#857A82" />
          </Pressable>
        )}
      </View>

      {resultados.length > 0 && (
        <View style={styles.results}>
          {resultados.map((r) => (
            <Pressable
              key={r.chave}
              style={({ pressed }) => [styles.resultItem, pressed && styles.pressed]}
              onPress={() => escolherResultado(r)}
            >
              <Text style={styles.resultName}>{r.titulo}</Text>
              <Text style={styles.resultDetail}>{r.detalhe}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {busca.trim().length >= 2 && resultados.length === 0 && (
        <Text style={styles.emptySearch}>
          Nada encontrado. Tente o nome do bairro ou distrito (por exemplo,
          Itaquera), de uma estação de metrô ou trem, de um parque, hospital
          ou estádio, ou o número da delegacia (por exemplo, 47).
        </Text>
      )}

      <Pressable
        style={({ pressed }) => [styles.locateButton, pressed && styles.pressed]}
        onPress={usarMinhaLocalizacao}
        disabled={localizando}
        accessibilityRole="button"
        accessibilityLabel="Usar minha localização"
        accessibilityHint="Mostra a área onde você está. A localização não é salva nem enviada."
      >
        {localizando ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="locate-outline" size={19} color={colors.primary} />
        )}
        <Text style={styles.locateText}>
          {localizando ? 'Buscando sua localização…' : 'Usar minha localização'}
        </Text>
      </Pressable>

      {avisoLocal && (
        <Text style={styles.localNote} accessibilityLiveRegion="polite">
          {avisoLocal}
        </Text>
      )}

      {/* Mapa */}
      <View style={styles.mapCard}>
        <View style={styles.mapBox}>
          <MapaCalorDelegacias
            enquadramento={enquadramento}
            selecionadoId={selecionadoId}
            onSelect={selecionar}
            marcadores={filtrarMarcadores(marcadores, categorias)}
            marcadorSelecionadoId={servicoId}
            onMarcador={(id) => setServicoId(id === 'origem' ? undefined : id)}
            onMarcadoresVisiveis={setIconesVisiveis}
          />
        </View>
        <Text style={styles.mapHint}>
          Cada área é a região atendida por uma delegacia (DP). Toque em uma
          área para ver o relatório ou em um ícone para ver o serviço.
        </Text>
        <FiltroServicos
          ativas={categorias}
          onMudar={mudarCategorias}
          visiveis={iconesVisiveis}
        />
        {servicoTocado && (
          <CartaoServicoMapa
            servico={servicoTocado}
            onFechar={() => setServicoId(undefined)}
          />
        )}
        {enquadramento.tipo === 'area' && (
          <Pressable
            style={styles.linkButton}
            onPress={() => setEnquadramento({ tipo: 'cidade' })}
          >
            <Ionicons name="expand-outline" size={18} color={colors.primary} />
            <Text style={styles.linkButtonText}>Ver a cidade inteira</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>
          Mulheres vítimas em {ANO_PADRAO}, por área de delegacia
        </Text>
        {legenda.map((faixa) => (
          <View key={faixa.rotulo} style={styles.legendRow}>
            <View style={[styles.legendSwatch, { backgroundColor: faixa.cor }]} />
            <Text style={styles.legendText}>{faixa.rotulo}</Text>
          </View>
        ))}
      </View>

      {selecionadoId ? (
        <Relatorio
          id={selecionadoId}
          origem={origem}
          ano={ano}
          onAno={setAno}
          onFechar={() => setSelecionadoId(undefined)}
        />
      ) : (
        <View style={styles.hintCard}>
          <Ionicons name="hand-left-outline" size={22} color={colors.primary} />
          <Text style={styles.hintText}>
            Toque em uma área no mapa ou busque um distrito para ver o
            relatório.
          </Text>
        </View>
      )}

      {/* Ranking */}
      <Text style={styles.sectionTitle}>
        Áreas com mais vítimas em {ANO_PADRAO}
      </Text>
      <View style={styles.rankList}>
        {maisVitimas.map((d, indice) => {
          const dados = dadosDaDelegacia(d.id);
          return (
            <Pressable
              key={d.id}
              style={({ pressed }) => [
                styles.rankItem,
                indice < maisVitimas.length - 1 && styles.rankDivider,
                pressed && styles.pressed,
              ]}
              onPress={() => abrirArea(d.id)}
            >
              <Text style={styles.rankName}>{dados?.forma.nome}</Text>
              <Text style={styles.rankValue}>
                {numero(d.vitimas[ANO_PADRAO])} mulheres vítimas
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Cidade inteira */}
      <View style={styles.cityBox}>
        <Text style={styles.sectionTitle}>Na cidade toda</Text>
        <Text style={styles.cityText}>
          Mulheres vítimas registradas na base:{' '}
          {ANOS.map((a) => `${numero(cidadeVitimasPorAno[a])} em ${rotuloAno(a)}`).join(' · ')}.
        </Text>
        <Text style={styles.cityText}>
          Alguns crimes não vêm separados por área na base. Na cidade toda, o
          painel da SSP registrou em {ANO_PADRAO}:{' '}
          {numero(cidadeOutrosTipos.feminicidio[ANO_PADRAO])} feminicídios,{' '}
          {numero(cidadeOutrosTipos.tentativaHomicidio[ANO_PADRAO])} tentativas
          de homicídio, {numero(cidadeOutrosTipos.estupro[ANO_PADRAO])} estupros
          e {numero(cidadeOutrosTipos.estuproVulneravel[ANO_PADRAO])} estupros
          de vulnerável (consumados e tentados).
        </Text>
      </View>

      {/* Como ler */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={25} color={colors.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Como ler este relatório</Text>
          {[
            'Nenhuma área é "segura". Os números mostram boletins registrados, e grande parte da violência contra a mulher nunca chega à polícia. Na violência doméstica, o risco está na relação com o agressor, não no bairro.',
            'O mapa mostra número de vítimas, não taxa: áreas maiores e mais populosas tendem a ter mais registros. Não há população por área de delegacia para calcular uma taxa sem estimativas.',
            'Cada caso é contado na área da delegacia do local onde o fato aconteceu, que nem sempre é onde a vítima mora.',
            'Uma mesma vítima pode ter mais de um crime no mesmo boletim, por isso a soma dos tipos é maior que o número de vítimas.',
            'Números de 1 a 4 aparecem como "menos de 5", para não expor casos isolados.',
            'A base é de violência contra a mulher, mas cerca de 0,5% dos registros têm a vítima marcada com outro sexo. Eles foram mantidos, como faz o painel da SSP.',
            `${numero(FONTE_DELEGACIAS.casosSemArea)} registros (1,5% do total) foram feitos em delegacias especializadas sem área própria e ficam só no total da cidade.`,
          ].map((item) => (
            <Text key={item} style={styles.infoText}>
              • {item}
            </Text>
          ))}
        </View>
      </View>

      {/* Fontes */}
      <View style={styles.sourceBox}>
        <Text style={styles.sourceTitle}>Fontes</Text>
        <Text style={styles.sourceText}>
          Vítimas e tipos de crime: {FONTE_DELEGACIAS.fonte}, arquivo{' '}
          {FONTE_DELEGACIAS.arquivo}. Inclui ameaça, lesão corporal, injúria,
          perseguição, descumprimento de medida protetiva e outros crimes
          ligados à violência doméstica. Os totais da cidade conferem com o
          painel da SSP.
        </Text>
        <Text style={styles.sourceText}>
          Áreas das delegacias: Centro de Estudos da Metrópole (CEM/USP), base
          Distritos e Delegacias Policiais 2021, a partir da SSP-SP.
        </Text>
        <Text style={styles.sourceText}>
          Serviços de apoio: Prefeitura de São Paulo (Secretaria Municipal de
          Direitos Humanos e Cidadania), páginas de setembro e outubro de 2026.
          A distância é aproximada, em linha reta.
        </Text>
        <Text style={styles.sourceText}>
          Lugares da busca (bairros, estações, parques, estádios, hospitais e
          universidades): {FONTE_LUGARES}. A busca e a localização funcionam
          no próprio aparelho: o que você digita e onde você está não são
          enviados nem salvos.
        </Text>
      </View>
    </>
  );
}

/* ------------------------------------------------------------------ */

function Relatorio({
  id,
  origem,
  ano,
  onAno,
  onFechar,
}: {
  id: string;
  origem?: Origem;
  ano: AnoDados;
  onAno: (ano: AnoDados) => void;
  onFechar: () => void;
}) {
  const dados = dadosDaDelegacia(id);
  if (!dados) return null;
  const { forma, indicador } = dados;

  const vitimas = indicador.vitimas[ano];
  const media = mediaDoAno(ano);
  const posicao = posicaoNoAno(id, ano);
  const distritos = distritosDaArea(id).slice(0, 4);

  const tipos = (Object.entries(indicador.casos[ano]) as [TipoCrime, number][])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const maiorTipo = tipos[0]?.[1] ?? 1;

  const v24 = indicador.vitimas['2024'];
  const v25 = indicador.vitimas['2025'];
  const variacao = v24 > 0 ? ((v25 - v24) / v24) * 100 : 0;
  const maiorAno = Math.max(...ANOS.map((a) => indicador.vitimas[a]), 1);

  const servicos = servicosProximos(id, 3, origem);

  return (
    <View style={styles.report}>
      <View style={styles.detailHeader}>
        <View style={styles.detailTitleBox}>
          <Text style={styles.reportEyebrow}>Relatório da área</Text>
          <Text style={styles.detailName}>{forma.nome}</Text>
          {origem && origem.nome !== 'sua localização' && (
            <Text style={styles.detailSubtitle}>
              {origem.nome} fica nesta área.
            </Text>
          )}
          {distritos.length > 0 && (
            <Text style={styles.detailSubtitle}>
              Cobre partes dos distritos {distritos.map((d) => d.nome).join(', ')}
            </Text>
          )}
        </View>
        <Pressable onPress={onFechar} accessibilityLabel="Fechar relatório" hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.primary} />
        </Pressable>
      </View>

      {/* Ano */}
      <View style={styles.yearRow} accessibilityRole="tablist">
        {ANOS.map((a) => (
          <Pressable
            key={a}
            onPress={() => onAno(a)}
            accessibilityRole="tab"
            accessibilityState={{ selected: a === ano }}
            style={[styles.yearChip, a === ano && styles.yearChipActive]}
          >
            <Text style={[styles.yearText, a === ano && styles.yearTextActive]}>
              {rotuloAno(a)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* 1. Total */}
      <View style={styles.detailStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{contagem(vitimas)}</Text>
          <Text style={styles.statLabel}>mulheres vítimas em {rotuloAno(ano)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{posicao}º</Text>
          <Text style={styles.statLabel}>de 93 áreas (1º = mais vítimas)</Text>
        </View>
      </View>

      {/* 2. Comparação e evolução */}
      <Text style={styles.reportText}>
        {vitimas > media
          ? `Acima da média das 93 áreas em ${rotuloAno(ano)} (${numero(media, 1)} vítimas por área).`
          : `Igual ou abaixo da média das 93 áreas em ${rotuloAno(ano)} (${numero(media, 1)} vítimas por área). Isso não quer dizer que a área seja segura.`}
      </Text>

      <Text style={styles.blockTitle}>Evolução</Text>
      <View style={styles.bars}>
        {ANOS.map((a) => (
          <View key={a} style={styles.typeRow}>
            <View style={styles.typeHeader}>
              <Text style={styles.typeName}>{rotuloAno(a)}</Text>
              <Text style={styles.typeValue}>{contagem(indicador.vitimas[a])}</Text>
            </View>
            <View style={styles.barTrackFull}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(indicador.vitimas[a] / maiorAno) * 100}%` },
                  a === FONTE_DELEGACIAS.anoParcial && styles.barPartial,
                ]}
              />
            </View>
          </View>
        ))}
      </View>
      {v24 > 0 && (
        <Text style={styles.reportNote}>
          De 2024 para 2025, o número de vítimas{' '}
          {variacao === 0
            ? 'ficou igual'
            : `${variacao > 0 ? 'subiu' : 'caiu'} ${numero(Math.abs(variacao), 0)}%`}{' '}
          ({numero(v24)} → {numero(v25)}). Na cidade toda,{' '}
          {numero(cidadeVitimasPorAno['2024'])} → {numero(cidadeVitimasPorAno['2025'])}.
          2026 tem só janeiro a agosto.
        </Text>
      )}

      {/* 3. Tipos */}
      <Text style={styles.blockTitle}>Crimes registrados em {rotuloAno(ano)}</Text>
      {tipos.length === 0 ? (
        <Text style={styles.reportText}>Nenhum registro nesse período.</Text>
      ) : (
        <View style={styles.bars}>
          {tipos.map(([tipo, v]) => (
            <View key={tipo} style={styles.typeRow}>
              <View style={styles.typeHeader}>
                <Text style={styles.typeName}>{NOMES_TIPOS[tipo]}</Text>
                <Text style={styles.typeValue}>{contagem(v)}</Text>
              </View>
              <View style={styles.barTrackFull}>
                <View
                  style={[
                    styles.barFill,
                    { width: `${Math.max((v / maiorTipo) * 100, 2)}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Crimes que a SSP não publica por delegacia */}
      <View style={styles.missingBox}>
        <Ionicons name="alert-circle-outline" size={18} color="#8A4A70" />
        <Text style={styles.missingText}>
          <Text style={styles.alwaysStrong}>
            Estupro, feminicídio e tentativa de homicídio não aparecem nesta
            lista
          </Text>{' '}
          porque a SSP não publica esses números por delegacia. Isso não quer
          dizer que não aconteceram nesta área. Na cidade toda, em{' '}
          {rotuloAno(ano)}, foram {numero(cidadeOutrosTipos.estupro[ano])}{' '}
          estupros, {numero(cidadeOutrosTipos.estuproVulneravel[ano])} estupros
          de vulnerável, {numero(cidadeOutrosTipos.feminicidio[ano])}{' '}
          feminicídios e {numero(cidadeOutrosTipos.tentativaHomicidio[ano])}{' '}
          tentativas de homicídio (estupros consumados e tentados; painel da
          SSP).
        </Text>
      </View>

      {/* 4. Serviços */}
      <Text style={styles.blockTitle}>
        {origem
          ? `Onde buscar atendimento perto de ${origem.nome}`
          : 'Onde buscar atendimento perto daqui'}
      </Text>
      <View style={styles.services}>
        {servicos.map((s) => (
          <CartaoServico key={s.id} servico={s} km={s.km} />
        ))}
      </View>

      <View style={styles.alwaysBox}>
        <Text style={styles.alwaysText}>
          <Text style={styles.alwaysStrong}>24 horas: </Text>
          Casa da Mulher Brasileira e 1ª DDM (Cambuci), 7ª DDM (Itaquera) e 8ª
          DDM (Jd. Marília). Qualquer delegacia também registra a ocorrência.
        </Text>
        <Text style={styles.alwaysText}>
          <Text style={styles.alwaysStrong}>Medida protetiva e orientação jurídica: </Text>
          Defensoria Pública (NUDEM), gratuita.
        </Text>
        <Pressable
          style={styles.linkButton}
          onPress={() => Linking.openURL(DEFENSORIA_URL)}
        >
          <Ionicons name="open-outline" size={18} color={colors.primary} />
          <Text style={styles.linkButtonText}>Agendar na Defensoria</Text>
        </Pressable>
        <Text style={styles.alwaysText}>
          <Text style={styles.alwaysStrong}>Telefones: </Text>
          Ligue 180 (Central de Atendimento à Mulher) · 190 em perigo imediato.
        </Text>
      </View>
    </View>
  );
}

function CartaoServico({ servico, km }: { servico: ServicoMulher; km: number }) {
  const aproximado = servico.precisao !== 'endereco';
  const primeiroTelefone = servico.telefone.split('/')[0].replace(/[^0-9]/g, '');
  const distancia = Math.max(0.5, Math.round(km * 2) / 2);

  return (
    <View style={styles.serviceCard}>
      <Text style={styles.serviceType}>{NOME_TIPO_SERVICO[servico.tipo]}</Text>
      <Text style={styles.serviceName}>{servico.nome}</Text>
      <Text style={styles.serviceText}>{servico.endereco}</Text>
      <Text style={styles.serviceText}>Horário: {servico.horario}</Text>
      {servico.id === 'cmb' && (
        <Text style={styles.serviceText}>No mesmo endereço: 1ª DDM – Centro (24 horas).</Text>
      )}
      <Text style={styles.serviceMeta}>
        Cerca de {numero(distancia, distancia % 1 ? 1 : 0)} km em linha reta
        {aproximado ? ' (localização aproximada)' : ''}
      </Text>
      <Pressable
        style={styles.callButton}
        onPress={() => Linking.openURL(`tel:${primeiroTelefone}`)}
        accessibilityLabel={`Ligar para ${servico.nome}`}
      >
        <Ionicons name="call-outline" size={16} color={colors.primary} />
        <Text style={styles.callText}>{servico.telefone}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: { color: colors.text, fontSize: 16, lineHeight: 24, marginBottom: 18 },

  searchBox: {
    minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 9,
    backgroundColor: colors.white, borderWidth: 1, borderColor: '#E6DDE0',
    borderRadius: 25, paddingHorizontal: 16, marginBottom: 10,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  results: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: '#E6DDE0',
    borderRadius: 18, overflow: 'hidden', marginBottom: 12,
  },
  resultItem: {
    paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: '#F1EAEC', gap: 2,
  },
  resultName: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  resultDetail: { color: '#6E6170', fontSize: 13 },
  emptySearch: { color: '#6E6170', fontSize: 14, lineHeight: 20, marginBottom: 12, paddingHorizontal: 4 },
  locateButton: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8,
    minHeight: 40, borderRadius: 20, borderWidth: 1.5, borderColor: colors.primary,
    paddingHorizontal: 14, marginBottom: 10,
  },
  locateText: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  localNote: { color: '#6E6170', fontSize: 13, lineHeight: 19, marginBottom: 12, paddingHorizontal: 4 },
  pressed: { opacity: 0.7 },

  mapCard: {
    width: '100%', backgroundColor: colors.white, borderRadius: 24, borderWidth: 1,
    borderColor: '#E6DDE0', padding: 10, marginTop: 4, marginBottom: 16, overflow: 'hidden',
  },
  mapBox: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  mapHint: { color: '#6E6170', fontSize: 12, lineHeight: 17, marginTop: 8 },

  linkButton: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: 6, paddingVertical: 6,
  },
  linkButtonText: { color: colors.primary, fontSize: 14, fontWeight: '700' },

  legend: { gap: 7, marginBottom: 18 },
  legendTitle: { color: colors.primary, fontSize: 14, fontWeight: '700', marginBottom: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendSwatch: {
    width: 22, height: 14, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(61,30,69,0.12)',
  },
  legendText: { color: colors.text, fontSize: 13 },

  hintCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F6EEF0',
    borderRadius: 20, padding: 16, marginBottom: 24,
  },
  hintText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 20 },

  report: { backgroundColor: '#F6EEF0', borderRadius: 20, padding: 18, gap: 12, marginBottom: 24 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  detailTitleBox: { flex: 1, gap: 2 },
  reportEyebrow: {
    color: '#8A4A70', fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
  },
  detailName: { color: colors.primary, fontSize: 22, fontWeight: '700' },
  detailSubtitle: { color: '#6E6170', fontSize: 13, lineHeight: 18 },

  yearRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  yearChip: {
    minHeight: 34, borderRadius: 17, borderWidth: 1, borderColor: '#D9CBD0',
    paddingHorizontal: 13, justifyContent: 'center', backgroundColor: colors.white,
  },
  yearChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  yearText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  yearTextActive: { color: colors.white },

  detailStats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: colors.white, borderRadius: 14, padding: 12 },
  statValue: { color: colors.primary, fontSize: 26, fontWeight: '700', fontVariant: ['tabular-nums'] },
  statLabel: { color: '#6E6170', fontSize: 12, lineHeight: 16, marginTop: 2 },

  reportText: { color: colors.text, fontSize: 14, lineHeight: 21 },
  reportNote: { color: '#6E6170', fontSize: 13, lineHeight: 19 },
  blockTitle: { color: colors.primary, fontSize: 16, fontWeight: '700', marginTop: 6 },

  bars: { gap: 9 },
  barTrackFull: { width: '100%', height: 10, borderRadius: 5, backgroundColor: '#EADDE2', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6, backgroundColor: '#8A4A70' },
  barPartial: { backgroundColor: '#CF879E' },

  typeRow: { gap: 4 },
  typeHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  typeName: { flex: 1, color: colors.text, fontSize: 13 },
  typeValue: { color: colors.primary, fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },

  missingBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: colors.white, borderRadius: 14, padding: 12,
    borderLeftWidth: 3, borderLeftColor: '#CF879E',
  },
  missingText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },

  services: { gap: 10 },
  serviceCard: { backgroundColor: colors.white, borderRadius: 16, padding: 14, gap: 3 },
  serviceType: { color: '#8A4A70', fontSize: 12, fontWeight: '700' },
  serviceName: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  serviceText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  serviceMeta: { color: '#6E6170', fontSize: 12, marginTop: 2 },
  callButton: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6,
    marginTop: 6, borderWidth: 1, borderColor: '#D9CBD0', borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  callText: { color: colors.primary, fontSize: 13, fontWeight: '600' },

  alwaysBox: { backgroundColor: colors.white, borderRadius: 16, padding: 14, gap: 6 },
  alwaysText: { color: colors.text, fontSize: 13, lineHeight: 19 },
  alwaysStrong: { fontWeight: '700', color: colors.primary },

  sectionTitle: { color: colors.primary, fontSize: 18, fontWeight: '700', marginBottom: 10 },
  rankList: {
    backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: '#E6DDE0',
    marginBottom: 22, overflow: 'hidden',
  },
  rankItem: { paddingHorizontal: 16, paddingVertical: 12 },
  rankDivider: { borderBottomWidth: 1, borderBottomColor: '#F1EAEC' },
  rankName: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  rankValue: { color: '#6E6170', fontSize: 13, marginTop: 2 },

  cityBox: { gap: 6, marginBottom: 18 },
  cityText: { color: colors.text, fontSize: 14, lineHeight: 21 },

  infoBox: {
    borderWidth: 1.5, borderColor: colors.pink, borderRadius: 19, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 18,
  },
  infoContent: { flex: 1, gap: 6 },
  infoTitle: { color: colors.primary, fontSize: 15, fontWeight: '700' },
  infoText: { color: colors.text, fontSize: 13, lineHeight: 20 },

  sourceBox: { gap: 6, marginBottom: 22, paddingHorizontal: 2 },
  sourceTitle: { color: colors.primary, fontSize: 14, fontWeight: '700' },
  sourceText: { color: '#6E6170', fontSize: 12, lineHeight: 18 },
});
