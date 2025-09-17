import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useChatStore } from '../state/useChatStore';
import { 
  Conversation, 
  ConversationMeta, 
  ConversationFilters,
  ConversationsResponse 
} from '../models';
import { mockConversations, mockConversationMeta } from '../data/mockData';

// Filter and sort conversations based on filters
const filterConversations = (
  conversations: Conversation[], 
  filters: ConversationFilters
): Conversation[] => {
  let filtered = [...conversations];

  // Filter by assignee type
  if (filters.assignee_type !== 'all') {
    filtered = filtered.filter(conv => {
      switch (filters.assignee_type) {
        case 'me':
          return conv.assignee_id === 1; // Mock current user ID
        case 'assigned':
          return conv.assignee_id !== null;
        case 'unassigned':
          return conv.assignee_id === null;
        default:
          return true;
      }
    });
  }

  // Filter by status
  if (filters.status !== 'all') {
    filtered = filtered.filter(conv => conv.status === filters.status);
  }

  // Filter by inbox
  if (filters.inbox_id) {
    filtered = filtered.filter(conv => conv.inbox_id === filters.inbox_id);
  }

  // Filter by team
  if (filters.team_id) {
    filtered = filtered.filter(conv => conv.team_id === filters.team_id);
  }

  // Filter by labels
  if (filters.labels.length > 0) {
    filtered = filtered.filter(conv => 
      filters.labels.some(labelTitle => 
        conv.labels.some(label => label.title === labelTitle)
      )
    );
  }

  // Filter by search query
  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(conv => 
      conv.meta.sender.name.toLowerCase().includes(query) ||
      conv.meta.sender.email?.toLowerCase().includes(query) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(query))
    );
  }

  // Sort conversations
  filtered.sort((a, b) => {
    switch (filters.sort_by) {
      case 'last_activity_at_desc':
        return b.last_activity_at - a.last_activity_at;
      case 'last_activity_at_asc':
        return a.last_activity_at - b.last_activity_at;
      case 'created_at_desc':
        return b.created_at - a.created_at;
      case 'created_at_asc':
        return a.created_at - b.created_at;
      case 'priority_desc':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, null: 0 };
        return (priorityOrder[b.priority || 'null'] || 0) - (priorityOrder[a.priority || 'null'] || 0);
      case 'priority_asc':
        const priorityOrderAsc = { urgent: 4, high: 3, medium: 2, low: 1, null: 0 };
        return (priorityOrderAsc[a.priority || 'null'] || 0) - (priorityOrderAsc[b.priority || 'null'] || 0);
      case 'waiting_since_desc':
        return (b.waiting_since || 0) - (a.waiting_since || 0);
      case 'waiting_since_asc':
        return (a.waiting_since || 0) - (b.waiting_since || 0);
      default:
        return b.last_activity_at - a.last_activity_at;
    }
  });

  return filtered;
};

// Calculate meta counts based on filters
const calculateMeta = (
  conversations: Conversation[], 
  baseFilters: Omit<ConversationFilters, 'assignee_type'>
): ConversationMeta => {
  const filterWithoutAssignee = (assigneeType: 'me' | 'assigned' | 'unassigned' | 'all') => {
    return filterConversations(conversations, { ...baseFilters, assignee_type: assigneeType });
  };

  return {
    mine_count: filterWithoutAssignee('me').length,
    unassigned_count: filterWithoutAssignee('unassigned').length,
    assigned_count: filterWithoutAssignee('assigned').length,
    all_count: filterWithoutAssignee('all').length,
  };
};

export const useConversations = () => {
  const { filters } = useChatStore();
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ['conversations', filters],
    queryFn: async (): Promise<ConversationsResponse> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const filteredConversations = filterConversations(mockConversations, filters);
      const meta = calculateMeta(mockConversations, {
        status: filters.status,
        inbox_id: filters.inbox_id,
        team_id: filters.team_id,
        labels: filters.labels,
        sort_by: filters.sort_by,
        search: filters.search,
      });

      return {
        data: {
          meta,
          payload: filteredConversations,
        },
      };
    },
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      snoozed_until 
    }: { 
      id: number; 
      status: string; 
      snoozed_until?: string; 
    }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update mock data
      const conversation = mockConversations.find(c => c.id === id);
      if (conversation) {
        conversation.status = status as any;
        if (snoozed_until) {
          conversation.snoozed_until = new Date(snoozed_until).getTime();
        }
      }
      
      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });

  // Toggle priority mutation
  const togglePriorityMutation = useMutation({
    mutationFn: async ({ 
      id, 
      priority 
    }: { 
      id: number; 
      priority: string; 
    }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const conversation = mockConversations.find(c => c.id === id);
      if (conversation) {
        conversation.priority = priority as any;
      }
      
      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });

  // Assign agent mutation
  const assignAgentMutation = useMutation({
    mutationFn: async ({ 
      id, 
      assignee_id 
    }: { 
      id: number; 
      assignee_id: number; 
    }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const conversation = mockConversations.find(c => c.id === id);
      if (conversation) {
        conversation.assignee_id = assignee_id;
        // Find agent and update meta
        const agent = mockConversations[0]?.meta?.assignee; // Mock agent lookup
        if (agent) {
          conversation.meta.assignee = { ...agent, id: assignee_id };
        }
      }
      
      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
    },
  });

  // Assign team mutation
  const assignTeamMutation = useMutation({
    mutationFn: async ({ 
      id, 
      team_id 
    }: { 
      id: number; 
      team_id: number; 
    }) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const conversation = mockConversations.find(c => c.id === id);
      if (conversation) {
        conversation.team_id = team_id;
      }
      
      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation'] });
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
    toggleStatus: toggleStatusMutation.mutate,
    togglePriority: togglePriorityMutation.mutate,
    assignAgent: assignAgentMutation.mutate,
    assignTeam: assignTeamMutation.mutate,
  };
};

export const useConversationsMeta = () => {
  const { filters } = useChatStore();

  return useQuery({
    queryKey: ['conversations', 'meta', filters],
    queryFn: async (): Promise<ConversationMeta> => {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return calculateMeta(mockConversations, {
        status: filters.status,
        inbox_id: filters.inbox_id,
        team_id: filters.team_id,
        labels: filters.labels,
        sort_by: filters.sort_by,
        search: filters.search,
      });
    },
    staleTime: 15000, // 15 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useConversation = (id: number | null) => {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: async (): Promise<Conversation | null> => {
      if (!id) return null;
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const conversation = mockConversations.find(c => c.id === id);
      return conversation || null;
    },
    enabled: !!id,
    staleTime: 30000,
  });
};