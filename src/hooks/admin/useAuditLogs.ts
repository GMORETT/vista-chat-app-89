import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AuditLog, AuditLogFilters, AuditLogResponse, AuditExportRequest } from '../../models/audit';
import { useAdminService } from '../../services/AdminService';

export const useAuditLogs = (filters: AuditLogFilters = {}, page: number = 1) => {
  const adminService = useAdminService();
  
  return useQuery<AuditLogResponse>({
    queryKey: ['solabs-admin', 'audit-logs', filters, page],
    queryFn: () => adminService.getAuditLogs(filters, page),
    placeholderData: (previousData) => previousData
  });
};

export const useAuditLogDetail = (id: number) => {
  const adminService = useAdminService();
  
  return useQuery<AuditLog>({
    queryKey: ['solabs-admin', 'audit-logs', id],
    queryFn: () => adminService.getAuditLog(id),
    enabled: !!id
  });
};

export const useExportAuditLogs = () => {
  const adminService = useAdminService();
  
  return useMutation<Blob, Error, AuditExportRequest>({
    mutationFn: async (request) => {
      const response = await adminService.exportAuditLogs(request);
      
      // Create blob for download
      const mimeType = request.format === 'csv' 
        ? 'text/csv' 
        : 'application/json';
      
      return new Blob([response], { type: mimeType });
    },
  });
};

export const useValidateAuditChain = () => {
  const adminService = useAdminService();
  
  return useMutation<{ valid: boolean; error?: string }, Error, number | undefined>({
    mutationFn: (accountId) => adminService.validateAuditChain(accountId),
  });
};