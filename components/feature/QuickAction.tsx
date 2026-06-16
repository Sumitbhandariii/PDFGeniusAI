/**
 * Quick Action Button - Grid action buttons for home screen
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';
import { Radius, Spacing, Typography } from '@/constants/theme';

interface QuickActionProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle?: string;
  gradientColors: [string, string];
  onPress: () => void;
}

export function QuickAction({
  icon,
  title,
  subtitle,
  gradientColors,
  onPress,
}: QuickActionProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.82, transform: [{ scale: 0.96 }] },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.iconWrapper}>
          <MaterialIcons name={icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    minHeight: 90,
  },
  gradient: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    gap: 2,
  },
  title: {
    ...Typography.label,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.75)',
  },
});
