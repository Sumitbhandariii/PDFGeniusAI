/**
 * Settings Screen
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, Radius, Typography } from '@/constants/theme';
import { getGeminiApiKey, saveGeminiApiKey } from '@/services/geminiService';
import { useAlert } from '@/template';
import { getSupabaseClient } from '@/template';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();

  const [geminiKey, setGeminiKey] = useState('');
  const [keyVisible, setKeyVisible] = useState(false);
  const [keyDirty, setKeyDirty] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getGeminiApiKey().then((k) => {
      if (k) setGeminiKey(k);
    });
    getSupabaseClient().auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);

  const handleSaveApiKey = useCallback(async () => {
    await saveGeminiApiKey(geminiKey.trim());
    setKeyDirty(false);
    showAlert('API Key Saved', 'Gemini API key has been saved successfully.');
  }, [geminiKey, showAlert]);

  const handleSignOut = useCallback(async () => {
    showAlert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await getSupabaseClient().auth.signOut();
          setUser(null);
        },
      },
    ]);
  }, [showAlert]);

  const SettingRow = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
    color,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    color?: string;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.settingRow,
        { borderBottomColor: colors.divider },
        pressed && onPress && { backgroundColor: `${colors.primary}08` },
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${color || colors.primary}15` }]}>
        <MaterialIcons name={icon as any} size={20} color={color || colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {rightElement || (onPress ? (
        <MaterialIcons name="arrow-forward-ios" size={14} color={colors.textMuted} />
      ) : null)}
    </Pressable>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>{title}</Text>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Account Section */}
        <SectionHeader title="ACCOUNT" />
        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {user ? (
            <>
              <SettingRow
                icon="account-circle"
                title={user.email || 'User'}
                subtitle="Signed in with OnSpace Cloud"
                color="#10B981"
              />
              <SettingRow
                icon="sync"
                title="Cloud Sync"
                subtitle="Auto-backup enabled"
                color="#3B82F6"
                rightElement={
                  <Switch
                    value={true}
                    onValueChange={() => {}}
                    trackColor={{ true: colors.primary }}
                    thumbColor="#FFF"
                  />
                }
              />
              <SettingRow
                icon="logout"
                title="Sign Out"
                color="#EF4444"
                onPress={handleSignOut}
              />
            </>
          ) : (
            <SettingRow
              icon="login"
              title="Sign In for Cloud Sync"
              subtitle="Back up your PDFs and AI chats"
              color={colors.primary}
              onPress={() => showAlert('Coming Soon', 'Authentication setup coming soon.')}
            />
          )}
        </View>

        {/* AI Settings */}
        <SectionHeader title="AI CONFIGURATION" />
        <View
          style={[
            styles.settingsGroup,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.apiKeySection}>
            <View style={[styles.settingIcon, { backgroundColor: `${colors.primary}15` }]}>
              <MaterialIcons name="vpn-key" size={20} color={colors.primary} />
            </View>
            <View style={styles.apiKeyContent}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                Gemini API Key
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textMuted }]}>
                Get free key at aistudio.google.com
              </Text>
              <View style={[styles.apiKeyInput, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <TextInput
                  value={geminiKey}
                  onChangeText={(v) => { setGeminiKey(v); setKeyDirty(true); }}
                  placeholder="AIza..."
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!keyVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[styles.apiKeyTextInput, { color: colors.textPrimary }]}
                />
                <Pressable
                  onPress={() => setKeyVisible((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialIcons
                    name={keyVisible ? 'visibility-off' : 'visibility'}
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              </View>
              {keyDirty && (
                <Pressable
                  onPress={handleSaveApiKey}
                  style={[styles.saveKeyBtn, { backgroundColor: colors.primary }]}
                >
                  <MaterialIcons name="save" size={16} color="#FFF" />
                  <Text style={styles.saveKeyBtnText}>Save Key</Text>
                </Pressable>
              )}
            </View>
          </View>

          <SettingRow
            icon="smart-toy"
            title="AI Model"
            subtitle="Gemini 1.5 Flash (Default)"
            color="#8B5CF6"
          />
          <SettingRow
            icon="tune"
            title="AI Creativity"
            subtitle="Balanced (Recommended)"
            color="#EC4899"
          />
        </View>

        {/* Appearance */}
        <SectionHeader title="APPEARANCE" />
        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon={isDark ? 'dark-mode' : 'light-mode'}
            title={isDark ? 'Dark Mode' : 'Light Mode'}
            subtitle="Tap to toggle theme"
            color={isDark ? '#818CF8' : '#F59E0B'}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ true: colors.primary }}
                thumbColor="#FFF"
              />
            }
          />
          <SettingRow
            icon="text-fields"
            title="Reader Font Size"
            subtitle="Medium (16pt)"
            color="#10B981"
          />
          <SettingRow
            icon="brightness-6"
            title="Night Mode"
            subtitle="Sepia filter for reading"
            color="#F59E0B"
          />
        </View>

        {/* Reader Settings */}
        <SectionHeader title="READER" />
        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="swap-vert"
            title="Default Scroll Direction"
            subtitle="Vertical scrolling"
            color="#06B6D4"
          />
          <SettingRow
            icon="auto-fix-high"
            title="Auto Page Fit"
            subtitle="Fit to screen width"
            color="#6366F1"
          />
          <SettingRow
            icon="bookmark"
            title="Remember Last Page"
            subtitle="Auto-resume reading"
            color="#8B5CF6"
            rightElement={
              <Switch
                value={true}
                onValueChange={() => {}}
                trackColor={{ true: colors.primary }}
                thumbColor="#FFF"
              />
            }
          />
        </View>

        {/* Storage & Backup */}
        <SectionHeader title="STORAGE & BACKUP" />
        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="cloud-upload"
            title="Backup to Cloud"
            subtitle="OnSpace Cloud sync"
            color="#3B82F6"
            onPress={() => showAlert('Cloud Backup', 'Sign in to enable automatic cloud backup of your PDFs and AI chats.')}
          />
          <SettingRow
            icon="storage"
            title="Local Storage"
            subtitle="App documents folder"
            color="#10B981"
          />
          <SettingRow
            icon="delete-sweep"
            title="Clear Cache"
            color="#EF4444"
            onPress={() => showAlert('Clear Cache', 'Cache cleared successfully.')}
          />
        </View>

        {/* About */}
        <SectionHeader title="ABOUT" />
        <View style={[styles.settingsGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="info" title="Version" subtitle="1.0.0 (Build 1)" color={colors.textMuted} />
          <SettingRow
            icon="star-rate"
            title="Rate App"
            subtitle="Help us improve"
            color="#F59E0B"
            onPress={() => showAlert('Thank You!', 'Thank you for using PDF Genius AI!')}
          />
          <SettingRow
            icon="privacy-tip"
            title="Privacy Policy"
            color="#6366F1"
            onPress={() => showAlert('Privacy Policy', 'Your data is stored locally and securely on your device.')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTitle: { ...Typography.h1 },
  sectionHeader: {
    ...Typography.labelSmall,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: Spacing.md + 4,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  settingsGroup: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: { flex: 1, gap: 2 },
  settingTitle: { ...Typography.label, fontWeight: '600' },
  settingSubtitle: { ...Typography.caption },

  // API Key
  apiKeySection: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  apiKeyContent: { flex: 1, gap: Spacing.sm },
  apiKeyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  apiKeyTextInput: {
    flex: 1,
    ...Typography.body,
    includeFontPadding: false,
  } as any,
  saveKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    height: 36,
    borderRadius: Radius.full,
  },
  saveKeyBtnText: { color: '#FFF', ...Typography.label, fontWeight: '700' },
});
