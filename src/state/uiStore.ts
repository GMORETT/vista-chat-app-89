import { create } from 'zustand';

interface UiState {
  // Layout state
  sidebarCollapsed: boolean;
  isMobile: boolean;
  activePane: 'sidebar' | 'list' | 'conversation'; // For mobile navigation
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Actions
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setIsMobile: (mobile: boolean) => void;
  setActivePane: (pane: 'sidebar' | 'list' | 'conversation') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  // Initial state
  sidebarCollapsed: false,
  isMobile: false,
  activePane: 'list',
  theme: 'system',
  
  // Actions
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  
  setActivePane: (pane) => set({ activePane: pane }),
  
  setTheme: (theme) => set({ theme }),
}));