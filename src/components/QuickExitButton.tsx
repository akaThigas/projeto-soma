import { useEffect } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';

import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { colors } from '../constants/theme';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { quickExit } from '../utils/quickExit';

/**
 * Botão de saída rápida, fixo no canto superior direito
 * de todas as telas (exceto a splash).
 *
 * Na Web também é possível sair pressionando a tecla Esc.
 */
export function QuickExitButton() {
  const pathname = usePathname();

  const {
    isCompactPhone,
    safeTop,
    safeRight,
    horizontalPadding,
  } = useResponsiveLayout();

  const isSplash = pathname === '/';

  useEffect(() => {
    if (Platform.OS !== 'web' || isSplash) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        quickExit();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSplash]);

  if (isSplash) {
    return null;
  }

  return (
    <Pressable
      onPress={quickExit}
      accessibilityRole="button"
      accessibilityLabel="Sair rapidamente"
      accessibilityHint={
        Platform.OS === 'web'
          ? 'Abre uma página neutra no lugar do SOMA. Atalho: tecla Esc.'
          : 'Fecha o SOMA e abre uma página neutra no navegador.'
      }
      hitSlop={10}
      style={({ pressed }) => [
        styles.button,
        {
          top: safeTop + (isCompactPhone ? 8 : 12),
          right: safeRight + Math.max(horizontalPadding - 4, 10),
        },
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name="close"
        size={isCompactPhone ? 16 : 18}
        color={colors.textLight}
      />

      <Text
        style={[
          styles.text,
          isCompactPhone && { fontSize: 13 },
        ]}
      >
        Sair
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    zIndex: 1000,
    elevation: 12,

    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,

    minHeight: 40,
    paddingVertical: 8,
    paddingLeft: 11,
    paddingRight: 14,

    borderRadius: 22,

    backgroundColor: colors.primary,
    borderWidth: 1.5,
    borderColor: colors.lightPink,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },

  pressed: {
    opacity: 0.8,
  },

  text: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
