import React, { useEffect, useState } from 'react';
import { useUiStore } from '../state/uiStore';
import { useChatStore } from '../state/useChatStore';
import { ConversationFilters } from '../components/ConversationFilters';
import { TabsCounts } from '../components/TabsCounts';
import { ConversationList } from '../components/ConversationList';
import { MessageList } from '../components/ChatWindow/MessageList';
import { Composer } from '../components/ChatWindow/Composer';
import { ActionsBar } from '../components/ChatWindow/ActionsBar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Search, X, Settings, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const InboxPage: React.FC = () => {
  const { 
    isMobile, 
    activePane, 
    isExpanded,
    setIsMobile, 
    setActivePane,
    setIsExpanded
  } = useUiStore();
  
  const { selectedConversationId, searchQuery, setSearchQuery } = useChatStore();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

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
            {/* Header with Logo, Search and User Controls */}
            <div className="flex items-center gap-2 p-4 border-b border-border bg-card">
              {/* Logo */}
              <div className="flex-shrink-0">
                <img 
                  src="/brand/logo-solabs.png" 
                  alt="Solabs" 
                  className="h-8 w-auto object-contain"
                />
              </div>
              
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
              
              {/* User info */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-24 truncate">{user?.name}</span>
              </div>
              
              {/* Admin button - only for admin users */}
              {user?.roles.includes('admin-interno') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              
              {/* Logout button */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={logout}
                title="Sair"
                className="flex items-center"
              >
                <LogOut className="h-4 w-4" />
              </Button>
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
          flex flex-col bg-background ${isMobile ? 'pb-16' : ''}
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
