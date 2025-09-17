import React from 'react';
import { useParams } from 'react-router-dom';
import { useConversation } from '../hooks/useConversations';
import { useChatStore } from '../state/useChatStore';
import { MessageList } from '../components/ChatWindow/MessageList';
import { Composer } from '../components/ChatWindow/Composer';
import { ActionsBar } from '../components/ChatWindow/ActionsBar';

export const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const conversationId = id ? parseInt(id, 10) : null;
  
  const { setSelectedConversationId } = useChatStore();
  const { data: conversation, isLoading, error } = useConversation(conversationId);

  React.useEffect(() => {
    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [conversationId, setSelectedConversationId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-medium text-danger mb-2">Erro ao carregar conversa</div>
          <div className="text-sm text-muted">{error.message}</div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-lg font-medium text-foreground mb-2">Conversa não encontrada</div>
          <div className="text-sm text-muted">A conversa solicitada não existe ou foi removida</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Actions bar */}
      <ActionsBar />
      
      {/* Messages */}
      <div className="flex-1">
        <MessageList height={window.innerHeight - 160} />
      </div>
      
      {/* Composer */}
      <Composer />
    </div>
  );
};