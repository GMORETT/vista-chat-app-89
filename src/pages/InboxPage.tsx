import React, { useEffect, useState } from 'react';
import { useUiStore } from '../state/uiStore';
import { useFilterStore } from '../state/stores/filterStore';
import { useConversationStore } from '../state/stores/conversationStore';
import { RoleBasedFilters } from '../components/RoleBasedFilters';
import { RoleBasedTabsCounts } from '../components/RoleBasedTabsCounts';
import { ClientSelector } from '../components/ClientSelector';
import { ConversationListOptimized } from '../components/ConversationListOptimizedFixed';
import { MessageList } from '../components/ChatWindow/MessageList';
import { Composer } from '../components/ChatWindow/Composer';
import { ActionsBar } from '../components/ChatWindow/ActionsBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Search, X, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentClient } from '../hooks/useCurrentClient';
import { useRealTimeMessages } from '../hooks/useRealTimeMessages';

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
  
  // Debug selected conversation changes
  useEffect(() => {
    console.log('🔄 Selected conversation ID changed to:', selectedConversationId);
  }, [selectedConversationId]);
  const { searchQuery, setSearchQuery } = useFilterStore();
  const { user, getChatwootConfig } = useAuth();
  // Initialize current client context for proper RBAC
  useCurrentClient();
  const navigate = useNavigate();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Real-time WebSocket connection for all conversations
  const chatwootConfig = getChatwootConfig();
  const isRealTimeEnabled = import.meta.env.VITE_ENABLE_REALTIME === 'true';
  
  const getWebSocketUrl = () => {
    if (!chatwootConfig) return '';
    const isDevelopment = import.meta.env.DEV;
    
    let wsUrl;
    if (isDevelopment) {
      wsUrl = `ws://localhost:8082/chatwoot-ws`;
    } else {
      wsUrl = chatwootConfig.websocketUrl;
    }
    
    console.log('🔗 Global WebSocket URL:', wsUrl, '(isDevelopment:', isDevelopment, ')');
    return wsUrl;
  };

  // Single WebSocket that handles both global and conversation-specific events
  console.log('🔧 InboxPage selectedConversationId for WebSocket:', selectedConversationId);
  const { isConnected, reconnectAttempts } = useRealTimeMessages(
    selectedConversationId, // Pass the selected conversation ID (null for global, ID for specific)
    isRealTimeEnabled && chatwootConfig ? {
      url: getWebSocketUrl(),
      token: chatwootConfig.token,
      accountId: chatwootConfig.accountId,
      userId: import.meta.env.VITE_USER_ID || user?.id, // Use env variable for user ID
    } : undefined
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchQuery, setSearchQuery]);

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
    <div className="flex h-full bg-bg overflow-hidden">
      {/* Conversations List */}
      <div 
        className={`
          ${isMobile 
            ? activePane === 'list' ? 'w-full' : 'hidden'
            : isExpanded ? 'hidden' : 'w-[320px]'
          } 
          border-r border-border bg-card flex-shrink-0 flex flex-col h-full
        `}
      >
        {/* Rest of the content - Hidden when expanded */}
        {(!isMobile || activePane === 'list') && !isExpanded && (
          <>
            {/* Header with Search and User Controls - Fixed */}
            <div className="flex items-center gap-2 p-4 border-b border-border bg-card sticky top-0 z-10">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar conversas..."
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                />
                {localSearchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocalSearchQuery('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              {/* Role-based controls */}
              <div className="flex items-center gap-2">
                {/* Super Admin: Admin button with tooltip */}
                {user?.role === 'super_admin' && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/admin')}
                    title="Área Administrativa"
                    className="flex items-center"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Filters with integrated toolbar - Fixed */}
            <div className="sticky top-[73px] z-10 bg-card">
              <RoleBasedFilters />
            </div>
            
            {/* Tabs - Fixed */}
            <div className="sticky top-[121px] z-10 bg-card">
              <RoleBasedTabsCounts />
            </div>
            
            {/* Conversation list - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <ConversationListOptimized height={0} />
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
          flex flex-col bg-background h-full ${isMobile ? 'pb-16' : ''}
        `}
      >
        {/* Render if there's a selected conversation or mobile with chat view */}
        {((!isMobile || activePane === 'conversation') && selectedConversationId) && (
          <>
            {/* Actions bar with integrated navigation */}
            <ActionsBar />
            
            {/* Messages */}
            <div className="flex-1 min-h-0">
              <MessageList />
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
