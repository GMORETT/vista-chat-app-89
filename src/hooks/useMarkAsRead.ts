import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createChatService } from '../utils/chatServiceFactory';

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { getChatwootConfig } = useAuth();
  
  // Create appropriate chat service based on configuration
  const chatwootConfig = getChatwootConfig();
  const chatService = createChatService(chatwootConfig ? {
    token: chatwootConfig.token,
    accountId: chatwootConfig.accountId,
  } : undefined);

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      const response = await chatService.markRead(conversationId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (_, conversationId) => {
      // Invalidate conversations list to refresh unread status
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
      
      console.log('✅ Conversation', conversationId, 'marked as read');
    },
    onError: (error, conversationId) => {
      console.error('❌ Failed to mark conversation', conversationId, 'as read:', error);
    },
  });

  const markAsRead = useCallback((conversationId: number) => {
    markAsReadMutation.mutate(conversationId);
  }, [markAsReadMutation.mutate]);

  return {
    markAsRead,
    isMarking: markAsReadMutation.isPending,
  };
};