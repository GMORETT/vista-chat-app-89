import { apiClient } from './client';
import { Contact, Conversation, ApiResponse } from '../models';

interface ContactsQuery {
  page?: number;
  sort?: string;
  q?: string;
  labels?: string[];
}

interface ContactsResponse {
  payload: Contact[];
  meta: {
    current_page: number;
    next_page?: number;
    prev_page?: number;
  };
}

export const contactsApi = {
  // Get contacts list
  getContacts: async (params: ContactsQuery): Promise<ApiResponse<ContactsResponse>> => {
    return apiClient.get('/api/v1/contacts', params);
  },

  // Get single contact
  getContact: async (id: number): Promise<ApiResponse<Contact>> => {
    return apiClient.get(`/api/v1/contacts/${id}`);
  },

  // Get conversations for a contact
  getContactConversations: async (id: number): Promise<ApiResponse<Conversation[]>> => {
    return apiClient.get(`/api/v1/contacts/${id}/conversations`);
  },

  // Get contact labels
  getContactLabels: async (id: number): Promise<ApiResponse<string[]>> => {
    return apiClient.get(`/api/v1/contacts/${id}/labels`);
  },

  // Add labels to contact
  addContactLabels: async (id: number, labels: string[]): Promise<ApiResponse<any>> => {
    return apiClient.post(`/api/v1/contacts/${id}/labels`, { labels });
  },

  // Remove custom attributes
  destroyCustomAttributes: async (id: number): Promise<ApiResponse<any>> => {
    return apiClient.post(`/api/v1/contacts/${id}/destroy_custom_attributes`);
  },
};