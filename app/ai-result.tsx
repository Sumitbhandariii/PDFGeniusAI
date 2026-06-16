/**
 * AI Result Screen - Shows AI feature output (summary, notes, flashcards, etc.)
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Clipboard,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { useAIChat } from '@/hooks/useAIChat';
import { usePDFFiles } from '@/hooks/usePDFFiles';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Spacing, Radius, Typography } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { AIMessage } from '@/components';
import type { ChatMessageDisplay } from '@/hooks/useAIChat';
import { useAlert } from '@/template';

export default function AIResultScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const params = useLocalSearchParams<{
    featureId: string;
    pdfId: string;
    pdfName: string;
    pdfUri: string;
  }>();

  const { getFileById } = usePDFFiles();
  const file = getFileById(params.pdfId);
  const pdfUri = file?.localUri || params.pdfUri;

  const { runAIFeature, isLoading } = useAIChat(params.pdfId, pdfUri, params.pdfName);

  const [result, setResult] = useState<string>('');
  const [hasRun, setHasRun] = useState(false);
  const [translateLang, setTranslateLang] = useState('Spanish');

  const featureInfo = APP_CONFIG.aiFeatures.find((f) => f.id === params.featureId);

  useEffect(() => {
    if (!hasRun && pdfUri) {
      runFeature();
    }
  }, [pdfUri]);

  const runFeature = useCallback(async () => {
    setHasRun(true);
    setResult('');
    const output = await runAIFeature(params.featureId, { language: translateLang });
    setResult(output);
  }, [params.featureId, translateLang, runAIFeature]);

  const handleCopy = useCallback(() => {
    Clipboard.setString(result);
    showAlert('Copied', 'Content copied to clipboard.');
  }, [result, showAlert]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        title: `${featureInfo?.title} - ${params.pdfName}`,
        message: result,
      });
    } catch (e) {}
  }, [result, featureInfo, params.pdfName]);

  const displayMessage: ChatMessageDisplay = {
    id: '1',
    role: 'assistant',
    content: result || '',
    isLoading: isLoading && !result,
    createdAt: new Date().toISOString(),
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={
          featureInfo?.gradient
            ? (featureInfo.gradient as [string, string])
            : [colors.primary, colors.secondary]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{featureInfo?.title || 'AI Result'}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {params.pdfName?.replace('.pdf', '')}
          </Text>
        </View>

        <View style={styles.headerRight}>
          {result && (
            <>
              <Pressable
                onPress={handleCopy}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
              >
                <MaterialIcons name="content-copy" size={20} color="#FFF" />
              </Pressable>
              <Pressable
                onPress={handleShare}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
              >
                <MaterialIcons name="share" size={20} color="#FFF" />
              </Pressable>
            </>
          )}
        </View>
      </LinearGradient>

      {/* PDF Info Card */}
      <View style={[styles.pdfInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <MaterialIcons name="picture-as-pdf" size={20} color={colors.primary} />
        <Text style={[styles.pdfInfoText, { color: colors.textSecondary }]} numberOfLines={1}>
          {params.pdfName}
        </Text>
        <Pressable
          onPress={runFeature}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.rerunBtn,
            { backgroundColor: `${colors.primary}15` },
            pressed && { opacity: 0.7 },
          ]}
        >
          <MaterialIcons name="refresh" size={16} color={colors.primary} />
          <Text style={[styles.rerunText, { color: colors.primary }]}>Regenerate</Text>
        </Pressable>
      </View>

      {/* Result */}
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {isLoading && !result ? (
          <View style={styles.loadingState}>
            <LoadingSpinner size={48} />
            <Text style={[styles.loadingTitle, { color: colors.textPrimary }]}>
              {featureInfo?.title || 'Analyzing'}...
            </Text>
            <Text style={[styles.loadingDesc, { color: colors.textSecondary }]}>
              AI is reading your PDF and generating results
            </Text>
          </View>
        ) : (
          <AIMessage
            message={displayMessage}
            onCopy={handleCopy}
          />
        )}
      </ScrollView>

      {/* Bottom actions */}
      {result && !isLoading && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.divider,
              paddingBottom: insets.bottom + 8,
            },
          ]}
        >
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/ai-chat',
                params: { pdfId: params.pdfId, pdfName: params.pdfName, pdfUri },
              })
            }
            style={({ pressed }) => [
              styles.followUpBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.82 },
            ]}
          >
            <MaterialIcons name="chat" size={18} color="#FFF" />
            <Text style={styles.followUpBtnText}>Continue in Chat</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerTitle: { color: '#FFF', ...Typography.h4, fontWeight: '700' },
  headerSubtitle: { color: 'rgba(255,255,255,0.75)', ...Typography.caption },
  headerRight: { flexDirection: 'row', gap: 4 },

  pdfInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  pdfInfoText: { flex: 1, ...Typography.bodySmall },
  rerunBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    height: 30,
    borderRadius: Radius.full,
  },
  rerunText: { ...Typography.labelSmall, fontWeight: '600' },

  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
    minHeight: 300,
  },
  loadingTitle: { ...Typography.h3, textAlign: 'center' },
  loadingDesc: { ...Typography.body, textAlign: 'center', lineHeight: 22 },

  bottomBar: {
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  followUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: Radius.xl,
  },
  followUpBtnText: { color: '#FFF', ...Typography.button },
});
