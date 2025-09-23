import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ConversationFilters, 
  Conversation, 
  Contact, 
  AssignType, 
  StatusType, 
  SortBy,
  Message,
  ConversationMeta 
} from '../models';
import { getConversations } from '../data/mockDataLazy';

// Centralized chat state interface
interface ChatState {
  // Data
  conversations: Conversation[];
  meta: ConversationMeta | null;
  
  // Active tab
  activeTab: AssignType;
  
  // Filters state
  filters: ConversationFilters;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  
  // Selected entities
  selectedConversationId: number | null;
  selectedConversation: Conversation | null;
  selectedContact: Contact | null;
  
  // Pagination
  currentPage: number;
  hasNextPage: boolean;
  
  // Draft messages (by conversation ID)
  drafts: Record<number, string>;
  
  // Theme
  themeMode: 'light' | 'dark' | 'system';
  
  // UI state
  sidebarCollapsed: boolean;
  isMobile: boolean;
  activePane: 'sidebar' | 'list' | 'conversation';
  
  // Account selection for super admin
  selectedAccountId: number | null;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  removeConversation: (id: number) => void;
  setMeta: (meta: ConversationMeta) => void;
  
  setActiveTab: (tab: AssignType) => void;
  setFilters: (filters: Partial<ConversationFilters>) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
  
  setSelectedConversationId: (id: number | null) => void;
  setSelectedConversation: (conversation: Conversation | null) => void;
  setSelectedConversationData: (conversation: Conversation | null) => void;
  setSelectedContact: (contact: Contact | null) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  
  setDraft: (conversationId: number, draft: string) => void;
  getDraft: (conversationId: number) => string;
  clearDraft: (conversationId: number) => void;
  
  setThemeMode: (theme: 'light' | 'dark' | 'system') => void;
  
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setIsMobile: (mobile: boolean) => void;
  setActivePane: (pane: 'sidebar' | 'list' | 'conversation') => void;
  
  setSelectedAccountId: (accountId: number | null) => void;
  clearDependentFilters: () => void;
  
  reset: () => void;
}

// Default filters
const defaultFilters: ConversationFilters = {
  assignee_type: 'all',
  status: 'all',
  inbox_id: undefined,
  team_id: undefined,
  labels: [],
  sort_by: 'last_activity_at_desc',
  q: undefined,
  updated_within: undefined,
  page: 1,
};

const defaultMeta: ConversationMeta = {
  mine_count: 0,
  unassigned_count: 0,
  assigned_count: 0,
  all_count: 0,
};

// Persistent fields
const persistedFields = ['themeMode', 'sidebarCollapsed', 'filters', 'drafts'];

// Migration function to fix status filter issue
const migrateStore = (persistedState: any, version: number) => {
  if (version === 0) {
    // Force status filter to 'all' for existing users
    if (persistedState.filters?.status === 'open') {
      persistedState.filters.status = 'all';
    }
  }
  return persistedState;
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: getConversations(30),
      meta: defaultMeta,
      
      activeTab: 'all',
      filters: defaultFilters,
      searchQuery: '',
      isLoading: false,
      error: null,
      
      selectedConversationId: null,
      selectedConversation: null,
      selectedContact: null,
      
      currentPage: 1,
      hasNextPage: false,
      
      drafts: {},
      
      themeMode: 'system',
      
      sidebarCollapsed: false,
      isMobile: false,
      activePane: 'list',
      selectedAccountId: null,
      
      // Actions
      setConversations: (conversations) => set({ conversations }),
      
      addConversation: (conversation) => set((state) => ({
        conversations: [conversation, ...state.conversations],
      })),
      
      updateConversation: (updatedConversation) => set((state) => ({
        conversations: state.conversations.map(conv => 
          conv.id === updatedConversation.id ? updatedConversation : conv
        ),
        selectedConversation: state.selectedConversationId === updatedConversation.id 
          ? updatedConversation
          : state.selectedConversation,
      })),
      
      removeConversation: (id) => set((state) => ({
        conversations: state.conversations.filter(conv => conv.id !== id),
        selectedConversationId: state.selectedConversationId === id ? null : state.selectedConversationId,
        selectedConversation: state.selectedConversationId === id ? null : state.selectedConversation,
      })),
      
      setMeta: (meta) => set({ meta }),
      
      setActiveTab: (tab) => {
        set({ 
          activeTab: tab,
          filters: { ...get().filters, assignee_type: tab }
        });
      },
      
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters, page: 1 },
          currentPage: 1,
        }));
      },
      
      setSearchQuery: (query) => {
        set({ 
          searchQuery: query,
          filters: { ...get().filters, q: query || undefined, page: 1 },
          currentPage: 1,
        });
      },
      
      resetFilters: () => {
        set({ 
          filters: { ...defaultFilters, assignee_type: get().activeTab },
          searchQuery: ''
        });
      },
      
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
      
      setSelectedConversation: (conversation) => {
        set({ 
          selectedConversation: conversation,
          selectedConversationId: conversation?.id || null,
          selectedContact: conversation?.meta?.sender || null
        });
      },
      
      setSelectedConversationData: (conversation) => set({ selectedConversation: conversation }),
      
      setSelectedContact: (contact) => {
        set({ selectedContact: contact });
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      
      setCurrentPage: (page) => set((state) => ({ 
        currentPage: page,
        filters: { ...state.filters, page },
      })),
      setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
      
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
      
      setSelectedAccountId: (accountId) => {
        set({ selectedAccountId: accountId });
      },
      
      clearDependentFilters: () => {
        set((state) => ({
          filters: {
            ...state.filters,
            inbox_id: undefined,
            assignee_type: 'all',
            team_id: undefined,
          }
        }));
      },
      
      reset: () => {
        set({
          conversations: getConversations(30),
          meta: defaultMeta,
          activeTab: 'all',
          filters: defaultFilters,
          searchQuery: '',
          isLoading: false,
          error: null,
          selectedConversationId: null,
          selectedConversation: null,
          selectedContact: null,
          currentPage: 1,
          hasNextPage: false,
          activePane: 'list',
        });
      },
    }),
    {
      name: 'chat-store',
      version: 1,
      migrate: migrateStore,
      partialize: (state) =>
        Object.fromEntries(
          persistedFields.map(field => [field, state[field as keyof ChatState]])
        ),
    }
  )
);