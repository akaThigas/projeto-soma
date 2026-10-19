import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MapaDestaque } from '../components/MapaDestaque';
import { colors } from '../constants/theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const canais = [
  {
    titulo: 'Ligue 180',
    descricao:
      'Central de Atendimento à Mulher para orientação e encaminhamento.',
    icone: 'call-outline',
    acao: 'phone',
    valor: 'tel:180',
    botao: 'Ligar para 180',
  },
  {
    titulo: 'Polícia Militar - 190',
    descricao:
      'Utilize em situações de emergência ou perigo imediato.',
    icone: 'warning-outline',
    acao: 'phone',
    valor: 'tel:190',
    botao: 'Ligar para 190',
  },
  {
    titulo: 'Rede de apoio',
    descricao:
      'Lista de delegacias, casas da mulher, hospitais e defensorias, com endereço e telefone.',
    icone: 'business-outline',
    acao: 'route',
    valor: '/rede-apoio',
    botao: 'Ver a lista',
  },
  {
    titulo: 'Web Denúncia',
    descricao:
      'Acesse o canal online de denúncia do Estado de São Paulo.',
    icone: 'globe-outline',
    acao: 'url',
    valor:
      'https://www.webdenuncia.sp.gov.br/',
    botao: 'Abrir canal',
  },
];

export default function DenunciarScreen() {
  const {
    isCompactPhone,
    isPhone,
    horizontalPadding,
    topPadding,
    contentMaxWidth,
  } = useResponsiveLayout();

  async function executarAcao(
    acao: string,
    valor: string
  ) {
    try {
      if (acao === 'route') {
        router.push(valor as any);
        return;
      }

      await Linking.openURL(valor);
    } catch {
      Alert.alert(
        'Não foi possível abrir',
        'Tente novamente ou utilize o canal diretamente.'
      );
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.content,
            {
              maxWidth: contentMaxWidth,
              paddingHorizontal:
                horizontalPadding,
            },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={26}
              color={colors.primary}
            />

            <Text style={styles.backText}>
              Voltar
            </Text>
          </Pressable>

          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              {
                fontSize:
                  isCompactPhone
                    ? 30
                    : 36,
              },
            ]}
          >
            Como buscar ajuda?
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                fontSize:
                  isCompactPhone
                    ? 15
                    : 18,
              },
            ]}
          >
            Cada situação pode precisar de um
            caminho diferente. Escolha o canal
            mais adequado para o momento.
          </Text>

          {/* O mapa é o caminho principal */}
          <MapaDestaque
            titulo="Encontre atendimento no mapa"
            texto="Delegacias da Mulher, casas da mulher, hospitais e defensorias de São Paulo, com o telefone de cada um."
          />

          <View style={styles.cards}>
            {canais.map((canal) => (
              <View
                key={canal.titulo}
                style={[
                  styles.card,
                  {
                    width:
                      isPhone
                        ? '100%'
                        : '48.5%',
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        width:
                          isCompactPhone
                            ? 50
                            : 58,

                        height:
                          isCompactPhone
                            ? 50
                            : 58,

                        borderRadius:
                          isCompactPhone
                            ? 25
                            : 29,
                      },
                    ]}
                  >
                    <Ionicons
                      name={canal.icone as any}
                      size={
                        isCompactPhone
                          ? 26
                          : 30
                      }
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={[
                      styles.cardTitle,
                      {
                        fontSize:
                          isCompactPhone
                            ? 18
                            : 20,
                      },
                    ]}
                  >
                    {canal.titulo}
                  </Text>
                </View>

                <Text style={styles.cardDescription}>
                  {canal.descricao}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${canal.botao}: ${canal.titulo}`}
                  style={({ pressed }) => [
                    styles.cardButton,
                    pressed &&
                      styles.pressed,
                  ]}
                  onPress={() =>
                    executarAcao(
                      canal.acao,
                      canal.valor
                    )
                  }
                >
                  <Text style={styles.cardButtonText}>
                    {canal.botao}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color={colors.white}
                  />
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.notice}>
            <Ionicons
              name="shield-checkmark-outline"
              size={27}
              color={colors.primary}
            />

            <Text style={styles.noticeText}>
              O SOMA não realiza nem armazena
              denúncias. A plataforma direciona
              você para canais e serviços oficiais.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            style={styles.emergencyButton}
            onPress={() =>
              router.push('/emergencia')
            }
          >
            <Ionicons
              name="warning"
              size={25}
              color={colors.white}
            />

            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>
                Está em perigo agora?
              </Text>

              <Text style={styles.emergencyText}>
                Acesse a opção de emergência.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.white}
            />
          </Pressable>
        </View>
      </ScrollView>
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

    marginBottom: 28,
  },

  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    gap: 14,
  },

  card: {
    minHeight: 235,

    backgroundColor: colors.white,

    borderWidth: 1,
    borderColor: '#E4DADC',

    borderRadius: 22,

    padding: 18,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 14,
  },

  iconContainer: {
    backgroundColor: colors.lightPink,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  cardTitle: {
    flex: 1,

    color: colors.primary,

    fontWeight: '700',
  },

  cardDescription: {
    flex: 1,

    color: colors.text,

    fontSize: 14,
    lineHeight: 21,

    marginBottom: 16,
  },

  cardButton: {
    minHeight: 46,

    backgroundColor: colors.primary,

    borderRadius: 23,

    paddingHorizontal: 16,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,
  },

  cardButtonText: {
    color: colors.white,

    fontSize: 14,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.75,
  },

  notice: {
    marginTop: 25,

    borderWidth: 1.5,
    borderColor: colors.pink,

    borderRadius: 20,

    padding: 17,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 11,
  },

  noticeText: {
    flex: 1,

    color: colors.text,

    fontSize: 14,
    lineHeight: 21,
  },

  emergencyButton: {
    minHeight: 88,

    marginTop: 22,

    backgroundColor: '#B4495A',

    borderRadius: 22,

    padding: 18,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 13,
  },

  emergencyContent: {
    flex: 1,
  },

  emergencyTitle: {
    color: colors.white,

    fontSize: 17,
    fontWeight: '700',

    marginBottom: 3,
  },

  emergencyText: {
    color: '#FBECEF',

    fontSize: 13,
  },
});