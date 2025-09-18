import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminChatService } from '../../api/AdminChatService';
import { Label, CreateLabelRequest } from '../../models/admin';

// Mock service for development
const mockAdminService = new AdminChatService(
  'http://localhost:3001',
  () => 'mock-token',
  'mock-account-id'
);

export const useLabels = () => {
  return useQuery<Label[]>({
    queryKey: ['admin', 'labels'],
    queryFn: async () => {
      // Mock data for development
      return [
        {
          id: 1,
          title: 'Bug',
          description: 'Bug reports and issues',
          color: '#ef4444',
          show_on_sidebar: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          title: 'Feature Request',
          description: 'New feature requests',
          color: '#3b82f6',
          show_on_sidebar: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 3,
          title: 'VIP Customer',
          description: 'VIP customer conversations',
          color: '#f59e0b',
          show_on_sidebar: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 4,
          title: 'Urgent',
          description: 'Urgent issues requiring immediate attention',
          color: '#dc2626',
          show_on_sidebar: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
    },
  });
};

export const useCreateLabel = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Label, Error, CreateLabelRequest>({
    mutationFn: async (data) => {
      // Mock implementation
      return {
        id: Date.now(),
        ...data,
        show_on_sidebar: data.show_on_sidebar ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'labels'] });
    },
  });
};

export const useUpdateLabel = () => {
  const queryClient = useQueryClient();
  
  return useMutation<Label, Error, { id: number; data: Partial<CreateLabelRequest> }>({
    mutationFn: async ({ id, data }) => {
      return {
        id,
        title: data.title || '',
        description: data.description,
        color: data.color || '#6b7280',
        show_on_sidebar: data.show_on_sidebar ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'labels'] });
    },
  });
};

export const useDeleteLabel = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      console.log('Deleting label:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'labels'] });
    },
  });
};