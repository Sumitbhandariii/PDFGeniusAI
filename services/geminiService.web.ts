/**
 * Gemini AI Service - Web
 * Web-compatible version using localStorage and fetch for PDF base64
 */
import { APP_CONFIG } from '@/constants/config';

const API_KEY_STORAGE = 'gemini_api_key';

export interface GeminiResponse {
  text: string;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export async function getGeminiApiKey(): Promise<string | null> {
  try {
    return localStorage.getItem(API_KEY_STORAGE);
  } catch {
    return null;
  }
}

export async function saveGeminiApiKey(key: string): Promise<void> {
  try {
    localStorage.setItem(API_KEY_STORAGE, key);
  } catch {}
}

export async function hasGeminiApiKey(): Promise<boolean> {
  const key = await getGeminiApiKey();
  return !!(key && key.trim().length > 0);
}

export async function callGemini(
  prompt: string,
  history?: ChatMessage[]
): Promise<GeminiResponse> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    return {
      text: '',
      error: 'Gemini API key not configured. Please add your API key in Settings.',
    };
  }

  try {
    const url = `${APP_CONFIG.geminiBaseUrl}/${APP_CONFIG.geminiModel}:generateContent?key=${apiKey}`;

    const contents = [];
    if (history && history.length > 0) {
      contents.push(...history);
    }
    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `API Error ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson?.error?.message || errMsg;
        if (response.status === 400 && errMsg.includes('API_KEY')) {
          errMsg = 'Invalid API key. Please check your Gemini API key in Settings.';
        }
      } catch {}
      return { text: '', error: errMsg };
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') ||
      '';

    if (!text) return { text: '', error: 'No response from AI. Please try again.' };
    return { text };
  } catch (e: any) {
    if (e.message?.includes('Network')) {
      return { text: '', error: 'Network error. Please check your internet connection.' };
    }
    return { text: '', error: `AI error: ${e.message || 'Unknown error'}` };
  }
}

/**
 * Web version: reads PDF as base64 from data URI or fetches blob
 */
async function readPDFAsBase64(pdfUri: string): Promise<string> {
  if (pdfUri.startsWith('data:')) {
    // Strip the data URL prefix
    return pdfUri.split(',')[1] || '';
  }
  // Fetch and convert to base64
  const response = await fetch(pdfUri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function callGeminiWithPDF(
  pdfUri: string,
  prompt: string
): Promise<GeminiResponse> {
  const apiKey = await getGeminiApiKey();
  if (!apiKey) {
    return {
      text: '',
      error: 'Gemini API key not configured. Please add your API key in Settings.',
    };
  }

  try {
    const base64Data = await readPDFAsBase64(pdfUri);
    if (!base64Data) {
      return { text: '', error: 'Could not read PDF file.' };
    }

    const url = `${APP_CONFIG.geminiBaseUrl}/${APP_CONFIG.geminiModel}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { inline_data: { mime_type: 'application/pdf', data: base64Data } },
              { text: prompt },
            ],
          },
        ],
        generationConfig: { temperature: 0.5, maxOutputTokens: 8192 },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `API Error ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson?.error?.message || errMsg;
      } catch {}
      return { text: '', error: errMsg };
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') ||
      '';

    if (!text) return { text: '', error: 'No response from AI. Please try again.' };
    return { text };
  } catch (e: any) {
    if (e.message?.includes('Network')) {
      return { text: '', error: 'Network error. Please check your internet connection.' };
    }
    return { text: '', error: `AI error: ${e.message || 'Unknown error'}` };
  }
}

export async function generateSummary(pdfUri: string, detailed: boolean = false): Promise<GeminiResponse> {
  const prompt = detailed
    ? `Provide a detailed academic-style summary of this document. Include: **Executive Summary**, **Main Themes**, **Key Arguments**, **Important Data/Statistics**, and **Conclusions**. Use markdown formatting.`
    : `Provide a comprehensive, well-structured summary of this PDF document. Format your response with clear sections: **Overview**, **Key Points**, and **Conclusion**. Be concise but thorough. Use markdown formatting.`;
  return callGeminiWithPDF(pdfUri, prompt);
}

export async function generateNotes(pdfUri: string): Promise<GeminiResponse> {
  const prompt = `Convert this PDF into structured study notes. Format as:
## Main Topics
- Bullet points for key concepts

## Important Terms & Definitions
- Term: Definition

## Key Takeaways
1. Numbered list of most important points

## Formulas / Important Data
- Any formulas, statistics, or critical data

Use markdown formatting throughout.`;
  return callGeminiWithPDF(pdfUri, prompt);
}

export async function generateFlashcards(pdfUri: string): Promise<GeminiResponse> {
  const prompt = `Generate 10 comprehensive study flashcards from this document. Format each as:

---
**Q:** [Clear, specific question that tests understanding]
**A:** [Concise, accurate answer]

---
Make questions test understanding and application, not just memorization. Cover the most important concepts.`;
  return callGeminiWithPDF(pdfUri, prompt);
}

export async function generateQuiz(pdfUri: string): Promise<GeminiResponse> {
  const prompt = `Create 5 multiple choice questions (MCQs) from this document. Format:

**Q1:** [Question]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
Answer: [Letter] - [Brief explanation of why this is correct]

---

Make questions test deep understanding of the material.`;
  return callGeminiWithPDF(pdfUri, prompt);
}

export async function extractKeywords(pdfUri: string): Promise<GeminiResponse> {
  const prompt = `Extract the most important keywords, phrases, and concepts from this document. Format as:

## Primary Keywords
[List the 5-10 most important terms]

## Secondary Concepts
[List 10-15 important supporting concepts]

## Technical Terms
[List any specialized technical terminology with brief definitions]

## Key Themes
[List 3-5 overarching themes]`;
  return callGeminiWithPDF(pdfUri, prompt);
}

export async function translateContent(pdfUri: string, targetLanguage: string): Promise<GeminiResponse> {
  const prompt = `Translate the content of this PDF to ${targetLanguage}. Maintain the original formatting, structure, and meaning. Translate all text including headings, body text, and captions.`;
  return callGeminiWithPDF(pdfUri, prompt);
}

export async function chatWithPDF(pdfUri: string, question: string): Promise<GeminiResponse> {
  const prompt = `You are a helpful AI assistant. Answer the following question based on the PDF document provided. If the answer is not in the document, clearly state that. Be accurate, helpful, and cite relevant sections when possible.

Question: ${question}`;
  return callGeminiWithPDF(pdfUri, prompt);
}

export async function rewriteContent(
  pdfUri: string,
  style: 'simple' | 'professional' | 'student'
): Promise<GeminiResponse> {
  const styleMap = {
    simple: 'simple, easy-to-understand language suitable for a general audience. Break down complex terms and use everyday examples.',
    professional: 'formal, professional language suitable for a business or academic audience. Maintain technical accuracy.',
    student: 'student-friendly language with clear explanations, examples, and study tips.',
  };
  const prompt = `Rewrite the content of this PDF document in ${styleMap[style]} Maintain the key information and structure but adapt the language and style.`;
  return callGeminiWithPDF(pdfUri, prompt);
}
