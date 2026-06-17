/**
 * PDF Service - Web
 * Web-compatible version without native modules
 */

export interface PickedPDF {
  name: string;
  uri: string;
  size: number;
  mimeType: string;
}

export async function ensurePDFDirectory(): Promise<void> {
  // No-op on web
}

export async function pickPDFFile(multiple: boolean = false): Promise<PickedPDF[]> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.multiple = multiple;

    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) {
        resolve([]);
        return;
      }
      const result: PickedPDF[] = [];
      const readers: Promise<void>[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const promise = new Promise<void>((res) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            result.push({
              name: file.name,
              uri: ev.target?.result as string,
              size: file.size,
              mimeType: file.type || 'application/pdf',
            });
            res();
          };
          reader.onerror = () => res();
          reader.readAsDataURL(file);
        });
        readers.push(promise);
      }

      Promise.all(readers).then(() => resolve(result));
    };

    input.oncancel = () => resolve([]);
    input.click();
  });
}

export async function copyPDFToStorage(sourceUri: string, fileName: string): Promise<string> {
  // On web, we just return the data URI/blob URL as-is
  return sourceUri;
}

export async function getFileInfo(uri: string): Promise<{ exists: boolean; size?: number }> {
  return { exists: true };
}

export async function sharePDF(uri: string): Promise<void> {
  if (navigator.share) {
    await navigator.share({ title: 'PDF', url: uri });
  } else {
    const a = document.createElement('a');
    a.href = uri;
    a.download = 'document.pdf';
    a.click();
  }
}

export async function deletePDFFromStorage(uri: string): Promise<void> {
  // On web, revoke object URLs if applicable
  if (uri.startsWith('blob:')) {
    URL.revokeObjectURL(uri);
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function formatProgress(progress: number): string {
  return `${Math.round(progress * 100)}%`;
}

export function estimateReadingTime(pageCount: number): string {
  const minutes = Math.ceil((pageCount * 250) / 200);
  if (minutes < 60) return `${minutes} min read`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m read` : `${hours}h read`;
}

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
