import { Ionicons } from '@expo/vector-icons';

import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Text } from './AppText';

import { colors } from '../constants/theme';

type HomeShortcutCardProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'default' | 'emergency';
};

export function HomeShortcutCard({
  title,
  icon,
  onPress,
  variant = 'default',
}: HomeShortcutCardProps) {
  const { width } = useWindowDimensions();

  const isUltraCompact = width < 350;
  const isCompact = width < 390;
  const isLarge = width >= 768;

  const isEmergency = variant === 'emergency';

  const cardWidth = isUltraCompact
    ? '48%'
    : '31.5%';

  const cardMinHeight = isCompact
    ? 112
    : isLarge
      ? 145
      : 128;

  const iconContainerSize = isCompact
    ? 52
    : isLarge
      ? 66
      : 60;

  const iconSize = isCompact
    ? 28
    : isLarge
      ? 36
      : 32;

  const titleSize = isCompact
    ? 13
    : isLarge
      ? 16
      : 14;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.card,

        {
          width: cardWidth,
          minHeight: cardMinHeight,
        },

        isEmergency &&
          styles.emergencyCard,

        pressed &&
          styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconContainer,

          {
            width: iconContainerSize,
            height: iconContainerSize,
            borderRadius:
              iconContainerSize / 2,
          },

          isEmergency &&
            styles.emergencyIconContainer,
        ]}
      >
        <Ionicons
          name={icon}
          size={iconSize}
          color={
            isEmergency
              ? colors.white
              : colors.primary
          }
        />
      </View>

      <Text
        style={[
          styles.title,

          {
            fontSize: titleSize,
            lineHeight: titleSize + 5,
          },

          isEmergency &&
            styles.emergencyTitle,
        ]}
        numberOfLines={2}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E8C8CA',

    borderRadius: 20,

    borderWidth: 1.5,
    borderColor: '#EADBDD',

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 7,
    paddingVertical: 12,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.07,
    shadowRadius: 3,

    elevation: 2,
  },

  emergencyCard: {
    backgroundColor: '#B4495A',
    borderColor: '#B4495A',
  },

  cardPressed: {
    opacity: 0.75,

    transform: [
      {
        scale: 0.97,
      },
    ],
  },

  iconContainer: {
    backgroundColor: '#D79BAD',

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 9,
  },

  emergencyIconContainer: {
    backgroundColor:
      'rgba(255, 255, 255, 0.18)',
  },

  title: {
    color: colors.primary,

    fontWeight: '700',

    textAlign: 'center',
  },

  emergencyTitle: {
    color: colors.white,
  },
});