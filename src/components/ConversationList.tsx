import React from 'react';
import { useConversations } from '../hooks/useConversations';
import { useConversationStore } from '../state/conversationStore';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  height: number;
}

export const ConversationList: React.FC<ConversationListProps> = ({ height }) => {
  const { conversations, isLoading } = useConversations();
  const { selectedConversationId, setSelectedConversation } = useConversationStore();

  const handleConversationSelect = (id: number) => {
    setSelectedConversation(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted">
        <div className="text-lg font-medium mb-2">Nenhuma conversa encontrada</div>
        <div className="text-sm">Tente ajustar os filtros ou verificar mais tarde</div>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto" style={{ height }}>
      {conversations.map((conversation) => (
        <ConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedConversationId}
          onClick={() => handleConversationSelect(conversation.id)}
        />
      ))}
    </div>
  );
};