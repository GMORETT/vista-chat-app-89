import { Conversation, Message, Contact, Agent, Team, Inbox, Label, StatusType, PriorityType } from '../models/chat';

// Reduced mock data for better performance
export const mockAgents: Agent[] = [
  { id: 1, name: 'Samuel França', email: 'samuel@empresa.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'agent', account_id: 1 },
  { id: 2, name: 'Marina Costa', email: 'marina@empresa.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'agent', account_id: 1 },
  { id: 3, name: 'Rafael Duarte', email: 'rafael@empresa.com', available: false, confirmed: true, availability_status: 'offline', auto_offline: true, role: 'agent', account_id: 1 },
];

export const mockTeams: Team[] = [
  { id: 1, name: 'Vendas', description: 'Equipe de vendas', allow_auto_assign: true, account_id: 1 },
  { id: 2, name: 'Suporte', description: 'Equipe de suporte técnico', allow_auto_assign: true, account_id: 1 },
];

export const mockInboxes: Inbox[] = [
  { id: 1, name: 'Site Principal', channel_type: 'website', greeting_enabled: true, enable_auto_assignment: true, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 1 },
  { id: 2, name: 'WhatsApp Business', channel_type: 'whatsapp', greeting_enabled: true, enable_auto_assignment: true, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 1 },
  { id: 3, name: 'Instagram', channel_type: 'instagram', greeting_enabled: true, enable_auto_assignment: false, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 1 },
];

export const mockLabels: Label[] = [
  { id: 1, title: 'Bug', slug: 'bug', cw_name: 'acc1_bug', description: 'Problema técnico', color: '#f97316', status: 'active', show_on_sidebar: true, account_id: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 2, title: 'Vendas', slug: 'vendas', cw_name: 'acc1_vendas', description: 'Oportunidade de venda', color: '#3b82f6', status: 'active', show_on_sidebar: true, account_id: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 3, title: 'Suporte', slug: 'suporte', cw_name: 'acc1_suporte', description: 'Questão de suporte', color: '#8b5cf6', status: 'active', show_on_sidebar: true, account_id: 1, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
];

// Lazy contact generator - only create when needed
let _contactsCache: Contact[] | null = null;

export const getContacts = (count: number = 10): Contact[] => {
  if (_contactsCache && _contactsCache.length >= count) {
    return _contactsCache.slice(0, count);
  }

  const firstNames = ['Ana', 'Carlos', 'Maria', 'João', 'Lucia'];
  const lastNames = ['Silva', 'Santos', 'Costa', 'Pereira', 'Oliveira'];
  const domains = ['gmail.com', 'outlook.com', 'empresa.com'];

  _contactsCache = Array.from({ length: Math.max(count, 10) }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const domain = domains[i % domains.length];
    
    return {
      id: i + 1,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone_number: `+5511${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
      avatar_url: null,
      created_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 365 * 24 * 60 * 60),
      custom_attributes: {},
    };
  });

  return _contactsCache.slice(0, count);
};

// Lazy conversation generator
let _conversationsCache: Conversation[] | null = null;

export const getConversations = (count: number = 15): Conversation[] => {
  if (_conversationsCache && _conversationsCache.length >= count) {
    return _conversationsCache.slice(0, count);
  }

  const contacts = getContacts(count);
  const statuses: StatusType[] = ['open', 'pending', 'resolved'];
  const priorities: (PriorityType)[] = [null, 'medium', 'high'];
  
  _conversationsCache = Array.from({ length: Math.max(count, 15) }, (_, i) => {
    const contact = contacts[i % contacts.length];
    const inbox = mockInboxes[i % mockInboxes.length];
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    // Assign conversations to specific agents to match auth context
    // First agent (id: 1) matches our mock user
    let assignee = null;
    if (i % 3 === 0) {
      assignee = mockAgents[0]; // Always assign to first agent (Samuel França - id: 1)
    } else if (i % 5 === 0) {
      assignee = mockAgents[1]; // Some to Marina Costa
    }
    const unreadCount = status === 'open' ? Math.floor(Math.random() * 3) : 0;
    
    return {
      id: i + 1,
      messages: [],
      account_id: 1,
      inbox_id: inbox.id,
      inbox: inbox,
      status,
      assignee_id: assignee?.id || null,
      team_id: assignee ? mockTeams[i % mockTeams.length].id : null,
      display_id: i + 1000,
      additional_attributes: {},
      agent_last_seen_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
      assignee_last_seen_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
      can_reply: true,
      channel: inbox.channel_type,
      contact_last_seen_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600),
      created_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 365 * 24 * 60 * 60),
      custom_attributes: {},
      first_reply_created_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 365 * 24 * 60 * 60),
      identifier: `conv_${i + 1}`,
      last_activity_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
      last_non_activity_message: null,
      muted: false,
      priority,
      snoozed_until: null,
      timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
      unread_count: unreadCount,
      updated_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600),
      uuid: `uuid_${i + 1}`,
      waiting_since: status === 'pending' ? Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400) : null,
      labels: mockLabels.slice(0, Math.floor(Math.random() * 2)),
      meta: {
        sender: contact,
        assignee: assignee,
        team: assignee ? mockTeams.find(t => t.id === mockTeams[i % mockTeams.length].id) || null : null,
        hmac_verified: true,
        channel: inbox.channel_type,
        browser: {
          device_name: 'Desktop',
          browser_name: 'Chrome',
          browser_version: '120.0.0.0',
          platform_name: 'Windows',
          platform_version: '10',
        },
        referer: null,
        custom_attributes: {},
      },
    };
  });

  return _conversationsCache.slice(0, count);
};

// Lazy message generator
const messageTypes = [
  'Olá! Preciso de ajuda com minha conta.',
  'Não consigo acessar o sistema.',
  'Quando será lançada a nova funcionalidade?',
  'Obrigado pelo excelente atendimento!',
  'Qual é o valor do plano premium?',
];

const responses = [
  'Olá! Claro, posso ajudá-lo. Qual é o problema específico?',
  'Vou verificar isso para você. Um momento, por favor.',
  'Entendo sua situação. Vamos resolver isso juntos.',
  'Muito obrigado pelo feedback! Ficamos felizes em ajudar.',
  'Deixe-me encaminhar sua solicitação para o setor responsável.',
];

export const generateMessages = (conversationId: number, count: number = 5): Message[] => {
  return Array.from({ length: count }, (_, i) => {
    const isOutgoing = i % 3 === 0;
    
    return {
      id: (conversationId * 1000) + i + 1,
      content: isOutgoing 
        ? responses[i % responses.length]
        : messageTypes[i % messageTypes.length],
      inbox_id: mockInboxes[conversationId % mockInboxes.length].id,
      conversation_id: conversationId,
      message_type: isOutgoing ? 1 : 0,
      created_at: Math.floor(Date.now() / 1000) - ((count - i) * 60 * 5),
      updated_at: Math.floor(Date.now() / 1000) - ((count - i) * 60 * 5),
      private: false,
      status: 'sent' as const,
      source_id: `msg_${conversationId}_${i}`,
      content_type: 'text' as const,
      content_attributes: {},
      sender_type: isOutgoing ? 'agent' : 'contact',
      sender_id: isOutgoing ? mockAgents[0].id : conversationId,
      external_source_ids: {},
      additional_attributes: {},
      processed_message_content: null,
      sentiment: {},
      conversation: {} as any,
      attachments: [],
    };
  });
};

// Calculate meta based on actual conversations
const calculateMeta = () => {
  const conversations = getConversations(15);
  const mine_count = conversations.filter(c => c.meta.assignee?.id === 1).length; // Samuel França
  const unassigned_count = conversations.filter(c => !c.meta.assignee).length;
  const assigned_count = conversations.filter(c => c.meta.assignee).length;
  const all_count = conversations.length;
  
  return {
    mine_count,
    unassigned_count,
    assigned_count,
    all_count,
  };
};

export const mockConversationMeta = calculateMeta();