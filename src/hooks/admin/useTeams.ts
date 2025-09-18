import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminChatService } from '../../api/AdminChatService';
import { Team, CreateTeamRequest } from '../../models/admin';

// Mock service for development
const mockAdminService = new AdminChatService(
  'http://localhost:3001',
  () => 'mock-token',
  'mock-account-id'
);

export const useTeams = () => {
  return useQuery<Team[]>({
    queryKey: ['admin', 'teams'],
    queryFn: async () => {
      // Mock data for development
      return [
        {
          id: 1,
          name: 'Support Team',
          description: 'Customer support team',
          allow_auto_assign: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Sales Team',
          description: 'Sales and pre-sales team',
          allow_auto_assign: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
    },
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Team, Error, CreateTeamRequest>({
    mutationFn: async (data) => {
      // Mock implementation
      return {
        id: Date.now(),
        ...data,
        allow_auto_assign: data.allow_auto_assign || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Team, Error, { id: number; data: Partial<CreateTeamRequest> }>({
    mutationFn: async ({ id, data }) => {
      return {
        id,
        name: data.name || '',
        description: data.description,
        allow_auto_assign: data.allow_auto_assign || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });
};

export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      console.log('Deleting team:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'teams'] });
    },
  });
};