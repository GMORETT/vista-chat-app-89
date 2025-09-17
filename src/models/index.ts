// Types based on Chatwoot API and PRD specifications

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

export interface Contact {
  id: number;
  name: string;
  email?: string;
  phone_number?: string;
  custom_attributes?: Record<string, any>;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

export interface Team {
  id: number;
  name: string;
}

export interface Inbox {
  id: number;
  name: string;
  channel_type: string;
}

export interface Conversation {
  id: number;
  inbox_id: number;
  status: StatusType;
  priority: PriorityType;
  last_activity_at: number;
  updated_at: number;
  created_at: number;
  unread_count: number;
  snoozed_until?: number | null;
  meta: {
    sender: Contact;
    assignee?: Agent | null;
    team?: Team | null;
    channel: string;
  };
  labels: string[];
  custom_attributes: Record<string, any>;
  can_reply: boolean;
}

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

export interface Message {
  id: number;
  content: string;
  message_type: number; // 0: incoming, 1: outgoing
  created_at: number;
  attachments: Attachment[];
  sender?: Contact | Agent;
  private?: boolean;
}

export interface Attachment {
  id: number;
  file_type: string;
  account_id: number;
  file_url: string;
  thumb_url?: string;
  data_url: string;
  fallback_title: string;
}

export interface MessagesResponse {
  payload: Message[];
}

export interface SendMessageRequest {
  content: string;
  private?: boolean;
}

export interface SendFileRequest {
  content?: string;
  private?: boolean;
  attachments: File[];
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}