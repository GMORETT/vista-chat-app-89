import React, { useEffect } from 'react';
import { useUiStore } from '../state/uiStore';
import { useConversationStore } from '../state/conversationStore';
import { ConversationFilters } from '../components/ConversationFilters';
import { TabsCounts } from '../components/TabsCounts';
import { ConversationList } from '../components/ConversationList';
import { MessageList } from '../components/ChatWindow/MessageList';
import { Composer } from '../components/ChatWindow/Composer';
import { ActionsBar } from '../components/ChatWindow/ActionsBar';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const InboxPage: React.FC = () => {
  const { 
    isMobile, 
    activePane, 
    isExpanded,
    setIsMobile, 
    setActivePane,
    setIsExpanded
  } = useUiStore();
  const { selectedConversationId } = useConversationStore();

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
        {/* Rest of the content - Hidden when expanded */}
        {(!isMobile || activePane === 'list') && !isExpanded && (
          <>
            {/* Header with brand */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <img 
                  src="/brand/logo.webp" 
                  alt="Solabs" 
                  className="h-8 w-auto"
                />
                <div>
                  <h1 className="text-lg font-heading text-foreground">Solabs</h1>
                </div>
              </div>
            </div>

            {/* Filters with integrated toolbar */}
            <ConversationFilters />
            
            {/* Tabs */}
            <TabsCounts />
            
            {/* Conversation list */}
            <div className="flex-1 overflow-hidden">
              <ConversationList height={isMobile ? window.innerHeight - 300 : window.innerHeight - 260} />
            </div>
          </>
        )}
      </div>

      {/* Chat Window */}
      <div 
        className={`
          ${isMobile 
            ? activePane === 'conversation' ? 'w-full' : 'hidden'
            : isExpanded ? 'w-full' : 'flex-1'
          } 
          flex flex-col bg-background
        `}
      >
        {/* Render if there's a selected conversation or mobile with chat view */}
        {((!isMobile || activePane === 'conversation') && selectedConversationId) && (
          <>
            {/* Expanded Layout Header with Back Button */}
            {isExpanded && !isMobile && (
              <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              </div>
            )}

            {/* Mobile Header with Back Button */}
            {isMobile && (
              <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActivePane('list')}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="font-heading text-foreground">Conversa</h2>
              </div>
            )}
            
            {/* Actions bar */}
            <ActionsBar />
            
            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <MessageList height={window.innerHeight - (isMobile ? 220 : 160)} />
            </div>
            
            {/* Composer */}
            <Composer />
          </>
        )}
        
        {/* Empty state */}
        {!selectedConversationId && !isMobile && (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-heading mb-2">Nenhuma conversa selecionada</p>
              <p>Selecione uma conversa da lista para começar</p>
            </div>
          </div>
        )}
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