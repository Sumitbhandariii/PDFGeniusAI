/**
 * PDF Viewer Screen - Full-featured PDF reader
 * Uses react-native-pdf for rendering with controls overlay
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { usePDFFiles } from '@/hooks/usePDFFiles';
import { useBookmarks } from '@/hooks/useBookmarks';
import { Typography, Spacing, Radius } from '@/constants/theme';
import { useAlert } from '@/template';
import { PDFRenderer } from '@/components/feature/PDFRenderer';

const { width, height } = Dimensions.get('window');

type ScrollMode = 'vertical' | 'horizontal';
type ReadingMode = 'normal' | 'night' | 'sepia';

export default function PDFViewerScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getFileById, updateReadingProgress } = usePDFFiles();
  const { showAlert } = useAlert();

  const file = getFileById(params.id);
  const { bookmarks, addBookmark, isPageBookmarked } = useBookmarks(params.id);

  const [currentPage, setCurrentPage] = useState(file?.lastPage || 1);
  const [totalPages, setTotalPages] = useState(file?.pageCount || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [scrollMode, setScrollMode] = useState<ScrollMode>('vertical');
  const [readingMode, setReadingMode] = useState<ReadingMode>('normal');
  const [scale, setScale] = useState(1.0);

  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const hideControlsTimer = useRef<any>(null);

  // Auto-hide controls after 3 seconds
  const resetHideTimer = useCallback(() => {
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    Animated.timing(controlsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    setShowControls(true);
    hideControlsTimer.current = setTimeout(() => {
      Animated.timing(controlsOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      setShowControls(false);
    }, 4000);
  }, [controlsOpacity]);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    };
  }, []);

  const handlePageChanged = useCallback(
    (page: number, pagesCount: number) => {
      setCurrentPage(page);
      if (pagesCount > 0) setTotalPages(pagesCount);
      if (params.id) {
        updateReadingProgress(params.id, page, pagesCount || totalPages);
      }
    },
    [params.id, totalPages, updateReadingProgress]
  );

  const handleLoadComplete = useCallback(
    (numberOfPages: number) => {
      setTotalPages(numberOfPages);
      setLoading(false);
      if (params.id && numberOfPages > 0) {
        updateReadingProgress(params.id, file?.lastPage || 1, numberOfPages);
      }
    },
    [params.id, file]
  );

  const handleBookmark = useCallback(() => {
    if (isPageBookmarked(currentPage)) {
      showAlert('Page Already Bookmarked', `Page ${currentPage} is already in your bookmarks.`);
    } else {
      addBookmark(currentPage, `Page ${currentPage} — ${file?.name?.replace('.pdf', '') || 'PDF'}`);
      showAlert('Bookmarked!', `Page ${currentPage} has been bookmarked.`);
    }
  }, [currentPage, isPageBookmarked, addBookmark, file, showAlert]);

  const handleAIChat = useCallback(() => {
    if (file) {
      router.push({
        pathname: '/ai-chat',
        params: { pdfId: file.id, pdfName: file.name, pdfUri: file.localUri },
      });
    }
  }, [file, router]);

  const toggleScrollMode = useCallback(() => {
    setScrollMode((m) => (m === 'vertical' ? 'horizontal' : 'vertical'));
    resetHideTimer();
  }, [resetHideTimer]);

  const toggleReadingMode = useCallback(() => {
    setReadingMode((m) => {
      if (m === 'normal') return 'night';
      if (m === 'night') return 'sepia';
      return 'normal';
    });
    resetHideTimer();
  }, [resetHideTimer]);

  const readingModeFilter = {
    normal: {},
    night: { tintColor: undefined, style: { filter: 'invert(1) hue-rotate(180deg)' } },
    sepia: { tintColor: '#704214', style: { opacity: 0.85 } },
  };

  const readingModeIcon = {
    normal: 'wb-sunny',
    night: 'nights-stay',
    sepia: 'coffee',
  };

  if (!file) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>PDF Not Found</Text>
          <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>
            This PDF file could not be found. It may have been deleted.
          </Text>
          <Pressable onPress={() => router.back()} style={[styles.errorBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.errorBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor:
            readingMode === 'night' ? '#000' : readingMode === 'sepia' ? '#F4ECD8' : colors.background,
        },
      ]}
    >
      <StatusBar hidden={!showControls} />

      {/* PDF Renderer - platform-specific (native uses react-native-pdf, web uses iframe) */}
      <Pressable style={styles.pdfArea} onPress={resetHideTimer}>
        <PDFRenderer
          uri={file.localUri}
          initialPage={file.lastPage || 1}
          horizontal={scrollMode === 'horizontal'}
          scale={scale}
          onLoadComplete={handleLoadComplete}
          onPageChanged={handlePageChanged}
          onError={(err) => { setError(err); setLoading(false); }}
          onPress={resetHideTimer}
        />
      </Pressable>

      {/* Top Controls */}
      <Animated.View
        style={[
          styles.topControls,
          {
            paddingTop: insets.top,
            backgroundColor: 'rgba(0,0,0,0.75)',
            opacity: controlsOpacity,
          },
        ]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.controlBtn, pressed && { opacity: 0.6 }]}
        >
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </Pressable>

        <View style={styles.topCenter}>
          <Text style={styles.topTitle} numberOfLines={1}>
            {file.name.replace('.pdf', '')}
          </Text>
          {totalPages > 0 && (
            <Text style={styles.topSubtitle}>
              {currentPage} / {totalPages}
            </Text>
          )}
        </View>

        <View style={styles.topRight}>
          <Pressable
            onPress={handleBookmark}
            style={({ pressed }) => [styles.controlBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons
              name={isPageBookmarked(currentPage) ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isPageBookmarked(currentPage) ? '#F59E0B' : '#FFF'}
            />
          </Pressable>
          <Pressable
            onPress={handleAIChat}
            style={({ pressed }) => [styles.aiBtn, pressed && { opacity: 0.8 }]}
          >
            <MaterialIcons name="auto-awesome" size={18} color="#FFF" />
          </Pressable>
        </View>
      </Animated.View>

      {/* Bottom Controls */}
      <Animated.View
        style={[
          styles.bottomControls,
          {
            paddingBottom: insets.bottom + 12,
            backgroundColor: 'rgba(0,0,0,0.75)',
            opacity: controlsOpacity,
          },
        ]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        {/* Progress Bar */}
        {totalPages > 0 && (
          <View style={styles.progressSection}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${(currentPage / totalPages) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round((currentPage / totalPages) * 100)}%
            </Text>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.bottomRow}>
          <Pressable
            onPress={toggleScrollMode}
            style={({ pressed }) => [styles.bottomBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons
              name={scrollMode === 'vertical' ? 'swap-horiz' : 'swap-vert'}
              size={22}
              color="#FFF"
            />
            <Text style={styles.bottomBtnLabel}>
              {scrollMode === 'vertical' ? 'Horizontal' : 'Vertical'}
            </Text>
          </Pressable>

          <Pressable
            onPress={toggleReadingMode}
            style={({ pressed }) => [styles.bottomBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons
              name={readingModeIcon[readingMode] as any}
              size={22}
              color="#FFF"
            />
            <Text style={styles.bottomBtnLabel}>
              {readingMode === 'normal' ? 'Normal' : readingMode === 'night' ? 'Night' : 'Sepia'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setScale((s) => Math.min(s + 0.25, 4))}
            style={({ pressed }) => [styles.bottomBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="zoom-in" size={22} color="#FFF" />
            <Text style={styles.bottomBtnLabel}>Zoom In</Text>
          </Pressable>

          <Pressable
            onPress={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            style={({ pressed }) => [styles.bottomBtn, pressed && { opacity: 0.6 }]}
          >
            <MaterialIcons name="zoom-out" size={22} color="#FFF" />
            <Text style={styles.bottomBtnLabel}>Zoom Out</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  pdfArea: { flex: 1 },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  errorTitle: { ...Typography.h3 },
  errorDesc: { ...Typography.body, textAlign: 'center' },
  errorBtn: {
    paddingHorizontal: Spacing.xl,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  errorBtnText: { color: '#FFF', ...Typography.button },

  // Top Controls
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: {
    color: '#FFF',
    ...Typography.label,
    fontWeight: '600',
  },
  topSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    ...Typography.caption,
    marginTop: 2,
  },
  topRight: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  controlBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBtn: {
    backgroundColor: 'rgba(99,102,241,0.8)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Controls
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    ...Typography.caption,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  bottomBtn: {
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  bottomBtnLabel: {
    color: 'rgba(255,255,255,0.8)',
    ...Typography.caption,
    fontWeight: '500',
  },
});
