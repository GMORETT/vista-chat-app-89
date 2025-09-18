// Mock data for the fake BFF server
// This uses the same data structure as the frontend MockChatService

// Mock Accounts for multi-tenant support
const mockAccounts = [
  { id: 1, name: 'Cliente Alpha', slug: 'cliente-alpha', status: 'active', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  { id: 2, name: 'Cliente Beta', slug: 'cliente-beta', status: 'active', created_at: '2024-01-02T00:00:00Z', updated_at: '2024-01-02T00:00:00Z' },
  { id: 3, name: 'Cliente Gamma', slug: 'cliente-gamma', status: 'inactive', created_at: '2024-01-03T00:00:00Z', updated_at: '2024-01-03T00:00:00Z' },
];

const mockAgents = [
  // Super admin (account_id: null)
  { id: 1, name: 'Super Admin', email: 'superadmin@solabs.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'super_admin', account_id: null },
  // Agents for Account 1
  { id: 2, name: 'Samuel França', email: 'samuel@clientealpha.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'administrator', account_id: 1 },
  { id: 3, name: 'Marina Costa', email: 'marina@clientealpha.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'agent', account_id: 1 },
  // Agents for Account 2
  { id: 4, name: 'Rafael Duarte', email: 'rafael@clientebeta.com', available: false, confirmed: true, availability_status: 'offline', auto_offline: true, role: 'administrator', account_id: 2 },
  { id: 5, name: 'Camila Barros', email: 'camila@clientebeta.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'agent', account_id: 2 },
  // Agents for Account 3
  { id: 6, name: 'Diego Fernandes', email: 'diego@clientegamma.com', available: true, confirmed: true, availability_status: 'online', auto_offline: true, role: 'agent', account_id: 3 },
];

const mockTeams = [
  { id: 1, name: 'Vendas', description: 'Equipe de vendas', allow_auto_assign: true, account_id: 1 },
  { id: 2, name: 'Suporte', description: 'Equipe de suporte técnico', allow_auto_assign: true, account_id: 1 },
  { id: 3, name: 'Marketing', description: 'Equipe de marketing', allow_auto_assign: false, account_id: 1 },
  { id: 4, name: 'Financeiro', description: 'Equipe financeira', allow_auto_assign: true, account_id: 1 },
];

const mockInboxes = [
  { id: 1, name: 'Site Principal Alpha', channel_type: 'website', greeting_enabled: true, enable_auto_assignment: true, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 1 },
  { id: 2, name: 'WhatsApp Alpha', channel_type: 'whatsapp', greeting_enabled: true, enable_auto_assignment: true, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 1 },
  { id: 3, name: 'Site Principal Beta', channel_type: 'website', greeting_enabled: false, enable_auto_assignment: true, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 2 },
  { id: 4, name: 'Email Beta', channel_type: 'email', greeting_enabled: true, enable_auto_assignment: false, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 2 },
  { id: 5, name: 'Instagram Gamma', channel_type: 'instagram', greeting_enabled: true, enable_auto_assignment: true, working_hours_enabled: false, allow_messages_after_resolved: true, account_id: 3 },
];

const mockLabels = [
  { id: 1, title: 'Urgente', description: 'Requer atenção imediata', color: '#ef4444', show_on_sidebar: true, account_id: 1 },
  { id: 2, title: 'Bug', description: 'Problema técnico', color: '#f97316', show_on_sidebar: true, account_id: 1 },
  { id: 3, title: 'Feature Request', description: 'Solicitação de funcionalidade', color: '#10b981', show_on_sidebar: false, account_id: 1 },
  { id: 4, title: 'Vendas Beta', description: 'Oportunidade de venda', color: '#3b82f6', show_on_sidebar: true, account_id: 2 },
  { id: 5, title: 'Suporte Beta', description: 'Questão de suporte', color: '#8b5cf6', show_on_sidebar: true, account_id: 2 },
  { id: 6, title: 'Billing', description: 'Questão financeira', color: '#f59e0b', show_on_sidebar: false, account_id: 2 },
  { id: 7, title: 'Feedback Gamma', description: 'Feedback do cliente', color: '#06b6d4', show_on_sidebar: false, account_id: 3 },
  { id: 8, title: 'Cancelamento', description: 'Solicitação de cancelamento', color: '#ef4444', show_on_sidebar: true, account_id: 3 },
];

const generateContacts = () => {
  const firstNames = ['Ana', 'Carlos', 'Maria', 'João', 'Lucia', 'Pedro', 'Julia', 'Roberto', 'Fernanda', 'Marcos'];
  const lastNames = ['Silva', 'Santos', 'Costa', 'Pereira', 'Oliveira', 'Souza', 'Lima', 'Ferreira', 'Alves', 'Ribeiro'];
  const domains = ['gmail.com', 'outlook.com', 'empresa.com', 'teste.com', 'exemplo.com'];

  const contacts = [];
  for (let i = 1; i <= 50; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
    const domain = domains[i % domains.length];
    
    contacts.push({
      id: i,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      phone_number: `+5511${String(Math.floor(Math.random() * 900000000) + 100000000)}`,
      avatar_url: null,
      created_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 365 * 24 * 60 * 60),
      custom_attributes: {},
    });
  }
  return contacts;
};

const mockContacts = generateContacts();

const generateMessages = (conversationId, count = 10) => {
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

  const messages = [];
  for (let i = 1; i <= count; i++) {
    const isOutgoing = i % 3 === 0; // 1/3 são respostas do agente
    const isPrivate = i % 10 === 9; // 1/10 são notas privadas
    const hasAttachment = i % 15 === 14; // 1/15 têm anexos
    
    const baseMessage = {
      id: conversationId * 1000 + i,
      content: isOutgoing 
        ? responses[i % responses.length]
        : messageTypes[i % messageTypes.length],
      inbox_id: mockInboxes[conversationId % mockInboxes.length].id,
      conversation_id: conversationId,
      message_type: isOutgoing ? 1 : 0, // 1 = outgoing, 0 = incoming
      created_at: Math.floor(Date.now() / 1000) - ((count - i) * 60 * 5), // 5 min intervals
      updated_at: Math.floor(Date.now() / 1000) - ((count - i) * 60 * 5),
      private: isPrivate,
      status: 'sent',
      source_id: `msg_${conversationId}_${i}`,
      content_type: 'text',
      content_attributes: {},
      sender_type: isOutgoing ? 'agent' : 'contact',
      sender_id: isOutgoing ? mockAgents[0].id : conversationId,
      external_source_ids: {},
      additional_attributes: {},
      processed_message_content: null,
      sentiment: {},
      conversation: {},
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

    messages.push(baseMessage);
  }

  return messages;
};

const generateConversations = () => {
  const statuses = ['open', 'pending', 'snoozed', 'resolved'];
  const priorities = [null, 'low', 'medium', 'high', 'urgent'];
  
  const conversations = [];
  for (let i = 1; i <= 60; i++) {
    const contact = mockContacts[i % mockContacts.length];
    const inbox = mockInboxes[i % mockInboxes.length];
    const status = statuses[i % statuses.length];
    const priority = priorities[i % priorities.length];
    const assignee = i % 3 === 0 ? mockAgents[i % mockAgents.length] : null;
    const unreadCount = status === 'open' ? Math.floor(Math.random() * 5) : 0;
    const labelCount = Math.floor(Math.random() * 4);
    const conversationLabels = mockLabels.slice(0, labelCount);
    
    conversations.push({
      id: i,
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
      identifier: `conv_${i}`,
      last_activity_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
      last_non_activity_message: null,
      muted: false,
      priority,
      snoozed_until: status === 'snoozed' ? Math.floor(Date.now() / 1000) + 86400 : null,
      timestamp: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 86400),
      unread_count: unreadCount,
      updated_at: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 3600),
      uuid: `uuid_${i}`,
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
    });
  }

  return conversations;
};

const mockConversations = generateConversations();

// Lazy generation of messages
const mockMessages = {};

const getMessages = (conversationId) => {
  if (!mockMessages[conversationId]) {
    mockMessages[conversationId] = generateMessages(conversationId);
  }
  return mockMessages[conversationId];
};

const calculateMeta = () => {
  const allConversations = mockConversations;
  const myId = mockAgents[0].id; // Assume first agent is "me"
  
  return {
    mine_count: allConversations.filter(c => c.assignee?.id === myId).length,
    unassigned_count: allConversations.filter(c => !c.assignee).length,
    assigned_count: allConversations.filter(c => c.assignee).length,
    all_count: allConversations.length
  };
};

const mockConversationMeta = calculateMeta();

module.exports = {
  mockData: {
    accounts: mockAccounts,
    agents: mockAgents,
    teams: mockTeams,
    inboxes: mockInboxes,
    labels: mockLabels,
    contacts: mockContacts,
    conversations: mockConversations,
    messages: mockMessages,
    conversationMeta: mockConversationMeta,
    getMessages
  }
};