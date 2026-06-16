/**
 * useBookmarks Hook - Bookmark management for PDF files
 */
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveBookmark, fetchBookmarks, deleteBookmark, type Bookmark } from '@/services/databaseService';
import { useAlert } from '@/template';

export function useBookmarks(pdfId?: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();

  const loadBookmarks = useCallback(async () => {
    if (!pdfId) return;
    setLoading(true);
    try {
      const { data } = await fetchBookmarks(pdfId);
      setBookmarks(data);
    } catch (e) {
      console.warn('Failed to load bookmarks:', e);
      // Fallback to local storage
      const raw = await AsyncStorage.getItem(`bookmarks_${pdfId}`);
      if (raw) setBookmarks(JSON.parse(raw));
    } finally {
      setLoading(false);
    }
  }, [pdfId]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const addBookmark = useCallback(
    async (pageNumber: number, title?: string) => {
      if (!pdfId) return;

      const bookmarkTitle = title || `Page ${pageNumber}`;
      const isDuplicate = bookmarks.some((b) => b.pageNumber === pageNumber);
      if (isDuplicate) {
        showAlert('Already Bookmarked', `Page ${pageNumber} is already bookmarked.`);
        return;
      }

      const { data, error } = await saveBookmark(pdfId, pageNumber, bookmarkTitle);
      if (error) {
        // Fallback to local storage
        const localBookmark: Bookmark = {
          id: Date.now().toString(),
          pdfId,
          pageNumber,
          title: bookmarkTitle,
          createdAt: new Date().toISOString(),
        };
        const updated = [...bookmarks, localBookmark].sort(
          (a, b) => a.pageNumber - b.pageNumber
        );
        setBookmarks(updated);
        await AsyncStorage.setItem(`bookmarks_${pdfId}`, JSON.stringify(updated));
      } else if (data) {
        const updated = [...bookmarks, data].sort(
          (a, b) => a.pageNumber - b.pageNumber
        );
        setBookmarks(updated);
        await AsyncStorage.setItem(`bookmarks_${pdfId}`, JSON.stringify(updated));
      }
    },
    [pdfId, bookmarks, showAlert]
  );

  const removeBookmark = useCallback(
    async (bookmarkId: string) => {
      await deleteBookmark(bookmarkId);
      const updated = bookmarks.filter((b) => b.id !== bookmarkId);
      setBookmarks(updated);
      if (pdfId) {
        await AsyncStorage.setItem(`bookmarks_${pdfId}`, JSON.stringify(updated));
      }
    },
    [bookmarks, pdfId]
  );

  const isPageBookmarked = useCallback(
    (pageNumber: number): boolean => {
      return bookmarks.some((b) => b.pageNumber === pageNumber);
    },
    [bookmarks]
  );

  return {
    bookmarks,
    loading,
    addBookmark,
    removeBookmark,
    isPageBookmarked,
    refreshBookmarks: loadBookmarks,
  };
}
