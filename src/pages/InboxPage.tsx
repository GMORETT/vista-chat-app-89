import React, { useEffect } from 'react';
import { useUiStore } from '../state/uiStore';
import { ConversationFilters } from '../components/ConversationFilters';
import { TabsCounts } from '../components/TabsCounts';
import { ConversationList } from '../components/ConversationList';
import { MessageList } from '../components/ChatWindow/MessageList';
import { Composer } from '../components/ChatWindow/Composer';
import { ActionsBar } from '../components/ChatWindow/ActionsBar';
import { Menu, X } from 'lucide-react';
import { Button } from '../components/ui/button';

export const InboxPage: React.FC = () => {
  const { 
    sidebarCollapsed, 
    isMobile, 
    activePane, 
    setSidebarCollapsed, 
    setIsMobile, 
    setActivePane 
  } = useUiStore();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      // Auto-collapse sidebar on medium screens
      if (width >= 1024 && width < 1280) {
        setSidebarCollapsed(true);
      } else if (width >= 1280) {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile, setSidebarCollapsed]);

  // Mobile navigation
  const showMobilePane = (pane: 'sidebar' | 'list' | 'conversation') => {
    setActivePane(pane);
  };

  return (
    <div className="flex h-screen bg-bg">
      {/* Sidebar */}
      <div 
        className={`
          ${isMobile 
            ? activePane === 'sidebar' ? 'w-full' : 'hidden'
            : sidebarCollapsed ? 'w-0' : 'w-[280px]'
          } 
          transition-all duration-300 border-r border-border bg-card flex-shrink-0 overflow-hidden
        `}
      >
        {(!isMobile || activePane === 'sidebar') && (
          <div className="h-full flex flex-col">
            {/* Sidebar header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">S</span>
                  </div>
                  <span className="font-heading font-bold text-foreground">Solabs</span>
                </div>
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActivePane('list')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4">
              <nav className="space-y-2">
                <div className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                  Conversas
                </div>
                <a 
                  href="#" 
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary"
                >
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Caixa de entrada
                </a>
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Conversations List */}
      <div 
        className={`
          ${isMobile 
            ? activePane === 'list' ? 'w-full' : 'hidden'
            : 'w-[380px]'
          } 
          border-r border-border bg-card flex-shrink-0 flex flex-col
        `}
      >
        {(!isMobile || activePane === 'list') && (
          <>
            {/* Header with mobile menu */}
            {isMobile && (
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => showMobilePane('sidebar')}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                <h1 className="font-heading font-bold">Conversas</h1>
                <div></div>
              </div>
            )}

            {/* Filters */}
            <ConversationFilters />
            
            {/* Tabs */}
            <TabsCounts />
            
            {/* List */}
            <div className="flex-1">
              <ConversationList height={isMobile ? window.innerHeight - 200 : window.innerHeight - 160} />
            </div>
          </>
        )}
      </div>

      {/* Chat Window */}
      <div 
        className={`
          flex-1 flex flex-col
          ${isMobile && activePane !== 'conversation' ? 'hidden' : ''}
        `}
      >
        {/* Header with mobile back button */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-border bg-card">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActivePane('list')}
            >
              ← Voltar
            </Button>
            <h1 className="font-heading font-bold">Conversa</h1>
            <div></div>
          </div>
        )}

        {/* Actions bar */}
        <ActionsBar />
        
        {/* Messages */}
        <div className="flex-1">
          <MessageList height={window.innerHeight - (isMobile ? 220 : 160)} />
        </div>
        
        {/* Composer */}
        <Composer />
      </div>

      {/* Mobile navigation bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="flex">
            <button
              onClick={() => showMobilePane('sidebar')}
              className={`flex-1 p-4 text-center ${activePane === 'sidebar' ? 'text-primary' : 'text-muted'}`}
            >
              Menu
            </button>
            <button
              onClick={() => showMobilePane('list')}
              className={`flex-1 p-4 text-center ${activePane === 'list' ? 'text-primary' : 'text-muted'}`}
            >
              Conversas
            </button>
            <button
              onClick={() => showMobilePane('conversation')}
              className={`flex-1 p-4 text-center ${activePane === 'conversation' ? 'text-primary' : 'text-muted'}`}
            >
              Chat
            </button>
          </div>
        </div>
      )}
    </div>
  );
};