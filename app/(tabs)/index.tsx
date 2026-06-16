/**
 * Home Screen - PDF Genius AI Dashboard
 * Premium dashboard with recent files, favorites, quick actions
 */
import React, { useCallback, useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
  RefreshControl,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { usePDFFiles } from '@/hooks/usePDFFiles';
import { SearchBar, QuickAction, PDFCard, EmptyState } from '@/components';
import { Spacing, Radius, Typography } from '@/constants/theme';
import { formatFileSize } from '@/services/pdfService';
import { hasGeminiApiKey } from '@/services/geminiService';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { recentFiles, favorites, files, importing, importPDF, toggleFavorite, loading, refreshFiles } = usePDFFiles();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshFiles();
    setRefreshing(false);
  }, [refreshFiles]);

  const handleOpenPDF = useCallback(
    (fileId: string) => {
      router.push({ pathname: '/pdf-viewer', params: { id: fileId } });
    },
    [router]
  );

  const handleImport = useCallback(async () => {
    const file = await importPDF();
    if (file) {
      router.push({ pathname: '/pdf-viewer', params: { id: file.id } });
    }
  }, [importPDF, router]);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      router.push({ pathname: '/(tabs)/library', params: { query: searchQuery } });
    }
  }, [searchQuery, router]);

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const displayedRecent = recentFiles.slice(0, 5);
  const displayedFavorites = favorites.slice(0, 6);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ─── Header ─── */}
        <LinearGradient
          colors={isDark ? ['#0D0D1A', '#13131F'] : ['#EEF0FF', '#F5F7FF']}
          style={[styles.headerGradient, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.greeting, { color: colors.textMuted }]}>{greeting} 👋</Text>
              <Text style={[styles.appName, { color: colors.textPrimary }]}>PDF Genius AI</Text>
            </View>
            <Pressable
              onPress={() => router.push('/(tabs)/settings')}
              style={({ pressed }) => [
                styles.avatarBtn,
                { backgroundColor: `${colors.primary}20` },
                pressed && { opacity: 0.7 },
              ]}
            >
              <MaterialIcons name="person" size={22} color={colors.primary} />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchWrapper}>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search your PDFs..."
              onSubmit={handleSearch}
            />
          </View>
        </LinearGradient>

        {/* ─── AI Hero Card ─── */}
        <View style={styles.section}>
          <Pressable
            onPress={() => router.push('/(tabs)/ai')}
            style={({ pressed }) => [pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }]}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiHeroCard}
            >
              <Image
                source={require('@/assets/images/ai-hero.png')}
                style={styles.aiHeroImage}
                contentFit="cover"
              />
              <View style={styles.aiHeroOverlay}>
                <View style={styles.aiHeroBadge}>
                  <MaterialIcons name="auto-awesome" size={14} color="#F59E0B" />
                  <Text style={styles.aiHeroBadgeText}>Powered by Gemini</Text>
                </View>
                <Text style={styles.aiHeroTitle}>Chat with your PDF</Text>
                <Text style={styles.aiHeroSubtitle}>
                  Ask questions, get summaries, generate notes & more
                </Text>
                <View style={styles.aiHeroCTA}>
                  <Text style={styles.aiHeroCTAText}>Explore AI Features</Text>
                  <MaterialIcons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* ─── Quick Actions ─── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <QuickAction
              icon="upload-file"
              title="Open PDF"
              subtitle="From storage"
              gradientColors={['#6366F1', '#8B5CF6']}
              onPress={handleImport}
            />
            <QuickAction
              icon="auto-awesome"
              title="AI Chat"
              subtitle="Ask anything"
              gradientColors={['#8B5CF6', '#EC4899']}
              onPress={() => router.push('/(tabs)/ai')}
            />
            <QuickAction
              icon="build"
              title="PDF Tools"
              subtitle="Merge & more"
              gradientColors={['#0EA5E9', '#6366F1']}
              onPress={() => router.push('/(tabs)/tools')}
            />
            <QuickAction
              icon="menu-book"
              title="Library"
              subtitle={`${files.length} PDFs`}
              gradientColors={['#10B981', '#0EA5E9']}
              onPress={() => router.push('/(tabs)/library')}
            />
          </View>
        </View>

        {/* ─── Stats row ─── */}
        {files.length > 0 && (
          <View style={[styles.statsRow, { borderColor: colors.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{files.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Documents</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.secondary }]}>{favorites.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Favorites</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>
                {files.filter((f) => f.readingProgress > 0).length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>In Progress</Text>
            </View>
          </View>
        )}

        {/* ─── Continue Reading ─── */}
        {displayedRecent.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Continue Reading
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/library')}
                style={({ pressed }) => [pressed && { opacity: 0.6 }]}
              >
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: Spacing.md }}
            >
              {displayedRecent.map((file) => (
                <Pressable
                  key={file.id}
                  onPress={() => handleOpenPDF(file.id)}
                  style={({ pressed }) => [
                    styles.recentCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      opacity: pressed ? 0.85 : 1,
                      transform: pressed ? [{ scale: 0.97 }] : [],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[`${colors.primary}25`, `${colors.secondary}15`]}
                    style={styles.recentCardThumb}
                  >
                    <MaterialIcons name="picture-as-pdf" size={32} color={colors.primary} />
                  </LinearGradient>
                  <View style={styles.recentCardInfo}>
                    <Text
                      style={[styles.recentCardName, { color: colors.textPrimary }]}
                      numberOfLines={2}
                    >
                      {file.name.replace('.pdf', '')}
                    </Text>
                    <Text style={[styles.recentCardMeta, { color: colors.textMuted }]}>
                      {file.pageCount > 0 ? `${file.pageCount} pages` : formatFileSize(file.fileSize)}
                    </Text>
                    {file.readingProgress > 0 && (
                      <View>
                        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                backgroundColor: colors.primary,
                                width: `${Math.round(file.readingProgress * 100)}%`,
                              },
                            ]}
                          />
                        </View>
                        <Text style={[styles.progressText, { color: colors.primary }]}>
                          {Math.round(file.readingProgress * 100)}%
                        </Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.section}>
            <EmptyState
              title="No PDFs yet"
              description="Import your first PDF to get started"
              icon="picture-as-pdf"
              action={{
                label: 'Import PDF',
                onPress: handleImport,
              }}
            />
          </View>
        )}

        {/* ─── Favorites ─── */}
        {displayedFavorites.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                ⭐ Favorites
              </Text>
            </View>
            <View style={[styles.listContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {displayedFavorites.map((file) => (
                <PDFCard
                  key={file.id}
                  file={file}
                  onPress={() => handleOpenPDF(file.id)}
                  onFavoritePress={() => toggleFavorite(file.id)}
                  variant="list"
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Pressable
        onPress={handleImport}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + 90 },
          pressed && { transform: [{ scale: 0.93 }], opacity: 0.85 },
        ]}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <MaterialIcons name="add" size={28} color="#FFF" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerGradient: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...Typography.bodySmall,
  },
  appName: {
    ...Typography.h2,
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    marginTop: 4,
  },
  section: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
  },
  seeAll: {
    ...Typography.label,
    fontWeight: '600',
  },

  // AI Hero Card
  aiHeroCard: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    height: 180,
    overflow: 'hidden',
    position: 'relative',
  },
  aiHeroImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.25,
  },
  aiHeroOverlay: {
    flex: 1,
    padding: Spacing.lg,
    gap: 6,
    justifyContent: 'center',
  },
  aiHeroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  aiHeroBadgeText: {
    color: '#F59E0B',
    ...Typography.labelSmall,
    fontWeight: '600',
  },
  aiHeroTitle: {
    color: '#FFFFFF',
    ...Typography.h2,
    fontWeight: '800',
  },
  aiHeroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    ...Typography.bodySmall,
    lineHeight: 20,
  },
  aiHeroCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  aiHeroCTAText: {
    color: '#FFFFFF',
    ...Typography.label,
    fontWeight: '700',
  },

  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statNumber: {
    ...Typography.h3,
  },
  statLabel: {
    ...Typography.caption,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },

  // Recent Cards (horizontal)
  recentCard: {
    width: 160,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  recentCardThumb: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentCardInfo: {
    padding: Spacing.sm + 2,
    gap: 4,
  },
  recentCardName: {
    ...Typography.labelSmall,
    fontWeight: '600',
    lineHeight: 18,
  },
  recentCardMeta: {
    ...Typography.caption,
  },
  progressBar: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    ...Typography.caption,
    fontWeight: '600',
    marginTop: 2,
  },

  // List
  listContainer: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabGradient: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
