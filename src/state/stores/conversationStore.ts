import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Conversation, ConversationMeta, Message } from '../../models';

interface ConversationState {
  conversations: Conversation[];
  meta: ConversationMeta | null;
  selectedConversationId: number | null;
  selectedConversation: Conversation | null;
  isLoading: boolean;
  error: string | null;
  replyToMessage: Message | null;
  markAsReadCallback: ((conversationId: number) => void) | null;

  // Actions
  setConversations: (conversations: Conversation[]) => void;
  updateConversation: (conversation: Conversation) => void;
  setSelectedConversationId: (id: number | null) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  setMeta: (meta: ConversationMeta) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setReplyToMessage: (message: Message | null) => void;
  clearSelection: () => void;
  reset: () => void;
  setMarkAsReadCallback: (callback: ((conversationId: number) => void) | null) => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      conversations: [],
      meta: null,
      selectedConversationId: null,
      selectedConversation: null,
      isLoading: false,
      error: null,
      replyToMessage: null,
      markAsReadCallback: null,

      setConversations: (conversations) => set({ conversations }),
      
      updateConversation: (updatedConversation) => set((state) => ({
        conversations: state.conversations.map(conv => 
          conv.id === updatedConversation.id ? updatedConversation : conv
        ),
        selectedConversation: state.selectedConversationId === updatedConversation.id 
          ? updatedConversation
          : state.selectedConversation,
      })),

      setSelectedConversationId: (id) => {
        const currentState = get();
        
        // Only proceed if the ID is actually changing
        if (currentState.selectedConversationId === id) {
          return;
        }
        
        let conversation = null;
        if (id) {
          conversation = currentState.conversations.find(c => c.id === id) || null;
          
          // Mark conversation as read when selected (async, don't wait)
          const { markAsReadCallback } = currentState;
          if (markAsReadCallback) {
            // Use setTimeout to avoid blocking the state update
            setTimeout(() => markAsReadCallback(id), 0);
          }
        }
        
        set({ 
          selectedConversationId: id,
          selectedConversation: conversation,
        });
      },

      setSelectedConversation: (conversation) => set({ 
        selectedConversation: conversation,
        selectedConversationId: conversation?.id || null,
      }),

      setMeta: (meta) => set({ meta }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setReplyToMessage: (message) => set({ replyToMessage: message }),
      setMarkAsReadCallback: (callback) => set({ markAsReadCallback: callback }),

      clearSelection: () => set({
        selectedConversationId: null,
        selectedConversation: null,
        replyToMessage: null,
      }),

      reset: () => set({
        conversations: [],
        meta: null,
        selectedConversationId: null,
        selectedConversation: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'conversation-store',
      partialize: () => ({}),
      version: 2,
      migrate: () => ({}),
    }
  )
);