"use client";

import { useState, useEffect, useRef } from "react";
import { X, Menu } from "lucide-react";
import Image from "next/image";
import { SlimeChatUserList } from "./slime-chat-user-list";

interface Message {
  id: string;
  username: string;
  content: string;
  timestamp: string;
  userColor: string;
}

interface SlimeChatWindowProps {
  onClose: () => void;
  isMobile: boolean;
}

// Generate a consistent user ID for this session
const getUserId = () => {
  if (typeof window === 'undefined') return 'anonymous';

  let userId = localStorage.getItem('slime_chat_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('slime_chat_user_id', userId);
  }
  return userId;
};

// Get or set username
const getUsername = () => {
  if (typeof window === 'undefined') return 'Guest';

  let username = localStorage.getItem('slime_chat_username');
  if (!username) {
    username = `Guest${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('slime_chat_username', username);
  }
  return username;
};

export function SlimeChatWindow({ onClose, isMobile }: SlimeChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showUserList, setShowUserList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastFetchTime = useRef<string | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const guildId = 'default'; // Use default guild for now
  const userId = getUserId();
  const username = getUsername();

  // Fetch messages from backend
  const fetchMessages = async (isInitial = false) => {
    try {
      const params = new URLSearchParams({ guildId, limit: '50' });
      if (!isInitial && lastFetchTime.current) {
        params.append('since', lastFetchTime.current);
      }

      const response = await fetch(`/api/chat/messages?${params}`);
      if (!response.ok) throw new Error('Failed to fetch messages');

      const data = await response.json();

      if (isInitial) {
        setMessages(data.messages || []);
      } else if (data.messages && data.messages.length > 0) {
        setMessages(prev => [...prev, ...data.messages]);
      }

      // Update last fetch time
      if (data.messages && data.messages.length > 0) {
        lastFetchTime.current = data.messages[data.messages.length - 1].timestamp;
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      if (isInitial) {
        setError('Failed to load messages');
      }
    }
  };

  // Load messages on mount and set up polling
  useEffect(() => {
    fetchMessages(true);

    // Poll for new messages every 2 seconds
    pollingInterval.current = setInterval(() => {
      fetchMessages(false);
    }, 2000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guildId,
          userId,
          username,
          content: inputValue.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      // Add the sent message immediately to the UI
      setMessages(prev => [...prev, data.message]);
      lastFetchTime.current = data.message.timestamp;
      setInputValue("");
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div 
      className={`fixed bottom-0 ${
        isMobile ? 'left-[10%] right-[10%]' : 'right-4 w-[35%]'
      } bg-zinc-900 border-2 border-emerald-500 rounded-t-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] z-50`}
      style={{ height: isMobile ? '70vh' : '500px' }}
    >
      {/* Header */}
      <div className="bg-zinc-800 border-b border-emerald-500/30 px-4 py-3 flex items-center justify-between rounded-t-lg">
        <div className="flex items-center gap-3">
          {/* Slimy.ai Logo */}
          <div className="relative w-6 h-6">
            <Image
              src="/images/logo.svg"
              alt="slimy.ai"
              fill
              className="object-contain"
            />
          </div>
          
          {/* slime.chat Text */}
          <span className="text-emerald-500 font-semibold text-lg">
            slime.chat
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Hamburger Menu for User List */}
          <button
            onClick={() => setShowUserList(!showUserList)}
            className="p-2 hover:bg-zinc-700 rounded transition-colors"
            aria-label="Toggle user list"
          >
            <Menu className="w-5 h-5 text-emerald-500" />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-700 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-emerald-500" />
          </button>
        </div>
      </div>

      {/* User List Dropdown */}
      {showUserList && (
        <SlimeChatUserList onClose={() => setShowUserList(false)} />
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: 'calc(100% - 120px)' }}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm">
            {error}
          </div>
        )}

        {messages.length === 0 && !error && (
          <div className="text-center text-gray-500 text-sm mt-8">
            No messages yet. Be the first to say hello!
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3">
            {/* User Avatar */}
            <div
              className="w-8 h-8 rounded flex-shrink-0"
              style={{ backgroundColor: message.userColor }}
            />

            {/* Message Content */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span
                  className="font-semibold text-sm"
                  style={{ color: message.userColor }}
                >
                  {message.username}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-white text-sm mt-1">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-emerald-500/30 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 bg-zinc-800 text-white px-4 py-2 rounded-lg border border-emerald-500/30 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-gray-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)] hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
