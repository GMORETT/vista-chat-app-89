import { apiClient } from './client';
import { Inbox, ApiResponse } from '../models';

export const inboxesApi = {
  // Get all inboxes
  getInboxes: async (): Promise<ApiResponse<Inbox[]>> => {
    return apiClient.get('/api/v1/inboxes');
  },

  // Get single inbox
  getInbox: async (id: number): Promise<ApiResponse<Inbox>> => {
    return apiClient.get(`/api/v1/inboxes/${id}`);
  },
};