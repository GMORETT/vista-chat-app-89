import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminChatService } from '../../api/AdminChatService';
import { Agent, CreateAgentRequest } from '../../models/admin';

// Mock service for development
const mockAdminService = new AdminChatService(
  'http://localhost:3001',
  () => 'mock-token',
  'mock-account-id'
);

export const useAgents = () => {
  return useQuery<Agent[]>({
    queryKey: ['admin', 'agents'],
    queryFn: async () => {
      // Mock data for development
      return [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'agent' as const,
          confirmed: true,
          availability_status: 'available' as const,
          auto_offline: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'administrator' as const,
          confirmed: true,
          availability_status: 'busy' as const,
          auto_offline: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
    },
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Agent, Error, CreateAgentRequest>({
    mutationFn: async (data) => {
      // Mock implementation
      return {
        id: Date.now(),
        ...data,
        role: data.role || 'agent',
        confirmed: false,
        availability_status: 'offline' as const,
        auto_offline: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'agents'] });
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Agent, Error, { id: number; data: Partial<CreateAgentRequest> }>({
    mutationFn: async ({ id, data }) => {
      return {
        id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'agent',
        confirmed: true,
        availability_status: 'available' as const,
        auto_offline: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'agents'] });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      console.log('Deleting agent:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'agents'] });
    },
  });
};