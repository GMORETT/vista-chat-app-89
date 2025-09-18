import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminChatService } from '../../api/AdminChatService';
import { Agent, CreateAgentRequest } from '../../models/admin';

// Use mock service for development
const adminChatService = new AdminChatService(
  'http://localhost:3001',
  () => 'mock-token',
  'mock-account-id'
);

export const useAgents = () => {
  return useQuery<Agent[]>({
    queryKey: ['solabs-admin', 'agents'],
    queryFn: () => adminChatService.getAgents(),
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Agent, Error, CreateAgentRequest>({
    mutationFn: (data) => adminChatService.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'agents'] });
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Agent, Error, { id: number; data: Partial<CreateAgentRequest> }>({
    mutationFn: ({ id, data }) => adminChatService.updateAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'agents'] });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => adminChatService.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'agents'] });
    },
  });
};