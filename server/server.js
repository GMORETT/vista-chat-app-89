const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { mockData } = require('./mockData');
const app = express();
const PORT = 3001;

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Simulate network delay
const delay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to paginate results
const paginate = (array, page = 1, limit = 25) => {
  const offset = (page - 1) * limit;
  const items = array.slice(offset, offset + limit);
  return {
    payload: items,
    meta: {
      current_page: page,
      next_page: offset + limit < array.length ? page + 1 : null,
      prev_page: page > 1 ? page - 1 : null,
      total_pages: Math.ceil(array.length / limit),
      total_count: array.length
    }
  };
};

// Filter conversations based on query parameters
const filterConversations = (conversations, query) => {
  let filtered = [...conversations];

  if (query.status) {
    filtered = filtered.filter(conv => conv.status === query.status);
  }
  
  if (query.assignee_type) {
    if (query.assignee_type === 'unassigned') {
      filtered = filtered.filter(conv => !conv.assignee);
    } else if (query.assignee_type === 'assigned') {
      filtered = filtered.filter(conv => conv.assignee);
    } else if (query.assignee_type === 'me') {
      // Assuming current user is Samuel França (agent with ID 1)
      filtered = filtered.filter(conv => conv.assignee && conv.assignee.id === 1);
    }
  }

  if (query.inbox_id) {
    filtered = filtered.filter(conv => conv.inbox.id === parseInt(query.inbox_id));
  }

  if (query.team_id) {
    filtered = filtered.filter(conv => conv.team && conv.team.id === parseInt(query.team_id));
  }

  if (query.labels && query.labels.length > 0) {
    filtered = filtered.filter(conv => 
      query.labels.some(label => conv.labels.some(convLabel => convLabel.title === label))
    );
  }

  // Text search (q parameter)
  if (query.q) {
    const searchTerm = query.q.toLowerCase();
    filtered = filtered.filter(conv => {
      const contactName = conv.meta.sender.name?.toLowerCase() || '';
      const contactEmail = conv.meta.sender.email?.toLowerCase() || '';
      const contactPhone = conv.meta.sender.phone_number?.toLowerCase() || '';
      
      return contactName.includes(searchTerm) || 
             contactEmail.includes(searchTerm) || 
             contactPhone.includes(searchTerm);
    });
  }

  // Updated within filter
  if (query.updated_within) {
    const now = new Date();
    let cutoffDate;
    
    switch (query.updated_within) {
      case '1d':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = null;
    }
    
    if (cutoffDate) {
      filtered = filtered.filter(conv => new Date(conv.updated_at) >= cutoffDate);
    }
  }

  // Sorting
  if (query.sort_by) {
    switch (query.sort_by) {
      case 'last_activity_at_desc':
        filtered.sort((a, b) => new Date(b.last_activity_at) - new Date(a.last_activity_at));
        break;
      case 'last_activity_at_asc':
        filtered.sort((a, b) => new Date(a.last_activity_at) - new Date(b.last_activity_at));
        break;
      case 'created_at_desc':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'created_at_asc':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'priority_desc':
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1, null: 0 };
        filtered.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));
        break;
      case 'priority_asc':
        const priorityOrderAsc = { urgent: 4, high: 3, medium: 2, low: 1, null: 0 };
        filtered.sort((a, b) => (priorityOrderAsc[a.priority] || 0) - (priorityOrderAsc[b.priority] || 0));
        break;
      case 'waiting_since_desc':
        filtered.sort((a, b) => (b.waiting_since || 0) - (a.waiting_since || 0));
        break;
      case 'waiting_since_asc':
        filtered.sort((a, b) => (a.waiting_since || 0) - (b.waiting_since || 0));
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  } else {
    // Default sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return filtered;
};

// CONVERSATIONS ROUTES
app.get('/api/messaging/conversations', async (req, res) => {
  await delay();
  
  try {
    const { 
      page = 1, 
      status, 
      assignee_type, 
      inbox_id, 
      team_id, 
      labels, 
      q, 
      sort_by, 
      updated_within 
    } = req.query;
    
    const query = {
      status,
      assignee_type,
      inbox_id,
      team_id,
      labels: labels ? (Array.isArray(labels) ? labels : [labels]) : [],
      q,
      sort_by,
      updated_within
    };

    const filtered = filterConversations(mockData.conversations, query);
    const result = paginate(filtered, parseInt(page));

    res.json({
      data: result,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.get('/api/messaging/conversations/meta', async (req, res) => {
  await delay();
  
  try {
    const { status, assignee_type, inbox_id, team_id, labels, q, updated_within } = req.query;
    const query = {
      status,
      assignee_type,
      inbox_id,
      team_id,
      labels: labels ? (Array.isArray(labels) ? labels : [labels]) : [],
      q,
      updated_within
    };

    // Calculate dynamic meta counts based on current filters
    const allConversations = mockData.conversations;
    const filteredConversations = filterConversations(allConversations, query);
    
    const dynamicMeta = {
      mine_count: filterConversations(allConversations, { ...query, assignee_type: 'me' }).length,
      unassigned_count: filterConversations(allConversations, { ...query, assignee_type: 'unassigned' }).length,
      assigned_count: filterConversations(allConversations, { ...query, assignee_type: 'assigned' }).length,
      all_count: filteredConversations.length,
    };

    res.json({
      data: dynamicMeta,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.get('/api/messaging/conversations/:id', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    
    if (!conversation) {
      return res.status(404).json({
        data: null,
        error: 'Conversation not found'
      });
    }

    res.json({
      data: conversation,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.get('/api/messaging/conversations/:id/messages', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    const { page = 1, before, after, limit = 20 } = req.query;
    
    let messages = mockData.getMessages(conversationId);
    
    // Before/after filtering for pagination
    if (before) {
      const beforeTimestamp = parseInt(before);
      messages = messages.filter(m => m.created_at < beforeTimestamp);
    }
    if (after) {
      const afterTimestamp = parseInt(after);
      messages = messages.filter(m => m.created_at > afterTimestamp);
    }

    // Sort messages by timestamp (oldest first for proper pagination)
    messages.sort((a, b) => a.created_at - b.created_at);

    const result = paginate(messages, parseInt(page), parseInt(limit));

    res.json({
      data: result,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.post('/api/messaging/conversations/:id/messages', upload.array('files'), async (req, res) => {
  await delay(500); // Longer delay for message sending
  
  try {
    const conversationId = parseInt(req.params.id);
    const { content, private: isPrivate } = req.body;
    const files = req.files || [];

    // Create new message
    const newMessage = {
      id: Date.now(),
      content: content || '',
      message_type: 'outgoing',
      created_at: new Date().toISOString(),
      private: isPrivate === 'true',
      source_id: null,
      sender: mockData.agents[0], // Assume first agent is sending
      conversation_id: conversationId,
      attachments: files.map((file, index) => ({
        id: Date.now() + index,
        file_type: file.mimetype.split('/')[0],
        account_id: 1,
        file_size: file.size,
        data_url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        thumb_url: null
      }))
    };

    // Add to mock data
    if (!mockData.messages[conversationId]) {
      mockData.messages[conversationId] = [];
    }
    mockData.messages[conversationId].push(newMessage);

    res.json({
      data: newMessage,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.post('/api/messaging/conversations/:id/toggle_status', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    const { status, snoozed_until } = req.body;
    
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({
        data: null,
        error: 'Conversation not found'
      });
    }

    conversation.status = status;
    if (snoozed_until) {
      conversation.snoozed_until = snoozed_until;
    }

    res.json({
      data: conversation,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.post('/api/messaging/conversations/:id/toggle_priority', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    const { priority } = req.body;
    
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({
        data: null,
        error: 'Conversation not found'
      });
    }

    conversation.priority = priority;

    res.json({
      data: conversation,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.post('/api/messaging/conversations/:id/assign_agent', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    const { assignee_id } = req.body;
    
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({
        data: null,
        error: 'Conversation not found'
      });
    }

    const agent = mockData.agents.find(a => a.id === assignee_id);
    conversation.assignee = agent || null;

    res.json({
      data: conversation,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.post('/api/messaging/conversations/:id/assign_team', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    const { team_id } = req.body;
    
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({
        data: null,
        error: 'Conversation not found'
      });
    }

    const team = mockData.teams.find(t => t.id === team_id);
    conversation.team = team || null;

    res.json({
      data: conversation,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.post('/api/messaging/conversations/:id/labels/add', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    const { labels } = req.body;
    
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({
        data: null,
        error: 'Conversation not found'
      });
    }

    // Add labels that don't already exist
    labels.forEach(labelTitle => {
      const labelExists = conversation.labels.some(l => l.title === labelTitle);
      if (!labelExists) {
        const label = mockData.labels.find(l => l.title === labelTitle);
        if (label) {
          conversation.labels.push(label);
        }
      }
    });

    res.json({
      data: conversation,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.post('/api/messaging/conversations/:id/labels/remove', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    const { labels } = req.body;
    
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({
        data: null,
        error: 'Conversation not found'
      });
    }

    // Remove specified labels
    conversation.labels = conversation.labels.filter(label => 
      !labels.includes(label.title)
    );

    res.json({
      data: conversation,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.post('/api/messaging/conversations/:id/custom_attributes', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    const { custom_attributes } = req.body;
    
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({
        data: null,
        error: 'Conversation not found'
      });
    }

    conversation.custom_attributes = {
      ...conversation.custom_attributes,
      ...custom_attributes
    };

    res.json({
      data: conversation,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.post('/api/messaging/conversations/:id/mark_read', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({
        data: null,
        error: 'Conversation not found'
      });
    }

    conversation.unread_count = 0;
    conversation.last_activity_at = new Date().toISOString();

    res.json({
      data: { success: true },
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.post('/api/messaging/conversations/:id/mark_unread', async (req, res) => {
  await delay();
  
  try {
    const conversationId = parseInt(req.params.id);
    
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({
        data: null,
        error: 'Conversation not found'
      });
    }

    conversation.unread_count = Math.max(1, conversation.unread_count || 0);

    res.json({
      data: { success: true },
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

// INBOXES ROUTES
app.get('/api/messaging/inboxes', async (req, res) => {
  await delay();
  
  try {
    res.json({
      data: {
        payload: mockData.inboxes,
        meta: {
          current_page: 1,
          next_page: null,
          prev_page: null
        }
      },
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

// CONTACTS ROUTES
app.get('/api/messaging/contacts', async (req, res) => {
  await delay();
  
  try {
    const { page = 1, sort, q, labels } = req.query;
    let contacts = [...mockData.contacts];

    // Search filter
    if (q) {
      const query = q.toLowerCase();
      contacts = contacts.filter(contact => 
        contact.name?.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone_number?.includes(query)
      );
    }

    // Labels filter
    if (labels && labels.length > 0) {
      const labelArray = Array.isArray(labels) ? labels : [labels];
      contacts = contacts.filter(contact => 
        labelArray.some(label => contact.additional_attributes?.labels?.includes(label))
      );
    }

    // Sort
    if (sort) {
      const [field, direction] = sort.split(':');
      contacts.sort((a, b) => {
        const aVal = a[field] || '';
        const bVal = b[field] || '';
        const result = aVal.localeCompare(bVal);
        return direction === 'desc' ? -result : result;
      });
    }

    const result = paginate(contacts, parseInt(page));

    res.json({
      data: result,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.get('/api/messaging/contacts/:id', async (req, res) => {
  await delay();
  
  try {
    const contactId = parseInt(req.params.id);
    const contact = mockData.contacts.find(c => c.id === contactId);
    
    if (!contact) {
      return res.status(404).json({
        data: null,
        error: 'Contact not found'
      });
    }

    res.json({
      data: contact,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

app.get('/api/messaging/contacts/:id/conversations', async (req, res) => {
  await delay();
  
  try {
    const contactId = parseInt(req.params.id);
    const { page = 1 } = req.query;
    
    const conversations = mockData.conversations.filter(conv => 
      conv.contact.id === contactId
    );

    const result = paginate(conversations, parseInt(page));

    res.json({
      data: result,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      data: null,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Chatwoot BFF Fake Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 CORS enabled for: ${allowedOrigins.join(', ')}`);
});