// Complete type system based on Chatwoot API and PRD specifications

export type AssignType = 'all' | 'assigned' | 'me' | 'unassigned';
export type StatusType = 'open' | 'pending' | 'snoozed' | 'resolved' | 'all';
export type PriorityType = 'urgent' | 'high' | 'medium' | 'low' | null;
export type SortBy =
  | 'last_activity_at_desc'
  | 'last_activity_at_asc'
  | 'created_at_desc'
  | 'created_at_asc'
  | 'priority_desc'
  | 'priority_asc'
  | 'waiting_since_desc'
  | 'waiting_since_asc';

export type MessageType = 'incoming' | 'outgoing' | 'activity' | 'template';

// Base interfaces
export interface Contact {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  avatar?: string;
  identifier?: string;
  custom_attributes?: Record<string, any>;
  created_at: number;
  last_activity_at?: number;
  location?: string;
  country_code?: string;
  blocked?: boolean;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  confirmed: boolean;
  available: boolean;
  availability_status: 'online' | 'offline' | 'busy';
  auto_offline: boolean;
  role: 'agent' | 'administrator';
}

export interface Team {
  id: number;
  name: string;
  description?: string;
  allow_auto_assign: boolean;
  account_id: number;
}

export interface Inbox {
  id: number;
  name: string;
  channel_type: string;
  avatar?: string;
  webhook_url?: string;
  greeting_enabled: boolean;
  greeting_message?: string;
  enable_auto_assignment: boolean;
  out_of_office_message?: string;
  working_hours_enabled: boolean;
  timezone?: string;
  allow_messages_after_resolved: boolean;
}

export interface Label {
  id: number;
  title: string;
  description?: string;
  color: string;
  show_on_sidebar: boolean;
}

export interface Attachment {
  id: number;
  file_type: string;
  account_id: number;
  extension?: string;
  data_url: string;
  thumb_url?: string;
  file_url: string;
  file_size: number;
  fallback_title: string;
}

export interface Message {
  id: number;
  content: string;
  message_type: number; // 0: incoming, 1: outgoing, 2: activity, 3: template
  created_at: number;
  updated_at: number;
  private: boolean;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  source_id?: string;
  content_type: 'text' | 'input_select' | 'cards' | 'form' | 'article';
  content_attributes?: Record<string, any>;
  sender?: Contact | Agent;
  conversation_id: number;
  inbox_id: number;
  attachments: Attachment[];
  external_source_ids?: Record<string, any>;
}

export interface Conversation {
  id: number;
  inbox_id: number;
  status: StatusType;
  priority: PriorityType;
  agent_last_seen_at: number;
  assignee_last_seen_at: number;
  last_activity_at: number;
  last_non_activity_message?: Message;
  updated_at: number;
  created_at: number;
  timestamp: number;
  account_id: number;
  additional_attributes?: Record<string, any>;
  custom_attributes: Record<string, any>;
  inbox: Inbox;
  messages: Message[];
  meta: {
    sender: Contact;
    assignee?: Agent | null;
    team?: Team | null;
    hmac_verified?: boolean;
    channel: string;
  };
  labels: Label[];
  unread_count: number;
  first_reply_created_at?: number;
  waiting_since?: number;
  snoozed_until?: number | null;
  can_reply: boolean;
}

// Query interfaces
export interface ConversationQuery {
  page?: number;
  assignee_type?: AssignType;
  status?: StatusType;
  inbox_id?: number;
  team_id?: number;
  labels?: string[];
  q?: string;
  sort_by?: SortBy;
  updated_within?: string;
}

export interface MessageQuery {
  before?: string;
  limit?: number;
}

export interface ContactQuery {
  page?: number;
  sort?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  identifier?: string;
}

// Request interfaces
export interface SendMessageRequest {
  content: string;
  message_type?: MessageType;
  private?: boolean;
  content_type?: string;
  content_attributes?: Record<string, any>;
  echo_id?: string;
}

export interface SendFileRequest {
  content?: string;
  message_type?: MessageType;
  private?: boolean;
  attachments: File[];
}

export interface UpdateStatusRequest {
  status: StatusType;
  snoozed_until?: string;
}

export interface UpdatePriorityRequest {
  priority: PriorityType;
}

export interface AssignAgentRequest {
  assignee_id: number;
}

export interface AssignTeamRequest {
  team_id: number;
}

export interface LabelOperation {
  labels: string[];
}

export interface UpdateCustomAttributesRequest {
  custom_attributes: Record<string, any>;
}

export interface MarkReadRequest {
  agent_last_seen_at?: number;
}

// Response interfaces
export interface ConversationMeta {
  mine_count: number;
  unassigned_count: number;
  assigned_count: number;
  all_count: number;
}

export interface ConversationsResponse {
  data: {
    meta: ConversationMeta;
    payload: Conversation[];
  };
}

export interface MessagesResponse {
  payload: Message[];
  meta?: {
    count: number;
    current_page: number;
  };
}

export interface ContactsResponse {
  payload: Contact[];
  meta: {
    count: number;
    current_page: number;
  };
}

export interface InboxesResponse {
  payload: Inbox[];
}

// API Response wrapper
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

// Real-time event types
export interface ConversationCreatedEvent {
  type: 'conversation.created';
  data: Conversation;
}

export interface ConversationUpdatedEvent {
  type: 'conversation.updated';
  data: Conversation;
}

export interface ConversationStatusChangedEvent {
  type: 'conversation.status_changed';
  data: Conversation;
}

export interface MessageCreatedEvent {
  type: 'message.created';
  data: Message;
}

export interface MessageUpdatedEvent {
  type: 'message.updated';
  data: Message;
}

export interface AssigneeChangedEvent {
  type: 'assignee.changed';
  data: {
    conversation: Conversation;
    assignee: Agent | null;
  };
}

export interface ContactUpdatedEvent {
  type: 'contact.updated';
  data: Contact;
}

export interface PresenceUpdateEvent {
  type: 'presence.update';
  data: {
    account_id: number;
    users: Record<string, 'online' | 'offline'>;
  };
}

export interface TypingOnEvent {
  type: 'conversation.typing_on';
  data: {
    conversation: Conversation;
    user: Agent;
    is_private: boolean;
  };
}

export interface TypingOffEvent {
  type: 'conversation.typing_off';
  data: {
    conversation: Conversation;
    user: Agent;
    is_private: boolean;
  };
}

export type ChatEvent =
  | ConversationCreatedEvent
  | ConversationUpdatedEvent
  | ConversationStatusChangedEvent
  | MessageCreatedEvent
  | MessageUpdatedEvent
  | AssigneeChangedEvent
  | ContactUpdatedEvent
  | PresenceUpdateEvent
  | TypingOnEvent
  | TypingOffEvent;

// Utility types
export interface PaginationMeta {
  count: number;
  current_page: number;
  total_count?: number;
  total_pages?: number;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Record<string, any>;
}

// Filter and search types
export interface ConversationFilters {
  assignee_type: AssignType;
  status: StatusType;
  inbox_id?: number;
  team_id?: number;
  labels: string[];
  sort_by: SortBy;
  search?: string;
}

export interface MessageFilters {
  before?: string;
  after?: string;
  limit: number;
}

// WebSocket connection types
export interface WebSocketConfig {
  url: string;
  accountId: number;
  userId: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface WebSocketMessage {
  event: string;
  data: any;
  identifier?: string;
}