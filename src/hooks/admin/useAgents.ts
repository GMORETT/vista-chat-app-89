import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Agent, CreateAgentRequest } from '../../models/admin';
import { useAdminService } from '../../services/AdminService';

export const useAgents = (accountId?: number) => {
  const adminService = useAdminService();
  
  return useQuery<Agent[]>({
    queryKey: ['solabs-admin', 'agents', accountId],
    queryFn: () => adminService.listAgents(),
    select: (data) => {
      // Filter agents by account_id if provided
      if (accountId) {
        return data.filter(agent => agent.account_id === accountId);
      }
      return data;
    }
  });
};

export const useCreateAgent = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();
  
  return useMutation<Agent, Error, CreateAgentRequest>({
    mutationFn: (data) => adminService.createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'agents'] });
    },
  });
};

export const useUpdateAgent = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();
  
  return useMutation<Agent, Error, { id: number; data: Partial<CreateAgentRequest> }>({
    mutationFn: ({ id, data }) => adminService.updateAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'agents'] });
    },
  });
};

export const useDeleteAgent = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => adminService.deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'agents'] });
    },
  });
};