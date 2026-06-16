/**
 * AI Feature Card - for AI Hub screen
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Radius, Spacing, Typography } from '@/constants/theme';

interface AIFeatureCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  gradientColors: [string, string];
  onPress: () => void;
  disabled?: boolean;
}

export function AIFeatureCard({
  icon,
  title,
  description,
  gradientColors,
  onPress,
  disabled = false,
}: AIFeatureCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.82 : 1,
          transform: pressed && !disabled ? [{ scale: 0.97 }] : [],
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconGradient}
      >
        <MaterialIcons name={icon} size={22} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
          {description}
        </Text>
      </View>
      <MaterialIcons name="arrow-forward-ios" size={14} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginVertical: 4,
  },
  iconGradient: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...Typography.label,
    fontWeight: '600',
  },
  description: {
    ...Typography.bodySmall,
    lineHeight: 18,
  },
});
