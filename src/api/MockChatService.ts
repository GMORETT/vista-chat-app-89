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
} from '../models/chat';

/**
 * Mock implementation of Chat Service
 * Used for development and testing without real API
 */
export class MockChatService implements IChatService {
  // ============================================================================
  // CONVERSATION OPERATIONS
  // ============================================================================
  
  async listConversations(query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.listConversations not implemented');
  }
  
  async getConversationsMeta(): Promise<ApiResponse<ConversationMeta>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.getConversationsMeta not implemented');
  }
  
  async getConversation(id: number): Promise<ApiResponse<Conversation>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.getConversation not implemented');
  }
  
  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================
  
  async getMessages(conversationId: number, query?: MessageQuery): Promise<ApiResponse<MessagesResponse>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.getMessages not implemented');
  }
  
  async sendMessage(conversationId: number, request: SendMessageRequest): Promise<ApiResponse<Message>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.sendMessage not implemented');
  }
  
  async sendAttachment(conversationId: number, request: SendFileRequest): Promise<ApiResponse<Message>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.sendAttachment not implemented');
  }
  
  // ============================================================================
  // CONVERSATION STATUS & PRIORITY
  // ============================================================================
  
  async toggleStatus(conversationId: number, request: UpdateStatusRequest): Promise<ApiResponse<Conversation>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.toggleStatus not implemented');
  }
  
  async togglePriority(conversationId: number, request: UpdatePriorityRequest): Promise<ApiResponse<Conversation>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.togglePriority not implemented');
  }
  
  // ============================================================================
  // ASSIGNMENT OPERATIONS
  // ============================================================================
  
  async assignAgent(conversationId: number, request: AssignAgentRequest): Promise<ApiResponse<Conversation>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.assignAgent not implemented');
  }
  
  async assignTeam(conversationId: number, request: AssignTeamRequest): Promise<ApiResponse<Conversation>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.assignTeam not implemented');
  }
  
  // ============================================================================
  // LABEL OPERATIONS
  // ============================================================================
  
  async addLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.addLabels not implemented');
  }
  
  async removeLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.removeLabels not implemented');
  }
  
  // ============================================================================
  // CUSTOM ATTRIBUTES
  // ============================================================================
  
  async updateCustomAttributes(conversationId: number, request: UpdateCustomAttributesRequest): Promise<ApiResponse<Conversation>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.updateCustomAttributes not implemented');
  }
  
  // ============================================================================
  // READ STATUS
  // ============================================================================
  
  async markRead(conversationId: number, request?: MarkReadRequest): Promise<ApiResponse<void>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.markRead not implemented');
  }
  
  async markUnread(conversationId: number): Promise<ApiResponse<void>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.markUnread not implemented');
  }
  
  // ============================================================================
  // INBOX OPERATIONS
  // ============================================================================
  
  async listInboxes(): Promise<ApiResponse<InboxesResponse>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.listInboxes not implemented');
  }
  
  // ============================================================================
  // CONTACT OPERATIONS
  // ============================================================================
  
  async listContacts(query?: ContactQuery): Promise<ApiResponse<ContactsResponse>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.listContacts not implemented');
  }
  
  async getContact(id: number): Promise<ApiResponse<Contact>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.getContact not implemented');
  }
  
  async getContactConversations(contactId: number, query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>> {
    // TODO: Implement mock data generation
    throw new Error('MockChatService.getContactConversations not implemented');
  }
}