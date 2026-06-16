/**
 * Premium Card Component with multiple variants
 */
import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Radius, Spacing } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'outlined' | 'flat';
  onPress?: () => void;
  style?: ViewStyle;
  padding?: number;
  radius?: number;
}

export function Card({
  children,
  variant = 'default',
  onPress,
  style,
  padding = Spacing.md,
  radius = Radius.lg,
}: CardProps) {
  const { colors, isDark } = useTheme();

  const getStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: radius,
      padding,
      overflow: 'hidden',
    };

    switch (variant) {
      case 'elevated':
        return {
          ...base,
          backgroundColor: colors.cardElevated,
          ...(isDark
            ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }
            : {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 4,
              }),
        };
      case 'glass':
        return {
          ...base,
          backgroundColor: colors.glass,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.12)',
        };
      case 'outlined':
        return {
          ...base,
          backgroundColor: colors.card,
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case 'flat':
        return {
          ...base,
          backgroundColor: 'transparent',
        };
      default:
        return {
          ...base,
          backgroundColor: colors.card,
          ...(isDark
            ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }
            : {
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
              }),
        };
    }
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          getStyle(),
          style,
          pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[getStyle(), style]}>{children}</View>;
}
