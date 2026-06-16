/**
 * AI Chat Screen - Chat with PDF using Gemini AI
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { usePDFFiles } from '@/hooks/usePDFFiles';
import { useAIChat } from '@/hooks/useAIChat';
import { AIMessage, LoadingSpinner } from '@/components';
import { Spacing, Radius, Typography } from '@/constants/theme';
import { useAlert } from '@/template';

const QUICK_PROMPTS = [
  'Summarize this PDF',
  'What are the key points?',
  'Explain the main concept',
  'List important facts',
  'What conclusions are drawn?',
];

export default function AIChatScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    pdfId?: string;
    pdfName?: string;
    pdfUri?: string;
    chatId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const { getFileById } = usePDFFiles();

  const file = params.pdfId ? getFileById(params.pdfId) : undefined;
  const pdfUri = file?.localUri || params.pdfUri;

  const {
    messages,
    isLoading,
    hasApiKey,
    checkApiKey,
    sendMessage,
    startNewChat,
    loadMessages,
  } = useAIChat(params.pdfId, pdfUri, params.pdfName || file?.name);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkApiKey();
    if (params.chatId) {
      loadMessages(params.chatId);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    await sendMessage(text);
  }, [inputText, isLoading, sendMessage]);

  const handleQuickPrompt = useCallback(
    (prompt: string) => {
      setInputText(prompt);
    },
    []
  );

  const handleCopy = useCallback((text: string) => {
    Clipboard.setString(text);
    showAlert('Copied', 'Text copied to clipboard.');
  }, [showAlert]);

  const pdfName = params.pdfName || file?.name || 'PDF Document';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </Pressable>

        <View style={styles.headerCenter}>
          <View style={styles.headerBadge}>
            <MaterialIcons name="auto-awesome" size={14} color="#F59E0B" />
            <Text style={styles.headerBadgeText}>Gemini AI</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {pdfName.replace('.pdf', '')}
          </Text>
        </View>

        <Pressable
          onPress={startNewChat}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.newChatBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="add-comment" size={22} color="#FFF" />
        </Pressable>
      </LinearGradient>

      {/* API Key Warning */}
      {hasApiKey === false && (
        <Pressable
          onPress={() => router.push('/(tabs)/settings')}
          style={[styles.apiKeyBanner, { backgroundColor: colors.warningBg, borderColor: `${colors.warning}40` }]}
        >
          <MaterialIcons name="vpn-key" size={16} color={colors.warning} />
          <Text style={[styles.apiKeyBannerText, { color: colors.warning }]}>
            Add Gemini API key in Settings to start chatting
          </Text>
          <MaterialIcons name="arrow-forward-ios" size={12} color={colors.warning} />
        </Pressable>
      )}

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AIMessage message={item} onCopy={handleCopy} />
          )}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: Spacing.md,
            paddingBottom: Spacing.xl,
            flexGrow: 1,
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <View style={[styles.emptyChatIcon, { backgroundColor: `${colors.primary}15` }]}>
                <MaterialIcons name="auto-awesome" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.emptyChatTitle, { color: colors.textPrimary }]}>
                Chat with your PDF
              </Text>
              <Text style={[styles.emptyChatDesc, { color: colors.textSecondary }]}>
                Ask any question about "{pdfName.replace('.pdf', '')}" and I will answer using the document content.
              </Text>

              {/* Quick Prompts */}
              <View style={styles.quickPromptsWrapper}>
                {QUICK_PROMPTS.map((p, i) => (
                  <Pressable
                    key={i}
                    onPress={() => handleQuickPrompt(p)}
                    style={({ pressed }) => [
                      styles.quickPrompt,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                        opacity: pressed ? 0.75 : 1,
                      },
                    ]}
                  >
                    <Text style={[styles.quickPromptText, { color: colors.textSecondary }]}>
                      {p}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Input Area */}
        <View
          style={[
            styles.inputArea,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.divider,
              paddingBottom: insets.bottom + Spacing.sm,
            },
          ]}
        >
          {/* Quick prompts when focused */}
          {messages.length > 0 && (
            <View style={styles.quickPromptsRow}>
              {QUICK_PROMPTS.slice(0, 3).map((p, i) => (
                <Pressable
                  key={i}
                  onPress={() => handleQuickPrompt(p)}
                  style={({ pressed }) => [
                    styles.quickChip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <Text style={[styles.quickChipText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.inputRow}>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask anything about this PDF..."
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={2000}
                style={[styles.textInput, { color: colors.textPrimary }]}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
            </View>

            <Pressable
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
              style={({ pressed }) => [
                styles.sendBtn,
                pressed && { opacity: 0.75, transform: [{ scale: 0.93 }] },
              ]}
            >
              <LinearGradient
                colors={
                  inputText.trim() && !isLoading
                    ? [colors.primary, colors.secondary]
                    : [colors.border, colors.border]
                }
                style={styles.sendBtnGradient}
              >
                {isLoading ? (
                  <LoadingSpinner size={20} color="#FFF" />
                ) : (
                  <MaterialIcons
                    name="send"
                    size={20}
                    color={inputText.trim() ? '#FFF' : colors.textMuted}
                  />
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerBadgeText: { color: '#F59E0B', ...Typography.caption, fontWeight: '700' },
  headerTitle: { color: '#FFF', ...Typography.label, fontWeight: '700' },
  newChatBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  apiKeyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  apiKeyBannerText: { flex: 1, ...Typography.bodySmall },

  // Empty state
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
    minHeight: 400,
  },
  emptyChatIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyChatTitle: { ...Typography.h3, textAlign: 'center' },
  emptyChatDesc: { ...Typography.body, textAlign: 'center', lineHeight: 22 },
  quickPromptsWrapper: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
    marginTop: 8,
  },
  quickPrompt: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  quickPromptText: { ...Typography.bodySmall },

  // Input Area
  inputArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
    padding: Spacing.sm,
  },
  quickPromptsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  quickChip: {
    flex: 1,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  quickChipText: { ...Typography.caption, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    maxHeight: 120,
  },
  textInput: {
    ...Typography.body,
    includeFontPadding: false,
    textAlignVertical: 'center',
  } as any,
  sendBtn: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendBtnGradient: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
