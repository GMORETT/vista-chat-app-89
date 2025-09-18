import { apiClient } from './client';
import { Label, ApiResponse } from '../models';

export const labelsApi = {
  // Get all labels
  getLabels: async (accountId?: number): Promise<ApiResponse<Label[]>> => {
    const params: Record<string, any> = {};
    if (accountId) params.account_id = accountId;
    return apiClient.get('/api/v1/labels', params);
  },

  // Create new label
  createLabel: async (title: string, color?: string, accountId?: number): Promise<ApiResponse<Label>> => {
    const data: any = { 
      title, 
      color: color || '#007bff',
      show_on_sidebar: true 
    };
    if (accountId) data.account_id = accountId;
    return apiClient.post('/api/v1/labels', data);
  },
};