/**
 * usePDFFiles Hook - PDF file operations with context integration
 */
import { useContext, useCallback, useState } from 'react';
import { PDFContext, type PDFFile } from '@/contexts/PDFContext';
import { pickPDFFile, copyPDFToStorage, formatFileSize } from '@/services/pdfService';
import { useAlert } from '@/template';

export function usePDFFiles() {
  const ctx = useContext(PDFContext);
  const { showAlert } = useAlert();
  const [importing, setImporting] = useState(false);

  const importPDF = useCallback(async (): Promise<PDFFile | null> => {
    try {
      setImporting(true);
      const picked = await pickPDFFile(false);
      if (!picked.length) return null;

      const file = picked[0];

      // Copy to permanent storage
      const localUri = await copyPDFToStorage(file.uri, file.name);

      const newFile = await ctx.addFile({
        name: file.name,
        localUri,
        fileSize: file.size,
        pageCount: 0,
        lastPage: 1,
        readingProgress: 0,
        isFavorite: false,
        isDeleted: false,
        tags: [],
      });

      return newFile;
    } catch (e: any) {
      showAlert('Import Failed', e.message || 'Could not import the PDF file.');
      return null;
    } finally {
      setImporting(false);
    }
  }, [ctx, showAlert]);

  const importMultiplePDFs = useCallback(async (): Promise<PDFFile[]> => {
    try {
      setImporting(true);
      const picked = await pickPDFFile(true);
      if (!picked.length) return [];

      const imported: PDFFile[] = [];
      for (const file of picked) {
        try {
          const localUri = await copyPDFToStorage(file.uri, file.name);
          const newFile = await ctx.addFile({
            name: file.name,
            localUri,
            fileSize: file.size,
            pageCount: 0,
            lastPage: 1,
            readingProgress: 0,
            isFavorite: false,
            isDeleted: false,
            tags: [],
          });
          imported.push(newFile);
        } catch (e) {
          console.warn(`Failed to import ${file.name}:`, e);
        }
      }
      return imported;
    } catch (e: any) {
      showAlert('Import Failed', e.message || 'Could not import PDF files.');
      return [];
    } finally {
      setImporting(false);
    }
  }, [ctx, showAlert]);

  const searchFiles = useCallback(
    (query: string): PDFFile[] => {
      if (!query.trim()) return ctx.files;
      const q = query.toLowerCase();
      return ctx.files.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      );
    },
    [ctx.files]
  );

  const getFileSizeDisplay = useCallback((file: PDFFile): string => {
    return formatFileSize(file.fileSize);
  }, []);

  const confirmDelete = useCallback(
    (file: PDFFile, onConfirm: () => void) => {
      showAlert(
        'Move to Trash',
        `"${file.name}" will be moved to trash.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Move to Trash',
            style: 'destructive',
            onPress: onConfirm,
          },
        ]
      );
    },
    [showAlert]
  );

  const confirmPermanentDelete = useCallback(
    (file: PDFFile, onConfirm: () => void) => {
      showAlert(
        'Delete Permanently',
        `"${file.name}" will be permanently deleted and cannot be recovered.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: onConfirm,
          },
        ]
      );
    },
    [showAlert]
  );

  return {
    ...ctx,
    importing,
    importPDF,
    importMultiplePDFs,
    searchFiles,
    getFileSizeDisplay,
    confirmDelete,
    confirmPermanentDelete,
  };
}
