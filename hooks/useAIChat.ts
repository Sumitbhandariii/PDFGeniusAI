/**
 * useAIChat Hook - AI chat state management with Gemini integration
 */
import { useState, useCallback, useRef } from 'react';
import {
  chatWithPDF,
  callGemini,
  generateSummary,
  generateNotes,
  generateFlashcards,
  generateQuiz,
  extractKeywords,
  translateContent,
  hasGeminiApiKey,
} from '@/services/geminiService';
import {
  createAIChat,
  saveAIMessage,
  fetchAIMessages,
  fetchAIChats,
  deleteAIChat,
  type AIChat,
  type AIMessage,
} from '@/services/databaseService';

export interface ChatMessageDisplay {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
  error?: string;
  createdAt: string;
}

export function useAIChat(pdfId?: string, pdfUri?: string, pdfName?: string) {
  const [messages, setMessages] = useState<ChatMessageDisplay[]>([]);
  const [chats, setChats] = useState<AIChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const abortRef = useRef(false);

  const checkApiKey = useCallback(async () => {
    const has = await hasGeminiApiKey();
    setHasApiKey(has);
    return has;
  }, []);

  const loadChats = useCallback(async () => {
    setLoadingChats(true);
    const { data } = await fetchAIChats();
    setChats(data);
    setLoadingChats(false);
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    const { data } = await fetchAIMessages(chatId);
    const display: ChatMessageDisplay[] = data.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));
    setMessages(display);
    setCurrentChatId(chatId);
  }, []);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const has = await checkApiKey();
      if (!has) {
        const noKeyMsg: ChatMessageDisplay = {
          id: Date.now().toString() + '_err',
          role: 'assistant',
          content: 'Please add your Gemini API key in Settings to use AI features.',
          error: 'no_api_key',
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, noKeyMsg]);
        return;
      }

      // Add user message
      const userMsg: ChatMessageDisplay = {
        id: Date.now().toString() + '_u',
        role: 'user',
        content: userMessage,
        createdAt: new Date().toISOString(),
      };

      // Add loading assistant message
      const loadingMsg: ChatMessageDisplay = {
        id: Date.now().toString() + '_ai',
        role: 'assistant',
        content: '',
        isLoading: true,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setIsLoading(true);
      abortRef.current = false;

      try {
        // Create chat if not exists
        let chatId = currentChatId;
        if (!chatId) {
          const { data: newChat } = await createAIChat(
            pdfId || null,
            pdfName || null,
            userMessage.slice(0, 60)
          );
          if (newChat) {
            chatId = newChat.id;
            setCurrentChatId(chatId);
          }
        }

        // Save user message
        if (chatId) {
          await saveAIMessage(chatId, 'user', userMessage);
        }

        // Call AI
        let result;
        if (pdfUri) {
          result = await chatWithPDF(pdfUri, userMessage);
        } else {
          result = await callGemini(userMessage);
        }

        if (abortRef.current) return;

        const aiResponse = result.error
          ? `⚠️ ${result.error}`
          : result.text;

        // Save AI response
        if (chatId && !result.error) {
          await saveAIMessage(chatId, 'assistant', aiResponse);
        }

        // Update messages
        setMessages((prev) =>
          prev.map((m) =>
            m.isLoading
              ? {
                  ...m,
                  content: aiResponse,
                  isLoading: false,
                  error: result.error,
                }
              : m
          )
        );
      } catch (e: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.isLoading
              ? {
                  ...m,
                  content: `⚠️ ${e.message || 'An error occurred. Please try again.'}`,
                  isLoading: false,
                  error: 'error',
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentChatId, pdfId, pdfUri, pdfName, checkApiKey]
  );

  const runAIFeature = useCallback(
    async (
      featureId: string,
      options?: { language?: string }
    ): Promise<string> => {
      if (!pdfUri) {
        return '⚠️ No PDF loaded. Please open a PDF first.';
      }

      const has = await checkApiKey();
      if (!has) {
        return '⚠️ Please add your Gemini API key in Settings to use AI features.';
      }

      setIsLoading(true);
      try {
        let result;
        switch (featureId) {
          case 'summary':
            result = await generateSummary(pdfUri, false);
            break;
          case 'detailed-summary':
            result = await generateSummary(pdfUri, true);
            break;
          case 'notes':
            result = await generateNotes(pdfUri);
            break;
          case 'flashcards':
            result = await generateFlashcards(pdfUri);
            break;
          case 'quiz':
            result = await generateQuiz(pdfUri);
            break;
          case 'keywords':
            result = await extractKeywords(pdfUri);
            break;
          case 'translate':
            result = await translateContent(pdfUri, options?.language || 'Spanish');
            break;
          default:
            result = await chatWithPDF(pdfUri, `Provide information about: ${featureId}`);
        }

        return result.error ? `⚠️ ${result.error}` : result.text;
      } finally {
        setIsLoading(false);
      }
    },
    [pdfUri, checkApiKey]
  );

  const startNewChat = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
  }, []);

  const removeChat = useCallback(
    async (chatId: string) => {
      await deleteAIChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChatId === chatId) {
        startNewChat();
      }
    },
    [currentChatId, startNewChat]
  );

  return {
    messages,
    chats,
    currentChatId,
    isLoading,
    loadingChats,
    hasApiKey,
    checkApiKey,
    loadChats,
    loadMessages,
    sendMessage,
    runAIFeature,
    startNewChat,
    removeChat,
  };
}
