import { Conversation, Message, Contact, Agent, Team, Inbox, Label, StatusType, PriorityType } from '../models/chat';

// Mock Agents
export const mockAgents: Agent[] = [
  { id: 1, name: 'Samuel França', email: 'samuel@empresa.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'agent', account_id: 1 },
  { id: 2, name: 'Marina Costa', email: 'marina@empresa.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'agent', account_id: 1 },
  { id: 3, name: 'Rafael Duarte', email: 'rafael@empresa.com', available: false, confirmed: true, availability_status: 'offline', auto_offline: true, role: 'agent', account_id: 1 },
  { id: 4, name: 'Camila Barros', email: 'camila@empresa.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'agent', account_id: 1 },
  { id: 5, name: 'Diego Fernandes', email: 'diego@empresa.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'administrator', account_id: null },
];

// Mock Teams
export const mockTeams: Team[] = [
  { id: 1, name: 'Vendas', description: 'Equipe de vendas', allow_auto_assign: true, account_id: 1 },
  { id: 2, name: 'Suporte', description: 'Equipe de suporte técnico', allow_auto_assign: true, account_id: 1 },
  { id: 3, name: 'Marketing', description: 'Equipe de marketing', allow_auto_assign: false, account_id: 1 },
  { id: 4, name: 'Financeiro', description: 'Equipe financeira', allow_auto_assign: true, account_id: 1 },
];

// Mock Inboxes
export const mockInboxes: Inbox[] = [
  { id: 1, name: 'Site Principal', channel_type: 'website', greeting_enabled: true, enable_auto_assignment: true, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 1 },
  { id: 2, name: 'WhatsApp Business', channel_type: 'whatsapp', greeting_enabled: true, enable_auto_assignment: true, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 1 },
  { id: 3, name: 'Email Suporte', channel_type: 'email', greeting_enabled: false, enable_auto_assignment: true, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 1 },
  { id: 4, name: 'Instagram', channel_type: 'instagram', greeting_enabled: true, enable_auto_assignment: false, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 1 },
  { id: 5, name: 'Facebook', channel_type: 'facebook', greeting_enabled: true, enable_auto_assignment: true, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 1 },
];

// Mock Labels
export const mockLabels: Label[] = [
  { id: 1, title: 'Bug', description: 'Problema técnico', color: '#f97316', show_on_sidebar: true, account_id: 1 },
  { id: 2, title: 'Feature Request', description: 'Solicitação de funcionalidade', color: '#10b981', show_on_sidebar: false, account_id: 1 },
  { id: 3, title: 'Vendas', description: 'Oportunidade de venda', color: '#3b82f6', show_on_sidebar: true, account_id: 1 },
  { id: 4, title: 'Suporte', description: 'Questão de suporte', color: '#8b5cf6', show_on_sidebar: true, account_id: 1 },
  { id: 5, title: 'Billing', description: 'Questão financeira', color: '#f59e0b', show_on_sidebar: false, account_id: 1 },
  { id: 6, title: 'Feedback', description: 'Feedback do cliente', color: '#06b6d4', show_on_sidebar: false, account_id: 1 },
  { id: 7, title: 'Cancelamento', description: 'Solicitação de cancelamento', color: '#ef4444', show_on_sidebar: true, account_id: 1 },
  { id: 8, title: 'Cliente VIP', description: 'Cliente importante', color: '#fbbf24', show_on_sidebar: true, account_id: 1 },
];

// Mock Contacts
const generateContacts = (): Contact[] => {
  const firstNames = ['Ana', 'Carlos', 'Maria', 'João', 'Lucia', 'Pedro', 'Julia', 'Roberto', 'Fernanda', 'Marcos'];
  const lastNames = ['Silva', 'Santos', 'Costa', 'Pereira', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Alves', 'Ribeiro'];
  const domains = ['gmail.com', 'outlook.com', 'empresa.com', 'teste.com', 'exemplo.com'];

  return Array.from({ length: 50 }, (_, i) => {
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
};

export const mockContacts = generateContacts();

// Mock Messages Generator
export const generateMessages = (conversationId: number, count: number): Message[] => {
  const messageTypes = [
    'Olá! Preciso de ajuda com minha conta.',
    'Não consigo acessar o sistema.',
    'Quando será lançada a nova funcionalidade?',
    'Obrigado pelo excelente atendimento!',
    'Há quanto tempo vocês estão no mercado?',
    'Qual é o valor do plano premium?',
    'Posso cancelar a qualquer momento?',
    'Vocês oferecem suporte 24/7?',
    'Como faço para alterar minha senha?',
    'Estou interessado nos seus serviços.',
  ];

  const responses = [
    'Olá! Claro, posso ajudá-lo. Qual é o problema específico?',
    'Vou verificar isso para você. Um momento, por favor.',
    'Entendo sua situação. Vamos resolver isso juntos.',
    'Muito obrigado pelo feedback! Ficamos felizes em ajudar.',
    'Deixe-me encaminhar sua solicitação para o setor responsável.',
    'Sim, posso fornecer essas informações para você.',
    'Perfeito! Vou processar sua solicitação agora.',
    'Claro! Vou explicar o processo passo a passo.',
    'Obrigado por entrar em contato conosco.',
    'Fico à disposição para mais esclarecimentos.',
  ];

  return Array.from({ length: count }, (_, i) => {
    const isOutgoing = i % 3 === 0; // 1/3 são respostas do agente
    const isPrivate = i % 10 === 9; // 1/10 são notas privadas
    const hasAttachment = i % 15 === 14; // 1/15 têm anexos
    
    const baseMessage: Message = {
      id: (conversationId * 1000) + i + 1,
      content: isOutgoing 
        ? responses[i % responses.length]
        : messageTypes[i % messageTypes.length],
      inbox_id: mockInboxes[conversationId % mockInboxes.length].id,
      conversation_id: conversationId,
      message_type: isOutgoing ? 1 : 0, // 1 = outgoing, 0 = incoming
      created_at: Math.floor(Date.now() / 1000) - ((count - i) * 60 * 5), // 5 min intervals
      updated_at: Math.floor(Date.now() / 1000) - ((count - i) * 60 * 5),
      private: isPrivate,
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
      conversation: {} as any, // Será preenchido quando necessário
      attachments: [],
    };

    if (hasAttachment) {
      baseMessage.attachments = [{
        id: i + 1,
        file_type: 'image',
        extension: 'jpg',
        data_url: `https://picsum.photos/200/200?random=${i}`,
        thumb_url: `https://picsum.photos/100/100?random=${i}`,
        file_url: `https://picsum.photos/200/200?random=${i}`,
        file_size: Math.floor(Math.random() * 1000000) + 50000,
        fallback_title: `imagem_${i + 1}.jpg`,
        coordinates_lat: null,
        coordinates_long: null,
      }];
    }

    return baseMessage;
  });
};

// Mock Conversations Generator
const generateConversations = (): Conversation[] => {
  const statuses: StatusType[] = ['open', 'pending', 'snoozed', 'resolved'];
  const priorities: (PriorityType)[] = [null, 'low', 'medium', 'high', 'urgent'];
  
  return Array.from({ length: 60 }, (_, i) => {
    const contact = mockContacts[i % mockContacts.length];
    const inbox = mockInboxes[i % mockInboxes.length];
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const assignee = i % 3 === 0 ? mockAgents[i % mockAgents.length] : null;
    const unreadCount = status === 'open' ? Math.floor(Math.random() * 5) : 0;
    const labelCount = Math.floor(Math.random() * 4);
    const conversationLabels = mockLabels.slice(0, labelCount);
    
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
      snoozed_until: status === 'snoozed' ? Math.floor(Date.now() / 1000) + 86400 : null,
      timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
      unread_count: unreadCount,
      updated_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600),
      uuid: `uuid_${i + 1}`,
      waiting_since: status === 'pending' ? Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400) : null,
      labels: conversationLabels,
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
};

export const mockConversations = generateConversations();

// Generate messages for each conversation
export const mockMessages: Record<number, Message[]> = {};
// Note: Messages will be generated lazily when needed

// Mock Meta Data  
const calculateMeta = () => {
  const mine_count = mockConversations.filter(c => c.meta.assignee?.id === mockAgents[0].id).length;
  const unassigned_count = mockConversations.filter(c => !c.meta.assignee).length;
  const assigned_count = mockConversations.filter(c => c.meta.assignee).length;
  const all_count = mockConversations.length;
  
  return {
    mine_count,
    unassigned_count,
    assigned_count,
    all_count,
  };
};

export const mockConversationMeta = calculateMeta();