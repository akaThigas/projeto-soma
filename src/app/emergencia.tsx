import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../components/AppText';

import { colors } from '../constants/theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export default function EmergenciaScreen() {
  const {
    isCompactPhone,
    isPhone,
    horizontalPadding,
    topPadding,
    contentMaxWidth,
  } = useResponsiveLayout();

  async function ligar(numero: string) {
    try {
      await Linking.openURL(
        `tel:${numero}`
      );
    } catch {
      Alert.alert(
        'Não foi possível realizar a ligação',
        `Ligue diretamente para ${numero}.`
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

          <View style={styles.warningIcon}>
            <Ionicons
              name="warning"
              size={
                isCompactPhone
                  ? 34
                  : 42
              }
              color="#B4495A"
            />
          </View>

          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              {
                fontSize:
                  isCompactPhone
                    ? 29
                    : 36,
              },
            ]}
          >
            Você está em perigo agora?
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
            Se houver risco imediato para você
            ou outra pessoa, priorize o contato
            com o serviço oficial de emergência.
          </Text>

          <View
            style={[
              styles.emergencyCard,
              {
                padding:
                  isCompactPhone
                    ? 20
                    : 28,
              },
            ]}
          >
            <Ionicons
              name="shield-outline"
              size={
                isCompactPhone
                  ? 44
                  : 58
              }
              color={colors.white}
            />

            <Text style={styles.emergencyLabel}>
              EMERGÊNCIA
            </Text>

            <Text
              style={[
                styles.number,
                {
                  fontSize:
                    isCompactPhone
                      ? 58
                      : 72,
                },
              ]}
            >
              190
            </Text>

            <Text style={styles.police}>
              Polícia Militar
            </Text>

            <Text style={styles.emergencyDescription}>
              Utilize em situações de perigo
              imediato ou quando houver risco
              à integridade física.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ligar para 190, Polícia Militar"
              style={styles.callButton}
              onPress={() =>
                ligar('190')
              }
            >
              <Ionicons
                name="call"
                size={21}
                color="#B4495A"
              />

              <Text style={styles.callButtonText}>
                Ligar para 190
              </Text>
            </Pressable>
          </View>

          {/* Urgência médica: ferimentos ou mal-estar */}
          <View style={styles.samuCard}>
            <View style={styles.samuHeader}>
              <Ionicons
                name="medkit-outline"
                size={isCompactPhone ? 30 : 34}
                color="#B4495A"
              />

              <View style={styles.samuText}>
                <Text
                  accessibilityRole="header"
                  style={styles.samuTitle}
                >
                  SAMU 192
                </Text>

                <Text style={styles.samuDescription}>
                  Urgência médica. Ligue se alguém
                  estiver ferida ou passando mal.
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ligar para 192, SAMU"
              style={({ pressed }) => [
                styles.samuButton,
                pressed && { opacity: 0.75 },
              ]}
              onPress={() =>
                ligar('192')
              }
            >
              <Ionicons
                name="call"
                size={19}
                color="#B4495A"
              />

              <Text style={styles.samuButtonText}>
                Ligar para 192
              </Text>
            </Pressable>
          </View>

          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={colors.primary}
            />

            <Text style={styles.noticeText}>
              O SOMA não aciona a polícia nem
              envia pedidos de socorro. O botão
              apenas abre o canal oficial de
              ligação do dispositivo.
            </Text>
          </View>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Não é uma emergência imediata?
          </Text>

          <View style={styles.options}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ligar para 180. Orientação e atendimento à mulher."
              style={[
                styles.optionCard,
                {
                  width:
                    isPhone
                      ? '100%'
                      : '31.8%',
                },
              ]}
              onPress={() =>
                ligar('180')
              }
            >
              <Ionicons
                name="call-outline"
                size={27}
                color={colors.primary}
              />

              <Text style={styles.optionTitle}>
                Ligue 180
              </Text>

              <Text style={styles.optionText}>
                Orientação e atendimento à mulher.
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Canais de ajuda. Conheça outras formas de buscar atendimento."
              style={[
                styles.optionCard,
                {
                  width:
                    isPhone
                      ? '100%'
                      : '31.8%',
                },
              ]}
              onPress={() =>
                router.push('/denunciar')
              }
            >
              <Ionicons
                name="document-text-outline"
                size={27}
                color={colors.primary}
              />

              <Text style={styles.optionTitle}>
                Canais de ajuda
              </Text>

              <Text style={styles.optionText}>
                Conheça outras formas de buscar atendimento.
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Rede de apoio. Consulte serviços de acolhimento e orientação."
              style={[
                styles.optionCard,
                {
                  width:
                    isPhone
                      ? '100%'
                      : '31.8%',
                },
              ]}
              onPress={() =>
                router.push('/rede-apoio')
              }
            >
              <Ionicons
                name="people-outline"
                size={27}
                color={colors.primary}
              />

              <Text style={styles.optionTitle}>
                Rede de apoio
              </Text>

              <Text style={styles.optionText}>
                Consulte serviços de acolhimento e orientação.
              </Text>
            </Pressable>
          </View>
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

    marginBottom: 24,
  },

  backText: {
    color: colors.primary,

    fontSize: 16,
    fontWeight: '600',
  },

  warningIcon: {
    marginBottom: 12,
  },

  title: {
    color: colors.primary,

    fontWeight: '700',

    lineHeight: 43,

    maxWidth: 650,

    marginBottom: 10,
  },

  subtitle: {
    color: colors.text,

    lineHeight: 26,

    maxWidth: 650,

    marginBottom: 24,
  },

  emergencyCard: {
    width: '100%',

    maxWidth: 700,

    alignSelf: 'center',

    backgroundColor: '#B4495A',

    borderRadius: 28,

    alignItems: 'center',
  },

  emergencyLabel: {
    color: '#FBECEE',

    fontSize: 13,
    fontWeight: '700',

    letterSpacing: 2,

    marginTop: 10,
  },

  number: {
    color: colors.white,

    fontWeight: '800',

    marginVertical: 3,
  },

  police: {
    color: colors.white,

    fontSize: 20,
    fontWeight: '700',

    marginBottom: 12,
  },

  emergencyDescription: {
    color: '#FBECEE',

    fontSize: 15,
    lineHeight: 22,

    textAlign: 'center',

    maxWidth: 440,

    marginBottom: 20,
  },

  callButton: {
    minHeight: 54,

    paddingHorizontal: 25,

    backgroundColor: colors.white,

    borderRadius: 27,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 8,
  },

  callButtonText: {
    color: '#B4495A',

    fontSize: 16,
    fontWeight: '800',
  },

  samuCard: {
    width: '100%',

    maxWidth: 700,

    alignSelf: 'center',

    marginTop: 14,

    backgroundColor: colors.white,

    borderWidth: 1.5,
    borderColor: '#B4495A',

    borderRadius: 22,

    padding: 18,
  },

  samuHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 13,

    marginBottom: 14,
  },

  samuText: {
    flex: 1,
  },

  samuTitle: {
    color: '#B4495A',

    fontSize: 22,
    fontWeight: '800',

    marginBottom: 2,
  },

  samuDescription: {
    color: colors.text,

    fontSize: 14,
    lineHeight: 20,
  },

  samuButton: {
    minHeight: 50,

    borderWidth: 1.5,
    borderColor: '#B4495A',

    borderRadius: 25,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,
  },

  samuButtonText: {
    color: '#B4495A',

    fontSize: 15,
    fontWeight: '800',
  },

  notice: {
    maxWidth: 700,

    alignSelf: 'center',

    marginTop: 18,

    borderWidth: 1,
    borderColor: '#D9CDD0',

    borderRadius: 18,

    padding: 15,

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

  sectionTitle: {
    color: colors.primary,

    fontSize: 22,
    fontWeight: '700',

    marginTop: 32,
    marginBottom: 15,
  },

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    gap: 12,
  },

  optionCard: {
    minHeight: 150,

    backgroundColor: colors.white,

    borderWidth: 1,
    borderColor: '#E3DADC',

    borderRadius: 20,

    padding: 17,
  },

  optionTitle: {
    color: colors.primary,

    fontSize: 17,
    fontWeight: '700',

    marginTop: 10,
    marginBottom: 5,
  },

  optionText: {
    color: colors.text,

    fontSize: 13,
    lineHeight: 19,
  },
});