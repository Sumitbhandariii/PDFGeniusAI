/**
 * PDF Renderer - Native (iOS/Android)
 * Uses react-native-pdf for high-performance native PDF rendering
 */
import React from 'react';
import { View, Text, ActivityIndicator, Dimensions, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing } from '@/constants/theme';

const { width, height } = Dimensions.get('window');

export interface PDFRendererProps {
  uri: string;
  initialPage?: number;
  horizontal?: boolean;
  scale?: number;
  onLoadComplete?: (pages: number) => void;
  onPageChanged?: (page: number, total: number) => void;
  onError?: (error: string) => void;
  onPress?: () => void;
}

export function PDFRenderer({
  uri,
  initialPage = 1,
  horizontal = false,
  scale = 1.0,
  onLoadComplete,
  onPageChanged,
  onError,
  onPress,
}: PDFRendererProps) {
  const { colors } = useTheme();

  return (
    <Pdf
      source={{ uri, cache: true }}
      page={initialPage}
      onLoadComplete={(numberOfPages) => onLoadComplete?.(numberOfPages)}
      onPageChanged={(page, totalPages) => onPageChanged?.(page, totalPages)}
      onError={(err) => onError?.(String(err))}
      onPressHandler={onPress}
      style={[styles.pdf, { width, height }]}
      horizontal={horizontal}
      enablePaging={horizontal}
      enableAnnotationRendering
      fitPolicy={0}
      spacing={horizontal ? 0 : 8}
      scale={scale}
      minScale={0.5}
      maxScale={4.0}
      enableAntialiasing
      renderActivityIndicator={() => (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading PDF...
          </Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  pdf: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  loadingText: { ...Typography.body },
});
