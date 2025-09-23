import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message, MessagesResponse, MessageFilters, SendMessageRequest, SendFileRequest, MessageQuery } from '../models/chat';
import { MockChatService } from '../api/MockChatService';
import { BffChatService } from '../api/BffChatService';

export const useMessages = (conversationId: number | null, filters?: MessageFilters) => {
  const queryClient = useQueryClient();
  // Note: Draft functionality removed for simplification
  const useBff = import.meta.env.VITE_USE_BFF === 'true';
  const chatService = useBff ? new BffChatService() : new MockChatService();
  
  // Convert filters to query format
  const query: MessageQuery = {
    before: filters?.before,
    limit: filters?.limit || 20,
  };
  
  const messagesQuery = useQuery({
    queryKey: ['messages', conversationId, query],
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
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, private: isPrivate }: { content: string; private?: boolean }) => {
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }
      
      const request: SendMessageRequest = {
        content,
        private: isPrivate || false,
      };
      
      const response = await chatService.sendMessage(conversationId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data!;
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });

  const sendFilesMutation = useMutation({
    mutationFn: async ({ files, content }: { files: File[]; content?: string }) => {
      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }
      
      const request: SendFileRequest = {
        files,
        content: content || 'Arquivo enviado',
      };
      
      const response = await chatService.sendAttachment(conversationId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data!;
    },
    onSuccess: () => {
      if (conversationId) {
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    },
  });

  const loadMoreMessages = async () => {
    if (!conversationId || messagesQuery.isFetching) return;
    
    const currentMessages = messagesQuery.data?.payload || [];
    if (currentMessages.length === 0) return;
    
    const oldestMessage = currentMessages[currentMessages.length - 1];
    const beforeTimestamp = oldestMessage.created_at.toString();
    
    const olderQuery: MessageQuery = {
      before: beforeTimestamp,
      limit: filters?.limit || 20,
    };
    
    const response = await chatService.getMessages(conversationId, olderQuery);
    if (response.error || !response.data) return;
    
    const olderMessages = response.data;
    
    if (olderMessages.payload.length > 0) {
      // Merge with existing data
      queryClient.setQueryData(['messages', conversationId, query], (old: MessagesResponse | undefined) => {
        if (!old) return olderMessages;
        
        return {
          ...old,
          payload: [...old.payload, ...olderMessages.payload],
        };
      });
    }
  };

  const loadNewerMessages = async () => {
    if (!conversationId || messagesQuery.isFetching) return;
    
    const currentMessages = messagesQuery.data?.payload || [];
    if (currentMessages.length === 0) return;
    
    const newestMessage = currentMessages[0];
    const afterTimestamp = newestMessage.created_at.toString();
    
    const newerQuery: MessageQuery = {
      after: afterTimestamp,
      limit: filters?.limit || 20,
    };
    
    const response = await chatService.getMessages(conversationId, newerQuery);
    if (response.error || !response.data) return;
    
    const newerMessages = response.data;
    
    if (newerMessages.payload.length > 0) {
      // Merge with existing data
      queryClient.setQueryData(['messages', conversationId, query], (old: MessagesResponse | undefined) => {
        if (!old) return newerMessages;
        
        return {
          ...old,
          payload: [...newerMessages.payload, ...old.payload],
        };
      });
    }
  };

  return {
    // Data
    messages: messagesQuery.data?.payload || [],
    isLoading: messagesQuery.isLoading,
    isSending: sendMessageMutation.isPending || sendFilesMutation.isPending,
    error: messagesQuery.error,

    // Actions
    sendMessage: (content: string, isPrivate?: boolean) => {
      sendMessageMutation.mutate({ content, private: isPrivate });
    },
    sendFiles: (files: File[], content?: string) => {
      sendFilesMutation.mutate({ files, content });
    },
    loadMoreMessages,
    loadNewerMessages,
    refetch: messagesQuery.refetch,
  };
};