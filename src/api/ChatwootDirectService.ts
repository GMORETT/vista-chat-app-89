import { IChatService } from './IChatService';
import {
  // Core types
  Conversation,
  Message,
  Contact,
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
 * Direct Chatwoot API Service Implementation
 * Connects directly to Chatwoot instance without BFF layer
 */
export class ChatwootDirectService implements IChatService {
  private baseUrl: string;
  private token: string;
  private accountId: number;

  constructor(config: { token: string; accountId: number }) {
    const envBaseUrl = import.meta.env.VITE_CHATWOOT_BASE_URL;
    const isDevelopment = import.meta.env.DEV;
    
    if (!envBaseUrl) {
      throw new Error('VITE_CHATWOOT_BASE_URL environment variable is required');
    }
    
    // Use localhost proxy in development to avoid CORS, direct URL in production
    if (isDevelopment) {
      this.baseUrl = ''; // Use relative URLs that will be proxied
    } else {
      this.baseUrl = envBaseUrl.replace(/\/$/, ''); // Direct URL in production
    }
    
    this.token = config.token;
    this.accountId = config.accountId;
    
    console.log('🔧 ChatwootDirectService initialized:');
    console.log('- isDevelopment:', isDevelopment);
    console.log('- envBaseUrl:', envBaseUrl);
    console.log('- baseUrl (used):', this.baseUrl);
    console.log('- accountId:', this.accountId);
    console.log('- token:', this.token ? `${this.token.substring(0, 10)}...` : 'null');
  }

  private buildApiUrl(endpoint: string): string {
    const isDevelopment = import.meta.env.DEV;
    
    // In development: use relative URLs that get proxied
    // In production: use full Chatwoot URL
    let url: string;
    if (isDevelopment) {
      url = `/api/v1/accounts/${this.accountId}${endpoint}`;
    } else {
      url = `${this.baseUrl}/api/v1/accounts/${this.accountId}${endpoint}`;
    }
    
    console.log('🔗 buildApiUrl Debug:');
    console.log('- isDevelopment:', isDevelopment);
    console.log('- this.baseUrl:', this.baseUrl);
    console.log('- this.accountId:', this.accountId);
    console.log('- endpoint:', endpoint);
    console.log('- Final URL:', url);
    
    return url;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildApiUrl(endpoint);
      
      console.log('🌐 Making request to:', url);
      console.log('🔧 Request details:', {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'api_access_token': this.token ? `${this.token.substring(0, 10)}...` : 'null',
          ...options.headers
        },
        body: options.body || 'none'
      });
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'api_access_token': this.token,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // Use the raw text if it's not JSON
          errorMessage = errorText || errorMessage;
        }

        return { error: errorMessage };
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      return { 
        error: error.message || 'Network error occurred'
      };
    }
  }

  private async uploadRequest<T = any>(
    endpoint: string,
    files: File[],
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildApiUrl(endpoint);
      
      const formData = new FormData();
      
      files.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'api_access_token': this.token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: `Upload failed: ${response.status} ${errorText}` };
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      return { error: error.message || 'Upload error occurred' };
    }
  }

  // ============================================================================
  // CONVERSATION OPERATIONS
  // ============================================================================
  
  async listConversations(query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> {
    console.log('🚀 ChatwootDirectService.listConversations called with query:', query);
    
    const params = new URLSearchParams();
    console.log('query here',query)
    if (query?.status && query.status !== 'all') params.append('status', query.status);
    if (query?.assignee_type && query.assignee_type !== 'all') params.append('assignee_type', query.assignee_type);
    if (query?.inbox_id) params.append('inbox_id', query.inbox_id.toString());
    if (query?.team_id) params.append('team_id', query.team_id.toString());
    if (query?.labels?.length) params.append('labels[]', query.labels.join(','));
    if (query?.q) params.append('q', query.q);
    if (query?.sort_by) params.append('sort_by', query.sort_by);
    if (query?.page) params.append('page', query.page.toString());

    const endpoint = `/conversations?${params.toString()}`;
    console.log('🌐 Making API call to endpoint:', endpoint);
    
    const response = await this.request<any>(endpoint);
    console.log('📡 Raw Chatwoot API response:', response);
    console.log('📡 Response data structure:', JSON.stringify(response, null, 2));
    
    if (response.error) return response;

    // Transform Chatwoot response to match our interface
    console.log('🔧 Extracting payload from response.data:', response.data);
    const transformedResponse = {
      data: {
        data: {
          meta: {
            mine_count: response.data?.data?.meta?.mine_count || 0,
            unassigned_count: response.data?.data?.meta?.unassigned_count || 0,
            assigned_count: response.data?.data?.meta?.assigned_count || 0,
            all_count: response.data?.data?.meta?.all_count || 0,
          },
          payload: response.data?.data?.payload || [],
        }
      }
    };
    
    console.log('🔄 Transformed response payload length:', transformedResponse.data.data.payload.length);
    console.log('🔄 Transformed response:', transformedResponse);
    
    return transformedResponse;
  }
  
  async getConversationsMeta(query?: ConversationQuery): Promise<ApiResponse<ConversationMeta>> {
    const params = new URLSearchParams();
    
    if (query?.status && query.status !== 'all') params.append('status', query.status);
    if (query?.assignee_type && query.assignee_type !== 'all') params.append('assignee_type', query.assignee_type);
    if (query?.inbox_id) params.append('inbox_id', query.inbox_id.toString());
    if (query?.team_id) params.append('team_id', query.team_id.toString());
    if (query?.labels?.length) params.append('labels[]', query.labels.join(','));

    const response = await this.request<any>(`/conversations/meta?${params.toString()}`);
    
    if (response.error) return response;

    return {
      data: {
        mine_count: response.data?.mine_count || 0,
        unassigned_count: response.data?.unassigned_count || 0,
        assigned_count: response.data?.assigned_count || 0,
        all_count: response.data?.all_count || 0,
      }
    };
  }
  
  async getConversation(id: number): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/conversations/${id}`);
  }
  
  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================
  
  async getMessages(conversationId: number, query?: MessageQuery): Promise<ApiResponse<MessagesResponse>> {
    const params = new URLSearchParams();
    
    if (query?.before) params.append('before', query.before);
    if (query?.after) params.append('after', query.after);
    if (query?.limit) params.append('limit', query.limit.toString());

    const response = await this.request<any>(`/conversations/${conversationId}/messages?${params.toString()}`);
    
    if (response.error) return response;

    return {
      data: {
        payload: response.data?.payload || response.data || [],
        meta: response.data?.meta,
      }
    };
  }
  
  async sendMessage(conversationId: number, request: SendMessageRequest): Promise<ApiResponse<Message>> {
    return this.request<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        content: request.content,
        message_type: request.message_type || 'outgoing',
        private: request.private || false,
        content_type: request.content_type || 'text',
        content_attributes: request.content_attributes || {},
      }),
    });
  }
  
  async sendAttachment(conversationId: number, request: SendFileRequest): Promise<ApiResponse<Message>> {
    return this.uploadRequest<Message>(`/conversations/${conversationId}/messages`, request.files, {
      content: request.content || '',
      message_type: 'outgoing',
    });
  }
  
  // ============================================================================
  // CONVERSATION STATUS & PRIORITY
  // ============================================================================
  
  async toggleStatus(conversationId: number, request: UpdateStatusRequest): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/conversations/${conversationId}/toggle_status`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
  
  async togglePriority(conversationId: number, request: UpdatePriorityRequest): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/conversations/${conversationId}/toggle_priority`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
  
  // ============================================================================
  // ASSIGNMENT OPERATIONS
  // ============================================================================
  
  async assignAgent(conversationId: number, request: AssignAgentRequest): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/conversations/${conversationId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
  
  async assignTeam(conversationId: number, request: AssignTeamRequest): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/conversations/${conversationId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
  
  // ============================================================================
  // LABEL OPERATIONS
  // ============================================================================
  
  async addLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/conversations/${conversationId}/labels`, {
      method: 'POST',
      body: JSON.stringify({ labels: request.labels }),
    });
  }
  
  async removeLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/conversations/${conversationId}/labels`, {
      method: 'DELETE',
      body: JSON.stringify({ labels: request.labels }),
    });
  }
  
  // ============================================================================
  // CUSTOM ATTRIBUTES
  // ============================================================================
  
  async updateCustomAttributes(conversationId: number, request: UpdateCustomAttributesRequest): Promise<ApiResponse<Conversation>> {
    return this.request<Conversation>(`/conversations/${conversationId}/custom_attributes`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
  
  // ============================================================================
  // READ STATUS
  // ============================================================================
  
  async markRead(conversationId: number, request?: MarkReadRequest): Promise<ApiResponse<void>> {
    return this.request<void>(`/conversations/${conversationId}/update_last_seen`, {
      method: 'POST',
      body: JSON.stringify(request || {}),
    });
  }
  
  async markUnread(conversationId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/conversations/${conversationId}/update_last_seen`, {
      method: 'POST',
      body: JSON.stringify({ agent_last_seen_at: 0 }),
    });
  }
  
  // ============================================================================
  // INBOX OPERATIONS
  // ============================================================================
  
  async listInboxes(): Promise<ApiResponse<InboxesResponse>> {
    const response = await this.request<any>('/inboxes');
    
    if (response.error) return response;

    return {
      data: {
        payload: response.data?.payload || response.data || [],
      }
    };
  }
  
  // ============================================================================
  // CONTACT OPERATIONS
  // ============================================================================
  
  async listContacts(query?: ContactQuery): Promise<ApiResponse<ContactsResponse>> {
    const params = new URLSearchParams();
    
    if (query?.page) params.append('page', query.page.toString());
    if (query?.sort) params.append('sort', query.sort);
    if (query?.name) params.append('name', query.name);
    if (query?.email) params.append('email', query.email);
    if (query?.phone_number) params.append('phone_number', query.phone_number);
    if (query?.identifier) params.append('identifier', query.identifier);

    const response = await this.request<any>(`/contacts?${params.toString()}`);
    
    if (response.error) return response;

    return {
      data: {
        payload: response.data?.payload || response.data || [],
        meta: response.data?.meta || { count: 0, current_page: 1 },
      }
    };
  }
  
  async getContact(id: number): Promise<ApiResponse<Contact>> {
    return this.request<Contact>(`/contacts/${id}`);
  }
  
  // ============================================================================
  // PROFILE OPERATIONS
  // ============================================================================
  
  async getProfile(): Promise<ApiResponse<any>> {
    // Profile endpoint doesn't use account path - it's a global user endpoint
    const isDevelopment = import.meta.env.DEV;
    let url: string;
    
    if (isDevelopment) {
      url = '/api/v1/profile';
    } else {
      url = `${this.baseUrl}/api/v1/profile`;
    }
    
    console.log('🔗 Profile API URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'api_access_token': this.token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return { error: errorMessage };
    }

    const data = await response.json();
    return { data };
  }
  
  async getContactConversations(contactId: number, query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> {
    const params = new URLSearchParams();
    if (query?.page) params.append('page', query.page.toString());

    const response = await this.request<any>(`/contacts/${contactId}/conversations?${params.toString()}`);
    
    if (response.error) return response;

    return {
      data: {
        data: {
          meta: response.data?.meta || { mine_count: 0, unassigned_count: 0, assigned_count: 0, all_count: 0 },
          payload: response.data?.payload || response.data || [],
        }
      }
    };
  }
}