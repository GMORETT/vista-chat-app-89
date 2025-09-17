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
  private baseUrl = import.meta.env.VITE_BFF_BASE_URL || 'http://localhost:3001';

  // ============================================================================
  // CONVERSATION OPERATIONS
  // ============================================================================
  
  async listConversations(query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> {
    const params = new URLSearchParams();
    
    if (query?.status) params.append('status', query.status);
    if (query?.assignee_type) params.append('assignee_type', query.assignee_type);
    if (query?.inbox_id) params.append('inbox_id', query.inbox_id.toString());
    if (query?.team_id) params.append('team_id', query.team_id.toString());
    if (query?.labels?.length) {
      query.labels.forEach(label => params.append('labels', label));
    }
    if (query?.page) params.append('page', query.page.toString());

    const response = await fetch(`${this.baseUrl}/api/messaging/conversations?${params}`);
    return await response.json();
  }
  
  async getConversationsMeta(): Promise<ApiResponse<ConversationMeta>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/meta`);
    return await response.json();
  }
  
  async getConversation(id: number): Promise<ApiResponse<Conversation>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${id}`);
    return await response.json();
  }
  
  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================
  
  async getMessages(conversationId: number, query?: MessageQuery): Promise<ApiResponse<MessagesResponse>> {
    const params = new URLSearchParams();
    
    if (query?.before) params.append('before', query.before);
    // Note: MessageQuery might not have 'after' and 'page' - check interface

    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/messages?${params}`);
    return await response.json();
  }
  
  async sendMessage(conversationId: number, request: SendMessageRequest): Promise<ApiResponse<Message>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return await response.json();
  }
  
  async sendAttachment(conversationId: number, request: SendFileRequest): Promise<ApiResponse<Message>> {
    const formData = new FormData();
    
    request.files.forEach(file => {
      formData.append('files', file);
    });
    
    if (request.content) {
      formData.append('content', request.content);
    }

    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  }
  
  // ============================================================================
  // CONVERSATION STATUS & PRIORITY
  // ============================================================================
  
  async toggleStatus(conversationId: number, request: UpdateStatusRequest): Promise<ApiResponse<Conversation>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/toggle_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return await response.json();
  }
  
  async togglePriority(conversationId: number, request: UpdatePriorityRequest): Promise<ApiResponse<Conversation>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/toggle_priority`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return await response.json();
  }
  
  // ============================================================================
  // ASSIGNMENT OPERATIONS
  // ============================================================================
  
  async assignAgent(conversationId: number, request: AssignAgentRequest): Promise<ApiResponse<Conversation>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/assign_agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return await response.json();
  }
  
  async assignTeam(conversationId: number, request: AssignTeamRequest): Promise<ApiResponse<Conversation>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/assign_team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return await response.json();
  }
  
  // ============================================================================
  // LABEL OPERATIONS
  // ============================================================================
  
  async addLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/labels/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return await response.json();
  }
  
  async removeLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/labels/remove`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return await response.json();
  }
  
  // ============================================================================
  // CUSTOM ATTRIBUTES
  // ============================================================================
  
  async updateCustomAttributes(conversationId: number, request: UpdateCustomAttributesRequest): Promise<ApiResponse<Conversation>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/custom_attributes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return await response.json();
  }
  
  // ============================================================================
  // READ STATUS
  // ============================================================================
  
  async markRead(conversationId: number, request?: MarkReadRequest): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/mark_read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }
  
  async markUnread(conversationId: number): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/conversations/${conversationId}/mark_unread`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return await response.json();
  }
  
  // ============================================================================
  // INBOX OPERATIONS
  // ============================================================================
  
  async listInboxes(): Promise<ApiResponse<InboxesResponse>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/inboxes`);
    return await response.json();
  }
  
  // ============================================================================
  // CONTACT OPERATIONS
  // ============================================================================
  
  async listContacts(query?: ContactQuery): Promise<ApiResponse<ContactsResponse>> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.sort) params.append('sort', query.sort);
    // Note: ContactQuery might not have 'q' and 'labels' - check interface

    const response = await fetch(`${this.baseUrl}/api/messaging/contacts?${params}`);
    return await response.json();
  }
  
  async getContact(id: number): Promise<ApiResponse<Contact>> {
    const response = await fetch(`${this.baseUrl}/api/messaging/contacts/${id}`);
    return await response.json();
  }
  
  async getContactConversations(contactId: number, query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());

    const response = await fetch(`${this.baseUrl}/api/messaging/contacts/${contactId}/conversations?${params}`);
    return await response.json();
  }
}