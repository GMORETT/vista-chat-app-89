import { create } from 'zustand';

interface UiState {
  // Layout state
  isMobile: boolean;
  activePane: 'list' | 'conversation'; // For mobile navigation
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  setIsMobile: (mobile: boolean) => void;
  setActivePane: (pane: 'list' | 'conversation') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  // Initial state
  isMobile: false,
  activePane: 'list',
  theme: 'system',
  
  // Actions
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  
  setActivePane: (pane) => set({ activePane: pane }),
  
  setTheme: (theme) => set({ theme }),
}));