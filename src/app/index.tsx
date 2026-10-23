import { useEffect } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

import { Image, StyleSheet, View } from 'react-native';
import { Text } from '../components/AppText';

import { ONBOARDING_STORAGE_KEY } from '../constants/storage';
import { colors } from '../constants/theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export default function SplashScreen() {
  const {
    isCompactPhone,
    isPhone,
  } = useResponsiveLayout();

  useEffect(() => {
    let active = true;

    const timer = setTimeout(
      async () => {
        try {
          const hideOnboarding =
            await AsyncStorage.getItem(
              ONBOARDING_STORAGE_KEY
            );

          if (!active) {
            return;
          }

          if (hideOnboarding === 'true') {
            router.replace('/home');
          } else {
            router.replace('/onboarding');
          }
        } catch (error) {
          console.warn(
            'Erro ao verificar preferência do onboarding:',
            error
          );

          if (active) {
            router.replace('/onboarding');
          }
        }
      },
      1800
    );

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const logoSize =
    isCompactPhone
      ? 170
      : isPhone
        ? 210
        : 230;

  const titleSize =
    isCompactPhone
      ? 30
      : 38;

  return (
    <LinearGradient
      colors={[
        '#3D1E45',
        colors.primaryDark,
      ]}
      start={{
        x: 0.5,
        y: 0,
      }}
      end={{
        x: 0.5,
        y: 1,
      }}
      style={styles.container}
    >
      <View style={styles.content}>
        <Image
          accessibilityLabel="Logo do SOMA"
          source={require(
            '../../assets/images/logo-soma.png'
          )}
          style={{
            width: logoSize,
            height: logoSize,
            marginBottom: 20,
          }}
          resizeMode="contain"
        />

        <Text
          style={[
            styles.title,
            {
              fontSize: titleSize,
              letterSpacing:
                isCompactPhone
                  ? 10
                  : 14,
            },
          ]}
        >
          S O M A
        </Text>
      </View>

      <View style={styles.loadingContainer}>
        <View style={styles.loadingBackground}>
          <View style={styles.loadingProgress} />
        </View>

        <Text style={styles.loadingText}>
          Segurança • Orientação • Monitoramento • Apoio
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: colors.textLight,
    fontWeight: '300',
  },

  loadingContainer: {
    position: 'absolute',

    bottom: 70,

    width: '100%',

    alignItems: 'center',

    paddingHorizontal: 30,
  },

  loadingBackground: {
    width: '55%',
    maxWidth: 320,

    height: 4,

    backgroundColor:
      'rgba(255, 255, 255, 0.25)',

    borderRadius: 4,

    overflow: 'hidden',
  },

  loadingProgress: {
    width: '70%',
    height: '100%',

    backgroundColor: colors.white,

    borderRadius: 4,
  },

  loadingText: {
    color:
      'rgba(255, 255, 255, 0.75)',

    fontSize: 12,

    marginTop: 16,

    letterSpacing: 1,

    textAlign: 'center',
  },
});