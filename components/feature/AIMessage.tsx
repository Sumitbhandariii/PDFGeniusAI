/**
 * AI Message Component - Renders chat messages with markdown-like formatting
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Radius, Typography } from '@/constants/theme';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { ChatMessageDisplay } from '@/hooks/useAIChat';

interface AIMessageProps {
  message: ChatMessageDisplay;
  onCopy?: (text: string) => void;
}

export function AIMessage({ message, onCopy }: AIMessageProps) {
  const { colors } = useTheme();
  const isUser = message.role === 'user';

  if (message.isLoading) {
    return (
      <View style={[styles.container, styles.assistantContainer]}>
        <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
          <MaterialIcons name="auto-awesome" size={16} color={colors.primary} />
        </View>
        <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.loadingRow}>
            <LoadingSpinner size={16} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Thinking...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Simple markdown-like text rendering
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Headers
      if (line.startsWith('## ')) {
        return (
          <Text key={i} style={[styles.heading2, { color: colors.textPrimary }]}>
            {line.replace('## ', '')}
          </Text>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <Text key={i} style={[styles.heading1, { color: colors.textPrimary }]}>
            {line.replace('# ', '')}
          </Text>
        );
      }
      // Bold with **
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <Text key={i} style={[styles.body, { color: colors.textPrimary }]}>
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <Text key={j} style={{ fontWeight: '700', color: colors.primary }}>
                  {part}
                </Text>
              ) : (
                part
              )
            )}
          </Text>
        );
      }
      // Bullet points
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
            <Text style={[styles.bulletText, { color: colors.textPrimary }]}>
              {line.replace(/^[-•] /, '')}
            </Text>
          </View>
        );
      }
      // Numbered list
      if (/^\d+\. /.test(line)) {
        const num = line.match(/^(\d+)/)?.[1];
        return (
          <View key={i} style={styles.bulletRow}>
            <Text style={[styles.numBullet, { color: colors.primary }]}>{num}.</Text>
            <Text style={[styles.bulletText, { color: colors.textPrimary }]}>
              {line.replace(/^\d+\. /, '')}
            </Text>
          </View>
        );
      }
      // Divider
      if (line === '---') {
        return <View key={i} style={[styles.divider, { backgroundColor: colors.divider }]} />;
      }
      // Empty line - add spacing
      if (line.trim() === '') {
        return <View key={i} style={{ height: 6 }} />;
      }
      // Regular text
      return (
        <Text key={i} style={[styles.body, { color: colors.textPrimary }]}>
          {line}
        </Text>
      );
    });
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: `${colors.primary}20` }]}>
          <MaterialIcons name="auto-awesome" size={16} color={colors.primary} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: colors.primary }]
            : [styles.assistantBubble, { backgroundColor: colors.card, borderColor: colors.border }],
          message.error && styles.errorBubble,
        ]}
      >
        {renderContent(message.content)}

        {/* Copy button for assistant messages */}
        {!isUser && message.content && onCopy && (
          <Pressable
            onPress={() => onCopy(message.content)}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            style={({ pressed }) => [styles.copyBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="content-copy" size={14} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {isUser && (
        <View style={[styles.avatar, { backgroundColor: `${colors.secondary}20` }]}>
          <MaterialIcons name="person" size={16} color={colors.secondary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    marginVertical: 4,
    paddingHorizontal: Spacing.md,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  assistantContainer: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: Radius.lg,
    padding: Spacing.md - 2,
    gap: 4,
  },
  userBubble: {
    borderRadius: Radius.lg,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderRadius: Radius.lg,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  errorBubble: {
    borderColor: '#EF444430',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    ...Typography.bodySmall,
    fontStyle: 'italic',
  },
  heading1: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 4,
  },
  heading2: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    marginTop: 4,
  },
  body: {
    ...Typography.body,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingLeft: 2,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 9,
    flexShrink: 0,
  },
  numBullet: {
    ...Typography.body,
    fontWeight: '700',
    minWidth: 20,
    marginTop: 0,
  },
  bulletText: {
    ...Typography.body,
    flex: 1,
    lineHeight: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 6,
  },
  copyBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
});
