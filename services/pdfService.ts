/**
 * PDF Service - File operations for PDF management
 * Handles picking, copying, and managing PDF files
 */
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

const PDF_DIR = `${FileSystem.documentDirectory}pdfs/`;

export interface PickedPDF {
  name: string;
  uri: string;
  size: number;
  mimeType: string;
}

/**
 * Ensure the PDFs directory exists
 */
export async function ensurePDFDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(PDF_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PDF_DIR, { intermediates: true });
  }
}

/**
 * Open document picker and return selected PDF(s)
 */
export async function pickPDFFile(multiple: boolean = false): Promise<PickedPDF[]> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple,
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.length) {
      return [];
    }

    return result.assets.map((asset) => ({
      name: asset.name || 'document.pdf',
      uri: asset.uri,
      size: asset.size || 0,
      mimeType: asset.mimeType || 'application/pdf',
    }));
  } catch (e: any) {
    console.error('Failed to pick PDF:', e);
    throw new Error(`Could not open file picker: ${e.message}`);
  }
}

/**
 * Copy PDF to app's permanent storage directory
 */
export async function copyPDFToStorage(sourceUri: string, fileName: string): Promise<string> {
  await ensurePDFDirectory();

  // Sanitize filename
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const destPath = `${PDF_DIR}${timestamp}_${safeName}`;

  try {
    await FileSystem.copyAsync({ from: sourceUri, to: destPath });
    return destPath;
  } catch (e: any) {
    // If copy fails, try moving
    try {
      await FileSystem.moveAsync({ from: sourceUri, to: destPath });
      return destPath;
    } catch {
      throw new Error(`Failed to save PDF: ${e.message}`);
    }
  }
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Format reading progress as percentage
 */
export function formatProgress(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}

/**
 * Get file info from URI
 */
export async function getFileInfo(uri: string): Promise<FileSystem.FileInfo> {
  return FileSystem.getInfoAsync(uri);
}

/**
 * Share a PDF file
 */
export async function sharePDF(uri: string): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Share PDF',
  });
}

/**
 * Delete a PDF from storage
 */
export async function deletePDFFromStorage(uri: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (e: any) {
    console.warn('Failed to delete file from storage:', e);
  }
}

/**
 * Calculate reading time estimate (avg 200 words/min, ~250 words/page)
 */
export function estimateReadingTime(pageCount: number): string {
  const minutes = Math.ceil((pageCount * 250) / 200);
  if (minutes < 60) return `${minutes} min read`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m read` : `${hours}h read`;
}

/**
 * Get relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

/**
 * Generate a color based on filename (for visual consistency)
 */
export function getFileColor(name: string): string {
  const colors = [
    '#6366F1', '#8B5CF6', '#EC4899',
    '#10B981', '#3B82F6', '#F59E0B',
    '#EF4444', '#06B6D4', '#84CC16',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
