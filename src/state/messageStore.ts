import { create } from 'zustand';
import { Message } from '../models';

interface MessageState {
  // Data
  messages: Message[];
  
  // UI state
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  // Typing indicators
  typingUsers: string[];
  
  // Actions
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (message: Message) => void;
  removeMessage: (id: number) => void;
  prependMessages: (messages: Message[]) => void; // For pagination
  
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setError: (error: string | null) => void;
  
  setTypingUsers: (users: string[]) => void;
  addTypingUser: (user: string) => void;
  removeTypingUser: (user: string) => void;
  
  // Reset
  reset: () => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  // Initial state
  messages: [],
  
  isLoading: false,
  isSending: false,
  error: null,
  
  typingUsers: [],
  
  // Actions
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),
  
  updateMessage: (updatedMessage) => set((state) => ({
    messages: state.messages.map(msg => 
      msg.id === updatedMessage.id ? updatedMessage : msg
    ),
  })),
  
  removeMessage: (id) => set((state) => ({
    messages: state.messages.filter(msg => msg.id !== id),
  })),
  
  prependMessages: (newMessages) => set((state) => ({
    messages: [...newMessages, ...state.messages],
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setSending: (sending) => set({ isSending: sending }),
  setError: (error) => set({ error }),
  
  setTypingUsers: (users) => set({ typingUsers: users }),
  
  addTypingUser: (user) => set((state) => ({
    typingUsers: state.typingUsers.includes(user) 
      ? state.typingUsers 
      : [...state.typingUsers, user],
  })),
  
  removeTypingUser: (user) => set((state) => ({
    typingUsers: state.typingUsers.filter(u => u !== user),
  })),
  
  reset: () => set({
    messages: [],
    isLoading: false,
    isSending: false,
    error: null,
    typingUsers: [],
  }),
  
  clearMessages: () => set({ messages: [] }),
}));