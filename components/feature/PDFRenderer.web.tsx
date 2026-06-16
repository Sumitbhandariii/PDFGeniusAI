/**
 * PDF Renderer - Web
 * Uses iframe/embed for web PDF rendering (react-native-pdf is native-only)
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Typography, Spacing, Radius } from '@/constants/theme';

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

export function PDFRenderer({ uri, onPress }: PDFRendererProps) {
  const { colors } = useTheme();

  // On web, use an iframe to render the PDF
  return (
    <Pressable style={styles.root} onPress={onPress}>
      {/* @ts-ignore - iframe is web-only */}
      <iframe
        src={uri}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          flex: 1,
        }}
        title="PDF Viewer"
        onLoad={() => {}}
        onError={() => {}}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
