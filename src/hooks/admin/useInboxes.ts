import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminChatService } from '../../api/AdminChatService';
import { Channel, CreateChannelRequest } from '../../models/admin';

// Mock service for development
const mockAdminService = new AdminChatService(
  'http://localhost:3001',
  () => 'mock-token',
  'mock-account-id'
);

export const useInboxes = () => {
  return useQuery<Channel[]>({
    queryKey: ['admin', 'inboxes'],
    queryFn: () => mockAdminService.getChannels(),
  });
};

export const useCreateInbox = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Channel, Error, CreateChannelRequest>({
    mutationFn: (data) => mockAdminService.createChannel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inboxes'] });
    },
  });
};

export const useUpdateInbox = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Channel, Error, { id: number; data: Partial<CreateChannelRequest> }>({
    mutationFn: ({ id, data }) => mockAdminService.updateChannel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inboxes'] });
    },
  });
};

export const useDeleteInbox = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => mockAdminService.deleteChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inboxes'] });
    },
  });
};

export const useChannelTypes = () => {
  return useQuery({
    queryKey: ['admin', 'channel-types'],
    queryFn: () => mockAdminService.getChannelTypes(),
  });
};