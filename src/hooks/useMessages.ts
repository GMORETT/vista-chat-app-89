import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message, MessagesResponse, MessageFilters, SendMessageRequest, SendFileRequest, MessageQuery } from '../models/chat';
import { useMessageStore } from '../state/stores/messageStore';
import { useEffect } from 'react';
import { createChatService } from '../utils/chatServiceFactory';
import { useAuth } from '../contexts/AuthContext';
import { usePollingMessages } from './useRealTimeMessages';

export const useMessages = (conversationId: number | null, filters?: MessageFilters) => {
  const queryClient = useQueryClient();
  const { getChatwootConfig } = useAuth();
  
  // Create appropriate chat service based on configuration
  const chatwootConfig = getChatwootConfig();
  const chatService = createChatService(chatwootConfig ? {
    token: chatwootConfig.token,
    accountId: chatwootConfig.accountId,
  } : undefined);
  
  const { 
    initializeBuffer, 
    addNewerMessages, 
    addOlderMessages, 
    addNewMessage, 
    getBuffer, 
    setLoadingState,
    clearBuffer,
    updateHasOlderMessages
  } = useMessageStore();
  
  const buffer = conversationId ? getBuffer(conversationId) : null;
  
  // Debug buffer state when conversation changes
  useEffect(() => {
    if (conversationId && buffer) {
      console.log('📊 Buffer state for conversation', conversationId, ':');
      console.log('📊 Messages count:', buffer.messages.length);
      console.log('📊 hasOlderMessages:', buffer.hasOlderMessages);
      console.log('📊 hasNewerMessages:', buffer.hasNewerMessages);
      console.log('📊 isLoadingOlder:', buffer.isLoadingOlder);
    }
  }, [conversationId, buffer?.messages.length, buffer?.hasOlderMessages]);
  
  // Polling fallback when WebSocket is not available or fails
  const isRealTimeEnabled = import.meta.env.VITE_ENABLE_REALTIME === 'true';
  const usePollingFallback = !isRealTimeEnabled || !chatwootConfig;
  
  const { isPolling } = usePollingMessages(
    conversationId,
    chatService,
    10000, // Poll every 10 seconds
    usePollingFallback
  );
  
  // Convert filters to query format
  const query: MessageQuery = {
    before: filters?.before,
    limit: filters?.limit || 50, // Increased for better buffer management
  };
  
  const messagesQuery = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async (): Promise<MessagesResponse> => {
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }
      
      const response = await chatService.getMessages(conversationId, query);
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data!;
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Initialize buffer when messages are loaded
  useEffect(() => {
    if (conversationId && messagesQuery.data?.payload && !buffer?.messages.length) {
      initializeBuffer(conversationId, messagesQuery.data.payload);
    }
  }, [conversationId, messagesQuery.data?.payload, buffer?.messages.length, initializeBuffer]);

  // Clear buffer when conversation changes
  useEffect(() => {
    return () => {
      if (conversationId) {
        // Don't clear immediately, let the new conversation initialize first
      }
    };
  }, [conversationId]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, private: isPrivate, replyToMessageId }: { content: string; private?: boolean; replyToMessageId?: number }) => {
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }
      
      const request: SendMessageRequest = {
        content,
        private: isPrivate || false,
        content_attributes: replyToMessageId ? { in_reply_to: replyToMessageId } : undefined,
      };
      
      const response = await chatService.sendMessage(conversationId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data!;
    },
    onSuccess: (newMessage) => {
      if (conversationId && newMessage) {
        // Add message to buffer immediately for optimistic UI
        addNewMessage(conversationId, newMessage);
        
        // Still invalidate queries for other data consistency
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });

  const sendFilesMutation = useMutation({
    mutationFn: async ({ files, content, replyToMessageId }: { files: File[]; content?: string; replyToMessageId?: number }) => {
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }
      
      const request: SendFileRequest = {
        files,
        content: content || 'Arquivo enviado',
        content_attributes: replyToMessageId ? { in_reply_to: replyToMessageId } : undefined,
      };
      
      const response = await chatService.sendAttachment(conversationId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data!;
    },
    onSuccess: (newMessage) => {
      if (conversationId && newMessage) {
        // Add file message to buffer immediately
        addNewMessage(conversationId, newMessage);
        
        // Still invalidate queries for other data consistency
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });

  const loadMoreMessages = async () => {
    if (!conversationId || !buffer || buffer.isLoadingOlder || !buffer.hasOlderMessages) {
      return;
    }
    
    setLoadingState(conversationId, 'older', true);
    
    try {
      // Find the actual oldest message (lowest created_at timestamp)
      const sortedMessages = [...buffer.messages].sort((a, b) => a.created_at - b.created_at);
      const oldestMessage = sortedMessages[0];
      
      if (!oldestMessage) {
        return;
      }
      
      // Use the message ID of the oldest message for pagination
      const beforeMessageId = oldestMessage.id;
      
      const olderQuery: MessageQuery = {
        before: beforeMessageId.toString(),
        limit: 50,
      };
      
      const response = await chatService.getMessages(conversationId, olderQuery);
      
      if (response.error || !response.data) {
        return;
      }
      
      const olderMessages = response.data.payload;
      
      if (olderMessages.length > 0) {
        addOlderMessages(conversationId, olderMessages);
      } else {
        // When we get 0 messages, there are no more older messages
        updateHasOlderMessages(conversationId, false);
      }
    } finally {
      setLoadingState(conversationId, 'older', false);
    }
  };

  const loadNewerMessages = async () => {
    if (!conversationId || !buffer || buffer.isLoadingNewer || !buffer.hasNewerMessages) return;
    
    setLoadingState(conversationId, 'newer', true);
    
    try {
      const newestMessage = buffer.messages[buffer.messages.length - 1];
      if (!newestMessage) return;
      
      const newerQuery: MessageQuery = {
        after: newestMessage.created_at.toString(),
        limit: 50,
      };
      
      const response = await chatService.getMessages(conversationId, newerQuery);
      if (response.error || !response.data) return;
      
      const newerMessages = response.data.payload;
      if (newerMessages.length > 0) {
        addNewerMessages(conversationId, newerMessages);
      }
    } finally {
      setLoadingState(conversationId, 'newer', false);
    }
  };

  return {
    // Data from buffer instead of query cache
    messages: buffer?.messages || [],
    isLoading: messagesQuery.isLoading,
    isSending: sendMessageMutation.isPending || sendFilesMutation.isPending,
    isLoadingOlder: buffer?.isLoadingOlder || false,
    isLoadingNewer: buffer?.isLoadingNewer || false,
    hasOlderMessages: buffer?.hasOlderMessages || false,
    hasNewerMessages: buffer?.hasNewerMessages || false,
    isPolling, // Expose polling status
    error: messagesQuery.error,

    // Actions
    sendMessage: (content: string, isPrivate?: boolean, replyToMessageId?: number) => {
      sendMessageMutation.mutate({ content, private: isPrivate, replyToMessageId });
    },
    sendFiles: (files: File[], content?: string, replyToMessageId?: number) => {
      sendFilesMutation.mutate({ files, content, replyToMessageId });
    },
    loadMoreMessages,
    loadNewerMessages,
    refetch: messagesQuery.refetch,
  };
};