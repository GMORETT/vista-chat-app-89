import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../api/messages';
import { useMessageStore } from '../state/messageStore';
import { SendMessageRequest } from '../models';

export const useMessages = (conversationId: number | null) => {
  const queryClient = useQueryClient();
  const { setMessages, setLoading, setError, setSending } = useMessageStore();

  const messagesQuery = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return null;
      const response = await messagesApi.getMessages(conversationId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!conversationId,
    staleTime: 10000, // 10 seconds
  });

  // Update store when data changes
  React.useEffect(() => {
    if (messagesQuery.data?.payload) {
      setMessages(messagesQuery.data.payload);
    }
  }, [messagesQuery.data, setMessages]);

  React.useEffect(() => {
    setLoading(messagesQuery.isLoading);
    setError(messagesQuery.error?.message || null);
  }, [messagesQuery.isLoading, messagesQuery.error, setLoading, setError]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, data }: { conversationId: number; data: SendMessageRequest }) => {
      setSending(true);
      const response = await messagesApi.sendMessage(conversationId, data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (newMessage) => {
      // Optimistically add message to the store
      useMessageStore.getState().addMessage(newMessage);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] }); // Update unread counts
    },
    onError: (error) => {
      setError(error.message);
    },
    onSettled: () => {
      setSending(false);
    },
  });

  // Send file mutation
  const sendFilesMutation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      files, 
      content, 
      isPrivate 
    }: { 
      conversationId: number; 
      files: File[]; 
      content?: string; 
      isPrivate?: boolean; 
    }) => {
      setSending(true);
      const response = await messagesApi.sendMessageWithFiles(conversationId, files, content, isPrivate);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: (newMessage) => {
      useMessageStore.getState().addMessage(newMessage);
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      setError(error.message);
    },
    onSettled: () => {
      setSending(false);
    },
  });

  // Load more messages (pagination)
  const loadMoreMessages = async (before?: string) => {
    if (!conversationId) return;
    
    try {
      setLoading(true);
      const response = await messagesApi.getMessages(conversationId, { before });
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data?.payload) {
        useMessageStore.getState().prependMessages(response.data.payload);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    messages: messagesQuery.data?.payload || [],
    isLoading: messagesQuery.isLoading,
    isSending: useMessageStore(state => state.isSending),
    error: messagesQuery.error,

    // Actions
    sendMessage: (data: SendMessageRequest) => {
      if (conversationId) {
        sendMessageMutation.mutate({ conversationId, data });
      }
    },
    sendFiles: (files: File[], content?: string, isPrivate?: boolean) => {
      if (conversationId) {
        sendFilesMutation.mutate({ conversationId, files, content, isPrivate });
      }
    },
    loadMoreMessages,
    refetch: messagesQuery.refetch,
  };
};