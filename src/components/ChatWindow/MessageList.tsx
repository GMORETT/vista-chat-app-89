import React, { useEffect, useRef, useMemo } from 'react';
import { useConversationStore } from '../../state/stores/conversationStore';
import { useMessages } from '../../hooks/useMessages';
import { Message } from '../../models';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal, Reply } from 'lucide-react';
import { LoadNewerMessagesButton } from './LoadNewerMessagesButton';

interface MessageListProps {}

export const MessageList: React.FC<MessageListProps> = () => {
  const { selectedConversationId } = useConversationStore();
  const { 
    messages, 
    isLoading, 
    isLoadingOlder,
    hasOlderMessages,
    isPolling,
    error,
    loadMoreMessages, 
    loadNewerMessages 
  } = useMessages(selectedConversationId);
  const listRef = useRef<VirtuosoHandle>(null);

  // Use messages from buffer (no more mock data generation)
  const displayMessages = messages;

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current && displayMessages.length > 0) {
      listRef.current.scrollToIndex({ index: displayMessages.length - 1, align: 'end' });
    }
  }, [displayMessages.length]);

  // Show API errors instead of falling back to mock data
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-lg font-medium text-destructive mb-2">
            Erro ao conectar com Chatwoot
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            {error.message || 'Falha na comunicação com o servidor'}
          </div>
          <div className="text-xs text-muted-foreground">
            Verifique sua conexão e credenciais do Chatwoot
          </div>
        </div>
      </div>
    );
  }

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

  if (displayMessages.length === 0) {
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
    const { setReplyToMessage } = useConversationStore();
    const isOutgoing = message.message_type === 1;
    const isPrivate = message.private;
    const isNote = message.private;

    const handleReply = () => {
      // Set this message as the reply target
      setReplyToMessage(message);
    };

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
      (displayMessages[index - 1] && message.created_at - displayMessages[index - 1].created_at > 300);

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
              group relative max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-sm
              transition-all duration-200 hover:shadow-md
              ${isOutgoing
                ? 'bg-primary text-primary-foreground ml-12 rounded-br-md'
                : 'bg-background border border-border mr-12 rounded-bl-md hover:bg-accent/5'
              }
              ${isPrivate || isNote ? 'border-l-4 border-l-warning bg-warning/5' : ''}
            `}
          >
            {/* Message actions dropdown */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 rounded-full ${isOutgoing ? 'text-primary-foreground hover:bg-primary-foreground/20' : 'text-muted-foreground hover:bg-accent'}`}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={handleReply} className="flex items-center gap-2">
                    <Reply className="h-3 w-3" />
                    Responder
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Private message or note indicator */}
            {(isPrivate || isNote) && (
              <Badge variant="outline" className="text-xs mb-2 border-warning text-warning">
                {isNote ? '📋 Nota interna' : '🔒 Nota privada'}
              </Badge>
            )}

            {/* Reply preview */}
            {message.content_attributes?.in_reply_to && (
              <div className={`
                mb-3 p-2 rounded-lg border-l-2 text-xs
                ${isOutgoing 
                  ? 'bg-primary-foreground/10 border-l-primary-foreground/30 text-primary-foreground/80' 
                  : 'bg-muted/50 border-l-muted-foreground/30 text-muted-foreground'
                }
              `}>
                {(() => {
                  // Find the replied-to message in the current message list
                  const repliedMessage = displayMessages.find(m => m.id === message.content_attributes?.in_reply_to);
                  if (repliedMessage) {
                    return (
                      <div>
                        <div className="font-medium mb-1">
                          {repliedMessage.sender?.name || (repliedMessage.message_type === 1 ? 'Você' : 'Cliente')}
                        </div>
                        <div className="truncate">
                          {repliedMessage.content || 'Arquivo enviado'}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div>
                        <div className="font-medium mb-1">Mensagem respondida</div>
                        <div className="text-xs opacity-70">Mensagem não encontrada no histórico atual</div>
                      </div>
                    );
                  }
                })()}
              </div>
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

            {/* Message metadata: timestamp and status */}
            <div className="flex items-center justify-between mt-2 gap-2">
              {/* Individual message timestamp */}
              <div className={`text-xs ${isOutgoing ? 'text-primary-foreground/50' : 'text-muted-foreground/70'}`}>
                {new Date(message.created_at * 1000).toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              {/* Message status for outgoing messages */}
              {isOutgoing && (
                <div className="text-xs text-primary-foreground/70">
                  {message.status === 'sent' ? '✓' : '✓✓'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Load newer messages button */}
      <LoadNewerMessagesButton
        onLoadNewer={loadNewerMessages}
        isLoading={isLoading}
        hasNewerMessages={false} // TODO: Implement logic to detect newer messages
      />
      
      <div className="flex-1">
        <Virtuoso
          ref={listRef}
          data={displayMessages}
          itemContent={(index, message) => (
            <MessageItem key={message.id} message={message} index={index} />
          )}
          followOutput="smooth"
          className="message-list h-full"
          atTopThreshold={100}
          startReached={(atTop) => {
            console.log('🔄 Start reached - infinite scroll triggered, atTop:', atTop);
            console.log('🔄 hasOlderMessages:', hasOlderMessages);
            console.log('🔄 isLoadingOlder:', isLoadingOlder);
            console.log('🔄 displayMessages length:', displayMessages.length);
            
            if (hasOlderMessages && !isLoadingOlder) {
              console.log('✅ Loading more messages...');
              loadMoreMessages();
            } else {
              console.log('❌ Not loading messages:', { hasOlderMessages, isLoadingOlder });
            }
          }}
          components={{
            Header: () => (
              hasOlderMessages ? (
                <div className="flex justify-center py-4">
                  {isLoadingOlder ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Carregando mensagens antigas...
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                      Role para cima para ver mensagens antigas
                    </div>
                  )}
                </div>
              ) : null
            ),
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
    </div>
  );
};