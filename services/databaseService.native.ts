/**
 * Database Service - Native (iOS/Android)
 * Handles cloud sync for PDFs, bookmarks, and AI chats
 */
import { getSupabaseClient } from '@/template';
import * as FileSystem from 'expo-file-system';
import type { PDFFile } from '@/contexts/PDFContext';

const supabase = getSupabaseClient();

export interface CloudPDFFile {
  id: string;
  user_id: string;
  name: string;
  file_path: string | null;
  local_uri: string | null;
  size_bytes: number;
  page_count: number;
  last_page: number;
  reading_progress: number;
  is_favorite: boolean;
  is_deleted: boolean;
  folder_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export async function syncPDFToCloud(file: PDFFile): Promise<{ error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { error: 'Not authenticated' };

    const fileContent = await FileSystem.readAsStringAsync(file.localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const storagePath = `${userData.user.id}/${file.id}/${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from('pdf-files')
      .upload(storagePath, decode(fileContent), {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.warn('Storage upload error:', uploadError.message);
    }

    const { error: dbError } = await supabase.from('pdf_files').upsert({
      id: file.id,
      user_id: userData.user.id,
      name: file.name,
      file_path: uploadError ? null : storagePath,
      size_bytes: file.fileSize,
      page_count: file.pageCount,
      last_page: file.lastPage,
      reading_progress: file.readingProgress,
      is_favorite: file.isFavorite,
      is_deleted: file.isDeleted,
      folder_id: file.folderId || null,
      tags: file.tags,
      updated_at: new Date().toISOString(),
    });

    return { error: dbError?.message || null };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function fetchCloudPDFFiles(): Promise<{ data: CloudPDFFile[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('pdf_files')
      .select('*')
      .eq('is_deleted', false)
      .order('updated_at', { ascending: false });

    return { data: (data as CloudPDFFile[]) || [], error: error?.message || null };
  } catch (e: any) {
    return { data: [], error: e.message };
  }
}

export interface Bookmark {
  id: string;
  pdfId: string;
  pageNumber: number;
  title: string;
  createdAt: string;
}

export async function saveBookmark(
  pdfId: string,
  pageNumber: number,
  title: string
): Promise<{ data: Bookmark | null; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return {
        data: { id: Date.now().toString(), pdfId, pageNumber, title, createdAt: new Date().toISOString() },
        error: null,
      };
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({ user_id: userData.user.id, pdf_id: pdfId, page_number: pageNumber, title })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    return {
      data: { id: data.id, pdfId: data.pdf_id, pageNumber: data.page_number, title: data.title, createdAt: data.created_at },
      error: null,
    };
  } catch (e: any) {
    return { data: null, error: e.message };
  }
}

export async function fetchBookmarks(pdfId: string): Promise<{ data: Bookmark[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('pdf_id', pdfId)
      .order('page_number', { ascending: true });

    return {
      data: (data || []).map((b) => ({
        id: b.id, pdfId: b.pdf_id, pageNumber: b.page_number, title: b.title, createdAt: b.created_at,
      })),
      error: error?.message || null,
    };
  } catch (e: any) {
    return { data: [], error: e.message };
  }
}

export async function deleteBookmark(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('bookmarks').delete().eq('id', id);
  return { error: error?.message || null };
}

export interface AIChat {
  id: string;
  pdfId: string | null;
  pdfName: string | null;
  title: string;
  createdAt: string;
}

export interface AIMessage {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export async function createAIChat(
  pdfId: string | null,
  pdfName: string | null,
  title: string
): Promise<{ data: AIChat | null; error: string | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('ai_chats')
      .insert({ user_id: userData.user.id, pdf_id: pdfId, pdf_name: pdfName, title })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    return {
      data: { id: data.id, pdfId: data.pdf_id, pdfName: data.pdf_name, title: data.title, createdAt: data.created_at },
      error: null,
    };
  } catch (e: any) {
    return { data: null, error: e.message };
  }
}

export async function saveAIMessage(
  chatId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('ai_messages').insert({ chat_id: chatId, role, content });
  return { error: error?.message || null };
}

export async function fetchAIChats(): Promise<{ data: AIChat[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ai_chats')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50);

    return {
      data: (data || []).map((c) => ({
        id: c.id, pdfId: c.pdf_id, pdfName: c.pdf_name, title: c.title, createdAt: c.created_at,
      })),
      error: error?.message || null,
    };
  } catch (e: any) {
    return { data: [], error: e.message };
  }
}

export async function fetchAIMessages(chatId: string): Promise<{ data: AIMessage[]; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    return {
      data: (data || []).map((m) => ({
        id: m.id, chatId: m.chat_id, role: m.role, content: m.content, createdAt: m.created_at,
      })),
      error: error?.message || null,
    };
  } catch (e: any) {
    return { data: [], error: e.message };
  }
}

export async function deleteAIChat(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('ai_chats').delete().eq('id', id);
  return { error: error?.message || null };
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
