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
        let conversation = null;
        if (id) {
          conversation = get().conversations.find(c => c.id === id) || null;
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