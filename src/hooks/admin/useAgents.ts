import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminService } from '../../services/AdminService';
import { Agent, CreateAgentRequest } from '../../models/admin';

export const useAgents = () => {
  const adminService = useAdminService();
  
  return useQuery<Agent[]>({
    queryKey: ['solabs-admin', 'agents'],
    queryFn: () => adminService.listAgents(),
  });
};

export const useCreateAgent = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Agent, Error, CreateAgentRequest>({
    mutationFn: (data) => adminService.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'agents'] });
    },
  });
};

export const useUpdateAgent = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Agent, Error, { id: number; data: Partial<CreateAgentRequest> }>({
    mutationFn: ({ id, data }) => adminService.updateAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'agents'] });
    },
  });
};

export const useDeleteAgent = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => adminService.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'agents'] });
    },
  });
};