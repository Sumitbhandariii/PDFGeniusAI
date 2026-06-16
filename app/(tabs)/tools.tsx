/**
 * PDF Tools Screen
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { usePDFFiles } from '@/hooks/usePDFFiles';
import { useAlert } from '@/template';
import { Spacing, Radius, Typography } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';

const TOOL_GRADIENTS: Record<string, [string, string]> = {
  merge: ['#6366F1', '#8B5CF6'],
  split: ['#8B5CF6', '#EC4899'],
  compress: ['#EC4899', '#F59E0B'],
  rotate: ['#F59E0B', '#EF4444'],
  extract: ['#EF4444', '#F97316'],
  reorder: ['#F97316', '#EAB308'],
  'img-to-pdf': ['#10B981', '#06B6D4'],
  scan: ['#06B6D4', '#3B82F6'],
};

export default function ToolsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { files, importPDF } = usePDFFiles();
  const { showAlert } = useAlert();

  const handleTool = (toolId: string, toolName: string) => {
    if (files.length === 0 && toolId !== 'img-to-pdf' && toolId !== 'scan') {
      showAlert('No PDFs', 'Please import a PDF first to use this tool.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import PDF', onPress: () => importPDF() },
      ]);
      return;
    }
    showAlert(
      toolName,
      `${toolName} is available in the full version. Your ${files.length} PDF(s) are ready to process.`,
      [{ text: 'Got it' }]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>PDF Tools</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Professional PDF editing and conversion
          </Text>
        </View>

        {/* Tools Grid */}
        <View style={styles.toolsGrid}>
          {APP_CONFIG.pdfTools.map((tool) => {
            const gradient = TOOL_GRADIENTS[tool.id] || ['#6366F1', '#8B5CF6'];
            return (
              <Pressable
                key={tool.id}
                onPress={() => handleTool(tool.id, tool.title)}
                style={({ pressed }) => [
                  styles.toolCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.82 : 1,
                    transform: pressed ? [{ scale: 0.96 }] : [],
                  },
                ]}
              >
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.toolIcon}
                >
                  <MaterialIcons name={tool.icon as any} size={26} color="#FFF" />
                </LinearGradient>
                <Text style={[styles.toolTitle, { color: colors.textPrimary }]}>
                  {tool.title}
                </Text>
                <Text style={[styles.toolDescription, { color: colors.textMuted }]}>
                  {tool.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* PRO Banner */}
        <Pressable
          style={({ pressed }) => [
            styles.proBanner,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <LinearGradient
            colors={['#F59E0B', '#EF4444', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.proBannerGradient}
          >
            <View style={styles.proBannerContent}>
              <MaterialIcons name="workspace-premium" size={32} color="#FFF" />
              <View style={styles.proBannerText}>
                <Text style={styles.proBannerTitle}>Upgrade to PRO</Text>
                <Text style={styles.proBannerSubtitle}>
                  Unlock batch processing, cloud storage & unlimited AI
                </Text>
              </View>
            </View>
            <View style={styles.proBannerCTA}>
              <Text style={styles.proBannerCTAText}>Explore PRO</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#FFF" />
            </View>
          </LinearGradient>
        </Pressable>

        {/* OCR Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>OCR & Scanning</Text>

          {[
            { icon: 'document-scanner', title: 'Camera OCR', desc: 'Extract text from camera', color: '#6366F1' },
            { icon: 'image', title: 'Image OCR', desc: 'Extract text from images', color: '#8B5CF6' },
            { icon: 'edit', title: 'Handwriting Recognition', desc: 'Digitize handwritten notes', color: '#EC4899' },
          ].map((item, i) => (
            <Pressable
              key={i}
              onPress={() => handleTool(item.icon, item.title)}
              style={({ pressed }) => [
                styles.ocrItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View style={[styles.ocrIcon, { backgroundColor: `${item.color}18` }]}>
                <MaterialIcons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={styles.ocrContent}>
                <Text style={[styles.ocrTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.ocrDesc, { color: colors.textMuted }]}>{item.desc}</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={14} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: 4,
  },
  headerTitle: { ...Typography.h1 },
  headerSubtitle: { ...Typography.body },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md - 4,
  },
  toolCard: {
    width: '47%',
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  toolIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolTitle: { ...Typography.label, fontWeight: '700' },
  toolDescription: { ...Typography.caption, lineHeight: 16 },

  proBanner: {
    margin: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
  proBannerGradient: { padding: Spacing.lg, gap: Spacing.md },
  proBannerContent: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  proBannerText: { flex: 1, gap: 4 },
  proBannerTitle: { color: '#FFF', ...Typography.h3, fontWeight: '800' },
  proBannerSubtitle: { color: 'rgba(255,255,255,0.85)', ...Typography.bodySmall, lineHeight: 18 },
  proBannerCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.full,
  },
  proBannerCTAText: { color: '#FFF', ...Typography.label, fontWeight: '700' },

  section: { marginTop: Spacing.lg, gap: Spacing.sm, paddingHorizontal: Spacing.md },
  sectionTitle: { ...Typography.h4, marginBottom: 4 },

  ocrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  ocrIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ocrContent: { flex: 1, gap: 2 },
  ocrTitle: { ...Typography.label, fontWeight: '600' },
  ocrDesc: { ...Typography.caption },
});
