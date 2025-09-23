import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MessageState {
  drafts: Record<number, string>;

  // Actions
  setDraft: (conversationId: number, draft: string) => void;
  getDraft: (conversationId: number) => string;
  clearDraft: (conversationId: number) => void;
}

export const useMessageStore = create<MessageState>()(
  persist(
    (set, get) => ({
      drafts: {},

      setDraft: (conversationId, draft) => {
        set((state) => ({
          drafts: { ...state.drafts, [conversationId]: draft }
        }));
      },

      getDraft: (conversationId) => {
        return get().drafts[conversationId] || '';
      },

      clearDraft: (conversationId) => {
        set((state) => {
          const { [conversationId]: removed, ...restDrafts } = state.drafts;
          return { drafts: restDrafts };
        });
      },
    }),
    {
      name: 'message-store',
      partialize: (state) => ({ drafts: state.drafts }),
    }
  )
);