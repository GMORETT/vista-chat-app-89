const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { mockData } = require('./mockData');
const { auditService } = require('./auditService');
const { createAuditWrapper } = require('./auditMiddleware');
const app = express();
const PORT = 3001;

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];

app.use(cors({
  origin: (origin, callback) => callback(null, true), // Allow all origins in development
  credentials: true
}));

app.use(express.json());

// RBAC Middleware for multi-tenant support
const rbacAuth = (req, res, next) => {
  // Mock authentication - in real app, extract from JWT or session
  const authHeader = req.headers['api_access_token'] || req.headers['authorization'];
  
  // Mock user based on token or default for development
  let currentUser;
  if (authHeader === 'super_admin_token') {
    currentUser = mockData.agents.find(a => a.role === 'super_admin');
  } else if (authHeader === 'admin_account1_token') {
    currentUser = mockData.agents.find(a => a.role === 'administrator' && a.account_id === 1);
  } else if (authHeader === 'admin_account2_token') {
    currentUser = mockData.agents.find(a => a.role === 'administrator' && a.account_id === 2);
  } else {
    // Default to super admin for development
    currentUser = mockData.agents.find(a => a.role === 'super_admin');
  }
  
  req.currentUser = currentUser;
  next();
};

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
app.get('/api/messaging/conversations', rbacAuth, enforceAccountStatus, async (req, res) => {
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

app.get('/api/messaging/conversations/meta', rbacAuth, enforceAccountStatus, async (req, res) => {
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

// ACCOUNT MANAGEMENT ROUTES - Platform API Structure
// Only super_admin can access these routes

// Middleware to enforce account status for agent routes
const enforceAccountStatus = (req, res, next) => {
  const accountId = req.currentUser?.account_id;
  if (accountId) {
    const account = mockData.accounts.find(a => a.id === accountId);
    if (account && account.status === 'inactive') {
      return res.status(403).json({ 
        error: 'Client is inactive', 
        code: 'CLIENT_INACTIVE' 
      });
    }
  }
  next();
};

app.get('/api/admin/accounts', rbacAuth, async (req, res) => {
  await delay();
  try {
    if (req.currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: super_admin role required' });
    }
    
    const { page = 1, name, status, sort = 'name_asc' } = req.query;
    let accounts = [...mockData.accounts];
    
    // Filter by name (server-side search)
    if (name) {
      accounts = accounts.filter(account => 
        account.name.toLowerCase().includes(name.toLowerCase()) ||
        account.slug.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    // Filter by status
    if (status) {
      accounts = accounts.filter(account => account.status === status);
    }
    
    // Sort accounts
    switch (sort) {
      case 'name_desc':
        accounts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'created_at_asc':
        accounts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'created_at_desc':
        accounts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        accounts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    const result = paginate(accounts, parseInt(page));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/accounts', rbacAuth, async (req, res) => {
  await delay();
  try {
    if (req.currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: super_admin role required' });
    }
    
    const { name, slug } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }
    
    // Simulate potential Chatwoot Platform API failure
    if (Math.random() < 0.1) { // 10% chance of failure for testing
      return res.status(502).json({ 
        error: 'Failed to create Chatwoot account', 
        code: 'CW_CREATE_ACCOUNT_FAILED' 
      });
    }
    
    const newAccount = {
      id: Date.now(),
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      status: 'active', // Always start as active
      chatwoot_account_id: `cw_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    mockData.accounts.push(newAccount);
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/accounts/:id', rbacAuth, async (req, res) => {
  await delay();
  try {
    if (req.currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: super_admin role required' });
    }
    
    const accountId = parseInt(req.params.id);
    const account = mockData.accounts.find(a => a.id === accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const { name, slug } = req.body;
    if (name) account.name = name;
    if (slug) account.slug = slug;
    account.updated_at = new Date().toISOString();
    
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Separate route for status changes with agent access effects
app.patch('/api/admin/accounts/:id/status', rbacAuth, async (req, res) => {
  await delay();
  try {
    if (req.currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: super_admin role required' });
    }
    
    const accountId = parseInt(req.params.id);
    const account = mockData.accounts.find(a => a.id === accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const { status } = req.body;
    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be active or inactive' });
    }
    
    const oldStatus = account.status;
    account.status = status;
    account.updated_at = new Date().toISOString();
    
    // Simulate effects of status change
    if (status === 'inactive' && oldStatus === 'active') {
      console.log(`[ACCOUNT_STATUS] Account ${accountId} set to inactive - blocking agent access`);
      // In real implementation, this would:
      // - Remove Account Users (non-super-admin) from Chatwoot Account
      // - Clear inbox members for this account
      // - Mark conversations as paused
    } else if (status === 'active' && oldStatus === 'inactive') {
      console.log(`[ACCOUNT_STATUS] Account ${accountId} reactivated - restoring agent access`);
      // In real implementation, this would:
      // - Restore Account Users and inbox members
      // - Resume conversations
    }
    
    res.json({ id: account.id, status: account.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/accounts/:id', rbacAuth, async (req, res) => {
  await delay();
  try {
    if (req.currentUser.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden: super_admin role required' });
    }
    
    const accountId = parseInt(req.params.id);
    const account = mockData.accounts.find(a => a.id === accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if account has active inboxes
    const hasActiveInboxes = mockData.inboxes?.some(inbox => 
      inbox.account_id === accountId
    );
    
    if (hasActiveInboxes) {
      return res.status(409).json({ 
        error: 'Cannot delete account with active inboxes. Please remove or cancel channels first.',
        code: 'ACCOUNT_HAS_ACTIVE_INBOXES'
      });
    }
    
    const index = mockData.accounts.findIndex(a => a.id === accountId);
    mockData.accounts.splice(index, 1);
    
    console.log(`[ACCOUNT_DELETE] Account ${accountId} deleted`);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADMIN ROUTES - Official Chatwoot API Structure with Multi-tenant RBAC
// Authentication middleware for admin routes
const adminAuth = (req, res, next) => {
  const token = req.headers['api_access_token'];
  if (!token) {
    return res.status(401).json({ error: 'Missing api_access_token header' });
  }
  
  // Mock authentication
  let currentUser;
  if (token === 'super_admin_token') {
    currentUser = mockData.agents.find(a => a.role === 'super_admin');
  } else if (token === 'admin_account1_token') {
    currentUser = mockData.agents.find(a => a.role === 'administrator' && a.account_id === 1);
  } else if (token === 'admin_account2_token') {
    currentUser = mockData.agents.find(a => a.role === 'administrator' && a.account_id === 2);
  } else {
    currentUser = mockData.agents.find(a => a.role === 'super_admin');
  }
  
  req.currentUser = currentUser;
  req.accountId = parseInt(req.params.accountId);
  
  // RBAC: Check if user can access this account
  if (currentUser.role !== 'super_admin' && currentUser.account_id !== req.accountId) {
    return res.status(403).json({ error: 'Forbidden: Access denied to this account' });
  }
  
  next();
};

// Inboxes
app.get('/api/v1/accounts/:accountId/inboxes', adminAuth, async (req, res) => {
  await delay();
  try {
    // Filter inboxes by account_id for non-super_admin users
    let inboxes = mockData.inboxes || [];
    if (req.currentUser.role !== 'super_admin') {
      inboxes = inboxes.filter(inbox => inbox.account_id === req.accountId);
    }
    res.json(inboxes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/accounts/:accountId/inboxes', adminAuth, async (req, res) => {
  await delay();
  try {
    const { name, channel, greeting_enabled, greeting_message } = req.body;
    const { type: channel_type, phone_number, provider_config } = channel || {};
    
    const newInbox = {
      id: Date.now(),
      name,
      channel_type,
      phone_number,
      provider_config: provider_config || {},
      greeting_enabled: greeting_enabled || false,
      greeting_message: greeting_message || '',
      account_id: req.accountId, // Associate with account
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (!mockData.inboxes) mockData.inboxes = [];
    mockData.inboxes.push(newInbox);
    
    res.json(newInbox);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/v1/accounts/:accountId/inboxes/:id', adminAuth, async (req, res) => {
  await delay();
  try {
    const inboxId = parseInt(req.params.id);
    const inbox = mockData.inboxes?.find(i => i.id === inboxId);
    
    if (!inbox) {
      return res.status(404).json({ error: 'Inbox not found' });
    }
    
    Object.assign(inbox, req.body, { updated_at: new Date().toISOString() });
    res.json(inbox);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/v1/accounts/:accountId/inboxes/:id', adminAuth, async (req, res) => {
  await delay();
  try {
    const inboxId = parseInt(req.params.id);
    if (!mockData.inboxes) return res.status(404).json({ error: 'Inbox not found' });
    
    const index = mockData.inboxes.findIndex(i => i.id === inboxId);
    if (index === -1) {
      return res.status(404).json({ error: 'Inbox not found' });
    }
    
    mockData.inboxes.splice(index, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teams
app.get('/api/v1/accounts/:accountId/teams', adminAuth, async (req, res) => {
  await delay();
  try {
    // Filter teams by account_id for non-super_admin users
    let teams = mockData.teams || [];
    if (req.currentUser.role !== 'super_admin') {
      teams = teams.filter(team => team.account_id === req.accountId);
    }
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/accounts/:accountId/teams', adminAuth, async (req, res) => {
  await delay();
  try {
    const { name, description, allow_auto_assign = false } = req.body;
    
    const newTeam = {
      id: Date.now(),
      name,
      description: description || '',
      allow_auto_assign,
      account_id: req.accountId, // Associate with account
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (!mockData.teams) mockData.teams = [];
    mockData.teams.push(newTeam);
    
    res.json(newTeam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Account Users (Agents)
app.get('/api/v1/accounts/:accountId/account_users', adminAuth, async (req, res) => {
  await delay();
  try {
    // Filter agents by account_id for non-super_admin users
    let agents = mockData.agents || [];
    if (req.currentUser.role !== 'super_admin') {
      agents = agents.filter(agent => agent.account_id === req.accountId);
    }
    res.json(agents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/accounts/:accountId/account_users', adminAuth, async (req, res) => {
  await delay();
  try {
    const { name, email, role = 'agent', availability_status = 'available' } = req.body;
    
    const newAgent = {
      id: Date.now(),
      name,
      email,
      role,
      availability_status,
      auto_offline: false,
      confirmed: true,
      account_id: role === 'super_admin' ? null : req.accountId, // Super admin has null account_id
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (!mockData.agents) mockData.agents = [];
    mockData.agents.push(newAgent);
    
    res.json(newAgent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Labels
app.get('/api/v1/accounts/:accountId/labels', adminAuth, async (req, res) => {
  await delay();
  try {
    // Filter labels by account_id for non-super_admin users
    let labels = mockData.labels || [];
    if (req.currentUser.role !== 'super_admin') {
      labels = labels.filter(label => label.account_id === req.accountId);
    }
    res.json(labels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/accounts/:accountId/labels', adminAuth, async (req, res) => {
  await delay();
  try {
    const { title, description, color, show_on_sidebar = true } = req.body;
    
    const newLabel = {
      id: Date.now(),
      title,
      description: description || '',
      color: color || '#007bff',
      show_on_sidebar,
      account_id: req.accountId, // Associate with account
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (!mockData.labels) mockData.labels = [];
    mockData.labels.push(newLabel);
    
    res.json(newLabel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Label assignment endpoints with proper merge logic
app.get('/api/v1/accounts/:accountId/contacts/:id/labels', adminAuth, async (req, res) => {
  await delay();
  try {
    const contactId = parseInt(req.params.id);
    const contact = mockData.contacts.find(c => c.id === contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json(contact.additional_attributes?.labels || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/accounts/:accountId/contacts/:id/labels', adminAuth, async (req, res) => {
  await delay();
  try {
    const contactId = parseInt(req.params.id);
    const { labels } = req.body;
    
    const contact = mockData.contacts.find(c => c.id === contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    if (!contact.additional_attributes) contact.additional_attributes = {};
    contact.additional_attributes.labels = labels;
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/accounts/:accountId/conversations/:id/labels', adminAuth, async (req, res) => {
  await delay();
  try {
    const conversationId = parseInt(req.params.id);
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    res.json(conversation.labels?.map(l => l.title) || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/accounts/:accountId/conversations/:id/labels', adminAuth, async (req, res) => {
  await delay();
  try {
    const conversationId = parseInt(req.params.id);
    const { labels } = req.body;
    
    const conversation = mockData.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    
    // Convert label titles to label objects
    conversation.labels = labels.map(title => {
      const existingLabel = mockData.labels.find(l => l.title === title);
      return existingLabel || { id: Date.now(), title, color: '#007bff' };
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Channel types endpoint
app.get('/api/v1/accounts/:accountId/channel-types', adminAuth, async (req, res) => {
  await delay();
  try {
    const channelTypes = [
      {
        id: 'web_widget',
        name: 'Website',
        description: 'Add a chat widget to your website',
        icon: 'globe',
        fields: [
          { name: 'website_name', label: 'Website Name', type: 'text', required: true },
          { name: 'website_url', label: 'Website URL', type: 'text', required: true }
        ]
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp Business',
        description: 'Official WhatsApp Business API (Meta Cloud)',
        icon: 'message-circle',
        fields: [
          { name: 'phone_number', label: 'Phone Number', type: 'text', required: true },
          { name: 'business_account_id', label: 'Business Account ID', type: 'text', required: true },
          { name: 'api_key', label: 'API Key', type: 'password', required: true, sensitive: true }
        ]
      },
      {
        id: 'api',
        name: 'API',
        description: 'Connect using our API',
        icon: 'code',
        fields: [
          { name: 'webhook_url', label: 'Webhook URL', type: 'text', required: false }
        ]
      }
    ];
    
    res.json(channelTypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= AUDIT LOGS ROUTES =============
app.get('/api/admin/audit-logs', rbacAuth, async (req, res) => {
  await delay();
  try {
    const page = parseInt(req.query.page) || 1;
    const filters = { ...req.query };
    delete filters.page;
    if (filters.account_id) filters.account_id = parseInt(filters.account_id);
    if (filters.actor_id) filters.actor_id = parseInt(filters.actor_id);
    if (filters.success !== undefined) filters.success = filters.success === 'true';
    const result = auditService.getLogs(filters, page);
    res.json({ data: result, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: error.message });
  }
});

app.get('/api/admin/audit-logs/export', rbacAuth, async (req, res) => {
  await delay();
  try {
    const format = req.query.format || 'csv';
    const filters = { ...req.query };
    delete filters.format;
    const logs = auditService.getLogs(filters, 1, 10000).payload;
    const exportData = format === 'json' ? auditService.exportToJSON(logs) : auditService.exportToCSV(logs);
    res.setHeader('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    res.send(exportData);
  } catch (error) {
    res.status(500).json({ data: null, error: error.message });
  }
});

app.get('/api/admin/audit-logs/validate', rbacAuth, async (req, res) => {
  await delay();
  try {
    const accountId = req.query.account_id ? parseInt(req.query.account_id) : undefined;
    const result = auditService.validateChain(accountId);
    res.json({ data: result, error: null });
  } catch (error) {
    res.status(500).json({ data: null, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Chatwoot BFF Fake Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Audit system enabled`);
  console.log(`🔗 CORS enabled for: ${allowedOrigins.join(', ')}`);
});