/**
 * Library Screen - All PDFs, Favorites, Trash management
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  FlatList,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { usePDFFiles } from '@/hooks/usePDFFiles';
import { SearchBar, PDFCard, EmptyState } from '@/components';
import { Spacing, Radius, Typography } from '@/constants/theme';
import { useAlert } from '@/template';
import { sharePDF } from '@/services/pdfService';
import type { PDFFile } from '@/contexts/PDFContext';

type FilterTab = 'all' | 'favorites' | 'recent' | 'trash';
type ViewMode = 'list' | 'grid';

const FILTERS: { id: FilterTab; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'folder' },
  { id: 'recent', label: 'Recent', icon: 'history' },
  { id: 'favorites', label: 'Favorites', icon: 'star' },
  { id: 'trash', label: 'Trash', icon: 'delete' },
];

export default function LibraryScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ query?: string }>();
  const { showAlert } = useAlert();

  const {
    files,
    recentFiles,
    favorites,
    trashedFiles,
    loading,
    importing,
    importPDF,
    importMultiplePDFs,
    toggleFavorite,
    deleteFile,
    restoreFile,
    permanentlyDelete,
    searchFiles,
    refreshFiles,
  } = usePDFFiles();

  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    if (params.query) {
      setSearchQuery(params.query);
    }
  }, [params.query]);

  const displayedFiles = useMemo(() => {
    let base: PDFFile[];
    switch (activeFilter) {
      case 'favorites':
        base = favorites;
        break;
      case 'recent':
        base = recentFiles;
        break;
      case 'trash':
        base = trashedFiles;
        break;
      default:
        base = files;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return base.filter((f) => f.name.toLowerCase().includes(q));
    }
    return base;
  }, [activeFilter, files, favorites, recentFiles, trashedFiles, searchQuery]);

  const handleOpenPDF = useCallback(
    (id: string) => {
      router.push({ pathname: '/pdf-viewer', params: { id } });
    },
    [router]
  );

  const handleShowOptions = useCallback(
    (file: PDFFile) => {
      if (activeFilter === 'trash') {
        showAlert(`"${file.name}"`, 'What would you like to do?', [
          { text: 'Restore', style: 'default', onPress: () => restoreFile(file.id) },
          {
            text: 'Delete Permanently',
            style: 'destructive',
            onPress: () => {
              showAlert(
                'Delete Permanently',
                'This cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => permanentlyDelete(file.id) },
                ]
              );
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]);
        return;
      }

      showAlert(file.name.replace('.pdf', ''), undefined, [
        {
          text: 'Open PDF',
          style: 'default',
          onPress: () => handleOpenPDF(file.id),
        },
        {
          text: file.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
          style: 'default',
          onPress: () => toggleFavorite(file.id),
        },
        {
          text: 'Chat with AI',
          style: 'default',
          onPress: () =>
            router.push({ pathname: '/ai-chat', params: { pdfId: file.id, pdfName: file.name } }),
        },
        {
          text: 'Share',
          style: 'default',
          onPress: async () => {
            try {
              await sharePDF(file.localUri);
            } catch (e: any) {
              showAlert('Share Failed', e.message);
            }
          },
        },
        {
          text: 'Move to Trash',
          style: 'destructive',
          onPress: () => deleteFile(file.id),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    },
    [activeFilter, showAlert, restoreFile, permanentlyDelete, toggleFavorite, deleteFile, handleOpenPDF, router]
  );

  const handleImport = useCallback(async () => {
    const file = await importPDF();
    if (file) handleOpenPDF(file.id);
  }, [importPDF, handleOpenPDF]);

  const emptyMessages = {
    all: { title: 'No PDFs yet', description: 'Import your first PDF to build your library' },
    recent: { title: 'No recent files', description: 'Open some PDFs to see them here' },
    favorites: { title: 'No favorites yet', description: 'Star PDFs to access them quickly' },
    trash: { title: 'Trash is empty', description: 'Deleted PDFs will appear here' },
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12, backgroundColor: colors.surface, borderBottomColor: colors.divider },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Library</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => setViewMode((v) => (v === 'list' ? 'grid' : 'list'))}
            style={({ pressed }) => [
              styles.iconBtn,
              { backgroundColor: colors.card },
              pressed && { opacity: 0.6 },
            ]}
          >
            <MaterialIcons
              name={viewMode === 'list' ? 'grid-view' : 'view-list'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
          <Pressable
            onPress={handleImport}
            style={({ pressed }) => [
              styles.importBtn,
              { backgroundColor: colors.primary },
              pressed && { opacity: 0.8 },
            ]}
          >
            {importing ? null : (
              <>
                <MaterialIcons name="add" size={18} color="#FFF" />
                <Text style={styles.importBtnText}>Import</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchArea, { backgroundColor: colors.surface }]}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search library..."
        />
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterArea, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: Spacing.sm }}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            const count =
              f.id === 'all'
                ? files.length
                : f.id === 'favorites'
                ? favorites.length
                : f.id === 'recent'
                ? recentFiles.length
                : trashedFiles.length;

            return (
              <Pressable
                key={f.id}
                onPress={() => setActiveFilter(f.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isActive ? '#FFF' : colors.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.filterBadge,
                      { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : colors.border },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterBadgeText,
                        { color: isActive ? '#FFF' : colors.textMuted },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {displayedFiles.length === 0 ? (
        <EmptyState
          title={emptyMessages[activeFilter].title}
          description={emptyMessages[activeFilter].description}
          icon={
            activeFilter === 'trash'
              ? 'delete-outline'
              : activeFilter === 'favorites'
              ? 'star-outline'
              : 'folder-open'
          }
          action={
            activeFilter === 'all'
              ? { label: 'Import PDF', onPress: handleImport }
              : undefined
          }
        />
      ) : viewMode === 'list' ? (
        <FlatList
          data={displayedFiles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PDFCard
              file={item}
              onPress={() => handleOpenPDF(item.id)}
              onFavoritePress={activeFilter !== 'trash' ? () => toggleFavorite(item.id) : undefined}
              onMorePress={() => handleShowOptions(item)}
              variant="list"
            />
          )}
          style={{ backgroundColor: colors.surface }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <Pressable onPress={refreshFiles} />
          }
        />
      ) : (
        <FlatList
          data={displayedFiles}
          keyExtractor={(item) => item.id}
          numColumns={2}
          renderItem={({ item }) => (
            <View style={{ flex: 1, margin: 6 }}>
              <PDFCard
                file={item}
                onPress={() => handleOpenPDF(item.id)}
                variant="grid"
              />
            </View>
          )}
          columnWrapperStyle={{ paddingHorizontal: Spacing.md }}
          contentContainerStyle={{ paddingVertical: Spacing.md }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { ...Typography.h2 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    height: 38,
    borderRadius: Radius.full,
  },
  importBtnText: { color: '#FFF', ...Typography.label, fontWeight: '700' },
  searchArea: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterArea: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    height: 36,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  filterChipText: { ...Typography.label, fontWeight: '600' },
  filterBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { ...Typography.caption, fontWeight: '700' },
});
