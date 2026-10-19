import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  useMemo,
  useState,
} from 'react';

import { colors } from '../constants/theme';
import { conteudos } from '../data/conteudos';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

export default function ExplorarScreen() {
  const [busca, setBusca] =
    useState('');

  const {
    isCompactPhone,
    isPhone,
    horizontalPadding,
    topPadding,
    contentMaxWidth,
  } = useResponsiveLayout();

  const resultados = useMemo(() => {
    const termo =
      busca.toLowerCase().trim();

    if (!termo) {
      return conteudos;
    }

    return conteudos.filter(
      (conteudo) =>
        conteudo.titulo
          .toLowerCase()
          .includes(termo) ||
        conteudo.resumo
          .toLowerCase()
          .includes(termo) ||
        conteudo.categoria
          .toLowerCase()
          .includes(termo)
    );
  }, [busca]);

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
            Explorar
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
            Informação também é uma forma de
            proteção. Encontre orientações de
            forma simples e direta.
          </Text>

          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={22}
              color="#81777E"
            />

            <TextInput
              style={styles.searchInput}
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar assunto"
              accessibilityLabel="Buscar assunto"
              placeholderTextColor="#918991"
            />

            {busca.length > 0 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
                hitSlop={8}
                onPress={() =>
                  setBusca('')
                }
              >
                <Ionicons
                  name="close-circle"
                  size={21}
                  color="#918991"
                />
              </Pressable>
            )}
          </View>

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Informações importantes
          </Text>

          <View style={styles.list}>
            {resultados.map(
              (conteudo) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${conteudo.categoria}: ${conteudo.titulo}. ${conteudo.resumo}`}
                  key={conteudo.id}
                  style={({ pressed }) => [
                    styles.card,
                    {
                      width:
                        isPhone
                          ? '100%'
                          : '48.5%',
                    },

                    pressed &&
                      styles.cardPressed,
                  ]}
                  onPress={() =>
                    router.push(
                      `/conteudo/${conteudo.id}` as any
                    )
                  }
                >
                  <View
                    style={[
                      styles.iconContainer,
                      {
                        width:
                          isCompactPhone
                            ? 52
                            : 60,

                        height:
                          isCompactPhone
                            ? 52
                            : 60,

                        borderRadius:
                          isCompactPhone
                            ? 26
                            : 30,
                      },
                    ]}
                  >
                    <Ionicons
                      name={conteudo.icone}
                      size={
                        isCompactPhone
                          ? 27
                          : 30
                      }
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.cardContent}>
                    <Text style={styles.category}>
                      {conteudo.categoria}
                    </Text>

                    <Text
                      style={[
                        styles.cardTitle,
                        {
                          fontSize:
                            isCompactPhone
                              ? 17
                              : 18,
                        },
                      ]}
                    >
                      {conteudo.titulo}
                    </Text>

                    <Text style={styles.cardDescription}>
                      {conteudo.resumo}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={colors.primary}
                  />
                </Pressable>
              )
            )}
          </View>

          {resultados.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search-outline"
                size={44}
                color={colors.pink}
              />

              <Text style={styles.emptyTitle}>
                Nenhum conteúdo encontrado
              </Text>

              <Text style={styles.emptyDescription}>
                Tente buscar por outro termo.
              </Text>
            </View>
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Precisa de ajuda agora? Ver canais de ajuda."
            style={styles.helpCard}
            onPress={() =>
              router.push('/denunciar')
            }
          >
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>
                Precisa de ajuda agora?
              </Text>

              <Text style={styles.helpDescription}>
                Veja os canais oficiais disponíveis.
              </Text>
            </View>

            <Ionicons
              name="arrow-forward-circle"
              size={34}
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

    marginBottom: 24,
  },

  searchContainer: {
    minHeight: 55,

    backgroundColor: colors.white,

    borderWidth: 1.5,
    borderColor: '#D8CFD1',

    borderRadius: 18,

    paddingHorizontal: 15,

    flexDirection: 'row',
    alignItems: 'center',

    marginBottom: 26,
  },

  searchInput: {
    flex: 1,

    marginLeft: 9,

    color: colors.text,

    fontSize: 16,
  },

  sectionTitle: {
    color: colors.primary,

    fontSize: 22,
    fontWeight: '700',

    marginBottom: 15,
  },

  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',

    justifyContent: 'space-between',

    gap: 14,
  },

  card: {
    minHeight: 130,

    backgroundColor: colors.white,

    borderRadius: 22,

    borderWidth: 1,
    borderColor: '#E5DDDF',

    padding: 15,

    flexDirection: 'row',
    alignItems: 'center',
  },

  cardPressed: {
    opacity: 0.75,
  },

  iconContainer: {
    backgroundColor: colors.lightPink,

    alignItems: 'center',
    justifyContent: 'center',

    marginRight: 12,
  },

  cardContent: {
    flex: 1,
  },

  category: {
    color: colors.pink,

    fontSize: 10,
    fontWeight: '700',

    textTransform: 'uppercase',

    marginBottom: 3,
  },

  cardTitle: {
    color: colors.primary,

    fontWeight: '700',

    marginBottom: 4,
  },

  cardDescription: {
    color: colors.text,

    fontSize: 13,
    lineHeight: 19,
  },

  emptyContainer: {
    alignItems: 'center',

    paddingVertical: 45,
  },

  emptyTitle: {
    color: colors.primary,

    fontSize: 19,
    fontWeight: '700',

    marginTop: 12,
  },

  emptyDescription: {
    color: colors.text,

    fontSize: 14,

    marginTop: 5,
  },

  helpCard: {
    minHeight: 95,

    backgroundColor: colors.primary,

    borderRadius: 22,

    paddingHorizontal: 20,
    paddingVertical: 18,

    marginTop: 25,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  helpContent: {
    flex: 1,

    paddingRight: 12,
  },

  helpTitle: {
    color: colors.white,

    fontSize: 18,
    fontWeight: '700',

    marginBottom: 4,
  },

  helpDescription: {
    color: '#F0E5EA',

    fontSize: 13,
  },
});