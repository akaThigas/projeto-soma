import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from './AppText';

import { colors } from '../constants/theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/**
 * Cartão em destaque que leva ao mapa detalhado da cidade de São Paulo
 * (distritos + delegacias, casas da mulher, hospitais e defensorias).
 * É o caminho principal para encontrar atendimento perto de você.
 */

type Props = {
  titulo?: string;
  texto?: string;
  botao?: string;
};

export function MapaDestaque({
  titulo = 'Mapa de São Paulo',
  texto = 'Veja no mapa delegacias, casas da mulher, hospitais e defensorias da cidade e encontre o atendimento mais perto de você.',
  botao = 'Abrir o mapa',
}: Props) {
  const { isCompactPhone } = useResponsiveLayout();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { padding: isCompactPhone ? 18 : 24 },
        pressed && styles.pressed,
      ]}
      onPress={() => router.push('/mapa')}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. ${botao}`}
    >
      <View style={styles.decorationOne} />
      <View style={styles.decorationTwo} />
      <Ionicons
        name="map"
        size={isCompactPhone ? 80 : 104}
        color="rgba(255,255,255,0.12)"
        style={styles.bgIcon}
      />

      <View style={styles.content}>
        <View style={styles.badge}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={styles.badgeText}>Principal</Text>
        </View>

        <Text
          style={[styles.title, { fontSize: isCompactPhone ? 24 : 29 }]}
        >
          {titulo}
        </Text>

        <Text
          style={[
            styles.text,
            isCompactPhone && { fontSize: 13, lineHeight: 19 },
          ]}
        >
          {texto}
        </Text>

        <View style={styles.button}>
          <Text style={styles.buttonText}>{botao}</Text>
          <Ionicons name="arrow-forward" size={19} color={colors.primary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 26,
    overflow: 'hidden',
    marginBottom: 24,
  },

  pressed: {
    opacity: 0.9,
  },

  content: {
    zIndex: 3,
    maxWidth: 500,
  },

  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.lightPink,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  badgeText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },

  title: {
    color: colors.background,
    fontWeight: '700',
    marginBottom: 8,
  },

  text: {
    color: '#F2E8ED',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
    maxWidth: 420,
  },

  button: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    paddingVertical: 10,
    paddingHorizontal: 17,
    borderRadius: 22,
  },

  buttonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  decorationOne: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(207,135,158,0.25)',
    right: -45,
    top: -55,
  },

  decorationTwo: {
    position: 'absolute',
    width: 135,
    height: 135,
    borderRadius: 68,
    backgroundColor: 'rgba(187,168,204,0.15)',
    right: 5,
    bottom: -50,
  },

  bgIcon: {
    position: 'absolute',
    right: 18,
    bottom: 14,
  },
});
