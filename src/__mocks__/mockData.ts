import { Agent, Team, Label } from '@/models/admin';
import { Contact, Conversation, Message } from '@/models/chat';
import { MountOptions } from '@/mfe/types';
import { vi } from 'vitest';

export const mockAdminUser: MountOptions['currentUser'] = {
  id: 1,
  name: 'Admin User',
  email: 'admin@test.com',
  role: 'admin-interno',
  roles: ['admin-interno', 'user'],
  account_id: 1
};

export const mockRegularUser: MountOptions['currentUser'] = {
  id: 2,
  name: 'Regular User',
  email: 'user@test.com',
  role: 'user',
  roles: ['user'],
  account_id: 1
};

export const mockSuperAdminUser = {
  id: 3,
  name: 'Super Admin User',
  email: 'superadmin@test.com',
  role: 'super_admin' as const,
  roles: ['super_admin', 'admin-interno', 'user'],
  assigned_inboxes: [],
  account_id: null
};

export const mockUpdatedAdminUser = {
  id: 1,
  name: 'Admin User',
  email: 'admin@test.com',
  role: 'admin' as const,
  roles: ['admin', 'user'],
  assigned_inboxes: [1],
  account_id: 1
};

export const mockUpdatedRegularUser = {
  id: 2,
  name: 'Regular User',
  email: 'user@test.com',
  role: 'user' as const,
  roles: ['user'],
  assigned_inboxes: [1],
  account_id: 1
};

export const mockAgent: Agent = {
  id: 1,
  name: 'Test Agent',
  email: 'agent@test.com',
  role: 'user',
  confirmed: true,
  availability_status: 'available',
  auto_offline: false,
  assigned_inboxes: [1],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  account_id: 1
};

export const mockTeam: Team = {
  id: 1,
  name: 'Test Team',
  description: 'Test team description',
  allow_auto_assign: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  account_id: 1
};

export const mockLabel: Label = {
  id: 1,
  title: 'Test Label',
  slug: 'test-label',
  cw_name: 'acc1_test_label',
  description: 'Test label description',
  color: '#FF5733',
  status: 'active',
  show_on_sidebar: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  account_id: 1
};

export const mockContact: Contact = {
  id: 1,
  name: 'Test Contact',
  email: 'contact@test.com',
  phone_number: '+1234567890',
  avatar: '/placeholder.svg',
  custom_attributes: {},
  created_at: Date.now(),
  last_activity_at: Date.now()
};

export const mockConversation: Conversation = {
  id: 1,
  inbox_id: 1,
  status: 'open',
  priority: null,
  agent_last_seen_at: Date.now(),
  assignee_last_seen_at: Date.now(),
  last_activity_at: Date.now(),
  updated_at: Date.now(),
  created_at: Date.now(),
  timestamp: Date.now(),
  account_id: 1,
  custom_attributes: {},
    inbox: {
    id: 1,
    name: 'Test Inbox',
    channel_type: 'web',
    greeting_enabled: false,
    enable_auto_assignment: false,
    working_hours_enabled: false,
    allow_messages_after_resolved: true,
    account_id: 1
  },
  messages: [],
  meta: {
    sender: mockContact,
    assignee: {
      id: 1,
      name: 'Test Agent',
      email: 'agent@test.com',
      avatar: '/placeholder.svg',
      confirmed: true,
      available: true,
      availability_status: 'online',
      auto_offline: false,
      role: 'agent',
      account_id: 1
    },
    channel: 'web'
  },
  labels: [mockLabel],
  unread_count: 2,
  can_reply: true
};

export const mockMessage: Message = {
  id: 1,
  content: 'Test message content',
  message_type: 0,
  created_at: Date.now(),
  updated_at: Date.now(),
  private: false,
  status: 'sent',
  content_type: 'text',
  sender: mockContact,
  sender_type: 'contact',
  sender_id: 1,
  conversation_id: 1,
  inbox_id: 1,
  attachments: []
};

export const mockMountOptions: MountOptions = {
  basePath: '/test',
  apiBaseUrl: 'http://localhost:3001',
  authToken: 'mock-token',
  theme: 'light',
  locale: 'pt-BR',
  currentUser: mockAdminUser,
  chatwootAccountId: 'mock-account-id',
  getAuthToken: () => Promise.resolve('mock-token'),
  onResize: vi.fn(),
  onUnauthorized: vi.fn()
};