import { Ionicons } from '@expo/vector-icons';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '../../components/AppText';

import { colors } from '../../constants/theme';
import { conteudos } from '../../data/conteudos';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { voltar } from '../../utils/voltar';

/**
 * Na versão web (saída estática), gera uma página para cada conteúdo.
 * Assim, links diretos como /conteudo/medida-protetiva funcionam no GitHub Pages.
 */
export function generateStaticParams() {
  return conteudos.map((item) => ({ id: item.id }));
}

export default function ConteudoScreen() {
  const { id } =
    useLocalSearchParams();

  const {
    isCompactPhone,
    horizontalPadding,
    topPadding,
  } = useResponsiveLayout();

  const conteudo = conteudos.find(
    (item) => item.id === id
  );

  if (!conteudo) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundTitle}>
          Conteúdo não encontrado
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          onPress={voltar}
        >
          <Text style={styles.backLink}>
            Voltar
          </Text>
        </Pressable>
      </View>
    );
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

          <View
            style={[
              styles.iconContainer,
              {
                width:
                  isCompactPhone
                    ? 66
                    : 78,

                height:
                  isCompactPhone
                    ? 66
                    : 78,

                borderRadius:
                  isCompactPhone
                    ? 33
                    : 39,
              },
            ]}
          >
            <Ionicons
              name={conteudo.icone}
              size={
                isCompactPhone
                  ? 34
                  : 40
              }
              color={colors.primary}
            />
          </View>

          <Text style={styles.category}>
            {conteudo.categoria}
          </Text>

          <Text
            accessibilityRole="header"
            style={[
              styles.title,
              {
                fontSize:
                  isCompactPhone
                    ? 29
                    : 35,

                lineHeight:
                  isCompactPhone
                    ? 36
                    : 42,
              },
            ]}
          >
            {conteudo.titulo}
          </Text>

          <Text
            style={[
              styles.summary,
              {
                fontSize:
                  isCompactPhone
                    ? 16
                    : 18,
              },
            ]}
          >
            {conteudo.resumo}
          </Text>

          <View style={styles.divider} />

          {conteudo.blocos.map((bloco, index) => {
            if (bloco.tipo === 'subtitulo') {
              return (
                <Text
                  key={index}
                  accessibilityRole="header"
                  style={styles.subtitle}
                >
                  {bloco.texto}
                </Text>
              );
            }

            if (bloco.tipo === 'lista') {
              return (
                <View key={index} style={styles.list}>
                  {bloco.itens.map((item) => (
                    <View key={item} style={styles.listItem}>
                      <Text
                        style={styles.bullet}
                        accessibilityElementsHidden
                        importantForAccessibility="no"
                      >
                        •
                      </Text>

                      <Text
                        style={[
                          styles.listText,
                          {
                            fontSize:
                              isCompactPhone
                                ? 15
                                : 17,
                          },
                        ]}
                      >
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            }

            return (
              <Text
                key={index}
                style={[
                  styles.paragraph,
                  {
                    fontSize:
                      isCompactPhone
                        ? 15
                        : 17,
                  },
                ]}
              >
                {bloco.texto}
              </Text>
            );
          })}

          {conteudo.fontes.length > 0 && (
            <View style={styles.sources}>
              <Text
                accessibilityRole="header"
                style={styles.sourcesTitle}
              >
                Fontes
              </Text>

              <Text style={styles.sourcesNote}>
                Consultadas em outubro de 2026. Os
                procedimentos podem variar conforme
                a localidade.
              </Text>

              {conteudo.fontes.map((fonte) => (
                <Pressable
                  key={fonte.url}
                  accessibilityRole="link"
                  accessibilityLabel={`Abrir fonte: ${fonte.rotulo}`}
                  hitSlop={6}
                  onPress={() =>
                    Linking.openURL(fonte.url).catch(() => {})
                  }
                >
                  <Text style={styles.sourceLink}>
                    {fonte.rotulo}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.warning}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={colors.primary}
            />

            <Text style={styles.warningText}>
              Este conteúdo tem finalidade de
              orientação e não substitui
              atendimento jurídico, policial,
              médico ou especializado.
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
    maxWidth: 760,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',

    alignSelf: 'flex-start',

    marginBottom: 30,
  },

  backText: {
    color: colors.primary,

    fontSize: 16,
    fontWeight: '600',
  },

  iconContainer: {
    backgroundColor: colors.lightPink,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 16,
  },

  category: {
    color: colors.pink,

    fontSize: 12,
    fontWeight: '700',

    textTransform: 'uppercase',

    marginBottom: 6,
  },

  title: {
    color: colors.primary,

    fontWeight: '700',

    marginBottom: 11,
  },

  summary: {
    color: colors.text,

    lineHeight: 27,
  },

  divider: {
    height: 1,

    backgroundColor: '#DED5D7',

    marginVertical: 25,
  },

  paragraph: {
    color: colors.text,

    lineHeight: 26,

    marginBottom: 17,
  },

  subtitle: {
    color: colors.primary,

    fontSize: 20,
    fontWeight: '700',

    marginTop: 8,
    marginBottom: 12,
  },

  list: {
    gap: 12,

    marginBottom: 20,
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 10,
  },

  bullet: {
    color: colors.pink,

    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },

  listText: {
    flex: 1,

    color: colors.text,

    lineHeight: 26,
  },

  sources: {
    gap: 8,

    marginTop: 12,
    marginBottom: 20,
  },

  sourcesTitle: {
    color: colors.primary,

    fontSize: 15,
    fontWeight: '700',
  },

  sourcesNote: {
    color: '#6E6170',

    fontSize: 12,
    lineHeight: 18,
  },

  sourceLink: {
    color: colors.primary,

    fontSize: 13,
    lineHeight: 19,

    textDecorationLine: 'underline',
  },

  warning: {
    borderWidth: 1.5,
    borderColor: colors.pink,

    borderRadius: 20,

    padding: 16,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 10,

    marginTop: 8,
  },

  warningText: {
    flex: 1,

    color: colors.text,

    fontSize: 13,
    lineHeight: 20,
  },

  helpButton: {
    minHeight: 58,

    backgroundColor: colors.primary,

    borderRadius: 29,

    marginTop: 25,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 9,
  },

  helpButtonText: {
    color: colors.white,

    fontSize: 16,
    fontWeight: '700',
  },

  notFoundContainer: {
    flex: 1,

    backgroundColor: colors.background,

    alignItems: 'center',
    justifyContent: 'center',

    padding: 30,
  },

  notFoundTitle: {
    color: colors.primary,

    fontSize: 24,
    fontWeight: '700',
  },

  backLink: {
    color: colors.pink,

    fontSize: 16,
    fontWeight: '700',

    marginTop: 18,
  },
});