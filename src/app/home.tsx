import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { HomeShortcutCard } from '../components/HomeShortcutCard';
import { MapaDestaque } from '../components/MapaDestaque';
import { colors } from '../constants/theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export default function HomeScreen() {
  const {
    isCompactPhone,
    isPhone,
    isDesktop,
    isShortScreen,
    horizontalPadding,
    topPadding,
    contentMaxWidth,
  } = useResponsiveLayout();

  const logoSize = isCompactPhone
    ? 50
    : isPhone
      ? 60
      : 65;

  const welcomeTitleSize =
    isCompactPhone
      ? 28
      : 34;

  const welcomeSubtitleSize =
    isCompactPhone
      ? 15
      : 18;

  const heroMinHeight =
    isCompactPhone || isShortScreen
      ? 175
      : isPhone
        ? 215
        : 225;

  const heroTitleSize =
    isCompactPhone
      ? 27
      : isPhone
        ? 32
        : 34;

  const heroPadding =
    isCompactPhone
      ? 18
      : 25;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: topPadding,
            paddingBottom: 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
        bounces
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
          {/* Logo */}

          <View
            style={[
              styles.logoContainer,

              {
                marginBottom:
                  isCompactPhone
                    ? 24
                    : 36,
              },
            ]}
          >
            <Image
              source={require(
                '../../assets/images/logo-soma.png'
              )}
              style={{
                width: logoSize,
                height: logoSize,
              }}
              resizeMode="contain"
            />

            <Text
              style={[
                styles.logoText,

                {
                  fontSize:
                    isCompactPhone
                      ? 21
                      : 25,

                  letterSpacing:
                    isCompactPhone
                      ? 5
                      : 7,
                },
              ]}
            >
              SOMA
            </Text>
          </View>

          {/* Boas-vindas */}

          <Text
            style={[
              styles.welcomeTitle,

              {
                fontSize:
                  welcomeTitleSize,

                lineHeight:
                  welcomeTitleSize + 7,
              },
            ]}
          >
            Olá, seja bem-vinda!
          </Text>

          <Text
            style={[
              styles.welcomeSubtitle,

              {
                fontSize:
                  welcomeSubtitleSize,

                lineHeight:
                  welcomeSubtitleSize + 7,

                marginBottom:
                  isCompactPhone
                    ? 20
                    : 28,
              },
            ]}
          >
            Você não está sozinha.
            Estamos aqui para te apoiar.
          </Text>

          {/* Mapa de São Paulo: caminho principal para encontrar atendimento */}

          <MapaDestaque />

          {/* Destaque */}

          <Pressable
            style={({ pressed }) => [
              styles.heroCard,

              {
                minHeight:
                  heroMinHeight,

                padding:
                  heroPadding,

                marginBottom:
                  isCompactPhone
                    ? 24
                    : 32,
              },

              pressed &&
                styles.heroPressed,
            ]}
            onPress={() =>
              router.push(
                '/tipos-violencia'
              )
            }
          >
            <View style={styles.heroContent}>
              <Text
                style={[
                  styles.heroText,

                  {
                    fontSize:
                      heroTitleSize,

                    lineHeight:
                      heroTitleSize + 6,
                  },
                ]}
              >
                Reconheça os sinais de violência
              </Text>

              <Text
                style={[
                  styles.heroDescription,

                  isCompactPhone && {
                    fontSize: 13,
                    lineHeight: 19,
                  },
                ]}
              >
                Informação pode ajudar você
                a identificar situações de
                violência e buscar apoio.
              </Text>

              <View style={styles.heroButton}>
                <Text style={styles.heroButtonText}>
                  Saiba mais
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={19}
                  color={colors.primary}
                />
              </View>
            </View>

            <View
              style={styles.heroDecorationOne}
            />

            <View
              style={styles.heroDecorationTwo}
            />

            <Ionicons
              name="heart-outline"
              size={
                isCompactPhone
                  ? 70
                  : 95
              }
              color="rgba(255,255,255,0.12)"
              style={styles.heroIcon}
            />
          </Pressable>

          {/* Atalhos */}

          <View
            style={[
              styles.shortcutsArea,

              isDesktop && {
                maxWidth: 760,
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,

                {
                  fontSize:
                    isCompactPhone
                      ? 21
                      : 24,
                },
              ]}
            >
              Como podemos ajudar?
            </Text>

            <View style={styles.grid}>
              <HomeShortcutCard
                title="Tipos de Violência"
                icon="hand-left-outline"
                onPress={() =>
                  router.push(
                    '/tipos-violencia'
                  )
                }
              />

              <HomeShortcutCard
                title="Como denunciar"
                icon="call-outline"
                onPress={() =>
                  router.push(
                    '/denunciar'
                  )
                }
              />

              <HomeShortcutCard
                title="Mapa de calor"
                icon="location-outline"
                onPress={() =>
                  router.push('/mapa')
                }
              />

              <HomeShortcutCard
                title="Rede de Apoio"
                icon="people-outline"
                onPress={() =>
                  router.push(
                    '/rede-apoio'
                  )
                }
              />

              <HomeShortcutCard
                title="Emergência"
                icon="warning-outline"
                variant="emergency"
                onPress={() =>
                  router.push(
                    '/emergencia'
                  )
                }
              />

              <HomeShortcutCard
                title="Mais"
                icon="ellipsis-horizontal-outline"
                onPress={() =>
                  router.push('/mais')
                }
              />
            </View>
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

  scroll: {
    flex: 1,
  },

  scrollContent: {
    alignItems: 'center',
  },

  content: {
    width: '100%',
  },

  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoText: {
    color: colors.primary,

    fontWeight: '700',

    marginLeft: 9,
  },

  welcomeTitle: {
    color: colors.primary,

    fontWeight: '700',

    marginBottom: 6,
  },

  welcomeSubtitle: {
    color: colors.text,

    maxWidth: 420,
  },

  heroCard: {
    width: '100%',

    backgroundColor:
      colors.primary,

    borderRadius: 26,

    justifyContent: 'center',

    overflow: 'hidden',
  },

  heroPressed: {
    opacity: 0.9,
  },

  heroContent: {
    zIndex: 3,

    maxWidth: 500,
  },

  heroText: {
    color: colors.background,

    fontWeight: '700',

    marginBottom: 9,

    maxWidth: 450,
  },

  heroDescription: {
    color: '#F2E8ED',

    fontSize: 15,
    lineHeight: 21,

    marginBottom: 17,

    maxWidth: 400,
  },

  heroButton: {
    alignSelf: 'flex-start',

    backgroundColor:
      colors.background,

    paddingVertical: 9,
    paddingHorizontal: 15,

    borderRadius: 22,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 6,
  },

  heroButtonText: {
    color: colors.primary,

    fontSize: 14,
    fontWeight: '700',
  },

  heroDecorationOne: {
    position: 'absolute',

    width: 180,
    height: 180,

    borderRadius: 90,

    backgroundColor:
      'rgba(207,135,158,0.25)',

    right: -45,
    top: -55,
  },

  heroDecorationTwo: {
    position: 'absolute',

    width: 135,
    height: 135,

    borderRadius: 68,

    backgroundColor:
      'rgba(187,168,204,0.15)',

    right: 5,
    bottom: -50,
  },

  heroIcon: {
    position: 'absolute',

    right: 20,
    bottom: 18,
  },

  shortcutsArea: {
    width: '100%',
    alignSelf: 'center',
  },

  sectionTitle: {
    color: colors.primary,

    fontWeight: '700',

    marginBottom: 17,
  },

  grid: {
    width: '100%',

    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    rowGap: 14,
  },
});