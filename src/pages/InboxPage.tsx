import React, { useEffect } from 'react';
import { useUiStore } from '../state/uiStore';
import { ConversationFilters } from '../components/ConversationFilters';
import { ConversationToolbar } from '../components/ConversationToolbar';
import { TabsCounts } from '../components/TabsCounts';
import { ConversationList } from '../components/ConversationList';
import { MessageList } from '../components/ChatWindow/MessageList';
import { Composer } from '../components/ChatWindow/Composer';
import { ActionsBar } from '../components/ChatWindow/ActionsBar';
import { Button } from '../components/ui/button';

export const InboxPage: React.FC = () => {
  const { 
    isMobile, 
    activePane, 
    isExpanded,
    setIsMobile, 
    setActivePane 
  } = useUiStore();

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  // Mobile navigation
  const showMobilePane = (pane: 'list' | 'conversation') => {
    setActivePane(pane);
  };

  return (
    <div className="flex h-screen bg-bg">
      {/* Conversations List */}
      <div 
        className={`
          ${isMobile 
            ? activePane === 'list' ? 'w-full' : 'hidden'
            : isExpanded ? 'hidden' : 'w-[420px]'
          } 
          border-r border-border bg-card flex-shrink-0 flex flex-col
        `}
      >
        {(!isMobile || activePane === 'list') && !isExpanded && (
          <>
            {/* Header with brand */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">S</span>
                  </div>
                  <span className="font-heading font-bold text-foreground">Solabs</span>
                </div>
                {isMobile && (
                  <h1 className="font-heading font-bold">Conversas</h1>
                )}
              </div>
            </div>

            {/* Filters */}
            <ConversationFilters />
            
            {/* Toolbar */}
            <ConversationToolbar />
            
            {/* Tabs */}
            <TabsCounts />
            
            {/* List */}
            <div className="flex-1">
              <ConversationList height={isMobile ? window.innerHeight - 300 : window.innerHeight - 260} />
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