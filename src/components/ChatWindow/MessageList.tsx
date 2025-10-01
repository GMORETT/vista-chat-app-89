import React, { useEffect, useRef, useMemo } from 'react';
import { useConversationStore } from '../../state/stores/conversationStore';
import { useMessages } from '../../hooks/useMessages';
import { Message } from '../../models';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
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
    error,
    loadMoreMessages, 
    loadNewerMessages 
  } = useMessages(selectedConversationId);
  
  // Track scroll position for older message loading
  const scrollAnchorMessageId = useRef<number | null>(null);
  const isLoadingOlderRef = useRef(false);
  const listRef = useRef<VirtuosoHandle>(null);

  // Use messages from buffer (no more mock data generation)
  const displayMessages = messages;

  // Track conversation changes and newest message ID
  const previousConversationId = useRef<number | null>(null);
  const previousNewestMessageId = useRef<number | null>(null);
  
  useEffect(() => {
    if (listRef.current && displayMessages.length > 0) {
      const newestMessage = displayMessages[displayMessages.length - 1];
      const currentNewestId = newestMessage.id;
      
      // Case 1: New conversation selected - always scroll to bottom
      if (selectedConversationId !== previousConversationId.current) {
        listRef.current.scrollToIndex({ index: displayMessages.length - 1, align: 'end' });
        previousConversationId.current = selectedConversationId;
        previousNewestMessageId.current = currentNewestId;
        return;
      }
      
      // Case 2: New message arrived (not loading older messages) - scroll to bottom
      if (previousNewestMessageId.current !== null && 
          currentNewestId !== previousNewestMessageId.current && 
          !isLoadingOlder) {
        listRef.current.scrollToIndex({ index: displayMessages.length - 1, align: 'end' });
      }
      
      // Case 3: Loading older messages - don't scroll (handled by not triggering above)
      
      previousNewestMessageId.current = currentNewestId;
    }
  }, [displayMessages, isLoadingOlder, selectedConversationId]);
  
  // Restore scroll position after loading older messages
  useEffect(() => {
    if (!isLoadingOlder && isLoadingOlderRef.current && scrollAnchorMessageId.current && listRef.current) {
      const anchorIndex = displayMessages.findIndex(msg => msg.id === scrollAnchorMessageId.current);
      
      if (anchorIndex !== -1) {
        listRef.current.scrollToIndex({ 
          index: anchorIndex, 
          align: 'start',
          behavior: 'auto'
        });
      }
      
      // Reset tracking
      isLoadingOlderRef.current = false;
      scrollAnchorMessageId.current = null;
    }
  }, [isLoadingOlder, displayMessages]);

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

            {/* Sender name for incoming messages (group conversations) */}
            {!isOutgoing && message.sender && (
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium text-muted-foreground">
                  {(() => {
                    console.log('🔍 PROCESSING MESSAGE - isOutgoing:', isOutgoing, 'has sender:', !!message.sender);
                    
                    // Check if this is a group message (has @g.us identifier)
                    const isGroupMessage = ('identifier' in message.sender && 
                                          message.sender.identifier && 
                                          message.sender.identifier.includes('@g.us'));
                    
                    console.log('🔍 IS GROUP MESSAGE:', isGroupMessage);
                    console.log('🔍 SENDER IDENTIFIER:', ('identifier' in message.sender && message.sender.identifier) || 'No identifier');
                    
                    if (isGroupMessage) {
                      // Parse sender from message content
                      const content = message.content || '';
                      console.log('🔍 RAW CONTENT:', JSON.stringify(content));
                      console.log('🔍 CONTENT START:', content.substring(0, 50));
                      
                      // Pattern 1a: **+55 (XX) XXXX-XXXX - Name:** (pre-formatted phone)
                      const formattedPhoneMatch = content.match(/^\*\*(\+55\s*\(\d{2}\)\s*\d{4,5}-\d{4})\s*-\s*(.*?):\*\*\s*/);
                      if (formattedPhoneMatch) {
                        console.log('🔍 MATCHED PRE-FORMATTED PHONE:', formattedPhoneMatch);
                        const formattedPhone = formattedPhoneMatch[1];
                        const name = formattedPhoneMatch[2];
                        return `📞 ${formattedPhone} - ${name}`;
                      }
                      
                      // Pattern 1b: **+whatsappId - Name:** message (raw WhatsApp ID + name)
                      const boldIdNameMatch = content.match(/^\*\*(\+\d+)\s*-\s*(.*?):\*\*\s*/);
                      if (boldIdNameMatch) {
                        console.log('🔍 MATCHED PATTERN 1:', boldIdNameMatch);
                        const rawNumber = boldIdNameMatch[1]; // e.g., "+5521997521661"
                        const name = boldIdNameMatch[2]; // e.g., "Oliveira"
                        
                        // Determine if this is a real phone number or WhatsApp ID
                        const isRealBrazilianPhone = (phone: string) => {
                          const digits = phone.replace('+', '');
                          // Real Brazilian phones: +55 + 2-digit area code + 8-9 digits = 11-12 total digits
                          return digits.startsWith('55') && (digits.length === 11 || digits.length === 12);
                        };
                        
                        if (isRealBrazilianPhone(rawNumber)) {
                          // Format as real Brazilian phone number
                          const formatBrazilianPhone = (phone: string) => {
                            const digits = phone.replace('+', '');
                            const countryCode = '55';
                            const areaCode = digits.substring(2, 4);
                            const number = digits.substring(4);
                            
                            // Format number as 99999-9999 or 9999-9999
                            if (number.length === 9) {
                              const formatted = `${number.substring(0, 5)}-${number.substring(5)}`;
                              return `+${countryCode} (${areaCode}) ${formatted}`;
                            } else if (number.length === 8) {
                              const formatted = `${number.substring(0, 4)}-${number.substring(4)}`;
                              return `+${countryCode} (${areaCode}) ${formatted}`;
                            }
                            return phone; // fallback
                          };
                          
                          const formattedPhone = formatBrazilianPhone(rawNumber);
                          console.log('🔍 Real phone formatted:', formattedPhone);
                          return `📞 ${formattedPhone} - ${name}`;
                        } else {
                          // This is a WhatsApp ID, show only the name
                          console.log('🔍 WhatsApp ID detected, showing only name:', name);
                          return `👤 ${name}`;
                        }
                      }
                      
                      // Pattern 2: **Name**: message (just name in bold)
                      const boldNameMatch = content.match(/^\*\*(.*?)\*\*:\s*/);
                      if (boldNameMatch) {
                        return `👤 ${boldNameMatch[1]}`;
                      }
                      
                      // Pattern 3: +phone - Name: message (real phone + name)
                      const phoneNameMatch = content.match(/^(\+\d+)\s*-\s*(.*?):\s*/);
                      if (phoneNameMatch) {
                        return `📞 ${phoneNameMatch[1]} - ${phoneNameMatch[2]}`;
                      }
                      
                      // Pattern 3: Name: message (no formatting)
                      const simpleNameMatch = content.match(/^([^:]+):\s*/);
                      if (simpleNameMatch) {
                        const name = simpleNameMatch[1].trim();
                        // Don't match if it looks like a timestamp or system message
                        if (name && !name.match(/^\d+:\d+/) && name.length < 50) {
                          return `👤 ${name}`;
                        }
                      }
                      
                      return `🏢 ${message.sender.name} (Group)`;
                    }
                    
                    // Not a group message - show normal sender info
                    return `📱 ${message.sender.name || 'Cliente'}`;
                  })()}
                </div>
                
                {/* Reply button for this header */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReply}
                  className="h-6 w-6 p-0 rounded-full text-muted-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Responder"
                >
                  <Reply className="h-3 w-3" />
                </Button>
              </div>
            )}


            {/* Message actions dropdown for outgoing messages */}
            {isOutgoing && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
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
            )}

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
                    // Determine sender name for reply preview
                    const getSenderDisplayName = () => {
                      if (repliedMessage.message_type === 1) return 'Você';
                      
                      if (repliedMessage.sender) {
                        // If sender has a name, use it
                        if (repliedMessage.sender.name) {
                          return repliedMessage.sender.name;
                        }
                        // Check if it's a Contact (has phone_number and identifier)
                        if ('phone_number' in repliedMessage.sender && repliedMessage.sender.phone_number) {
                          return repliedMessage.sender.phone_number;
                        }
                        if ('identifier' in repliedMessage.sender && repliedMessage.sender.identifier) {
                          return repliedMessage.sender.identifier;
                        }
                      }
                      
                      return 'Cliente';
                    };
                    
                    return (
                      <div>
                        <div className="font-medium mb-1">
                          {getSenderDisplayName()}
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
              {(() => {
                // Check if this is a group message and remove sender prefix
                const isGroupMessage = ('identifier' in message.sender && 
                                      message.sender?.identifier && 
                                      message.sender.identifier.includes('@g.us'));
                
                if (isGroupMessage && message.content) {
                  let cleanContent = message.content;
                  
                  // Remove Pattern 1a: **+55 (XX) XXXX-XXXX - Name:** (pre-formatted phone)
                  cleanContent = cleanContent.replace(/^\*\*(\+55\s*\(\d{2}\)\s*\d{4,5}-\d{4})\s*-\s*(.*?):\*\*\s*/, '');
                  
                  // Remove Pattern 1b: **+whatsappId - Name:** message
                  cleanContent = cleanContent.replace(/^\*\*(\+\d+)\s*-\s*(.*?):\*\*\s*/, '');
                  
                  // Remove Pattern 2: **Name**: message  
                  cleanContent = cleanContent.replace(/^\*\*(.*?)\*\*:\s*/, '');
                  
                  // Remove Pattern 3: +phone - Name: message
                  cleanContent = cleanContent.replace(/^(\+\d+)\s*-\s*(.*?):\s*/, '');
                  
                  // Remove Pattern 4: Name: message (if it matches our simple pattern)
                  const simpleMatch = cleanContent.match(/^([^:]+):\s*/);
                  if (simpleMatch) {
                    const name = simpleMatch[1].trim();
                    // Only remove if it looks like a contact name (not timestamp or system message)
                    if (name && !name.match(/^\d+:\d+/) && name.length < 50) {
                      cleanContent = cleanContent.replace(/^([^:]+):\s*/, '');
                    }
                  }
                  
                  return cleanContent;
                }
                
                return message.content;
              })()}
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
          followOutput={false}
          className="message-list h-full"
          atTopThreshold={50}
          atTopStateChange={(atTop) => {
            if (atTop && hasOlderMessages && !isLoadingOlder) {
              // Store the first visible message ID to restore scroll position later
              if (displayMessages.length > 0) {
                scrollAnchorMessageId.current = displayMessages[0].id;
                isLoadingOlderRef.current = true;
              }
              
              loadMoreMessages();
            }
          }}
          increaseViewportBy={{ top: 200, bottom: 200 }}
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