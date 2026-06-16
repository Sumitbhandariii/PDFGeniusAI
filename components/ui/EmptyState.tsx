/**
 * Empty State Component - shown when lists are empty
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing } from '@/constants/theme';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  image?: any;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon = 'folder-open',
  image,
  action,
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {image ? (
        <Image
          source={image}
          style={styles.image}
          contentFit="contain"
          transition={300}
        />
      ) : (
        <View style={[styles.iconWrapper, { backgroundColor: colors.glass }]}>
          <MaterialIcons name={icon} size={48} color={colors.textMuted} />
        </View>
      )}
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {description}
        </Text>
      ) : null}
      {action ? (
        <Button
          title={action.label}
          onPress={action.onPress}
          variant="gradient"
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
    gap: Spacing.md,
  },
  iconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  image: {
    width: 200,
    height: 150,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h3,
    textAlign: 'center',
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: Spacing.sm,
  },
});
