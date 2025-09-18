import { apiClient } from './client';
import { 
  ConversationQuery, 
  ConversationsResponse, 
  Conversation,
  ConversationMeta,
  ApiResponse
} from '../models';

export const conversationsApi = {
  // Get conversations list with filters
  getConversations: async (params: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> => {
    return apiClient.get('/api/v1/conversations', params);
  },

  // Get conversation meta counts
  getMeta: async (): Promise<ApiResponse<ConversationMeta>> => {
    return apiClient.get('/api/v1/conversations/meta');
  },

  // Get single conversation
  getConversation: async (id: number): Promise<ApiResponse<Conversation>> => {
    return apiClient.get(`/api/v1/conversations/${id}`);
  },

  // Update conversation status
  toggleStatus: async (
    id: number, 
    status: string, 
    snoozed_until?: string
  ): Promise<ApiResponse<Conversation>> => {
    return apiClient.post(`/api/v1/conversations/${id}/toggle_status`, {
      status,
      snoozed_until,
    });
  },

  // Update conversation priority
  togglePriority: async (
    id: number, 
    priority: string
  ): Promise<ApiResponse<Conversation>> => {
    return apiClient.post(`/api/v1/conversations/${id}/toggle_priority`, {
      priority,
    });
  },

  // Assign agent to conversation
  assignAgent: async (
    id: number, 
    assignee_id: number
  ): Promise<ApiResponse<Conversation>> => {
    return apiClient.post(`/api/v1/conversations/${id}/assignments?assignee_id=${assignee_id}`);
  },

  // Assign team to conversation
  assignTeam: async (
    id: number, 
    team_id: number
  ): Promise<ApiResponse<Conversation>> => {
    return apiClient.post(`/api/v1/conversations/${id}/assignments`, {
      team_id,
    });
  },

  // Mute conversation
  mute: async (id: number): Promise<ApiResponse<Conversation>> => {
    return apiClient.post(`/api/v1/conversations/${id}/mute`);
  },

  // Unmute conversation
  unmute: async (id: number): Promise<ApiResponse<Conversation>> => {
    return apiClient.post(`/api/v1/conversations/${id}/unmute`);
  },

  // Update custom attributes
  updateCustomAttributes: async (
    id: number, 
    custom_attributes: Record<string, any>
  ): Promise<ApiResponse<Conversation>> => {
    return apiClient.post(`/api/v1/conversations/${id}/custom_attributes`, {
      custom_attributes,
    });
  },

  // Get participants
  getParticipants: async (id: number): Promise<ApiResponse<any>> => {
    return apiClient.get(`/api/v1/conversations/${id}/participants`);
  },

  // Update participants
  updateParticipants: async (
    id: number, 
    user_ids: number[]
  ): Promise<ApiResponse<any>> => {
    return apiClient.patch(`/api/v1/conversations/${id}/participants`, {
      user_ids,
    });
  },

  // Mark as read
  markAsRead: async (id: number): Promise<ApiResponse<any>> => {
    return apiClient.post(`/api/v1/conversations/${id}/update_last_seen`);
  },

  // Mark as unread
  markAsUnread: async (id: number): Promise<ApiResponse<any>> => {
    return apiClient.post(`/api/v1/conversations/${id}/unread`);
  },

  // Get conversation labels
  getConversationLabels: async (id: number): Promise<ApiResponse<string[]>> => {
    return apiClient.get(`/api/v1/conversations/${id}/labels`);
  },

  // Add labels to conversation
  addConversationLabels: async (id: number, labels: string[]): Promise<ApiResponse<any>> => {
    return apiClient.post(`/api/v1/conversations/${id}/labels`, { labels });
  },
};