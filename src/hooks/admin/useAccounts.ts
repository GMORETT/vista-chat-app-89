import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAdminService } from '../../services/AdminService';
import { Account, CreateAccountRequest, UpdateAccountRequest } from '../../models/chat';

export const useAccounts = () => {
  const adminService = useAdminService();
  
  return useQuery<Account[]>({
    queryKey: ['solabs-admin', 'accounts'],
    queryFn: () => adminService.listAccounts(),
  });
};

export const useListAccounts = () => {
  const adminService = useAdminService();
  
  return useQuery<Account[]>({
    queryKey: ['solabs-admin', 'accounts'],
    queryFn: () => adminService.listAccounts(),
  });
};

export const useCreateAccount = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Account, Error, CreateAccountRequest>({
    mutationFn: (data) => adminService.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'accounts'] });
    },
  });
};

export const useUpdateAccount = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<Account, Error, { id: number; data: Partial<UpdateAccountRequest> }>({
    mutationFn: ({ id, data }) => adminService.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'accounts'] });
    },
  });
};

export const useDeleteAccount = () => {
  const adminService = useAdminService();
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: (id) => adminService.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'accounts'] });
    },
  });
};