import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminService } from '../../services/AdminService';
import { Label, CreateLabelRequest } from '../../models/admin';

export const useLabels = () => {
  const adminService = useAdminService();
  
  return useQuery<Label[]>({
    queryKey: ['solabs-admin', 'labels'],
    queryFn: () => adminService.listLabels(),
  });
};

export const useCreateLabel = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Label, Error, CreateLabelRequest>({
    mutationFn: (data) => adminService.createLabel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'labels'] });
    },
  });
};

export const useUpdateLabel = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Label, Error, { id: number; data: Partial<CreateLabelRequest> }>({
    mutationFn: ({ id, data }) => adminService.updateLabel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'labels'] });
    },
  });
};

export const useDeleteLabel = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => adminService.deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'labels'] });
    },
  });
};

export const useAddLabelsToContact = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { contactId: number; labelIds: number[] }>({
    mutationFn: ({ contactId, labelIds }) => adminService.addLabelsToContact(contactId, labelIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'labels'] });
    },
  });
};

export const useAddLabelsToConversation = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, { conversationId: number; labelIds: number[] }>({
    mutationFn: ({ conversationId, labelIds }) => adminService.addLabelsToConversation(conversationId, labelIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'labels'] });
    },
  });
};