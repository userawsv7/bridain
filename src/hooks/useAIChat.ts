import { useState, useCallback } from 'react';
import { Message, ConversationState, Skill, ConversationMode, ChatRequest, ChatResponse } from '../types/bridain';

interface UseAIChatOptions {
  initialMode?: ConversationMode;
  initialSkill?: Skill | null;
}

interface UseAIChatReturn extends ConversationState {
  sendMessage: (message: string, context?: string) => Promise<void>;
  setSkill: (skill: Skill | string | null) => void;
  setMode: (mode: ConversationMode) => void;
  addMessage: (message: Omit<Message, 'id'>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  updateScore: (isCorrect: boolean) => void;
}

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const { initialMode = 'chat', initialSkill = null } = options;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hi! I'm your AI Learning Coach. How can I help you today?",
      isUser: false,
      type: 'chat'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | string | null>(initialSkill);
  const [mode, setMode] = useState<ConversationMode>(initialMode);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const addMessage = useCallback((message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 0,
        text: "Hi! I'm your AI Learning Coach. How can I help you today?",
        isUser: false,
        type: 'chat'
      }
    ]);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const updateScore = useCallback((isCorrect: boolean) => {
    setAnswered(prev => prev + 1);
    if (isCorrect) {
      setScore(prev => prev + 10);
    }
  }, []);

  const setSkill = useCallback((skill: Skill | string | null) => {
    setSelectedSkill(skill);
  }, []);

  const sendMessage = useCallback(async (messageText: string, context?: string) => {
    if (!messageText.trim()) return;

    const userMessage: Omit<Message, 'id'> = {
      text: messageText,
      isUser: true,
      type: 'chat'
    };
    addMessage(userMessage);
    setLoading(true);

    try {
      const requestBody: ChatRequest = {
        message: messageText,
        context: context || `Expert help for ${typeof selectedSkill === 'object' ? selectedSkill?.name : selectedSkill || 'technology'}`,
        skill: typeof selectedSkill === 'object' ? selectedSkill?.name : selectedSkill || undefined,
        mode: mode
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data: ChatResponse = await response.json();
        const aiMessage: Omit<Message, 'id'> = {
          text: data.response,
          isUser: false,
          type: 'chat',
          emoji: data.emoji
        };
        addMessage(aiMessage);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      const errorMessage: Omit<Message, 'id'> = {
        text: "I apologize, but I'm having trouble connecting. Please try again.",
        isUser: false,
        type: 'chat'
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedSkill, mode, addMessage, setLoading]);

  return {
    messages,
    isLoading,
    isSpeaking,
    isListening,
    isMuted,
    selectedSkill,
    mode,
    score,
    answered,
    sendMessage,
    setSkill,
    setMode,
    addMessage,
    clearMessages,
    setLoading,
    updateScore
  };
}