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
 * Complete Chat Service Interface
 * Defines all methods for interacting with Chatwoot API
 * Based on PRD specifications and API documentation
 */
export interface IChatService {
  // ============================================================================
  // CONVERSATION OPERATIONS
  // ============================================================================
  
  /**
   * List conversations with filters, pagination and sorting
   */
  listConversations(query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>>;
  
  /**
   * Get conversations metadata (counts for different states)
   */
  getConversationsMeta(query?: ConversationQuery): Promise<ApiResponse<ConversationMeta>>;
  
  /**
   * Get single conversation by ID
   */
  getConversation(id: number): Promise<ApiResponse<Conversation>>;
  
  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================
  
  /**
   * Get messages for a conversation with pagination
   */
  getMessages(conversationId: number, query?: MessageQuery): Promise<ApiResponse<MessagesResponse>>;
  
  /**
   * Send a text message to a conversation
   */
  sendMessage(conversationId: number, request: SendMessageRequest): Promise<ApiResponse<Message>>;
  
  /**
   * Send message with file attachments
   */
  sendAttachment(conversationId: number, request: SendFileRequest): Promise<ApiResponse<Message>>;
  
  // ============================================================================
  // CONVERSATION STATUS & PRIORITY
  // ============================================================================
  
  /**
   * Toggle conversation status (open, pending, snoozed, resolved)
   */
  toggleStatus(conversationId: number, request: UpdateStatusRequest): Promise<ApiResponse<Conversation>>;
  
  /**
   * Toggle conversation priority (urgent, high, medium, low, null)
   */
  togglePriority(conversationId: number, request: UpdatePriorityRequest): Promise<ApiResponse<Conversation>>;
  
  // ============================================================================
  // ASSIGNMENT OPERATIONS
  // ============================================================================
  
  /**
   * Assign conversation to an agent
   */
  assignAgent(conversationId: number, request: AssignAgentRequest): Promise<ApiResponse<Conversation>>;
  
  /**
   * Assign conversation to a team
   */
  assignTeam(conversationId: number, request: AssignTeamRequest): Promise<ApiResponse<Conversation>>;
  
  // ============================================================================
  // LABEL OPERATIONS
  // ============================================================================
  
  /**
   * Add labels to a conversation
   */
  addLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>>;
  
  /**
   * Remove labels from a conversation
   */
  removeLabels(conversationId: number, request: LabelOperation): Promise<ApiResponse<Conversation>>;
  
  // ============================================================================
  // CUSTOM ATTRIBUTES
  // ============================================================================
  
  /**
   * Update conversation custom attributes
   */
  updateCustomAttributes(conversationId: number, request: UpdateCustomAttributesRequest): Promise<ApiResponse<Conversation>>;
  
  // ============================================================================
  // READ STATUS
  // ============================================================================
  
  /**
   * Mark conversation as read
   */
  markRead(conversationId: number, request?: MarkReadRequest): Promise<ApiResponse<void>>;
  
  /**
   * Mark conversation as unread
   */
  markUnread(conversationId: number): Promise<ApiResponse<void>>;
  
  // ============================================================================
  // INBOX OPERATIONS
  // ============================================================================
  
  /**
   * List all inboxes
   */
  listInboxes(): Promise<ApiResponse<InboxesResponse>>;
  
  // ============================================================================
  // CONTACT OPERATIONS
  // ============================================================================
  
  /**
   * List contacts with filters and pagination
   */
  listContacts(query?: ContactQuery): Promise<ApiResponse<ContactsResponse>>;
  
  /**
   * Get single contact by ID
   */
  getContact(id: number): Promise<ApiResponse<Contact>>;
  
  /**
   * Get conversations for a specific contact
   */
  getContactConversations(contactId: number, query?: ConversationQuery): Promise<ApiResponse<ConversationsResponse>>;
}