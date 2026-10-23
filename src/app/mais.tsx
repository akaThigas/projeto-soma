import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../components/AppText';

import { colors } from '../constants/theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { voltar } from '../utils/voltar';

type MenuItemProps = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  compact?: boolean;
};

function MenuItem({
  title,
  description,
  icon,
  onPress,
  compact = false,
}: MenuItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      style={({ pressed }) => [
        styles.menuItem,

        pressed &&
          styles.menuItemPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.menuIcon,
          {
            width:
              compact
                ? 50
                : 58,

            height:
              compact
                ? 50
                : 58,

            borderRadius:
              compact
                ? 25
                : 29,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={
            compact
              ? 25
              : 28
          }
          color={colors.primary}
        />
      </View>

      <View style={styles.menuContent}>
        <Text
          style={[
            styles.menuTitle,
            {
              fontSize:
                compact
                  ? 16
                  : 18,
            },
          ]}
        >
          {title}
        </Text>

        <Text style={styles.menuDescription}>
          {description}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color={colors.primary}
      />
    </Pressable>
  );
}

export default function MaisScreen() {
  const {
    isCompactPhone,
    isPhone,
    horizontalPadding,
    topPadding,
    contentMaxWidth,
  } = useResponsiveLayout();

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
            onPress={voltar}
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
            Mais
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
            Informações e recursos para utilizar
            o SOMA com mais segurança.
          </Text>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Informações e apoio
          </Text>

          <View style={styles.menu}>
            <View
              style={{
                width:
                  isPhone
                    ? '100%'
                    : '48.5%',
              }}
            >
              <MenuItem
                title="Segurança digital"
                description="Cuidados ao buscar ajuda usando seu dispositivo."
                icon="lock-closed-outline"
                compact={isCompactPhone}
                onPress={() =>
                  router.push(
                    '/conteudo/seguranca-digital'
                  )
                }
              />
            </View>

            <View
              style={{
                width:
                  isPhone
                    ? '100%'
                    : '48.5%',
              }}
            >
              <MenuItem
                title="Quero ajudar alguém"
                description="Orientações para apoiar outra pessoa."
                icon="people-outline"
                compact={isCompactPhone}
                onPress={() =>
                  router.push(
                    '/conteudo/ajudar-outra-pessoa'
                  )
                }
              />
            </View>

            <View
              style={{
                width:
                  isPhone
                    ? '100%'
                    : '48.5%',
              }}
            >
              <MenuItem
                title="Tipos de violência"
                description="Conheça diferentes formas e sinais de violência."
                icon="hand-left-outline"
                compact={isCompactPhone}
                onPress={() =>
                  router.push(
                    '/tipos-violencia'
                  )
                }
              />
            </View>

            <View
              style={{
                width:
                  isPhone
                    ? '100%'
                    : '48.5%',
              }}
            >
              <MenuItem
                title="Rede de apoio"
                description="Consulte serviços de orientação e acolhimento."
                icon="heart-outline"
                compact={isCompactPhone}
                onPress={() =>
                  router.push(
                    '/rede-apoio'
                  )
                }
              />
            </View>
          </View>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Aplicativo
          </Text>

          <View style={styles.singleMenu}>
            <MenuItem
              title="Configurações"
              description="Gerencie preferências, privacidade e opções do aplicativo."
              icon="settings-outline"
              compact={isCompactPhone}
              onPress={() =>
                router.push(
                  '/configuracoes'
                )
              }
            />
          </View>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Sobre o SOMA
          </Text>

          <View style={styles.aboutCard}>
            <View style={styles.aboutHeader}>
              <View style={styles.aboutIcon}>
                <Ionicons
                  name="flower-outline"
                  size={28}
                  color={colors.primary}
                />
              </View>

              <View style={styles.aboutHeaderText}>
                <Text style={styles.aboutName}>
                  Projeto SOMA
                </Text>

                <Text style={styles.aboutMeaning}>
                  Segurança • Orientação • Monitoramento • Apoio
                </Text>
              </View>
            </View>

            <Text style={styles.aboutText}>
              O SOMA é um projeto acadêmico
              criado para facilitar o acesso
              a informações e canais oficiais
              de apoio para mulheres em situação
              de violência doméstica.
            </Text>

            <Text style={styles.aboutText}>
              A plataforma busca tornar esse
              processo mais simples, discreto
              e acessível.
            </Text>
          </View>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Privacidade e segurança
          </Text>

          <View style={styles.privacyCard}>
            <Ionicons
              name="shield-checkmark-outline"
              size={31}
              color={colors.primary}
            />

            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>
                Seus dados importam
              </Text>

              <Text style={styles.privacyText}>
                O SOMA não é um órgão policial
                e não recebe denúncias diretamente.
                Os canais apresentados direcionam
                para serviços oficiais.
              </Text>

              <Text style={styles.privacyText}>
                O projeto também foi pensado para
                reduzir o armazenamento de
                informações sensíveis.
              </Text>
            </View>
          </View>

          <View style={styles.prototypeBox}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={colors.primary}
            />

            <Text style={styles.prototypeText}>
              Esta é uma versão de demonstração
              do Projeto SOMA. Alguns serviços e
              informações apresentados no MVP
              poderão utilizar dados simulados.
            </Text>
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

  sectionTitle: {
    color: colors.primary,

    fontSize: 21,
    fontWeight: '700',

    marginBottom: 13,
    marginTop: 5,
  },

  menu: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    gap: 12,

    marginBottom: 28,
  },

  singleMenu: {
    marginBottom: 28,
  },

  menuItem: {
    minHeight: 95,

    backgroundColor: colors.white,

    borderWidth: 1,
    borderColor: '#E5DDDF',

    borderRadius: 21,

    padding: 14,

    flexDirection: 'row',
    alignItems: 'center',
  },

  menuItemPressed: {
    opacity: 0.7,
  },

  menuIcon: {
    backgroundColor: colors.lightPink,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  menuContent: {
    flex: 1,
  },

  menuTitle: {
    color: colors.primary,

    fontWeight: '700',

    marginBottom: 4,
  },

  menuDescription: {
    color: colors.text,

    fontSize: 13,
    lineHeight: 19,
  },

  aboutCard: {
    backgroundColor: '#E8C8CA',

    borderRadius: 22,

    padding: 18,

    marginBottom: 28,
  },

  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 16,
  },

  aboutHeaderText: {
    flex: 1,
  },

  aboutIcon: {
    width: 54,
    height: 54,

    borderRadius: 27,

    backgroundColor: '#F1DCDE',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  aboutName: {
    color: colors.primary,

    fontSize: 20,
    fontWeight: '700',
  },

  aboutMeaning: {
    color: colors.text,

    fontSize: 11,
    lineHeight: 17,

    marginTop: 3,
  },

  aboutText: {
    color: colors.text,

    fontSize: 15,
    lineHeight: 23,

    marginBottom: 10,
  },

  privacyCard: {
    backgroundColor: colors.white,

    borderWidth: 1.5,
    borderColor: colors.pink,

    borderRadius: 21,

    padding: 17,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 12,

    marginBottom: 22,
  },

  privacyContent: {
    flex: 1,
  },

  privacyTitle: {
    color: colors.primary,

    fontSize: 17,
    fontWeight: '700',

    marginBottom: 6,
  },

  privacyText: {
    color: colors.text,

    fontSize: 13,
    lineHeight: 20,

    marginBottom: 8,
  },

  prototypeBox: {
    backgroundColor: '#F0E7EF',

    borderRadius: 19,

    padding: 16,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 10,
  },

  prototypeText: {
    flex: 1,

    color: colors.text,

    fontSize: 13,
    lineHeight: 20,
  },
});