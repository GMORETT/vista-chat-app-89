import { create } from 'zustand';

interface UiState {
  // Layout state
  isMobile: boolean;
  activePane: 'list' | 'conversation'; // For mobile navigation
  isExpanded: boolean; // For expanded layout toggle
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  setIsMobile: (mobile: boolean) => void;
  setActivePane: (pane: 'list' | 'conversation') => void;
  setIsExpanded: (expanded: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  // Initial state
  isMobile: false,
  activePane: 'list',
  isExpanded: false,
  theme: 'system',
  
  // Actions
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  
  setActivePane: (pane) => set({ activePane: pane }),
  
  setIsExpanded: (expanded) => set({ isExpanded: expanded }),
  
  setTheme: (theme) => set({ theme }),
}));