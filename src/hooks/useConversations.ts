import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '../api/conversations';
import { useConversationStore } from '../state/conversationStore';
import { ConversationQuery, Conversation } from '../models';

export const useConversations = () => {
  const queryClient = useQueryClient();
  const { filters, setConversations, setMeta, setLoading, setError } = useConversationStore();

  const conversationsQuery = useQuery({
    queryKey: ['conversations', filters],
    queryFn: async () => {
      const response = await conversationsApi.getConversations(filters);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const metaQuery = useQuery({
    queryKey: ['conversations', 'meta'],
    queryFn: async () => {
      const response = await conversationsApi.getMeta();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update store when data changes
  React.useEffect(() => {
    if (conversationsQuery.data?.data) {
      setConversations(conversationsQuery.data.data.payload);
      setMeta(conversationsQuery.data.data.meta);
    }
  }, [conversationsQuery.data, setConversations, setMeta]);

  React.useEffect(() => {
    if (metaQuery.data) {
      setMeta(metaQuery.data);
    }
  }, [metaQuery.data, setMeta]);

  React.useEffect(() => {
    setLoading(conversationsQuery.isLoading);
    setError(conversationsQuery.error?.message || null);
  }, [conversationsQuery.isLoading, conversationsQuery.error, setLoading, setError]);

  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status, snoozed_until }: { id: number; status: string; snoozed_until?: string }) =>
      conversationsApi.toggleStatus(id, status, snoozed_until),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });

  const togglePriorityMutation = useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: string }) =>
      conversationsApi.togglePriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });

  const assignAgentMutation = useMutation({
    mutationFn: ({ id, assignee_id }: { id: number; assignee_id: number }) =>
      conversationsApi.assignAgent(id, assignee_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });

  const assignTeamMutation = useMutation({
    mutationFn: ({ id, team_id }: { id: number; team_id: number }) =>
      conversationsApi.assignTeam(id, team_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });

  return {
    // Data
    conversations: conversationsQuery.data?.data?.payload || [],
    meta: metaQuery.data || null,
    isLoading: conversationsQuery.isLoading || metaQuery.isLoading,
    error: conversationsQuery.error || metaQuery.error,

    // Actions
    refetch: () => {
      conversationsQuery.refetch();
      metaQuery.refetch();
    },
    toggleStatus: toggleStatusMutation.mutate,
    togglePriority: togglePriorityMutation.mutate,
    assignAgent: assignAgentMutation.mutate,
    assignTeam: assignTeamMutation.mutate,
  };
};

export const useConversation = (id: number | null) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await conversationsApi.getConversation(id);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    enabled: !!id,
    staleTime: 30000,
  });
};