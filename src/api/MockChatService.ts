import { IChatService } from './IChatService';
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
  StatusType,
  PriorityType,
} from '../models/chat';

import {
  mockConversations,
  mockMessages,
  mockContacts,
  mockInboxes,
  mockAgents,
  mockTeams,
  mockLabels,
  generateMessages,
} from '../data/mockData';

/**
 * Mock implementation of Chat Service
 * Used for development and testing without real API
 */
export class MockChatService implements IChatService {
  // Internal state
  private conversations: Conversation[] = [...mockConversations];
  private messageStore: Record<number, Message[]> = {};
  private contacts: Contact[] = [...mockContacts];
  
  private delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private filterConversations(conversations: Conversation[], query?: ConversationQuery): Conversation[] {
    let filtered = [...conversations];
    
    if (!query) return filtered;

    // Filter by assignee_type
    if (query.assignee_type) {
      switch (query.assignee_type) {
        case 'me':
          filtered = filtered.filter(c => c.meta.assignee?.id === mockAgents[0].id);
          break;
        case 'unassigned':
          filtered = filtered.filter(c => !c.meta.assignee);
          break;
        case 'assigned':
          filtered = filtered.filter(c => c.meta.assignee);
          break;
        case 'all':
        default:
          // No filter
          break;
      }
    }

    // Filter by status
    if (query.status && query.status !== 'all') {
      filtered = filtered.filter(c => c.status === query.status);
    }

    // Filter by inbox
    if (query.inbox_id) {
      filtered = filtered.filter(c => c.inbox_id === query.inbox_id);
    }

    // Filter by team
    if (query.team_id) {
      filtered = filtered.filter(c => c.team_id === query.team_id);
    }

    // Filter by labels
    if (query.labels && query.labels.length > 0) {
      filtered = filtered.filter(c => 
        query.labels!.some(label => 
          c.labels.some(l => l.title.toLowerCase().includes(label.toLowerCase()))
        )
      );
    }

    // Filter by search query
    if (query.q) {
      const searchTerm = query.q.toLowerCase();
      filtered = filtered.filter(c =>
        c.meta.sender?.name?.toLowerCase().includes(searchTerm) ||
        c.meta.sender?.email?.toLowerCase().includes(searchTerm) ||
        c.identifier?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    if (query.sort_by) {
      filtered.sort((a, b) => {
        switch (query.sort_by) {
          case 'last_activity_at_desc':
            return b.last_activity_at - a.last_activity_at;
          case 'last_activity_at_asc':
            return a.last_activity_at - b.last_activity_at;
          case 'created_at_desc':
            return b.created_at - a.created_at;
          case 'created_at_asc':
            return a.created_at - b.created_at;
          case 'priority_desc':
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            const aPriority = a.priority ? priorityOrder[a.priority] || 0 : 0;
            const bPriority = b.priority ? priorityOrder[b.priority] || 0 : 0;
            return bPriority - aPriority;
          case 'priority_asc':
            const priorityOrderAsc = { urgent: 4, high: 3, medium: 2, low: 1 };
            const aPriorityAsc = a.priority ? priorityOrderAsc[a.priority] || 0 : 0;
            const bPriorityAsc = b.priority ? priorityOrderAsc[b.priority] || 0 : 0;
            return aPriorityAsc - bPriorityAsc;
          default:
            return b.last_activity_at - a.last_activity_at;
        }
      });
    }

    return filtered;
  }

  private calculateMeta(conversations: Conversation[]): ConversationMeta {
    return {
      mine_count: conversations.filter(c => c.meta.assignee?.id === mockAgents[0].id).length,
      unassigned_count: conversations.filter(c => !c.meta.assignee).length,
      assigned_count: conversations.filter(c => c.meta.assignee).length,
      all_count: conversations.length,
    };
  }

  private getConversationMessages(conversationId: number): Message[] {
    if (!this.messageStore[conversationId]) {
      this.messageStore[conversationId] = generateMessages(conversationId, 15);
    }
    return this.messageStore[conversationId];
  }

  // ============================================================================
  // CONVERSATION OPERATIONS
  // ============================================================================
  
  async listConversations(query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> {
    await this.delay();
    
    try {
      const filtered = this.filterConversations(this.conversations, query);
      const meta = this.calculateMeta(this.conversations);
      
      // Pagination
      const page = query?.page || 1;
      const perPage = 25;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const paginatedData = filtered.slice(start, end);
      
      return {
        data: {
          data: {
            meta,
            payload: paginatedData,
          },
        },
      };
    } catch (error) {
      return {
        error: 'Failed to fetch conversations',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async getConversationsMeta(): Promise<ApiResponse<ConversationMeta>> {
    await this.delay(100);
    
    try {
      const meta = this.calculateMeta(this.conversations);
      
      return {
        data: meta,
      };
    } catch (error) {
      return {
        error: 'Failed to fetch conversations meta',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async getConversation(id: number): Promise<ApiResponse<Conversation>> {
    await this.delay(200);
    
    try {
      const conversation = this.conversations.find(c => c.id === id);
      
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${id} not found`,
        };
      }
      
      return {
        data: conversation,
      };
    } catch (error) {
      return {
        error: 'Failed to fetch conversation',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================
  
  async getMessages(conversationId: number, query?: MessageQuery): Promise<ApiResponse<MessagesResponse>> {
    await this.delay(250);
    
    try {
      let messages = this.getConversationMessages(conversationId);
      
      // Apply filters
      if (query?.before) {
        const beforeTimestamp = parseInt(query.before);
        messages = messages.filter(m => m.created_at < beforeTimestamp);
      }
      
      
      // Sort by created_at desc (newest first)
      messages.sort((a, b) => b.created_at - a.created_at);
      
      // Apply limit
      const limit = query?.limit || 20;
      messages = messages.slice(0, limit);
      
      return {
        data: {
          payload: messages,
          meta: {
            count: messages.length,
            current_page: 1,
          },
        },
      };
    } catch (error) {
      return {
        error: 'Failed to fetch messages',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async sendMessage(conversationId: number, request: SendMessageRequest): Promise<ApiResponse<Message>> {
    // Simulate sending states
    await this.delay(100); // sending
    await this.delay(200); // sent
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      const messages = this.getConversationMessages(conversationId);
      const newMessage: Message = {
        id: Date.now() + Math.random(),
        content: request.content,
        inbox_id: conversation.inbox_id,
        conversation_id: conversationId,
        message_type: 1, // outgoing
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
        private: request.private || false,
        status: 'sent',
        source_id: `msg_${Date.now()}`,
        content_type: 'text',
        content_attributes: {},
        sender_type: 'agent',
        sender_id: mockAgents[0].id,
        external_source_ids: {},
        additional_attributes: {},
        processed_message_content: null,
        sentiment: {},
        conversation: conversation,
        attachments: [],
      };
      
      messages.unshift(newMessage);
      this.messageStore[conversationId] = messages;
      
      // Update conversation
      conversation.last_activity_at = Math.floor(Date.now() / 1000);
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      return {
        data: newMessage,
      };
    } catch (error) {
      return {
        error: 'Failed to send message',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async sendAttachment(conversationId: number, request: SendFileRequest): Promise<ApiResponse<Message>> {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 25) {
      await this.delay(150);
      // In real implementation, this would emit progress events
    }
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      const messages = this.getConversationMessages(conversationId);
      const newMessage: Message = {
        id: Date.now() + Math.random(),
        content: request.content || 'Arquivo enviado',
        inbox_id: conversation.inbox_id,
        conversation_id: conversationId,
        message_type: 1, // outgoing
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
        private: false,
        status: 'sent',
        source_id: `msg_${Date.now()}`,
        content_type: 'text',
        content_attributes: {},
        sender_type: 'agent',
        sender_id: mockAgents[0].id,
        external_source_ids: {},
        additional_attributes: {},
        processed_message_content: null,
        sentiment: {},
        conversation: conversation,
        attachments: [{
          id: Date.now(),
          file_type: 'file',
          extension: 'pdf',
          data_url: 'data:application/pdf;base64,mock-data',
          thumb_url: null,
          file_url: 'https://example.com/file.pdf',
          file_size: 1024000,
          fallback_title: 'document.pdf',
          coordinates_lat: null,
          coordinates_long: null,
        }],
      };
      
      messages.unshift(newMessage);
      this.messageStore[conversationId] = messages;
      
      // Update conversation
      conversation.last_activity_at = Math.floor(Date.now() / 1000);
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      return {
        data: newMessage,
      };
    } catch (error) {
      return {
        error: 'Failed to send attachment',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  // ============================================================================
  // CONVERSATION STATUS & PRIORITY
  // ============================================================================
  
  async toggleStatus(conversationId: number, request: UpdateStatusRequest): Promise<ApiResponse<Conversation>> {
    await this.delay(200);
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      conversation.status = request.status;
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      if (request.status === 'snoozed' && request.snoozed_until) {
        conversation.snoozed_until = new Date(request.snoozed_until).getTime() / 1000;
      } else {
        conversation.snoozed_until = null;
      }
      
      return {
        data: conversation,
      };
    } catch (error) {
      return {
        error: 'Failed to update status',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async togglePriority(conversationId: number, request: UpdatePriorityRequest): Promise<ApiResponse<Conversation>> {
    await this.delay(200);
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      conversation.priority = request.priority;
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      return {
        data: conversation,
      };
    } catch (error) {
      return {
        error: 'Failed to update priority',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  // ============================================================================
  // ASSIGNMENT OPERATIONS
  // ============================================================================
  
  async assignAgent(conversationId: number, request: AssignAgentRequest): Promise<ApiResponse<Conversation>> {
    await this.delay(300);
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      const agent = mockAgents.find(a => a.id === request.assignee_id);
      if (!agent) {
        return {
          error: 'Agent not found',
          message: `Agent with id ${request.assignee_id} not found`,
        };
      }
      
      conversation.assignee_id = request.assignee_id;
      conversation.meta.assignee = agent;
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      return {
        data: conversation,
      };
    } catch (error) {
      return {
        error: 'Failed to assign agent',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async assignTeam(conversationId: number, request: AssignTeamRequest): Promise<ApiResponse<Conversation>> {
    await this.delay(300);
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      const team = mockTeams.find(t => t.id === request.team_id);
      if (!team) {
        return {
          error: 'Team not found',
          message: `Team with id ${request.team_id} not found`,
        };
      }
      
      conversation.team_id = request.team_id;
      conversation.meta.team = team;
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      return {
        data: conversation,
      };
    } catch (error) {
      return {
        error: 'Failed to assign team',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  // ============================================================================
  // LABEL OPERATIONS
  // ============================================================================
  
  async addLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>> {
    await this.delay(200);
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      const labelsToAdd = mockLabels.filter(label => 
        request.labels.includes(label.title) && 
        !conversation.labels.some(l => l.id === label.id)
      );
      
      conversation.labels = [...conversation.labels, ...labelsToAdd];
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      return {
        data: conversation,
      };
    } catch (error) {
      return {
        error: 'Failed to add labels',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async removeLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>> {
    await this.delay(200);
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      conversation.labels = conversation.labels.filter(label => 
        !request.labels.includes(label.title)
      );
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      return {
        data: conversation,
      };
    } catch (error) {
      return {
        error: 'Failed to remove labels',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  // ============================================================================
  // CUSTOM ATTRIBUTES
  // ============================================================================
  
  async updateCustomAttributes(conversationId: number, request: UpdateCustomAttributesRequest): Promise<ApiResponse<Conversation>> {
    await this.delay(200);
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      conversation.custom_attributes = {
        ...conversation.custom_attributes,
        ...request.custom_attributes,
      };
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      return {
        data: conversation,
      };
    } catch (error) {
      return {
        error: 'Failed to update custom attributes',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  // ============================================================================
  // READ STATUS
  // ============================================================================
  
  async markRead(conversationId: number, request?: MarkReadRequest): Promise<ApiResponse<void>> {
    await this.delay(100);
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      conversation.unread_count = 0;
      conversation.agent_last_seen_at = request?.agent_last_seen_at || Math.floor(Date.now() / 1000);
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      return {
        data: undefined,
      };
    } catch (error) {
      return {
        error: 'Failed to mark as read',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async markUnread(conversationId: number): Promise<ApiResponse<void>> {
    await this.delay(100);
    
    try {
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (!conversation) {
        return {
          error: 'Conversation not found',
          message: `Conversation with id ${conversationId} not found`,
        };
      }
      
      conversation.unread_count = 1;
      conversation.updated_at = Math.floor(Date.now() / 1000);
      
      return {
        data: undefined,
      };
    } catch (error) {
      return {
        error: 'Failed to mark as unread',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  // ============================================================================
  // INBOX OPERATIONS
  // ============================================================================
  
  async listInboxes(): Promise<ApiResponse<InboxesResponse>> {
    await this.delay(200);
    
    try {
      return {
        data: {
          payload: mockInboxes,
        },
      };
    } catch (error) {
      return {
        error: 'Failed to fetch inboxes',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  // ============================================================================
  // CONTACT OPERATIONS
  // ============================================================================
  
  async listContacts(query?: ContactQuery): Promise<ApiResponse<ContactsResponse>> {
    await this.delay(300);
    
    try {
      let filtered = [...this.contacts];
      
      // Apply filters
      if (query?.name) {
        const searchTerm = query.name.toLowerCase();
        filtered = filtered.filter(c => 
          c.name?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (query?.email) {
        const searchTerm = query.email.toLowerCase();
        filtered = filtered.filter(c => 
          c.email?.toLowerCase().includes(searchTerm)
        );
      }
      
      if (query?.phone_number) {
        filtered = filtered.filter(c => 
          c.phone_number?.includes(query.phone_number!)
        );
      }
      
      if (query?.identifier) {
        filtered = filtered.filter(c => 
          c.id.toString().includes(query.identifier!)
        );
      }
      
      // Sort
      if (query?.sort) {
        filtered.sort((a, b) => {
          switch (query.sort) {
            case 'name':
              return (a.name || '').localeCompare(b.name || '');
            case '-name':
              return (b.name || '').localeCompare(a.name || '');
            case 'created_at':
              return a.created_at - b.created_at;
            case '-created_at':
              return b.created_at - a.created_at;
            default:
              return 0;
          }
        });
      }
      
      // Pagination
      const page = query?.page || 1;
      const perPage = 25;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const totalCount = filtered.length;
      const paginatedData = filtered.slice(start, end);
      
      return {
        data: {
          payload: paginatedData,
          meta: {
            count: paginatedData.length,
            current_page: page,
            total_count: totalCount,
            total_pages: Math.ceil(totalCount / perPage),
          },
        },
      };
    } catch (error) {
      return {
        error: 'Failed to fetch contacts',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async getContact(id: number): Promise<ApiResponse<Contact>> {
    await this.delay(200);
    
    try {
      const contact = this.contacts.find(c => c.id === id);
      
      if (!contact) {
        return {
          error: 'Contact not found',
          message: `Contact with id ${id} not found`,
        };
      }
      
      return {
        data: contact,
      };
    } catch (error) {
      return {
        error: 'Failed to fetch contact',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
  
  async getContactConversations(contactId: number, query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> {
    await this.delay(300);
    
    try {
      const contactConversations = this.conversations.filter(c => 
        c.meta.sender?.id === contactId
      );
      
      const filtered = this.filterConversations(contactConversations, query);
      const meta = this.calculateMeta(contactConversations);
      
      return {
        data: {
          data: {
            meta,
            payload: filtered,
          },
        },
      };
    } catch (error) {
      return {
        error: 'Failed to fetch contact conversations',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}