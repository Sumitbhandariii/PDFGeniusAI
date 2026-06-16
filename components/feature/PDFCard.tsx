/**
 * PDF Card Component - Displays a PDF file with metadata
 */
import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Radius, Typography } from '@/constants/theme';
import { formatFileSize, getRelativeTime, getFileColor, estimateReadingTime } from '@/services/pdfService';
import type { PDFFile } from '@/contexts/PDFContext';

interface PDFCardProps {
  file: PDFFile;
  onPress: () => void;
  onLongPress?: () => void;
  onFavoritePress?: () => void;
  onMorePress?: () => void;
  variant?: 'list' | 'grid';
}

export function PDFCard({
  file,
  onPress,
  onLongPress,
  onFavoritePress,
  onMorePress,
  variant = 'list',
}: PDFCardProps) {
  const { colors, isDark } = useTheme();
  const fileColor = getFileColor(file.name);

  if (variant === 'grid') {
    return (
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [
          styles.gridCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.85 : 1,
            transform: pressed ? [{ scale: 0.97 }] : [],
          },
        ]}
      >
        {/* Thumbnail placeholder */}
        <View style={[styles.gridThumbnail, { backgroundColor: `${fileColor}18` }]}>
          <View style={[styles.pdfIconWrapper, { backgroundColor: `${fileColor}25` }]}>
            <MaterialIcons name="picture-as-pdf" size={32} color={fileColor} />
          </View>
          {file.readingProgress > 0 && (
            <View style={[styles.gridProgress, { backgroundColor: colors.surface }]}>
              <View
                style={[
                  styles.gridProgressFill,
                  { backgroundColor: fileColor, width: `${file.readingProgress * 100}%` },
                ]}
              />
            </View>
          )}
          {file.isFavorite && (
            <View style={[styles.favBadge, { backgroundColor: colors.card }]}>
              <MaterialIcons name="star" size={12} color="#F59E0B" />
            </View>
          )}
        </View>

        {/* File info */}
        <View style={styles.gridInfo}>
          <Text
            style={[styles.gridName, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {file.name.replace('.pdf', '')}
          </Text>
          <Text style={[styles.gridMeta, { color: colors.textMuted }]}>
            {file.pageCount > 0 ? `${file.pageCount} pages` : formatFileSize(file.fileSize)}
          </Text>
        </View>
      </Pressable>
    );
  }

  // List variant
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.listCard,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.divider,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      {/* PDF Icon */}
      <View style={[styles.listIcon, { backgroundColor: `${fileColor}18` }]}>
        <MaterialIcons name="picture-as-pdf" size={26} color={fileColor} />
        {file.pageCount > 0 && (
          <Text style={[styles.pageCount, { color: fileColor }]}>
            {file.pageCount}
          </Text>
        )}
      </View>

      {/* Content */}
      <View style={styles.listContent}>
        <Text
          style={[styles.listName, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {file.name.replace('.pdf', '')}
        </Text>
        <View style={styles.listMeta}>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {formatFileSize(file.fileSize)}
          </Text>
          <View style={styles.metaDot} />
          <Text style={[styles.metaText, { color: colors.textMuted }]}>
            {getRelativeTime(file.updatedAt)}
          </Text>
          {file.pageCount > 0 && (
            <>
              <View style={styles.metaDot} />
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {estimateReadingTime(file.pageCount)}
              </Text>
            </>
          )}
        </View>

        {/* Reading progress bar */}
        {file.readingProgress > 0 && (
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: fileColor,
                  width: `${Math.round(file.readingProgress * 100)}%`,
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.listActions}>
        {onFavoritePress && (
          <Pressable
            onPress={onFavoritePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons
              name={file.isFavorite ? 'star' : 'star-outline'}
              size={20}
              color={file.isFavorite ? '#F59E0B' : colors.textMuted}
            />
          </Pressable>
        )}
        {onMorePress && (
          <Pressable
            onPress={onMorePress}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="more-vert" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Grid
  gridCard: {
    flex: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  gridThumbnail: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pdfIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  gridProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  favBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridInfo: {
    padding: Spacing.sm + 2,
    gap: 3,
  },
  gridName: {
    ...Typography.labelSmall,
    fontWeight: '600',
    lineHeight: 18,
  },
  gridMeta: {
    ...Typography.caption,
  },

  // List
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md - 2,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listIcon: {
    width: 52,
    height: 60,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flexShrink: 0,
  },
  pageCount: {
    fontSize: 9,
    fontWeight: '700',
  },
  listContent: {
    flex: 1,
    gap: 4,
  },
  listName: {
    ...Typography.label,
    fontWeight: '600',
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    ...Typography.caption,
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#888',
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
});
