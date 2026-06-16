/**
 * App-wide configuration constants
 */

export const APP_CONFIG = {
  name: 'PDF Genius AI',
  version: '1.0.0',
  // Gemini API - key set by user in Settings
  geminiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
  geminiModel: 'gemini-1.5-flash',
  // Max PDF size for AI (5MB)
  maxPdfSizeForAI: 5 * 1024 * 1024,
  // AI features
  aiFeatures: [
    {
      id: 'chat',
      title: 'Chat with PDF',
      description: 'Ask any question about your document',
      icon: 'chat-bubble-outline',
      gradient: ['#6366F1', '#8B5CF6'],
    },
    {
      id: 'summary',
      title: 'AI Summary',
      description: 'Get a concise summary instantly',
      icon: 'summarize',
      gradient: ['#8B5CF6', '#EC4899'],
    },
    {
      id: 'notes',
      title: 'AI Notes',
      description: 'Generate structured study notes',
      icon: 'edit-note',
      gradient: ['#06B6D4', '#3B82F6'],
    },
    {
      id: 'flashcards',
      title: 'Flashcards',
      description: 'Create study flashcards',
      icon: 'style',
      gradient: ['#10B981', '#06B6D4'],
    },
    {
      id: 'quiz',
      title: 'AI Quiz',
      description: 'Test your knowledge with MCQs',
      icon: 'quiz',
      gradient: ['#F59E0B', '#EF4444'],
    },
    {
      id: 'translate',
      title: 'Translate',
      description: 'Translate PDF to any language',
      icon: 'translate',
      gradient: ['#EF4444', '#F59E0B'],
    },
    {
      id: 'keywords',
      title: 'Keywords',
      description: 'Extract key terms and concepts',
      icon: 'label-outline',
      gradient: ['#6366F1', '#06B6D4'],
    },
    {
      id: 'mindmap',
      title: 'Mind Map',
      description: 'Visual topic relationships',
      icon: 'account-tree',
      gradient: ['#10B981', '#8B5CF6'],
    },
  ],
  // PDF Tools
  pdfTools: [
    { id: 'merge', title: 'Merge PDFs', icon: 'call-merge', description: 'Combine multiple PDFs' },
    { id: 'split', title: 'Split PDF', icon: 'call-split', description: 'Split into multiple files' },
    { id: 'compress', title: 'Compress', icon: 'compress', description: 'Reduce file size' },
    { id: 'rotate', title: 'Rotate Pages', icon: 'rotate-right', description: 'Rotate PDF pages' },
    { id: 'extract', title: 'Extract Pages', icon: 'content-cut', description: 'Extract specific pages' },
    { id: 'reorder', title: 'Reorder Pages', icon: 'swap-vert', description: 'Rearrange pages' },
    { id: 'img-to-pdf', title: 'Image to PDF', icon: 'image', description: 'Convert images to PDF' },
    { id: 'scan', title: 'Scan to PDF', icon: 'document-scanner', description: 'Scan documents' },
  ],
  // Storage keys
  storageKeys: {
    geminiApiKey: 'gemini_api_key',
    theme: 'app_theme',
    readerMode: 'reader_mode',
    fontSize: 'reader_font_size',
  },
};

export const AI_PROMPTS = {
  summary: (context: string) =>
    `You are a professional document analyst. Provide a comprehensive, well-structured summary of this PDF document. Format your response with clear sections: **Overview**, **Key Points**, and **Conclusion**. Be concise but thorough.\n\nDocument content:\n${context}`,

  detailedSummary: (context: string) =>
    `Provide a detailed academic-style summary of this document. Include: **Executive Summary**, **Main Themes**, **Key Arguments**, **Important Data/Statistics**, and **Conclusions**.\n\nDocument:\n${context}`,

  notes: (context: string) =>
    `Convert this PDF into structured study notes. Format as:\n## Main Topics\n- Bullet points for key concepts\n\n## Important Terms\n- Definitions\n\n## Key Takeaways\n- Numbered list\n\nDocument:\n${context}`,

  flashcards: (context: string) =>
    `Generate 10 study flashcards from this document. Format each as:\n**Q:** [Question]\n**A:** [Answer]\n\nMake questions test understanding, not just recall.\n\nDocument:\n${context}`,

  quiz: (context: string) =>
    `Create 5 multiple choice questions (MCQs) from this document. Format:\n\n**Q1:** [Question]\nA) [Option]\nB) [Option]\nC) [Option]\nD) [Option]\n**Answer:** [Letter] - [Brief explanation]\n\nDocument:\n${context}`,

  translate: (context: string, language: string) =>
    `Translate the following document content to ${language}. Maintain formatting and structure.\n\nDocument:\n${context}`,

  keywords: (context: string) =>
    `Extract the most important keywords, phrases, and concepts from this document. Format as:\n## Primary Keywords\n[List]\n## Secondary Concepts\n[List]\n## Technical Terms\n[List]\n\nDocument:\n${context}`,

  simplify: (context: string) =>
    `Rewrite this content in simple, easy-to-understand language suitable for a student. Break down complex terms.\n\nContent:\n${context}`,

  chat: (pdfContext: string, question: string) =>
    `You are an AI assistant that answers questions based ONLY on the provided PDF document. If the answer is not in the document, say so clearly.\n\nDocument Content:\n${pdfContext}\n\nUser Question: ${question}\n\nProvide a helpful, accurate answer based on the document.`,
};
