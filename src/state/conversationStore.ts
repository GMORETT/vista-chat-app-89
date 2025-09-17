import { create } from 'zustand';
import { 
  Conversation, 
  ConversationQuery, 
  ConversationMeta, 
  AssignType, 
  StatusType,
  SortBy 
} from '../models';

interface ConversationFilters extends ConversationQuery {
  assignee_type: AssignType;
  status: StatusType;
  sort_by: SortBy;
}

interface ConversationState {
  // Data
  conversations: Conversation[];
  meta: ConversationMeta | null;
  selectedConversationId: number | null;
  selectedConversation: Conversation | null;
  
  // Filters & UI state
  filters: ConversationFilters;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  hasNextPage: boolean;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversation: Conversation) => void;
  removeConversation: (id: number) => void;
  
  setMeta: (meta: ConversationMeta) => void;
  
  setSelectedConversation: (id: number | null) => void;
  setSelectedConversationData: (conversation: Conversation | null) => void;
  
  setFilters: (filters: Partial<ConversationFilters>) => void;
  setSearchQuery: (query: string) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  setCurrentPage: (page: number) => void;
  setHasNextPage: (hasNext: boolean) => void;
  
  // Reset
  reset: () => void;
}

const defaultFilters: ConversationFilters = {
  assignee_type: 'all',
  status: 'open',
  sort_by: 'last_activity_at_desc',
  page: 1,
};

const defaultMeta: ConversationMeta = {
  mine_count: 0,
  unassigned_count: 0,
  assigned_count: 0,
  all_count: 0,
};

export const useConversationStore = create<ConversationState>((set, get) => ({
  // Initial state
  conversations: [],
  meta: defaultMeta,
  selectedConversationId: null,
  selectedConversation: null,
  
  filters: defaultFilters,
  searchQuery: '',
  isLoading: false,
  error: null,
  
  currentPage: 1,
  hasNextPage: false,
  
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
  
  setSelectedConversation: (id) => {
    const conversation = id ? get().conversations.find(c => c.id === id) || null : null;
    set({ 
      selectedConversationId: id,
      selectedConversation: conversation,
    });
  },
  
  setSelectedConversationData: (conversation) => set({ selectedConversation: conversation }),
  
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters, page: 1 }, // Reset page when filters change
    currentPage: 1,
  })),
  
  setSearchQuery: (query) => set({ 
    searchQuery: query,
    filters: { ...get().filters, q: query, page: 1 },
    currentPage: 1,
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  setCurrentPage: (page) => set((state) => ({ 
    currentPage: page,
    filters: { ...state.filters, page },
  })),
  setHasNextPage: (hasNext) => set({ hasNextPage: hasNext }),
  
  reset: () => set({
    conversations: [],
    meta: defaultMeta,
    selectedConversationId: null,
    selectedConversation: null,
    filters: defaultFilters,
    searchQuery: '',
    isLoading: false,
    error: null,
    currentPage: 1,
    hasNextPage: false,
  }),
}));