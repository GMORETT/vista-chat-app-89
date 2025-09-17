import React, { useEffect, useRef } from 'react';
import { useMessages } from '../../hooks/useMessages';
import { useConversationStore } from '../../state/conversationStore';
import { Message } from '../../models';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MessageListProps {
  height: number;
}

export const MessageList: React.FC<MessageListProps> = ({ height }) => {
  const { selectedConversationId } = useConversationStore();
  const { messages, isLoading } = useMessages(selectedConversationId);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (!selectedConversationId) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Nenhuma conversa selecionada</div>
          <div className="text-sm">Selecione uma conversa para ver as mensagens</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">Nenhuma mensagem</div>
          <div className="text-sm">Esta conversa ainda não tem mensagens</div>
        </div>
      </div>
    );
  }

  const MessageItem: React.FC<{ message: Message }> = ({ message }) => {
    const isOutgoing = message.message_type === 1;
    const isPrivate = message.private;

    const formattedTime = React.useMemo(() => {
      try {
        return formatDistanceToNow(new Date(message.created_at * 1000), {
          addSuffix: true,
          locale: ptBR,
        });
      } catch {
        return '';
      }
    }, [message.created_at]);

    return (
      <div className="px-4 py-2">
        <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`
              max-w-[70%] rounded-lg px-4 py-2 text-sm
              ${isOutgoing
                ? 'bg-primary text-primary-foreground ml-12'
                : 'bg-card border border-border mr-12'
              }
              ${isPrivate ? 'border-warning border-2' : ''}
            `}
          >
            {/* Private message indicator */}
            {isPrivate && (
              <div className="text-xs text-warning font-medium mb-1">
                📝 Nota privada
              </div>
            )}

            {/* Message content */}
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="border border-border rounded p-2">
                    <a
                      href={attachment.data_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-link hover:underline text-xs"
                    >
                      📎 {attachment.fallback_title}
                    </a>
                  </div>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <div
              className={`
                text-xs mt-1 opacity-70
                ${isOutgoing ? 'text-primary-foreground' : 'text-muted'}
              `}
            >
              {formattedTime}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={listRef}
      className="overflow-y-auto" 
      style={{ height }}
    >
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};