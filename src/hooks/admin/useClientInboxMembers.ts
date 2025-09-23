import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Agent } from '../../models/admin';
import { useAdminService } from '../../services/AdminService';

export const useClientInboxMembers = (accountId: number, inboxId: number) => {
  const adminService = useAdminService();
  
  return useQuery<Agent[]>({
    queryKey: ['solabs-admin', 'client-inboxes', accountId, inboxId, 'members'],
    queryFn: () => adminService.getClientInboxMembers(accountId, inboxId),
    enabled: accountId > 0 && inboxId > 0,
  });
};

export const useAssignClientInboxMembers = () => {
  const queryClient = useQueryClient();
  const adminService = useAdminService();
  
  return useMutation<void, Error, { accountId: number; inboxId: number; agentIds: number[] }>({
    mutationFn: ({ accountId, inboxId, agentIds }) => 
      adminService.assignClientInboxMembers(accountId, inboxId, agentIds),
    onSuccess: (_, { accountId, inboxId }) => {
      queryClient.invalidateQueries({ 
        queryKey: ['solabs-admin', 'client-inboxes', accountId, inboxId, 'members'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['solabs-admin', 'client-inboxes', accountId] 
      });
    },
  });
};