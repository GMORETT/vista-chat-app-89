import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminService } from '../../services/AdminService';
import { Channel, CreateChannelRequest } from '../../models/admin';

export const useClientInboxes = (accountId: number) => {
  const adminService = useAdminService();
  
  return useQuery<Channel[]>({
    queryKey: ['solabs-admin', 'client-inboxes', accountId],
    queryFn: () => adminService.listClientInboxes(accountId),
    enabled: accountId > 0,
  });
};

export const useCreateClientInbox = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Channel, Error, { accountId: number; data: CreateChannelRequest }>({
    mutationFn: ({ accountId, data }) => adminService.createClientInbox(accountId, data),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'client-inboxes', accountId] });
    },
  });
};

export const useUpdateClientInbox = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Channel, Error, { accountId: number; inboxId: number; data: Partial<CreateChannelRequest> }>({
    mutationFn: ({ accountId, inboxId, data }) => adminService.updateClientInbox(accountId, inboxId, data),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'client-inboxes', accountId] });
    },
  });
};

export const useDeleteClientInbox = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { accountId: number; inboxId: number }>({
    mutationFn: ({ accountId, inboxId }) => adminService.deleteClientInbox(accountId, inboxId),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'client-inboxes', accountId] });
    },
  });
};