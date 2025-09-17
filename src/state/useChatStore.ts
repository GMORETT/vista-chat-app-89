import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ConversationFilters, 
  Conversation, 
  Contact, 
  AssignType, 
  StatusType, 
  SortBy,
  Message 
} from '../models';

// Centralized chat state interface
interface ChatState {
  // Active tab
  activeTab: AssignType;
  
  // Filters state
  filters: ConversationFilters;
  searchQuery: string;
  
  // Selected entities
  selectedConversationId: number | null;
  selectedConversation: Conversation | null;
  selectedContact: Contact | null;
  
  // Draft messages (by conversation ID)
  drafts: Record<number, string>;
  
  // Theme
  themeMode: 'light' | 'dark' | 'system';
  
  // UI state
  sidebarCollapsed: boolean;
  isMobile: boolean;
  activePane: 'sidebar' | 'list' | 'conversation';
  
  // Actions
  setActiveTab: (tab: AssignType) => void;
  setFilters: (filters: Partial<ConversationFilters>) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  
  setSelectedConversationId: (id: number | null) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  setSelectedContact: (contact: Contact | null) => void;
  
  setDraft: (conversationId: number, draft: string) => void;
  getDraft: (conversationId: number) => string;
  clearDraft: (conversationId: number) => void;
  
  setThemeMode: (theme: 'light' | 'dark' | 'system') => void;
  
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setIsMobile: (mobile: boolean) => void;
  setActivePane: (pane: 'sidebar' | 'list' | 'conversation') => void;
  
  reset: () => void;
}

// Default filters
const defaultFilters: ConversationFilters = {
  assignee_type: 'all',
  status: 'open',
  inbox_id: undefined,
  team_id: undefined,
  labels: [],
  sort_by: 'last_activity_at_desc',
  search: undefined,
};

// Persistent fields
const persistedFields = ['themeMode', 'sidebarCollapsed', 'filters', 'drafts'];

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeTab: 'all',
      filters: defaultFilters,
      searchQuery: '',
      
      selectedConversationId: null,
      selectedConversation: null,
      selectedContact: null,
      
      drafts: {},
      
      themeMode: 'system',
      
      sidebarCollapsed: false,
      isMobile: false,
      activePane: 'list',
      
      // Actions
      setActiveTab: (tab) => {
        set({ 
          activeTab: tab,
          filters: { ...get().filters, assignee_type: tab }
        });
      },
      
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters }
        }));
      },
      
      setSearchQuery: (query) => {
        set({ 
          searchQuery: query,
          filters: { ...get().filters, search: query || undefined }
        });
      },
      
      resetFilters: () => {
        set({ 
          filters: { ...defaultFilters, assignee_type: get().activeTab },
          searchQuery: ''
        });
      },
      
      setSelectedConversationId: (id) => {
        set({ selectedConversationId: id });
      },
      
      setSelectedConversation: (conversation) => {
        set({ 
          selectedConversation: conversation,
          selectedConversationId: conversation?.id || null,
          selectedContact: conversation?.meta?.sender || null
        });
      },
      
      setSelectedContact: (contact) => {
        set({ selectedContact: contact });
      },
      
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
      
      setThemeMode: (theme) => {
        set({ themeMode: theme });
      },
      
      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },
      
      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },
      
      setIsMobile: (mobile) => {
        set({ isMobile: mobile });
      },
      
      setActivePane: (pane) => {
        set({ activePane: pane });
      },
      
      reset: () => {
        set({
          activeTab: 'all',
          filters: defaultFilters,
          searchQuery: '',
          selectedConversationId: null,
          selectedConversation: null,
          selectedContact: null,
          activePane: 'list',
        });
      },
    }),
    {
      name: 'chat-store',
      partialize: (state) =>
        Object.fromEntries(
          persistedFields.map(field => [field, state[field as keyof ChatState]])
        ),
    }
  )
);