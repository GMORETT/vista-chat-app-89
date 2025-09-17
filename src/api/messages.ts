import { apiClient } from './client';
import { 
  MessagesResponse, 
  Message,
  SendMessageRequest,
  ApiResponse
} from '../models';

export const messagesApi = {
  // Get messages for a conversation
  getMessages: async (
    conversationId: number,
    params?: { before?: string; after?: string }
  ): Promise<ApiResponse<MessagesResponse>> => {
    return apiClient.get(`/api/v1/conversations/${conversationId}/messages`, params);
  },

  // Send text message
  sendMessage: async (
    conversationId: number,
    data: SendMessageRequest
  ): Promise<ApiResponse<Message>> => {
    return apiClient.post(`/api/v1/conversations/${conversationId}/messages`, data);
  },

  // Send message with attachments
  sendMessageWithFiles: async (
    conversationId: number,
    files: File[],
    content?: string,
    isPrivate?: boolean
  ): Promise<ApiResponse<Message>> => {
    return apiClient.uploadFiles(
      `/api/v1/conversations/${conversationId}/messages`,
      files,
      { 
        content: content || '',
        private: isPrivate || false,
      }
    );
  },

  // Delete message
  deleteMessage: async (
    conversationId: number,
    messageId: number
  ): Promise<ApiResponse<any>> => {
    return apiClient.delete(`/api/v1/conversations/${conversationId}/messages/${messageId}`);
  },

  // Retry failed message
  retryMessage: async (
    conversationId: number,
    messageId: number
  ): Promise<ApiResponse<Message>> => {
    return apiClient.post(`/api/v1/conversations/${conversationId}/messages/${messageId}/retry`);
  },
};