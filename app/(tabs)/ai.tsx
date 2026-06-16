/**
 * AI Hub Screen - All AI features in one place
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { usePDFFiles } from '@/hooks/usePDFFiles';
import { useAIChat } from '@/hooks/useAIChat';
import { AIFeatureCard, EmptyState } from '@/components';
import { Spacing, Radius, Typography } from '@/constants/theme';
import { APP_CONFIG } from '@/constants/config';
import { getRelativeTime } from '@/services/pdfService';

export default function AIHubScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { files, importPDF } = usePDFFiles();
  const { chats, loadingChats, hasApiKey, checkApiKey, loadChats, removeChat } = useAIChat();

  useEffect(() => {
    checkApiKey();
    loadChats();
  }, []);

  const handleFeature = useCallback(
    (featureId: string) => {
      if (files.length === 0) {
        router.push('/(tabs)/library');
        return;
      }
      // Use the most recent file
      const recentFile = files[0];
      router.push({
        pathname: '/ai-result',
        params: {
          featureId,
          pdfId: recentFile.id,
          pdfName: recentFile.name,
          pdfUri: recentFile.localUri,
        },
      });
    },
    [files, router]
  );

  const handleChatWithPDF = useCallback(
    (pdfId?: string) => {
      if (!pdfId && files.length === 0) {
        router.push('/(tabs)/library');
        return;
      }
      const fid = pdfId || files[0]?.id;
      const fname = files.find((f) => f.id === fid)?.name || '';
      router.push({
        pathname: '/ai-chat',
        params: { pdfId: fid, pdfName: fname },
      });
    },
    [files, router]
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={[styles.heroGradient, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.heroBadge}>
            <MaterialIcons name="auto-awesome" size={16} color="#F59E0B" />
            <Text style={styles.heroBadgeText}>Gemini AI</Text>
          </View>
          <Text style={styles.heroTitle}>AI Hub</Text>
          <Text style={styles.heroSubtitle}>
            Transform your PDFs with the power of AI
          </Text>

          {/* API Key warning */}
          {hasApiKey === false && (
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              style={styles.apiKeyWarning}
            >
              <MaterialIcons name="warning" size={16} color="#F59E0B" />
              <Text style={styles.apiKeyWarningText}>
                Add Gemini API key in Settings to enable AI
              </Text>
              <MaterialIcons name="arrow-forward-ios" size={12} color="#F59E0B" />
            </Pressable>
          )}
        </LinearGradient>

        {/* Chat with PDF - Primary CTA */}
        <View style={styles.section}>
          <Pressable
            onPress={() => handleChatWithPDF()}
            style={({ pressed }) => [
              styles.chatCTA,
              {
                backgroundColor: colors.card,
                borderColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
                transform: pressed ? [{ scale: 0.98 }] : [],
              },
            ]}
          >
            <View style={[styles.chatCTAIcon, { backgroundColor: `${colors.primary}15` }]}>
              <MaterialIcons name="chat" size={28} color={colors.primary} />
            </View>
            <View style={styles.chatCTAContent}>
              <Text style={[styles.chatCTATitle, { color: colors.textPrimary }]}>
                Chat with PDF
              </Text>
              <Text style={[styles.chatCTADesc, { color: colors.textSecondary }]}>
                Ask any question from your document
              </Text>
            </View>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.chatCTAArrow}
            >
              <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
            </LinearGradient>
          </Pressable>
        </View>

        {/* AI Features Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            AI Features
          </Text>
          {APP_CONFIG.aiFeatures.slice(1).map((feature) => (
            <AIFeatureCard
              key={feature.id}
              icon={feature.icon as any}
              title={feature.title}
              description={feature.description}
              gradientColors={feature.gradient as [string, string]}
              onPress={() => handleFeature(feature.id)}
            />
          ))}
        </View>

        {/* Recent AI Chats */}
        {chats.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Recent Chats
            </Text>
            <View
              style={[
                styles.chatsList,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              {chats.slice(0, 5).map((chat) => (
                <Pressable
                  key={chat.id}
                  onPress={() =>
                    router.push({
                      pathname: '/ai-chat',
                      params: {
                        chatId: chat.id,
                        pdfId: chat.pdfId || '',
                        pdfName: chat.pdfName || '',
                      },
                    })
                  }
                  style={({ pressed }) => [
                    styles.chatItem,
                    { borderBottomColor: colors.divider },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={[styles.chatItemIcon, { backgroundColor: `${colors.primary}15` }]}>
                    <MaterialIcons name="chat-bubble-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.chatItemContent}>
                    <Text style={[styles.chatItemTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                      {chat.title}
                    </Text>
                    {chat.pdfName && (
                      <Text style={[styles.chatItemPdf, { color: colors.textMuted }]} numberOfLines={1}>
                        📄 {chat.pdfName.replace('.pdf', '')}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.chatItemTime, { color: colors.textMuted }]}>
                    {getRelativeTime(chat.createdAt)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Empty state - no PDFs */}
        {files.length === 0 && (
          <View style={styles.section}>
            <EmptyState
              title="No PDFs to analyze"
              description="Import a PDF first, then use AI features to analyze it"
              icon="picture-as-pdf"
              action={{
                label: 'Import PDF',
                onPress: () => router.push('/(tabs)/library'),
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  heroGradient: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl + 8,
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroBadgeText: { color: '#F59E0B', ...Typography.labelSmall, fontWeight: '700' },
  heroTitle: { color: '#FFF', ...Typography.h1, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.75)', ...Typography.body, lineHeight: 22 },
  apiKeyWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  apiKeyWarningText: { flex: 1, color: '#F59E0B', ...Typography.bodySmall },

  section: { marginTop: Spacing.lg, gap: Spacing.md },
  sectionTitle: { ...Typography.h4, paddingHorizontal: Spacing.md },

  // Chat CTA
  chatCTA: {
    marginHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
  },
  chatCTAIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatCTAContent: { flex: 1, gap: 3 },
  chatCTATitle: { ...Typography.h4 },
  chatCTADesc: { ...Typography.bodySmall, lineHeight: 18 },
  chatCTAArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Recent Chats
  chatsList: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chatItemIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatItemContent: { flex: 1, gap: 2 },
  chatItemTitle: { ...Typography.label, fontWeight: '600' },
  chatItemPdf: { ...Typography.caption },
  chatItemTime: { ...Typography.caption },
});
