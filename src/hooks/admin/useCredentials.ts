import { useQuery } from '@tanstack/react-query';
import { useAdminService } from '../../services/AdminService';

export interface ServerCredential {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export const useCredentials = () => {
  const adminService = useAdminService();
  
  return useQuery<ServerCredential[]>({
    queryKey: ['solabs-admin', 'credentials'],
    queryFn: () => adminService.listCredentials(),
  });
};