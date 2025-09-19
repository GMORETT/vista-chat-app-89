import { IChatService } from './IChatService';
import { apiClient } from './client';
import {
  // Core types
  Conversation,
  Message,
  Contact,
  Inbox,
  ConversationMeta,
  
  // Query types
  ConversationQuery,
  MessageQuery,
  ContactQuery,
  
  // Request types
  SendMessageRequest,
  SendFileRequest,
  UpdateStatusRequest,
  UpdatePriorityRequest,
  AssignAgentRequest,
  AssignTeamRequest,
  LabelOperation,
  UpdateCustomAttributesRequest,
  MarkReadRequest,
  
  // Response types
  ConversationsResponse,
  MessagesResponse,
  ContactsResponse,
  InboxesResponse,
  ApiResponse,
} from '../models/chat';

/**
 * BFF (Backend for Frontend) Chat Service Implementation
 * Handles HTTP requests to the BFF layer which communicates with Chatwoot API
 */
export class BffChatService implements IChatService {
  // ============================================================================
  // CONVERSATION OPERATIONS
  // ============================================================================
  
  async listConversations(query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> {
    try {
      const params: Record<string, any> = {};
      
      if (query?.status) params.status = query.status;
      if (query?.assignee_type) params.assignee_type = query.assignee_type;
      if (query?.inbox_id) params.inbox_id = query.inbox_id;
      if (query?.team_id) params.team_id = query.team_id;
      if (query?.labels?.length) params.labels = query.labels;
      if (query?.q) params.q = query.q;
      if (query?.sort_by) params.sort_by = query.sort_by;
      if (query?.updated_within) params.updated_within = query.updated_within;
      if (query?.page) params.page = query.page;
      if (query?.account_id) params.account_id = query.account_id;

      return apiClient.get('/api/messaging/conversations', params);
    } catch (error: any) {
      // Handle inactive client error
      if (error.response?.status === 403 && error.response?.data?.code === 'CLIENT_INACTIVE') {
        throw new Error('CLIENT_INACTIVE');
      }
      throw error;
    }
  }
  
  async getConversationsMeta(query?: ConversationQuery): Promise<ApiResponse<ConversationMeta>> {
    const params: Record<string, any> = {};
    
    if (query?.status) params.status = query.status;
    if (query?.assignee_type) params.assignee_type = query.assignee_type;
    if (query?.inbox_id) params.inbox_id = query.inbox_id;
    if (query?.team_id) params.team_id = query.team_id;
    if (query?.labels?.length) params.labels = query.labels;
    if (query?.q) params.q = query.q;
    if (query?.updated_within) params.updated_within = query.updated_within;
    if (query?.account_id) params.account_id = query.account_id;

    return apiClient.get('/api/messaging/conversations/meta', params);
  }
  
  async getConversation(id: number): Promise<ApiResponse<Conversation>> {
    return apiClient.get(`/api/messaging/conversations/${id}`);
  }
  
  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================
  
  async getMessages(conversationId: number, query?: MessageQuery): Promise<ApiResponse<MessagesResponse>> {
    const params: Record<string, any> = {};
    
    if (query?.before) params.before = query.before;
    if (query?.after) params.after = query.after;
    if (query?.limit) params.limit = query.limit;

    return apiClient.get(`/api/messaging/conversations/${conversationId}/messages`, params);
  }
  
  async sendMessage(conversationId: number, request: SendMessageRequest): Promise<ApiResponse<Message>> {
    return apiClient.post(`/api/messaging/conversations/${conversationId}/messages`, request);
  }
  
  async sendAttachment(conversationId: number, request: SendFileRequest): Promise<ApiResponse<Message>> {
    const additionalData = request.content ? { content: request.content } : undefined;
    return apiClient.uploadFiles(`/api/messaging/conversations/${conversationId}/messages`, request.files, additionalData);
  }
  
  // ============================================================================
  // CONVERSATION STATUS & PRIORITY
  // ============================================================================
  
  async toggleStatus(conversationId: number, request: UpdateStatusRequest): Promise<ApiResponse<Conversation>> {
    return apiClient.post(`/api/messaging/conversations/${conversationId}/toggle_status`, request);
  }
  
  async togglePriority(conversationId: number, request: UpdatePriorityRequest): Promise<ApiResponse<Conversation>> {
    return apiClient.post(`/api/messaging/conversations/${conversationId}/toggle_priority`, request);
  }
  
  // ============================================================================
  // ASSIGNMENT OPERATIONS
  // ============================================================================
  
  async assignAgent(conversationId: number, request: AssignAgentRequest): Promise<ApiResponse<Conversation>> {
    return apiClient.post(`/api/messaging/conversations/${conversationId}/assign_agent`, request);
  }
  
  async assignTeam(conversationId: number, request: AssignTeamRequest): Promise<ApiResponse<Conversation>> {
    return apiClient.post(`/api/messaging/conversations/${conversationId}/assign_team`, request);
  }
  
  // ============================================================================
  // LABEL OPERATIONS
  // ============================================================================
  
  async addLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>> {
    return apiClient.post(`/api/messaging/conversations/${conversationId}/labels/add`, request);
  }
  
  async removeLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>> {
    return apiClient.post(`/api/messaging/conversations/${conversationId}/labels/remove`, request);
  }
  
  // ============================================================================
  // CUSTOM ATTRIBUTES
  // ============================================================================
  
  async updateCustomAttributes(conversationId: number, request: UpdateCustomAttributesRequest): Promise<ApiResponse<Conversation>> {
    return apiClient.post(`/api/messaging/conversations/${conversationId}/custom_attributes`, request);
  }
  
  // ============================================================================
  // READ STATUS
  // ============================================================================
  
  async markRead(conversationId: number, request?: MarkReadRequest): Promise<ApiResponse<void>> {
    return apiClient.post(`/api/messaging/conversations/${conversationId}/mark_read`, request || {});
  }
  
  async markUnread(conversationId: number): Promise<ApiResponse<void>> {
    return apiClient.post(`/api/messaging/conversations/${conversationId}/mark_unread`, {});
  }
  
  // ============================================================================
  // INBOX OPERATIONS
  // ============================================================================
  
  async listInboxes(): Promise<ApiResponse<InboxesResponse>> {
    return apiClient.get('/api/messaging/inboxes');
  }
  
  // ============================================================================
  // CONTACT OPERATIONS
  // ============================================================================
  
  async listContacts(query?: ContactQuery): Promise<ApiResponse<ContactsResponse>> {
    const params: Record<string, any> = {};
    
    if (query?.page) params.page = query.page;
    if (query?.sort) params.sort = query.sort;
    if (query?.name) params.name = query.name;
    if (query?.email) params.email = query.email;
    if (query?.phone_number) params.phone_number = query.phone_number;
    if (query?.identifier) params.identifier = query.identifier;
    if (query?.account_id) params.account_id = query.account_id;

    return apiClient.get('/api/messaging/contacts', params);
  }
  
  async getContact(id: number): Promise<ApiResponse<Contact>> {
    return apiClient.get(`/api/messaging/contacts/${id}`);
  }
  
  async getContactConversations(contactId: number, query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> {
    const params: Record<string, any> = {};
    if (query?.page) params.page = query.page;

    return apiClient.get(`/api/messaging/contacts/${contactId}/conversations`, params);
  }
}