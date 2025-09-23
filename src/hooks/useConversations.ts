import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Conversation, ConversationMeta, ConversationQuery, ConversationFilters, UpdateStatusRequest, UpdatePriorityRequest, AssignAgentRequest, AssignTeamRequest, StatusType, PriorityType, Label } from '../models/chat';
import { MockChatService } from '../api/MockChatService';
import { BffChatService } from '../api/BffChatService';
import { useConversationStore } from '../state/stores/conversationStore';
import { useToast } from '../hooks/use-toast';
import { useCurrentClient } from '../hooks/useCurrentClient';
import { useAuth } from '../contexts/AuthContext';
import { getConversations } from '../data/mockDataLazy';

export const useConversations = (filters: ConversationFilters) => {
  const queryClient = useQueryClient();
  const { updateConversation, selectedConversation } = useConversationStore();
  const { toast } = useToast();
  const { currentAccountId } = useCurrentClient();
  const { user } = useAuth();
  const useBff = import.meta.env.VITE_USE_BFF === 'true';
  const chatService = useBff ? new BffChatService() : new MockChatService();
  
  // Convert filters to query format
  const query: ConversationQuery = {
    assignee_type: filters.assignee_type,
    status: filters.status,
    inbox_id: filters.inbox_id,
    team_id: filters.team_id,
    labels: filters.labels,
    sort_by: filters.sort_by,
    q: filters.q,
    updated_within: filters.updated_within,
    account_id: currentAccountId, // Include account_id for filtering
  };

  const conversationsQuery = useQuery({
    queryKey: ['conversations', query],
    queryFn: async () => {
      const response = await chatService.listConversations(query);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ conversationId, status }: { conversationId: number; status: StatusType }) => {
      const request: UpdateStatusRequest = { status };
      const response = await chatService.toggleStatus(conversationId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onMutate: async ({ conversationId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      
      // Optimistically update conversation in store
      if (selectedConversation?.id === conversationId) {
        updateConversation({ ...selectedConversation, status });
      }
      
      // Optimistically update conversations list
      queryClient.setQueryData(['conversations', query], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            payload: oldData.data.payload.map((conv: any) => 
              conv.id === conversationId ? { ...conv, status } : conv
            )
          }
        };
      });
      
      return { conversationId, previousStatus: selectedConversation?.status };
    },
    onSuccess: (updatedConversation, { conversationId, status }) => {
      // Invalidate and refetch
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
      }, 100);
      
      toast({
        title: "Status atualizado",
        description: `Conversa marcada como ${status === 'open' ? 'aberta' : status === 'pending' ? 'pendente' : status === 'snoozed' ? 'adiada' : 'resolvida'}`,
      });
    },
    onError: (error, { conversationId }, context) => {
      // Rollback optimistic update
      if (context?.previousStatus && selectedConversation?.id === conversationId) {
        updateConversation({ ...selectedConversation, status: context.previousStatus });
      }
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const togglePriorityMutation = useMutation({
    mutationFn: async ({ conversationId, priority }: { conversationId: number; priority: PriorityType }) => {
      const request: UpdatePriorityRequest = { priority };
      const response = await chatService.togglePriority(conversationId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onMutate: async ({ conversationId, priority }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      
      // Optimistically update conversation in store
      if (selectedConversation?.id === conversationId) {
        updateConversation({ ...selectedConversation, priority });
      }
      
      // Optimistically update conversations list
      queryClient.setQueryData(['conversations', query], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            payload: oldData.data.payload.map((conv: any) => 
              conv.id === conversationId ? { ...conv, priority } : conv
            )
          }
        };
      });
      
      return { conversationId, previousPriority: selectedConversation?.priority };
    },
    onSuccess: (updatedConversation, { conversationId, priority }) => {
      // Invalidate and refetch with delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
      }, 100);
      
      toast({
        title: "Prioridade atualizada",
        description: `Prioridade definida como ${priority === 'urgent' ? 'urgente' : priority === 'high' ? 'alta' : priority === 'medium' ? 'média' : priority === 'low' ? 'baixa' : 'nenhuma'}`,
      });
    },
    onError: (error, { conversationId }, context) => {
      // Rollback optimistic update
      if (context?.previousPriority !== undefined && selectedConversation?.id === conversationId) {
        updateConversation({ ...selectedConversation, priority: context.previousPriority });
      }
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      toast({
        title: "Erro ao atualizar prioridade",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const assignAgentMutation = useMutation({
    mutationFn: async ({ conversationId, agentId }: { conversationId: number; agentId: number }) => {
      const request: AssignAgentRequest = { assignee_id: agentId };
      const response = await chatService.assignAgent(conversationId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
    },
  });

  const assignTeamMutation = useMutation({
    mutationFn: async ({ conversationId, teamId }: { conversationId: number; teamId: number }) => {
      const request: AssignTeamRequest = { team_id: teamId };
      const response = await chatService.assignTeam(conversationId, request);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
    },
  });

  const updateLabelsMutation = useMutation({
    mutationFn: async ({ conversationId, labels }: { conversationId: number; labels: Label[] }) => {
      // Mock implementation for updating labels
      const conversation = selectedConversation;
      if (!conversation) throw new Error('No conversation selected');
      
      const updatedConversation = { ...conversation, labels };
      return updatedConversation;
    },
    onMutate: async ({ conversationId, labels }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['conversations'] });
      
      // Optimistically update conversation in store
      if (selectedConversation?.id === conversationId) {
        updateConversation({ ...selectedConversation, labels });
      }
      
      // Optimistically update conversations list
      queryClient.setQueryData(['conversations', query], (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            payload: oldData.data.payload.map((conv: any) => 
              conv.id === conversationId ? { ...conv, labels } : conv
            )
          }
        };
      });
      
      return { conversationId, previousLabels: selectedConversation?.labels };
    },
    onSuccess: (updatedConversation, { conversationId, labels }) => {
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['conversationsMeta'] });
      }, 100);
      
      toast({
        title: "Labels atualizadas",
        description: `Labels da conversa foram atualizadas`,
      });
    },
    onError: (error, { conversationId }, context) => {
      // Rollback optimistic update
      if (context?.previousLabels && selectedConversation?.id === conversationId) {
        updateConversation({ ...selectedConversation, labels: context.previousLabels });
      }
      
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      
      toast({
        title: "Erro ao atualizar labels",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    conversations: conversationsQuery.data?.data?.payload || [],
    meta: conversationsQuery.data?.data?.meta || null,
    isLoading: conversationsQuery.isLoading,
    error: conversationsQuery.error,

    // Actions
    refetch: conversationsQuery.refetch,
    toggleStatus: (conversationId: number, status: StatusType) => 
      toggleStatusMutation.mutate({ conversationId, status }),
    togglePriority: (conversationId: number, priority: PriorityType) => 
      togglePriorityMutation.mutate({ conversationId, priority }),
    updateLabels: (conversationId: number, labels: Label[]) => 
      updateLabelsMutation.mutate({ conversationId, labels }),
    
    // Loading states
    isStatusLoading: toggleStatusMutation.isPending,
    isPriorityLoading: togglePriorityMutation.isPending,
    isLabelsLoading: updateLabelsMutation.isPending,
    assignAgent: (conversationId: number, agentId: number) => 
      assignAgentMutation.mutate({ conversationId, agentId }),
    assignTeam: (conversationId: number, teamId: number) => 
      assignTeamMutation.mutate({ conversationId, teamId }),
  };
};

export const useConversationsMeta = (filters?: ConversationFilters) => {
  const useBff = import.meta.env.VITE_USE_BFF === 'true';
  const chatService = useBff ? new BffChatService() : new MockChatService();
  const { currentAccountId } = useCurrentClient();
  const { user } = useAuth();
  
  // For mock service, calculate meta directly from conversations
  if (!useBff) {
    return useQuery({
      queryKey: ['conversationsMeta', filters, user?.id],
      queryFn: () => {
        // Get all conversations and calculate accurate counts
        const allConversations = getConversations(15);
        
        const mine_count = allConversations.filter(c => c.meta.assignee?.id === user?.id).length;
        const unassigned_count = allConversations.filter(c => !c.meta.assignee).length;
        const assigned_count = allConversations.filter(c => c.meta.assignee).length;
        const all_count = allConversations.length;
        
        return Promise.resolve({
          mine_count,
          unassigned_count,  
          assigned_count,
          all_count,
        });
      },
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes
      refetchInterval: 30 * 1000, // Refresh every 30 seconds
    });
  }
  
  // Convert filters to query format - Fix mine filter by handling assignee_type properly
  const query: ConversationQuery | undefined = filters ? {
    status: filters.status,
    assignee_type: filters.assignee_type === 'me' ? 'assigned' : filters.assignee_type, // Convert 'me' to 'assigned'
    inbox_id: filters.inbox_id,
    team_id: filters.team_id,
    labels: filters.labels,
    q: filters.q,
    updated_within: filters.updated_within,
    account_id: currentAccountId, // Include account_id for filtering
  } : { account_id: currentAccountId };
  
  return useQuery({
    queryKey: ['conversationsMeta', query],
    queryFn: async (): Promise<ConversationMeta> => {
      const response = await chatService.getConversationsMeta(query);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
  });
};

export const useConversation = (id: number | null) => {
  const useBff = import.meta.env.VITE_USE_BFF === 'true';
  const chatService = useBff ? new BffChatService() : new MockChatService();
  
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: async (): Promise<Conversation> => {
      if (!id) {
        throw new Error('Conversation ID is required');
      }
      
      const response = await chatService.getConversation(id);
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data!;
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};