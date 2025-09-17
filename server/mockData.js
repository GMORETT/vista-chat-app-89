// Mock data for the fake BFF server
// This uses the same data structure as the frontend MockChatService

const mockAgents = [
  { id: 1, name: 'John Doe', email: 'john@example.com', availability_status: 'online' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', availability_status: 'busy' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', availability_status: 'offline' },
];

const mockTeams = [
  { id: 1, name: 'Support Team', description: 'Customer support team' },
  { id: 2, name: 'Sales Team', description: 'Sales and business development' },
];

const mockInboxes = [
  { id: 1, name: 'Website', channel_type: 'Channel::WebWidget' },
  { id: 2, name: 'Email Support', channel_type: 'Channel::Email' },
  { id: 3, name: 'Facebook', channel_type: 'Channel::FacebookPage' },
  { id: 4, name: 'WhatsApp', channel_type: 'Channel::Whatsapp' },
];

const mockLabels = [
  { id: 1, title: 'bug', color: '#FF0000', show_on_sidebar: true },
  { id: 2, title: 'feature-request', color: '#00FF00', show_on_sidebar: true },
  { id: 3, title: 'urgent', color: '#FFA500', show_on_sidebar: true },
  { id: 4, title: 'billing', color: '#0000FF', show_on_sidebar: false },
  { id: 5, title: 'refund', color: '#800080', show_on_sidebar: false },
];

const generateContacts = () => {
  const names = [
    'Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Brown', 'Emma Wilson',
    'Frank Miller', 'Grace Lee', 'Henry Taylor', 'Ivy Chen', 'Jack Anderson',
    'Kate Thompson', 'Liam Garcia', 'Mia Rodriguez', 'Noah Martinez', 'Olivia Lopez',
    'Paul Hernandez', 'Quinn Moore', 'Rachel Jackson', 'Sam White', 'Tina Hall'
  ];
  
  const contacts = [];
  for (let i = 1; i <= 50; i++) {
    const name = names[i % names.length] || `Contact ${i}`;
    contacts.push({
      id: i,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone_number: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
      identifier: `contact_${i}`,
      additional_attributes: {
        city: 'New York',
        country: 'USA',
        labels: i % 3 === 0 ? ['vip'] : []
      },
      created_at: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  return contacts;
};

const mockContacts = generateContacts();

const generateMessages = (conversationId, count = 10) => {
  const messages = [];
  const messageTypes = ['incoming', 'outgoing'];
  const sampleMessages = [
    'Hello, how can I help you today?',
    'I have a question about my order',
    'Thank you for contacting us',
    'Can you please provide more details?',
    'I\'ll look into this right away',
    'Is there anything else I can help with?',
    'Thanks for your patience',
    'Let me check that for you',
    'I understand your concern',
    'We appreciate your feedback'
  ];

  for (let i = 1; i <= count; i++) {
    const messageType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    const isIncoming = messageType === 'incoming';
    
    messages.push({
      id: conversationId * 1000 + i,
      content: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
      message_type: messageType,
      created_at: new Date(Date.now() - (count - i) * 5 * 60 * 1000).toISOString(),
      private: false,
      source_id: null,
      sender: isIncoming ? mockContacts[conversationId % mockContacts.length] : mockAgents[0],
      conversation_id: conversationId,
      attachments: Math.random() > 0.8 ? [{
        id: i * 100,
        file_type: 'image',
        account_id: 1,
        file_size: 1024 * 50,
        data_url: '/placeholder.svg',
        thumb_url: '/placeholder.svg'
      }] : []
    });
  }

  return messages;
};

const generateConversations = () => {
  const conversations = [];
  const statuses = ['open', 'resolved', 'pending'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  for (let i = 1; i <= 60; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = Math.random() > 0.7 ? priorities[Math.floor(Math.random() * priorities.length)] : null;
    const inbox = mockInboxes[Math.floor(Math.random() * mockInboxes.length)];
    const contact = mockContacts[i % mockContacts.length];
    const assignee = Math.random() > 0.4 ? mockAgents[Math.floor(Math.random() * mockAgents.length)] : null;
    const team = Math.random() > 0.6 ? mockTeams[Math.floor(Math.random() * mockTeams.length)] : null;
    
    // Random labels (0-3 labels per conversation)
    const conversationLabels = [];
    const numLabels = Math.floor(Math.random() * 4);
    for (let j = 0; j < numLabels; j++) {
      const label = mockLabels[Math.floor(Math.random() * mockLabels.length)];
      if (!conversationLabels.find(l => l.id === label.id)) {
        conversationLabels.push(label);
      }
    }

    conversations.push({
      id: i,
      account_id: 1,
      inbox,
      contact,
      assignee,
      team,
      status,
      priority,
      labels: conversationLabels,
      unread_count: status === 'open' ? Math.floor(Math.random() * 5) : 0,
      last_activity_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
      first_reply_created_at: new Date(Date.now() - Math.random() * 23 * 60 * 60 * 1000).toISOString(),
      waiting_since: Math.random() > 0.5 ? Date.now() - Math.random() * 60 * 60 * 1000 : null,
      snoozed_until: null,
      custom_attributes: {
        source: inbox.channel_type,
        browser: 'Chrome',
        referer: 'https://example.com'
      },
      meta: {
        sender: contact,
        assignee: assignee
      }
    });
  }

  return conversations.sort((a, b) => new Date(b.last_activity_at) - new Date(a.last_activity_at));
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