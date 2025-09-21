import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat, Content, Part, Modality } from "@google/genai";
import { Message, Role, GroundingChunk, ChatHistory, ChatSession } from '../types';

// --- Single AI Instance & Initialization ---
// Initialize the AI client once and reuse it across the application.
// This is more efficient and centralizes API key handling, making debugging easier.
let ai: GoogleGenAI | null = null;
let initializationError: string | null = null;
try {
  // The API key MUST be available in the environment.
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set. Please ensure it's available in your environment.");
  }
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} catch (e) {
  console.error("FATAL: Failed to initialize GoogleGenAI client.", e);
  initializationError = (e instanceof Error) ? e.message : "An unknown error occurred during AI initialization.";
}


interface ImageAttachment {
  mimeType: string;
  data: string; // base64 string without data URI prefix
}

const GUEST_MESSAGE_LIMIT = 5;

const createNewChatSession = (): ChatSession => {
  const newId = `chat-${Date.now()}`;
  return {
    id: newId,
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
  };
};

export const useChat = (currentUser: string | null, lunaVersion: '1.0' | '2.0') => {
  const [chatHistory, setChatHistory] = useState<ChatHistory>({ activeChatId: null, sessions: {} });
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const stopGenerationRef = useRef(false);
  
  const isLoggedIn = !!currentUser;
  const CHAT_DATA_KEY = currentUser ? `luna-chat-data-${currentUser}` : 'luna-chat-data-guest';

  // Load history from localStorage
  useEffect(() => {
    let loadedHistory: ChatHistory = { activeChatId: null, sessions: {} };
    try {
      const saved = localStorage.getItem(CHAT_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sessions && typeof parsed.activeChatId !== 'undefined') {
          loadedHistory = parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }

    if (Object.keys(loadedHistory.sessions).length === 0) {
      const newSession = createNewChatSession();
      loadedHistory.sessions[newSession.id] = newSession;
      loadedHistory.activeChatId = newSession.id;
    }
    
    setChatHistory(loadedHistory);
    
  }, [currentUser, CHAT_DATA_KEY]);

  // Save history to localStorage
  useEffect(() => {
    try {
      if (chatHistory.activeChatId && Object.keys(chatHistory.sessions).length > 0) {
        localStorage.setItem(CHAT_DATA_KEY, JSON.stringify(chatHistory));
      } else {
        localStorage.removeItem(CHAT_DATA_KEY);
      }
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [chatHistory, CHAT_DATA_KEY]);
  
  const activeChat = chatHistory.activeChatId ? chatHistory.sessions[chatHistory.activeChatId] : null;
  const messages = activeChat?.messages || [];

  const initializeChat = useCallback((history: Message[]) => {
    try {
      if (!ai) {
        throw new Error("GoogleGenAI client is not initialized. Check for an API key or other startup errors.");
      }
      
      const chatHistoryForModel: Content[] = history
        .filter(msg => !msg.imageUrl && !msg.groundingChunks) // Only text-based messages for history
        .map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.text }],
        }));

      const systemInstruction = lunaVersion === '2.0'
        ? "You are Luna 2.0, an advanced AI assistant and expert programmer. Your responses should be highly detailed, structured, and nuanced. For any request, break down the solution into clear, logical steps. Use Markdown for formatting, including tables, lists, and multiple code blocks with language identifiers where appropriate, to enhance clarity. When providing code, also provide a thorough explanation of how it works. You are proactive in your assistance, anticipating user needs and offering further suggestions or optimizations."
        : "You are Luna, a friendly and helpful AI assistant.";

      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: chatHistoryForModel,
        config: { systemInstruction },
      });
    } catch (error) {
      console.error("Failed to initialize chat:", error);
    }
  }, [lunaVersion]);

  useEffect(() => {
    if (activeChat) {
      initializeChat(activeChat.messages);
      
      if (!isLoggedIn) {
          const userMessagesCount = activeChat.messages.filter(msg => msg.role === Role.USER).length;
          setIsLocked(userMessagesCount >= GUEST_MESSAGE_LIMIT);
      } else {
          setIsLocked(false);
      }
    }
  }, [activeChat, initializeChat, isLoggedIn]);

  const updateActiveChatMessages = (updater: (prevMessages: Message[]) => Message[]) => {
    if (!chatHistory.activeChatId) return;
    setChatHistory(prev => {
      const activeId = prev.activeChatId!;
      // It's possible for the active chat to be deleted during an async operation.
      // If so, just return the previous state without trying to update a non-existent session.
      if (!prev.sessions[activeId]) {
        return prev;
      }
      const updatedMessages = updater(prev.sessions[activeId].messages);
      return {
        ...prev,
        sessions: {
          ...prev.sessions,
          [activeId]: {
            ...prev.sessions[activeId],
            messages: updatedMessages,
          },
        },
      };
    });
  };

  const generateChatTitle = useCallback(async (chatId: string, firstMessage: string) => {
    try {
      if (!ai) throw new Error("GoogleGenAI client not initialized.");
      
      let cleanMessage = firstMessage;
      const patterns = [
        /^Imagine: "(.*)"$/s,
        /^Create Video: "(.*)"$/s,
        /^Edit Image: "(.*)"$/s,
        /^Search: "(.*)"$/s,
        /^Please provide a clear and concise explanation of the following topic... Topic: "(.*)"$/s,
        /^You are an expert code reviewer... Code:\n```(?:\w*\n)?([\s\S]*?)```$/s
      ];

      for (const pattern of patterns) {
          const match = firstMessage.match(pattern);
          if (match && match[1]) {
              cleanMessage = match[1].trim();
              break;
          }
      }

      const prompt = `Generate a very short, concise title (4-5 words max) for a conversation starting with: "${cleanMessage}"`;
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      const title = response.text.trim().replace(/"/g, '');

      setChatHistory(prev => ({
        ...prev,
        sessions: {
          ...prev.sessions,
          [chatId]: { ...prev.sessions[chatId], title },
        },
      }));
    } catch (error) {
      console.error('Failed to generate title:', error);
    }
  }, []);

  const startNewChat = () => {
    const newSession = createNewChatSession();
    setChatHistory(prev => ({
      ...prev,
      activeChatId: newSession.id,
      sessions: { ...prev.sessions, [newSession.id]: newSession, },
    }));
  };

  const switchChat = (chatId: string) => {
    if (chatHistory.sessions[chatId]) {
      setChatHistory(prev => ({ ...prev, activeChatId: chatId }));
    }
  };

  const deleteChat = (chatId: string) => {
    setChatHistory(prev => {
      const newSessions = { ...prev.sessions };
      delete newSessions[chatId];
      
      let newActiveId = prev.activeChatId;
      if (newActiveId === chatId) {
        const sortedSessions = Object.values(newSessions).sort((a, b) => b.createdAt - a.createdAt);
        newActiveId = sortedSessions.length > 0 ? sortedSessions[0].id : null;
      }

      if (!newActiveId) {
        const newSession = createNewChatSession();
        newSessions[newSession.id] = newSession;
        newActiveId = newSession.id;
      }
      
      return { sessions: newSessions, activeChatId: newActiveId };
    });
  };
  
  const stopGeneration = () => {
    stopGenerationRef.current = true;
  }
  
  const handleGenericError = (error: unknown, action: string) => {
    console.error(`Error during ${action}:`, error);
    const errorMessage = initializationError 
        ? `AI client failed to initialize: ${initializationError}`
        : `Sorry, something went wrong during ${action}. Please check the console for details.`;
    
    updateActiveChatMessages(prev => {
      const newMessages = [...prev];
      const lastMessage = newMessages[newMessages.length - 1];
      if(lastMessage && lastMessage.role === Role.MODEL) {
          lastMessage.text = errorMessage;
          return newMessages;
      }
      return [...prev, { role: Role.MODEL, text: errorMessage }];
    });
  }

  const sendMessage = async (text: string, attachment: ImageAttachment | null = null, isRegeneration = false) => {
    if (initializationError) { handleGenericError(null, "setup"); return; }
    if (!chatRef.current || isLocked || !chatHistory.activeChatId) return;

    const isNewChat = messages.length === 0;
    stopGenerationRef.current = false;
    setIsLoading(true);

    const userMessage: Message = { role: Role.USER, text };
    if (attachment) userMessage.imageUrl = `data:${attachment.mimeType};base64,${attachment.data}`;
    
    if (!isRegeneration) {
        updateActiveChatMessages(prev => [...prev, userMessage, { role: Role.MODEL, text: '' }]);
    } else {
        updateActiveChatMessages(prev => [...prev, { role: Role.MODEL, text: '' }]);
    }
    
    if (isNewChat && chatHistory.activeChatId) {
      generateChatTitle(chatHistory.activeChatId, text);
    }

    try {
      const promptParts: Part[] = [];
      if (text) promptParts.push({ text });
      if (attachment) promptParts.push({ inlineData: attachment });
      
      const responseStream = await chatRef.current.sendMessageStream({ message: promptParts });
      
      let fullResponse = '';
      for await (const chunk of responseStream) {
        if (stopGenerationRef.current) break;
        fullResponse += chunk.text;
        updateActiveChatMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          // Defensive check: only update if the last message is still a model's message.
          // This prevents errors if the user switches chats mid-stream.
          if (lastMessage && lastMessage.role === Role.MODEL) {
            lastMessage.text = fullResponse;
          }
          return newMessages;
        });
      }
    } catch (error) {
      handleGenericError(error, "sending message");
    } finally {
      setIsLoading(false);
      stopGenerationRef.current = false;
    }
  };
  
  const handleAction = async (userText: string, actionFn: () => Promise<Partial<Message>>) => {
    if (initializationError) { handleGenericError(null, "setup"); return; }
    if (isLocked || !chatHistory.activeChatId) return;
    
    const isNewChat = messages.length === 0;
    setIsLoading(true);
    const userMessage: Message = { role: Role.USER, text: userText };
    updateActiveChatMessages(prev => [...prev, userMessage, { role: Role.MODEL, text: '' }]);

    if (isNewChat) {
      generateChatTitle(chatHistory.activeChatId, userText);
    }

    try {
      const result = await actionFn();
      const modelMessage: Message = { role: Role.MODEL, text: result.text || '', ...result };
      updateActiveChatMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        // Defensive check to prevent updating the wrong message if chat is switched.
        if (lastMessage && lastMessage.role === Role.MODEL) {
            newMessages[newMessages.length - 1] = modelMessage;
        }
        return newMessages;
      });
    } catch (error) {
      handleGenericError(error, userText);
    } finally {
      setIsLoading(false);
    }
  };
  
  const regenerateLastResponse = useCallback(() => {
    if (isLoading || !activeChat) return;

    let lastUserMessageIndex = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === Role.USER) {
        lastUserMessageIndex = i;
        break;
      }
    }
    
    if (lastUserMessageIndex === -1) return;

    const lastUserMessage = messages[lastUserMessageIndex];
    
    const historyToRestore = messages.slice(0, lastUserMessageIndex);
    updateActiveChatMessages(() => historyToRestore);
    
    const attachment = lastUserMessage.imageUrl ? { 
        mimeType: lastUserMessage.imageUrl.split(';')[0].split(':')[1], 
        data: lastUserMessage.imageUrl.split(',')[1] 
    } : null;
    sendMessage(lastUserMessage.text, attachment, true);
    
  }, [messages, isLoading, activeChat]);


  const generateImage = (prompt: string) => handleAction(`Imagine: "${prompt}"`, async () => {
      if (!ai) throw new Error("AI client not initialized");
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001', prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });
      return { imageUrl: `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}` };
  });
  
  const editImage = (prompt: string, attachment: ImageAttachment) => handleAction(`Edit Image: "${prompt}"`, async () => {
      if (!ai) throw new Error("AI client not initialized");
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: { parts: [{ inlineData: attachment }, { text: prompt }] },
          config: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
      });

      const imagePart = response.candidates?.[0].content.parts.find(p => p.inlineData);
      const textPart = response.candidates?.[0].content.parts.find(p => p.text);
      if (!imagePart?.inlineData) throw new Error("API did not return an image.");
      
      return { 
        text: textPart?.text || "Here is the edited image:",
        imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
      };
  });

  const generateVideo = (prompt: string) => handleAction(`Create Video: "${prompt}"`, async () => {
    if (!ai || !process.env.API_KEY) throw new Error("AI client or API key not available.");

    updateActiveChatMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === Role.MODEL) {
            lastMessage.text = "📹 Generating video... This can take a few minutes. I'll update this message when it's ready.";
        }
        return newMessages;
    });

    let operation = await ai.models.generateVideos({ model: 'veo-2.0-generate-001', prompt });
    
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation });
    }
    
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed to produce a link.");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    return { text: `Here is your generated video for: "${prompt}"`, videoUrl };
  });

  const searchQuery = (text: string) => handleAction(`Search: "${text}"`, async () => {
      if (!ai) throw new Error("AI client not initialized");
      const response = await ai.models.generateContent({
         model: "gemini-2.5-flash", contents: text, config: { tools: [{googleSearch: {}}] },
      });
      return { text: response.text, groundingChunks: (response.candidates?.[0]?.groundingMetadata?.groundingChunks || []) as GroundingChunk[] };
  });

  const studyTopic = (topic: string) => {
    const studyPrompt = `Please provide a clear and concise explanation of the following topic... Topic: "${topic}"`;
    sendMessage(studyPrompt);
  };

  const codeAssistant = (code: string) => {
    const codePrompt = `You are an expert code reviewer... Code:\n\`\`\`\n${code}\n\`\`\``;
    sendMessage(codePrompt);
  };

  const debugError = useCallback(async (error: Error, errorInfo: React.ErrorInfo) => {
    // Force switch to Luna 2.0 for this expert task
    if (lunaVersion !== '2.0') {
      console.warn("Switching to Luna 2.0 for error debugging.");
    }
    const newSession = createNewChatSession();
    newSession.title = "Error Debug Session";
    
    setChatHistory(prev => ({
      ...prev,
      activeChatId: newSession.id,
      sessions: { ...prev.sessions, [newSession.id]: newSession },
    }));

    // This state update will trigger the useEffect to re-initialize the chat with Luna 2.0
    // We need to wait for the next render cycle for this to take effect.
    setTimeout(() => {
        const debugPrompt = `
You are Luna 2.0, an expert software engineer with deep knowledge of your own React and TypeScript source code. An unexpected runtime error has occurred within the application. Your task is to analyze the following error details and provide a diagnosis and a potential solution.

**Error Details:**
- **Message:** ${error.message}
- **Stack Trace:**
\`\`\`
${error.stack}
\`\`\`

**React Component Stack:**
\`\`\`
${errorInfo.componentStack}
\`\`\`

Based on this information, please provide:
1.  **A likely cause of the error** in simple terms.
2.  **A suggested code fix** or the area of the code to investigate.
3.  **Advice for the user** on how to proceed.
      `;
      sendMessage(debugPrompt);
    }, 0);
  }, [lunaVersion]);


  return {
    messages, chatHistory,
    activeChatId: chatHistory.activeChatId,
    sendMessage, isLoading,
    startNewChat, switchChat, deleteChat,
    generateImage, editImage, generateVideo,
    searchQuery, studyTopic, codeAssistant,
    regenerateLastResponse, stopGeneration,
    isLocked, debugError
  };
};