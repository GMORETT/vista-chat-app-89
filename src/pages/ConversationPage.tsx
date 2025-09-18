import React from 'react';
import { useParams } from 'react-router-dom';
import { useConversation } from '../hooks/useConversations';
import { useChatStore } from '../state/useChatStore';
import { MessageList } from '../components/ChatWindow/MessageList';
import { Composer } from '../components/ChatWindow/Composer';
import { ActionsBar } from '../components/ChatWindow/ActionsBar';
import { ApplyLabelsModal } from '../components/ApplyLabelsModal';
import { useApplyLabelsToConversation, useConversationLabels } from '../hooks/useLabels';
import { LabelBadge } from '../components/LabelBadge';
import { Card } from '../components/ui/card';
import { Tag } from 'lucide-react';

export const ConversationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const conversationId = id ? parseInt(id, 10) : null;
  
  const { setSelectedConversationId } = useChatStore();
  const { data: conversation, isLoading, error } = useConversation(conversationId);
  const { data: labels } = useConversationLabels(conversationId || 0);
  const applyLabelsMutation = useApplyLabelsToConversation();

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
      <ActionsBar />
      
      {/* Labels Section */}
      <Card className="mx-4 mb-2 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted" />
            <span className="text-sm font-medium">Labels</span>
          </div>
          <ApplyLabelsModal
            title="Gerenciar Labels da Conversa"
            description={`Aplicar labels à conversa #${conversationId}`}
            onApply={async (selectedLabels) => {
              if (conversationId) {
                await applyLabelsMutation.mutateAsync({
                  conversationId,
                  labels: selectedLabels,
                });
              }
            }}
          />
        </div>
        {labels && labels.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {labels.map((label) => (
              <LabelBadge key={label} label={label} />
            ))}
          </div>
        ) : (
          <div className="text-xs text-muted">Nenhuma label aplicada</div>
        )}
      </Card>
      
      <div className="flex-1 overflow-hidden">
        <MessageList />
      </div>
      <Composer />
    </div>
  );
};