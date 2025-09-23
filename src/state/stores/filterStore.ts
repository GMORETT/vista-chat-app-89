import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ConversationFilters, AssignType } from '../../models';

interface FilterState {
  activeTab: AssignType;
  filters: ConversationFilters;
  searchQuery: string;

  // Actions
  setActiveTab: (tab: AssignType) => void;
  setFilters: (filters: Partial<ConversationFilters>) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

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

export const useFilterStore = create<FilterState>()(
  persist(
    (set, get) => ({
      activeTab: 'all',
      filters: defaultFilters,
      searchQuery: '',

      setActiveTab: (tab) => {
        set({ 
          activeTab: tab,
          filters: { ...get().filters, assignee_type: tab, page: 1 }
        });
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters, page: 1 },
        }));
      },

      setSearchQuery: (query) => {
        set({ 
          searchQuery: query,
          filters: { ...get().filters, q: query || undefined, page: 1 },
        });
      },

      resetFilters: () => {
        set({ 
          filters: { ...defaultFilters, assignee_type: get().activeTab },
          searchQuery: ''
        });
      },
    }),
    {
      name: 'filter-store',
      partialize: (state) => ({ filters: state.filters, activeTab: state.activeTab }),
    }
  )
);