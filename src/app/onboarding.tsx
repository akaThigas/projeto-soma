import { useState } from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../components/AppText';

import { ONBOARDING_STORAGE_KEY } from '../constants/storage';
import { colors } from '../constants/theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

const items = [
  {
    title: 'Tipos de Violência',
    description:
      'Conheça seus direitos e saiba reconhecer os sinais.',
    icon: 'hand-left-outline',
  },
  {
    title: 'Como denunciar?',
    description:
      'Conheça os canais oficiais disponíveis.',
    icon: 'call-outline',
  },
  {
    title: 'Mapa de Calor',
    description:
      'Visualize informações territoriais e pontos de apoio.',
    icon: 'location-outline',
  },
  {
    title: 'Rede de Apoio',
    description:
      'Encontre serviços de acolhimento e orientação.',
    icon: 'people-outline',
  },
];

export default function OnboardingScreen() {
  const [
    naoMostrarNovamente,
    setNaoMostrarNovamente,
  ] = useState(false);

  const {
    isCompactPhone,
    isPhone,
    horizontalPadding,
    topPadding,
    contentMaxWidth,
  } = useResponsiveLayout();

  async function continuar() {
    try {
      if (naoMostrarNovamente) {
        await AsyncStorage.setItem(
          ONBOARDING_STORAGE_KEY,
          'true'
        );
      }

      router.replace('/home');
    } catch (error) {
      console.error(
        'Erro ao salvar preferência:',
        error
      );

      router.replace('/home');
    }
  }

  function pular() {
    router.replace('/home');
  }

  return (
    <ScrollView
      style={styles.container}
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
              contentMaxWidth ?? 700,

            paddingHorizontal:
              horizontalPadding,
          },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pular apresentação"
          style={styles.skip}
          onPress={pular}
        >
          <Text style={styles.skipText}>
            Pular
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

              lineHeight:
                isCompactPhone
                  ? 37
                  : 43,
            },
          ]}
        >
          O que você encontra aqui?
        </Text>

        <View style={styles.list}>
          {items.map((item) => (
            <View
              key={item.title}
              style={[
                styles.card,
                {
                  width:
                    isPhone
                      ? '100%'
                      : '48.5%',

                  padding:
                    isCompactPhone
                      ? 13
                      : 16,
                },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    width:
                      isCompactPhone
                        ? 58
                        : 70,

                    height:
                      isCompactPhone
                        ? 58
                        : 70,

                    borderRadius:
                      isCompactPhone
                        ? 29
                        : 35,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={
                    isCompactPhone
                      ? 29
                      : 36
                  }
                  color={colors.primary}
                />
              </View>

              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.cardTitle,
                    {
                      fontSize:
                        isCompactPhone
                          ? 17
                          : 19,
                    },
                  ]}
                >
                  {item.title}
                </Text>

                <Text
                  style={[
                    styles.cardDescription,
                    {
                      fontSize:
                        isCompactPhone
                          ? 14
                          : 16,
                    },
                  ]}
                >
                  {item.description}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: naoMostrarNovamente }}
          aria-checked={naoMostrarNovamente}
          accessibilityLabel="Não mostrar esta tela novamente"
          style={styles.checkboxContainer}
          onPress={() =>
            setNaoMostrarNovamente(
              !naoMostrarNovamente
            )
          }
        >
          <View
            style={[
              styles.checkbox,
              naoMostrarNovamente &&
                styles.checkboxChecked,
            ]}
          >
            {naoMostrarNovamente && (
              <Ionicons
                name="checkmark"
                size={18}
                color={colors.white}
              />
            )}
          </View>

          <Text style={styles.checkboxText}>
            Não mostrar esta tela novamente
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.button,
            pressed &&
              styles.buttonPressed,
          ]}
          onPress={continuar}
        >
          <Text
            style={[
              styles.buttonText,
              {
                fontSize:
                  isCompactPhone
                    ? 19
                    : 22,
              },
            ]}
          >
            Começar
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContent: {
    alignItems: 'center',
    paddingBottom: 50,
  },

  content: {
    width: '100%',
  },

  skip: {
    // À esquerda, para não ficar sob o botão de saída rápida (canto direito)
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 26,
  },

  skipText: {
    color: '#817881',

    fontSize: 16,
    fontWeight: '600',
  },

  title: {
    color: colors.primary,

    fontWeight: '700',

    marginBottom: 26,
  },

  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    gap: 14,
  },

  card: {
    minHeight: 105,

    borderWidth: 1.5,
    borderColor: '#D8CDD1',

    borderRadius: 22,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor:
      colors.background,
  },

  iconContainer: {
    backgroundColor: '#D99BAD',

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 13,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    color: colors.primary,

    fontWeight: '700',

    marginBottom: 4,
  },

  cardDescription: {
    color: colors.text,

    lineHeight: 21,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    marginTop: 28,
  },

  checkbox: {
    width: 24,
    height: 24,

    borderRadius: 6,

    borderWidth: 2,
    borderColor: colors.primary,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 10,
  },

  checkboxChecked: {
    backgroundColor: colors.primary,
  },

  checkboxText: {
    flex: 1,

    color: colors.text,

    fontSize: 15,
    lineHeight: 20,
  },

  button: {
    minHeight: 64,

    backgroundColor: colors.primary,

    borderRadius: 32,

    marginTop: 24,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 20,
  },

  buttonPressed: {
    opacity: 0.8,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  buttonText: {
    color: colors.white,
    fontWeight: '600',
  },
});