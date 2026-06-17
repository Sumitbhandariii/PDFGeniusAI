/**
 * PDF Context - Web
 * Web-compatible version using localStorage instead of AsyncStorage + expo-file-system
 */
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';

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

function loadFromStorage(): PDFFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(files: PDFFile[]): void {
  try {
    // On web, avoid storing large data URIs in localStorage to prevent quota errors
    const toSave = files.map((f) => ({
      ...f,
      // Keep data URIs for small files only (< 2MB); otherwise just store metadata
      localUri: f.localUri && f.localUri.length > 2 * 1024 * 1024 ? f.localUri.substring(0, 100) + '...' : f.localUri,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.warn('localStorage quota exceeded, saving metadata only');
    try {
      const minimal = files.map(({ localUri, ...rest }) => ({ ...rest, localUri: '' }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
    } catch {}
  }
}

export function PDFProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaded = loadFromStorage();
    setFiles(loaded);
    setLoading(false);
  }, []);

  const persistFiles = useCallback((updatedFiles: PDFFile[]) => {
    saveToStorage(updatedFiles);
  }, []);

  const addFile = useCallback(
    async (fileData: Omit<PDFFile, 'id' | 'createdAt' | 'updatedAt' | 'isSynced'>): Promise<PDFFile> => {
      const now = new Date().toISOString();
      const newFile: PDFFile = { ...fileData, id: generateId(), createdAt: now, updatedAt: now, isSynced: false };

      const isDuplicate = files.some(
        (f) => f.name === newFile.name && f.fileSize === newFile.fileSize && !f.isDeleted
      );
      if (isDuplicate) {
        const existing = files.find((f) => f.name === newFile.name && f.fileSize === newFile.fileSize);
        if (existing) return existing;
      }

      const updated = [newFile, ...files];
      setFiles(updated);
      persistFiles(updated);
      return newFile;
    },
    [files, persistFiles]
  );

  const updateFile = useCallback(
    async (id: string, updates: Partial<PDFFile>) => {
      const updated = files.map((f) =>
        f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
      );
      setFiles(updated);
      persistFiles(updated);
    },
    [files, persistFiles]
  );

  const deleteFile = useCallback(async (id: string) => {
    await updateFile(id, { isDeleted: true });
  }, [updateFile]);

  const restoreFile = useCallback(async (id: string) => {
    await updateFile(id, { isDeleted: false });
  }, [updateFile]);

  const permanentlyDelete = useCallback(
    async (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file && file.localUri?.startsWith('blob:')) {
        URL.revokeObjectURL(file.localUri);
      }
      const updated = files.filter((f) => f.id !== id);
      setFiles(updated);
      persistFiles(updated);
    },
    [files, persistFiles]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file) await updateFile(id, { isFavorite: !file.isFavorite });
    },
    [files, updateFile]
  );

  const updateReadingProgress = useCallback(
    async (id: string, page: number, total: number) => {
      const progress = total > 0 ? page / total : 0;
      await updateFile(id, { lastPage: page, readingProgress: progress });
    },
    [updateFile]
  );

  const refreshFiles = useCallback(async () => {
    const loaded = loadFromStorage();
    setFiles(loaded);
  }, []);

  const getFileById = useCallback(
    (id: string) => files.find((f) => f.id === id),
    [files]
  );

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
