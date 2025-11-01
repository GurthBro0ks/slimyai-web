'use client';

import { useState, useCallback, useEffect } from 'react';
import { Message, ChatSession } from '@/types/chat';
import { PersonalityMode } from '@/lib/personality-modes';

const STORAGE_KEY = 'slime-chat-session';

export function useChat() {
  const [session, setSession] = useState<ChatSession>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved session:', e);
        }
      }
    }
    
    // Default session
    return {
      id: `session_${Date.now()}`,
      messages: [],
      currentMode: 'helpful' as PersonalityMode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage whenever session changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [session]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content,
      timestamp: Date.now(),
      personalityMode: session.currentMode,
    };

    setSession(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      updatedAt: Date.now(),
    }));

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          personalityMode: session.currentMode,
          conversationHistory: session.messages,
        }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Add assistant message
      setSession(prev => ({
        ...prev,
        messages: [...prev.messages, data.message],
        updatedAt: Date.now(),
      }));
    } catch (err: any) {
      console.error('Send message error:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [session.currentMode, session.messages]);

  const setPersonalityMode = useCallback((mode: PersonalityMode) => {
    setSession(prev => ({
      ...prev,
      currentMode: mode,
      updatedAt: Date.now(),
    }));
  }, []);

  const clearConversation = useCallback(() => {
    setSession({
      id: `session_${Date.now()}`,
      messages: [],
      currentMode: session.currentMode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    setError(null);
  }, [session.currentMode]);

  return {
    messages: session.messages,
    currentMode: session.currentMode,
    isLoading,
    error,
    sendMessage,
    setPersonalityMode,
    clearConversation,
  };
}
