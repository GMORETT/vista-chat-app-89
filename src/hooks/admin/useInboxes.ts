import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminService } from '../../services/AdminService';
import { Channel, CreateChannelRequest } from '../../models/admin';

export const useInboxes = () => {
  const adminService = useAdminService();
  
  return useQuery<Channel[]>({
    queryKey: ['solabs-admin', 'inboxes'],
    queryFn: () => adminService.listInboxes(),
  });
};

export const useCreateInbox = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Channel, Error, CreateChannelRequest>({
    mutationFn: (data) => adminService.createInbox(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'inboxes'] });
    },
  });
};

export const useUpdateInbox = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Channel, Error, { id: number; data: Partial<CreateChannelRequest> }>({
    mutationFn: ({ id, data }) => adminService.updateInbox(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'inboxes'] });
    },
  });
};

export const useDeleteInbox = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => adminService.deleteInbox(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'inboxes'] });
    },
  });
};

export const useChannelTypes = () => {
  const adminService = useAdminService();
  
  return useQuery({
    queryKey: ['solabs-admin', 'channel-types'],
    queryFn: () => adminService.getChannelTypes(),
  });
};

export const useAssignInboxAgents = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { inboxId: number; agentIds: number[] }>({
    mutationFn: ({ inboxId, agentIds }) => adminService.assignInboxAgents(inboxId, agentIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'inboxes'] });
    },
  });
};