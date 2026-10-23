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

const tipos = [
  {
    titulo: 'Violência Física',
    descricao:
      'Agressões que causam ou podem causar danos ao corpo ou à saúde.',
    icone: 'hand-left-outline',
  },
  {
    titulo: 'Violência Psicológica',
    descricao:
      'Ameaças, humilhações, controle, isolamento e outras formas de dano emocional.',
    icone: 'chatbubble-ellipses-outline',
  },
  {
    titulo: 'Violência Sexual',
    descricao:
      'Condutas que constrangem ou forçam atos ou situações de natureza sexual.',
    icone: 'body-outline',
  },
  {
    titulo: 'Violência Patrimonial',
    descricao:
      'Controle, retenção, destruição ou subtração de dinheiro, bens e documentos.',
    icone: 'wallet-outline',
  },
  {
    titulo: 'Violência Moral',
    descricao:
      'Ofensas, acusações, difamação e outras ações que atingem a honra.',
    icone: 'megaphone-outline',
  },
  {
    titulo: 'Violência Vicária',
    descricao:
      'Uso de filhos, familiares ou vínculos afetivos como forma de causar sofrimento e controle.',
    icone: 'people-outline',
  },
];

export default function TiposViolenciaScreen() {
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
            Tipos de violência
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
            A violência doméstica pode acontecer
            de diferentes formas. Conhecer esses
            sinais pode ajudar a identificar uma
            situação de risco.
          </Text>

          <View style={styles.cards}>
            {tipos.map((tipo) => (
              <View
                key={tipo.titulo}
                style={[
                  styles.card,
                  {
                    width:
                      isPhone
                        ? '100%'
                        : '48.5%',

                    padding:
                      isCompactPhone
                        ? 15
                        : 18,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      width:
                        isCompactPhone
                          ? 52
                          : 62,

                      height:
                        isCompactPhone
                          ? 52
                          : 62,

                      borderRadius:
                        isCompactPhone
                          ? 26
                          : 31,
                    },
                  ]}
                >
                  <Ionicons
                    name={tipo.icone as any}
                    size={
                      isCompactPhone
                        ? 27
                        : 32
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
                    {tipo.titulo}
                  </Text>

                  <Text style={styles.cardText}>
                    {tipo.descricao}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={26}
              color={colors.primary}
            />

            <Text style={styles.infoText}>
              Você não precisa identificar sozinha
              qual tipo de violência está vivendo
              para buscar ajuda ou orientação.
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            style={styles.helpButton}
            onPress={() =>
              router.push('/denunciar')
            }
          >
            <Text style={styles.helpButtonText}>
              Ver canais de ajuda
            </Text>

            <Ionicons
              name="arrow-forward"
              size={21}
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
    minHeight: 130,

    backgroundColor: colors.white,

    borderWidth: 1,
    borderColor: '#E4DADC',

    borderRadius: 22,

    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    backgroundColor: colors.lightPink,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 14,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    color: colors.primary,

    fontWeight: '700',

    marginBottom: 5,
  },

  cardText: {
    color: colors.text,

    fontSize: 14,
    lineHeight: 20,
  },

  infoBox: {
    marginTop: 24,

    borderWidth: 1.5,
    borderColor: colors.pink,

    borderRadius: 20,

    padding: 17,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 11,
  },

  infoText: {
    flex: 1,

    color: colors.text,

    fontSize: 14,
    lineHeight: 21,
  },

  helpButton: {
    minHeight: 60,

    marginTop: 24,

    backgroundColor: colors.primary,

    borderRadius: 30,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 9,

    paddingHorizontal: 22,
  },

  helpButtonText: {
    color: colors.white,

    fontSize: 16,
    fontWeight: '700',
  },
});