import { Ionicons } from '@expo/vector-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { router } from 'expo-router';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../constants/theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const ONBOARDING_STORAGE_KEY =
  '@soma:hide-onboarding';

export default function ConfiguracoesScreen() {
  const {
    isCompactPhone,
    horizontalPadding,
    topPadding,
    contentMaxWidth,
  } = useResponsiveLayout();

  function mostrarApresentacaoAgora() {
    router.push('/onboarding');
  }

  async function restaurarApresentacao() {
    try {
      await AsyncStorage.removeItem(
        ONBOARDING_STORAGE_KEY
      );

      Alert.alert(
        'Preferência atualizada',
        'A apresentação inicial voltará a aparecer quando o aplicativo for aberto novamente.'
      );
    } catch {
      Alert.alert(
        'Não foi possível alterar a preferência',
        'Tente novamente.'
      );
    }
  }

  function confirmarLimpeza() {
    Alert.alert(
      'Limpar preferências?',
      'As preferências locais do SOMA serão restauradas para o padrão.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: limparPreferencias,
        },
      ]
    );
  }

  async function limparPreferencias() {
    try {
      await AsyncStorage.multiRemove([
        ONBOARDING_STORAGE_KEY,
      ]);

      Alert.alert(
        'Preferências removidas',
        'As configurações locais do SOMA foram restauradas.'
      );
    } catch {
      Alert.alert(
        'Erro',
        'Não foi possível limpar as preferências.'
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
              maxWidth:
                contentMaxWidth ?? 760,

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
            Configurações
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
            Ajuste preferências de uso do aplicativo.
          </Text>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Preferências
          </Text>

          <View style={styles.section}>
            <SettingItem
              icon="albums-outline"
              title="Ver apresentação agora"
              description='Abrir novamente a tela "O que você encontra aqui?".'
              compact={isCompactPhone}
              onPress={
                mostrarApresentacaoAgora
              }
            />

            <View style={styles.divider} />

            <SettingItem
              icon="refresh-outline"
              title="Mostrar na próxima abertura"
              description="Fazer a apresentação inicial voltar a aparecer ao abrir o SOMA."
              compact={isCompactPhone}
              onPress={
                restaurarApresentacao
              }
            />
          </View>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Acessibilidade
          </Text>

          <View style={styles.section}>
            <DisabledSettingItem
              icon="text-outline"
              title="Tamanho do texto"
              description="Permitir ajuste da escala dos textos do aplicativo."
              compact={isCompactPhone}
            />

            <View style={styles.divider} />

            <DisabledSettingItem
              icon="contrast-outline"
              title="Alto contraste"
              description="Aumentar o contraste dos elementos da interface."
              compact={isCompactPhone}
            />
          </View>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Privacidade
          </Text>

          <View style={styles.section}>
            <DisabledSettingItem
              icon="notifications-off-outline"
              title="Notificações discretas"
              description="Reduzir informações sensíveis exibidas em notificações."
              compact={isCompactPhone}
            />

            <View style={styles.divider} />

            <DisabledSettingItem
              icon="eye-off-outline"
              title="Modo discreto"
              description="Configurações para reduzir a exposição do conteúdo."
              compact={isCompactPhone}
            />
          </View>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Dados locais
          </Text>

          <View style={styles.section}>
            <SettingItem
              icon="trash-outline"
              title="Limpar preferências locais"
              description="Remove as preferências salvas pelo SOMA neste dispositivo."
              danger
              compact={isCompactPhone}
              onPress={confirmarLimpeza}
            />
          </View>

          <View style={styles.versionBox}>
            <View style={styles.versionIcon}>
              <Ionicons
                name="information-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <View style={styles.versionContent}>
              <Text style={styles.versionTitle}>
                Projeto SOMA
              </Text>

              <Text style={styles.versionText}>
                MVP 0.1
              </Text>

              <Text style={styles.versionDescription}>
                Segurança • Orientação • Monitoramento • Apoio
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

type SettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
  compact?: boolean;
};

function SettingItem({
  icon,
  title,
  description,
  onPress,
  danger = false,
  compact = false,
}: SettingItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [
        styles.settingItem,
        pressed && {
          opacity: 0.6,
        },
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.settingIcon,

          {
            width:
              compact
                ? 46
                : 52,

            height:
              compact
                ? 46
                : 52,

            borderRadius:
              compact
                ? 23
                : 26,
          },

          danger &&
            styles.dangerIcon,
        ]}
      >
        <Ionicons
          name={icon}
          size={
            compact
              ? 23
              : 26
          }
          color={
            danger
              ? '#A33D4C'
              : colors.primary
          }
        />
      </View>

      <View style={styles.settingContent}>
        <Text
          style={[
            styles.settingTitle,

            {
              fontSize:
                compact
                  ? 15
                  : 17,
            },

            danger &&
              styles.dangerTitle,
          ]}
        >
          {title}
        </Text>

        <Text style={styles.settingDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={21}
        color={
          danger
            ? '#A33D4C'
            : colors.primary
        }
      />
    </Pressable>
  );
}

type DisabledSettingItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  compact?: boolean;
};

function DisabledSettingItem({
  icon,
  title,
  description,
  compact = false,
}: DisabledSettingItemProps) {
  return (
    <View
      style={styles.disabledItem}
      accessible
      accessibilityLabel={`${title}, em breve. ${description}`}
      accessibilityState={{ disabled: true }}
    >
      <View
        style={[
          styles.disabledIcon,
          {
            width:
              compact
                ? 46
                : 52,

            height:
              compact
                ? 46
                : 52,

            borderRadius:
              compact
                ? 23
                : 26,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={
            compact
              ? 23
              : 26
          }
          color="#948A90"
        />
      </View>

      <View style={styles.settingContent}>
        <View style={styles.disabledTitleRow}>
          <Text
            style={[
              styles.disabledTitle,
              {
                fontSize:
                  compact
                    ? 15
                    : 17,
              },
            ]}
          >
            {title}
          </Text>

          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>
              Em breve
            </Text>
          </View>
        </View>

        <Text style={styles.disabledDescription}>
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor:
      colors.background,
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

    marginBottom: 9,
  },

  subtitle: {
    color: colors.text,

    lineHeight: 25,

    marginBottom: 30,
  },

  sectionTitle: {
    color: colors.primary,

    fontSize: 20,
    fontWeight: '700',

    marginBottom: 11,
  },

  section: {
    backgroundColor: colors.white,

    borderWidth: 1,
    borderColor: '#E6DEE0',

    borderRadius: 21,

    paddingHorizontal: 16,

    marginBottom: 26,
  },

  settingItem: {
    minHeight: 92,

    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 13,
  },

  settingIcon: {
    backgroundColor: colors.lightPink,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  dangerIcon: {
    backgroundColor: '#F3D8DC',
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    color: colors.primary,

    fontWeight: '700',

    marginBottom: 4,
  },

  dangerTitle: {
    color: '#A33D4C',
  },

  settingDescription: {
    color: colors.text,

    fontSize: 13,
    lineHeight: 19,

    paddingRight: 7,
  },

  divider: {
    height: 1,

    backgroundColor: '#E6DEE0',
  },

  disabledItem: {
    minHeight: 92,

    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 13,

    opacity: 0.75,
  },

  disabledIcon: {
    backgroundColor: '#EDE8EA',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  disabledTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',

    gap: 7,

    marginBottom: 4,
  },

  disabledTitle: {
    color: '#6D656A',

    fontWeight: '700',
  },

  disabledDescription: {
    color: '#777075',

    fontSize: 13,
    lineHeight: 19,
  },

  comingSoonBadge: {
    backgroundColor: '#E8DFE7',

    borderRadius: 10,

    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  comingSoonText: {
    color: colors.primary,

    fontSize: 9,
    fontWeight: '700',
  },

  versionBox: {
    backgroundColor: '#EEE5ED',

    borderRadius: 19,

    padding: 16,

    flexDirection: 'row',
    alignItems: 'center',
  },

  versionIcon: {
    width: 46,
    height: 46,

    borderRadius: 23,

    backgroundColor: colors.white,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  versionContent: {
    flex: 1,
  },

  versionTitle: {
    color: colors.primary,

    fontSize: 16,
    fontWeight: '700',
  },

  versionText: {
    color: colors.text,

    fontSize: 12,

    marginTop: 2,
  },

  versionDescription: {
    color: '#777075',

    fontSize: 10,

    marginTop: 4,
  },
});