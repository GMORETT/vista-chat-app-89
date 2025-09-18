import { apiClient } from './client';
import { Label, ApiResponse } from '../models';

export const labelsApi = {
  // Get all labels
  getLabels: async (): Promise<ApiResponse<Label[]>> => {
    return apiClient.get('/api/v1/labels');
  },

  // Create new label
  createLabel: async (title: string, color?: string): Promise<ApiResponse<Label>> => {
    return apiClient.post('/api/v1/labels', { 
      title, 
      color: color || '#007bff',
      show_on_sidebar: true 
    });
  },
};