import React, { useEffect, useRef, useMemo } from 'react';
import { useConversationStore } from '../../state/conversationStore';
import { Message } from '../../models';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { mockMessages } from '../../data/mockData';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

interface MessageListProps {
  height: number;
}

export const MessageList: React.FC<MessageListProps> = ({ height }) => {
  const { selectedConversationId } = useConversationStore();
  const listRef = useRef<VirtuosoHandle>(null);

  // Get messages from mock data
  const messages = useMemo(() => {
    if (!selectedConversationId) return [];
    
    // Generate messages if not already generated
    if (!mockMessages[selectedConversationId]) {
      const messageCount = Math.floor(Math.random() * 15) + 5;
      const messageTypes = [
        'Olá! Preciso de ajuda com minha conta.',
        'Não consigo acessar o sistema.',
        'Quando será lançada a nova funcionalidade?',
        'Obrigado pelo excelente atendimento!',
        'Há quanto tempo vocês estão no mercado?',
        'Qual é o valor do plano premium?',
        'Posso cancelar a qualquer momento?',
        'Vocês oferecem suporte 24/7?',
        'Como faço para alterar minha senha?',
        'Estou interessado nos seus serviços.',
      ];
      
      const responses = [
        'Olá! Claro, posso ajudá-lo. Qual é o problema específico?',
        'Vou verificar isso para você. Um momento, por favor.',
        'Entendo sua situação. Vamos resolver isso juntos.',
        'Muito obrigado pelo feedback! Ficamos felizes em ajudar.',
        'Deixe-me encaminhar sua solicitação para o setor responsável.',
        'Sim, posso fornecer essas informações para você.',
        'Perfeito! Vou processar sua solicitação agora.',
        'Claro! Vou explicar o processo passo a passo.',
        'Obrigado por entrar em contato conosco.',
        'Fico à disposição para mais esclarecimentos.',
      ];

      mockMessages[selectedConversationId] = Array.from({ length: messageCount }, (_, i) => {
        const isOutgoing = i % 3 === 0;
        const isPrivate = i % 10 === 9;
        const hasAttachment = i % 15 === 14;
        
        const baseMessage: Message = {
          id: (selectedConversationId * 1000) + i + 1,
          content: isOutgoing 
            ? responses[i % responses.length]
            : messageTypes[i % messageTypes.length],
          inbox_id: 1,
          conversation_id: selectedConversationId,
          message_type: isOutgoing ? 1 : 0,
          created_at: Math.floor(Date.now() / 1000) - ((messageCount - i) * 60 * 5),
          updated_at: Math.floor(Date.now() / 1000) - ((messageCount - i) * 60 * 5),
          private: isPrivate,
          status: 'sent' as const,
          source_id: `msg_${selectedConversationId}_${i}`,
          content_type: 'text' as const,
          content_attributes: {},
          sender_type: isOutgoing ? 'agent' : 'contact',
          sender_id: isOutgoing ? 1 : selectedConversationId,
          external_source_ids: {},
          additional_attributes: {},
          processed_message_content: null,
          sentiment: {},
          conversation: {} as any,
          attachments: [],
        };

        if (hasAttachment) {
          baseMessage.attachments = [{
            id: i + 1,
            file_type: 'image',
            extension: 'jpg',
            data_url: `https://picsum.photos/200/200?random=${i}`,
            thumb_url: `https://picsum.photos/100/100?random=${i}`,
            file_url: `https://picsum.photos/200/200?random=${i}`,
            file_size: Math.floor(Math.random() * 1000000) + 50000,
            fallback_title: `imagem_${i + 1}.jpg`,
            coordinates_lat: null,
            coordinates_long: null,
          }];
        }

        return baseMessage;
      });
    }
    
    return mockMessages[selectedConversationId] || [];
  }, [selectedConversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToIndex({ index: messages.length - 1, align: 'end' });
    }
  }, [messages.length]);

  if (!selectedConversationId) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        <div className="text-center">
          <div className="text-lg font-heading mb-2">Nenhuma conversa selecionada</div>
          <div className="text-sm">Selecione uma conversa para ver as mensagens</div>
        </div>
      </div>
    );
  }

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="p-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[70%] space-y-2 ${i % 2 === 0 ? 'ml-12' : 'mr-12'}`}>
            <Skeleton className={`h-16 rounded-lg ${i % 2 === 0 ? 'bg-primary/10' : 'bg-muted'}`} />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted">
        <div className="text-center">
          <div className="text-lg font-heading mb-2">Nenhuma mensagem</div>
          <div className="text-sm">Esta conversa ainda não tem mensagens</div>
        </div>
      </div>
    );
  }

  const MessageItem: React.FC<{ message: Message; index: number }> = ({ message, index }) => {
    const isOutgoing = message.message_type === 1;
    const isPrivate = message.private;
    const isNote = message.private;

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

    // Group messages by time (show timestamp only if >5 min apart)
    const showTimestamp = index === 0 || 
      (messages[index - 1] && message.created_at - messages[index - 1].created_at > 300);

    return (
      <div className="px-4 py-1">
        {/* Timestamp separator */}
        {showTimestamp && (
          <div className="flex items-center justify-center my-4">
            <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
              {formattedTime}
            </div>
          </div>
        )}

        <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} mb-2`}>
          <div
            className={`
              group max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm
              transition-all duration-200 hover:shadow-md
              ${isOutgoing
                ? 'bg-primary text-primary-foreground ml-12 rounded-br-md'
                : 'bg-background border border-border mr-12 rounded-bl-md hover:bg-accent/5'
              }
              ${isPrivate || isNote ? 'border-l-4 border-l-warning bg-warning/5' : ''}
            `}
          >
            {/* Private message or note indicator */}
            {(isPrivate || isNote) && (
              <Badge variant="outline" className="text-xs mb-2 border-warning text-warning">
                {isNote ? '📋 Nota interna' : '🔒 Nota privada'}
              </Badge>
            )}

            {/* Message content */}
            <div className="whitespace-pre-wrap break-words leading-relaxed">
              {message.content}
            </div>

            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.attachments.map((attachment) => (
                  <div 
                    key={attachment.id} 
                    className={`
                      border rounded-lg p-3 transition-colors hover:bg-accent/10
                      ${isOutgoing ? 'border-primary-foreground/20' : 'border-border'}
                    `}
                  >
                    {attachment.file_type === 'image' ? (
                      <div className="space-y-2">
                        <img 
                          src={attachment.data_url} 
                          alt={attachment.fallback_title}
                          className="max-w-full rounded-md shadow-sm"
                          loading="lazy"
                        />
                        <div className={`text-xs ${isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {attachment.fallback_title}
                        </div>
                      </div>
                    ) : (
                      <a
                        href={attachment.data_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`
                          flex items-center gap-2 text-xs hover:underline
                          ${isOutgoing ? 'text-primary-foreground' : 'text-primary'}
                        `}
                      >
                        📎 {attachment.fallback_title}
                        <span className={`
                          ${isOutgoing ? 'text-primary-foreground/70' : 'text-muted-foreground'}
                        `}>
                          ({(attachment.file_size / 1024).toFixed(1)} KB)
                        </span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Message status for outgoing messages */}
            {isOutgoing && (
              <div className="flex items-center justify-end mt-2 gap-1">
                <div className="text-xs text-primary-foreground/70">
                  {message.status === 'sent' ? '✓' : '✓✓'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height }}>
      <Virtuoso
        ref={listRef}
        data={messages}
        itemContent={(index, message) => (
          <MessageItem key={message.id} message={message} index={index} />
        )}
        followOutput="smooth"
        className="message-list"
        components={{
          EmptyPlaceholder: () => (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <div className="text-6xl mb-4">💬</div>
                <div className="text-lg font-heading text-foreground mb-2">
                  Inicie a conversa
                </div>
                <div className="text-sm text-muted-foreground">
                  Envie a primeira mensagem para começar o atendimento
                </div>
              </div>
            </div>
          )
        }}
      />
    </div>
  );
};