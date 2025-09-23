import React, { useMemo } from 'react';
import { useConversationStore } from '../state/stores/conversationStore';
import { useFilterStore } from '../state/stores/filterStore';
import { useUiStore } from '../state/uiStore';
import { ConversationItem } from './ConversationItem';
import { Virtuoso } from 'react-virtuoso';
import { Skeleton } from './ui/skeleton';
import { Conversation } from '../models';
import { useAuth } from '../contexts/AuthContext';

interface ConversationListOptimizedProps {
  height: number;
}

// Loading skeleton component
const LoadingSkeleton = React.memo(() => (
  <div className="p-4 space-y-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-5 w-8" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>
      </div>
    ))}
  </div>
));

// Empty state component
const EmptyState = React.memo(({ searchQuery }: { searchQuery: string }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <div className="text-2xl">💬</div>
    </div>
    <div className="text-lg font-heading text-foreground mb-2">
      {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
    </div>
    <div className="text-sm text-muted-foreground max-w-md">
      {searchQuery 
        ? 'Tente ajustar sua busca ou limpar os filtros para ver mais conversas'
        : 'As conversas aparecerão aqui quando clientes entrarem em contato'
      }
    </div>
  </div>
));

// Optimized filter and sort function
const filterConversations = (
  conversations: Conversation[], 
  searchQuery: string, 
  filters: any,
  currentUserId?: number
): Conversation[] => {
  let filtered = [...conversations];

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(conv => 
      conv.meta.sender.name?.toLowerCase().includes(query) ||
      conv.meta.sender.email?.toLowerCase().includes(query) ||
      conv.id.toString().includes(query)
    );
  }

  // Filter by assignee type - FIXED LOGIC
  if (filters.assignee_type !== 'all') {
    switch (filters.assignee_type) {
      case 'me':
        // Filter by current user ID
        filtered = filtered.filter(conv => conv.meta.assignee?.id === currentUserId);
        break;
      case 'assigned':
        filtered = filtered.filter(conv => conv.meta.assignee !== null);
        break;
      case 'unassigned':
        filtered = filtered.filter(conv => conv.meta.assignee === null);
        break;
    }
  }

  // Filter by status
  if (filters.status !== 'all') {
    filtered = filtered.filter(conv => conv.status === filters.status);
  }

  // Filter by inbox_id
  if (filters.inbox_id) {
    filtered = filtered.filter(conv => conv.inbox_id === filters.inbox_id);
  }

  // Filter by team_id
  if (filters.team_id) {
    filtered = filtered.filter(conv => conv.team_id === filters.team_id);
  }

  // Filter by labels
  if (filters.labels && filters.labels.length > 0) {
    filtered = filtered.filter(conv => 
      filters.labels.some((filterLabel: string) => 
        conv.labels.some(convLabel => convLabel.title === filterLabel)
      )
    );
  }

  // Filter by priority
  if (filters.priority) {
    filtered = filtered.filter(conv => conv.priority === filters.priority);
  }

  // Filter by updated_within
  if (filters.updated_within) {
    const now = Date.now();
    const withinDays = {
      '1d': 1,
      '7d': 7,
      '30d': 30,
      '90d': 90
    }[filters.updated_within];
    
    if (withinDays) {
      const cutoff = now - (withinDays * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(conv => conv.last_activity_at >= cutoff);
    }
  }

  // Sort conversations
  filtered.sort((a, b) => {
    switch (filters.sort_by) {
      case 'last_activity_at_desc':
        return b.last_activity_at - a.last_activity_at;
      case 'last_activity_at_asc':
        return a.last_activity_at - b.last_activity_at;
      case 'created_at_desc':
        return b.created_at - a.created_at;
      case 'created_at_asc':
        return a.created_at - b.created_at;
      case 'priority_desc':
        const priorityOrder = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
               (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      case 'priority_asc':
        const priorityOrderAsc = { 'urgent': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return (priorityOrderAsc[a.priority as keyof typeof priorityOrderAsc] || 0) - 
               (priorityOrderAsc[b.priority as keyof typeof priorityOrderAsc] || 0);
      default:
        return b.last_activity_at - a.last_activity_at;
    }
  });

  return filtered;
};

export const ConversationListOptimized: React.FC<ConversationListOptimizedProps> = React.memo(({ height }) => {
  const { conversations, selectedConversationId, setSelectedConversationId, isLoading } = useConversationStore();
  const { filters, searchQuery } = useFilterStore();
  const { isMobile, setActivePane } = useUiStore();
  const { user } = useAuth();

  // Memoized filtered conversations with proper user ID for "mine" filter
  const filteredConversations = useMemo(() => {
    return filterConversations(conversations, searchQuery, filters, user?.id);
  }, [conversations, searchQuery, filters, user?.id]);

  // Optimized callback
  const handleConversationSelect = React.useCallback((id: number) => {
    setSelectedConversationId(id);
    // On mobile, switch to conversation pane when a conversation is selected
    if (isMobile) {
      setActivePane('conversation');
    }
  }, [setSelectedConversationId, isMobile, setActivePane]);

  // Loading state
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Empty state
  if (filteredConversations.length === 0) {
    return <EmptyState searchQuery={searchQuery} />;
  }

  return (
    <div style={{ height }}>
      <Virtuoso
        data={filteredConversations}
        itemContent={(index, conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={conversation.id === selectedConversationId}
            onClick={() => handleConversationSelect(conversation.id)}
            index={index}
          />
        )}
        className="conversation-list"
        components={{
          EmptyPlaceholder: () => <EmptyState searchQuery={searchQuery} />
        }}
      />
    </div>
  );
});

ConversationListOptimized.displayName = 'ConversationListOptimized';