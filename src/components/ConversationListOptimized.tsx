import React, { useMemo, useCallback, memo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ConversationItem } from './ConversationItem';
import { Skeleton } from './ui/skeleton';
import { useConversationStore } from '../state/stores/conversationStore';
import { useFilterStore } from '../state/stores/filterStore';
import { useUiStore } from '../state/uiStore';
import { Conversation } from '../models';

interface ConversationListProps {
  height: number;
}

const LoadingSkeleton = memo(() => (
  <div className="space-y-1 p-2">
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i} className="flex items-start space-x-3 p-3 rounded-lg">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    ))}
  </div>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

const EmptyState = memo(({ hasSearch }: { hasSearch: boolean }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
    <div className="text-4xl">💬</div>
    <div className="space-y-2">
      <h3 className="text-lg font-medium">
        {hasSearch ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
      </h3>
      <p className="text-muted-foreground text-sm">
        {hasSearch 
          ? 'Tente ajustar seus filtros de busca'
          : 'As conversas aparecerão aqui quando chegarem'
        }
      </p>
    </div>
  </div>
));
EmptyState.displayName = 'EmptyState';

const filterConversations = (
  conversations: Conversation[], 
  searchQuery: string, 
  filters: any
): Conversation[] => {
  let filtered = [...conversations];

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(conv =>
      conv.meta?.sender?.name?.toLowerCase().includes(query) ||
      conv.meta?.sender?.email?.toLowerCase().includes(query) ||
      conv.messages?.some(msg => msg.content?.toLowerCase().includes(query))
    );
  }

  // Status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(conv => conv.status === filters.status);
  }

  // Assignee type filter
  if (filters.assignee_type && filters.assignee_type !== 'all') {
    switch (filters.assignee_type) {
      case 'mine':
        filtered = filtered.filter(conv => conv.assignee_id === 1); // Current user
        break;
      case 'unassigned':
        filtered = filtered.filter(conv => !conv.assignee_id);
        break;
      case 'assigned':
        filtered = filtered.filter(conv => conv.assignee_id);
        break;
    }
  }

  // Inbox filter
  if (filters.inbox_id) {
    filtered = filtered.filter(conv => conv.inbox_id === filters.inbox_id);
  }

  // Team filter
  if (filters.team_id) {
    filtered = filtered.filter(conv => conv.team_id === filters.team_id);
  }

  // Labels filter
  if (filters.labels?.length > 0) {
    filtered = filtered.filter(conv =>
      filters.labels.some((labelId: number) =>
        conv.labels?.some(label => label.id === labelId)
      )
    );
  }

  // Sort
  filtered.sort((a, b) => {
    switch (filters.sort_by) {
      case 'last_activity_at_desc':
        return (b.last_activity_at || 0) - (a.last_activity_at || 0);
      case 'created_at_desc':
        return (b.created_at || 0) - (a.created_at || 0);
      default:
        return 0;
    }
  });

  return filtered;
};

export const ConversationListOptimized = memo<ConversationListProps>(({ height }) => {
  const { conversations, isLoading, selectedConversationId, setSelectedConversationId } = useConversationStore();
  const { searchQuery, filters } = useFilterStore();
  const { isMobile, setActivePane } = useUiStore();

  const filteredConversations = useMemo(() => 
    filterConversations(conversations, searchQuery, filters),
    [conversations, searchQuery, filters]
  );

  const handleConversationSelect = useCallback((conversationId: number) => {
    setSelectedConversationId(conversationId);
    if (isMobile) {
      setActivePane('conversation');
    }
  }, [setSelectedConversationId, isMobile, setActivePane]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (filteredConversations.length === 0) {
    return <EmptyState hasSearch={!!searchQuery.trim()} />;
  }

  return (
    <Virtuoso
      style={{ height }}
      data={filteredConversations}
      itemContent={(index, conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedConversationId}
          onClick={() => handleConversationSelect(conversation.id)}
        />
      )}
      components={{
        EmptyPlaceholder: () => <EmptyState hasSearch={!!searchQuery.trim()} />,
      }}
    />
  );
});

ConversationListOptimized.displayName = 'ConversationListOptimized';