/**
 * PDF Context - Global PDF file state management
 * Handles recent files, favorites, and reading progress
 */
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { getSupabaseClient } from '@/template';

export interface PDFFile {
  id: string;
  name: string;
  localUri: string;
  fileSize: number;
  pageCount: number;
  lastPage: number;
  readingProgress: number;
  isFavorite: boolean;
  isDeleted: boolean;
  folderId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  // Cloud sync
  cloudPath?: string;
  isSynced: boolean;
}

interface PDFContextType {
  files: PDFFile[];
  recentFiles: PDFFile[];
  favorites: PDFFile[];
  trashedFiles: PDFFile[];
  loading: boolean;
  addFile: (file: Omit<PDFFile, 'id' | 'createdAt' | 'updatedAt' | 'isSynced'>) => Promise<PDFFile>;
  updateFile: (id: string, updates: Partial<PDFFile>) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  restoreFile: (id: string) => Promise<void>;
  permanentlyDelete: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  updateReadingProgress: (id: string, page: number, total: number) => Promise<void>;
  refreshFiles: () => Promise<void>;
  getFileById: (id: string) => PDFFile | undefined;
}

export const PDFContext = createContext<PDFContextType>({
  files: [],
  recentFiles: [],
  favorites: [],
  trashedFiles: [],
  loading: false,
  addFile: async () => ({} as PDFFile),
  updateFile: async () => {},
  deleteFile: async () => {},
  restoreFile: async () => {},
  permanentlyDelete: async () => {},
  toggleFavorite: async () => {},
  updateReadingProgress: async () => {},
  refreshFiles: async () => {},
  getFileById: () => undefined,
});

const STORAGE_KEY = 'pdf_genius_files';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function PDFProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);

  // Load files from local storage on mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PDFFile[] = JSON.parse(raw);
        // Filter out files whose local URIs no longer exist
        const valid = await Promise.all(
          parsed.map(async (f) => {
            try {
              const info = await FileSystem.getInfoAsync(f.localUri);
              return info.exists ? f : null;
            } catch {
              return null;
            }
          })
        );
        setFiles(valid.filter(Boolean) as PDFFile[]);
      }
    } catch (e) {
      console.error('Failed to load PDF files:', e);
    } finally {
      setLoading(false);
    }
  };

  const persistFiles = async (updatedFiles: PDFFile[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFiles));
    } catch (e) {
      console.error('Failed to persist files:', e);
    }
  };

  const addFile = useCallback(
    async (fileData: Omit<PDFFile, 'id' | 'createdAt' | 'updatedAt' | 'isSynced'>): Promise<PDFFile> => {
      const now = new Date().toISOString();
      const newFile: PDFFile = {
        ...fileData,
        id: generateId(),
        createdAt: now,
        updatedAt: now,
        isSynced: false,
      };

      // Check for duplicates by name + size
      const isDuplicate = files.some(
        (f) => f.name === newFile.name && f.fileSize === newFile.fileSize && !f.isDeleted
      );
      if (isDuplicate) {
        const existing = files.find((f) => f.name === newFile.name && f.fileSize === newFile.fileSize);
        if (existing) return existing;
      }

      const updated = [newFile, ...files];
      setFiles(updated);
      await persistFiles(updated);
      return newFile;
    },
    [files]
  );

  const updateFile = useCallback(
    async (id: string, updates: Partial<PDFFile>) => {
      const updated = files.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
      );
      setFiles(updated);
      await persistFiles(updated);
    },
    [files]
  );

  const deleteFile = useCallback(
    async (id: string) => {
      await updateFile(id, { isDeleted: true });
    },
    [updateFile]
  );

  const restoreFile = useCallback(
    async (id: string) => {
      await updateFile(id, { isDeleted: false });
    },
    [updateFile]
  );

  const permanentlyDelete = useCallback(
    async (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file) {
        try {
          const info = await FileSystem.getInfoAsync(file.localUri);
          if (info.exists) {
            await FileSystem.deleteAsync(file.localUri, { idempotent: true });
          }
        } catch (e) {
          console.warn('Could not delete local file:', e);
        }
      }
      const updated = files.filter((f) => f.id !== id);
      setFiles(updated);
      await persistFiles(updated);
    },
    [files]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file) {
        await updateFile(id, { isFavorite: !file.isFavorite });
      }
    },
    [files, updateFile]
  );

  const updateReadingProgress = useCallback(
    async (id: string, page: number, total: number) => {
      const progress = total > 0 ? page / total : 0;
      await updateFile(id, {
        lastPage: page,
        readingProgress: progress,
      });
    },
    [updateFile]
  );

  const refreshFiles = useCallback(async () => {
    await loadFiles();
  }, []);

  const getFileById = useCallback(
    (id: string) => files.find((f) => f.id === id),
    [files]
  );

  // Derived state
  const activeFiles = files.filter((f) => !f.isDeleted);
  const recentFiles = [...activeFiles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 20);
  const favorites = activeFiles.filter((f) => f.isFavorite);
  const trashedFiles = files.filter((f) => f.isDeleted);

  return (
    <PDFContext.Provider
      value={{
        files: activeFiles,
        recentFiles,
        favorites,
        trashedFiles,
        loading,
        addFile,
        updateFile,
        deleteFile,
        restoreFile,
        permanentlyDelete,
        toggleFavorite,
        updateReadingProgress,
        refreshFiles,
        getFileById,
      }}
    >
      {children}
    </PDFContext.Provider>
  );
}
