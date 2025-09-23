const crypto = require('crypto');

// In-memory storage for audit logs (replace with database in production)
let auditLogs = [];
let hashChain = new Map(); // account_id -> last hash

class AuditService {
  constructor() {
    this.logs = auditLogs;
  }

  // Calculate SHA-256 hash for tamper evidence
  calculateHash(payload) {
    const canonicalData = this.canonicalize(payload);
    return crypto.createHash('sha256').update(canonicalData, 'utf8').digest('hex');
  }

  // Canonicalize data for consistent hashing
  canonicalize(data) {
    return JSON.stringify(data, Object.keys(data).sort());
  }

  // Mask sensitive data in logs
  maskSecrets(data) {
    if (!data || typeof data !== 'object') return data;
    
    const masked = JSON.parse(JSON.stringify(data));
    const sensitiveFields = ['password', 'api_key', 'secret', 'token', 'authorization'];
    
    const maskValue = (obj) => {
      for (const key in obj) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          obj[key] = '***MASKED***';
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          maskValue(obj[key]);
        }
      }
    };
    
    maskValue(masked);
    return masked;
  }

  // Get last hash in chain for account
  getLastHash(accountId) {
    const lastLog = this.logs
      .filter(log => log.account_id === accountId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
    
    return lastLog ? lastLog.hash : null;
  }

  // Main logging function
  async log(event) {
    try {
      const timestamp = new Date().toISOString();
      const prevHash = this.getLastHash(event.account_id) || '';
      
      // Mask sensitive data
      const maskedBefore = this.maskSecrets(event.before);
      const maskedAfter = this.maskSecrets(event.after);
      
      // Prepare payload for hashing
      const hashPayload = {
        prev_hash: prevHash,
        timestamp,
        actor_id: event.actor_id,
        actor_role: event.actor_role,
        entity_type: event.entity_type,
        action: event.action,
        account_id: event.account_id,
        after: maskedAfter
      };
      
      const hash = this.calculateHash(hashPayload);
      
      // Create audit log entry
      const auditLog = {
        id: Date.now() + Math.random(), // Simple ID generation
        request_id: event.request_id,
        timestamp,
        actor_id: event.actor_id,
        actor_role: event.actor_role,
        actor_ip: event.actor_ip,
        entity_type: event.entity_type,
        action: event.action,
        account_id: event.account_id,
        cw_entity_id: event.cw_entity_id || null,
        before: maskedBefore,
        after: maskedAfter,
        success: event.success,
        error_message: event.error_message || null,
        hash,
        prev_hash: prevHash || null
      };
      
      // Store in memory
      this.logs.push(auditLog);
      
      // Update hash chain
      hashChain.set(event.account_id, hash);
      
      return auditLog;
    } catch (error) {
      console.error('Audit logging failed:', error);
      throw error;
    }
  }

  // Validate hash chain integrity
  validateChain(accountId = null) {
    const logs = accountId 
      ? this.logs.filter(log => log.account_id === accountId)
      : this.logs;
    
    logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const expectedPrevHash = i === 0 ? null : logs[i - 1].hash;
      
      if (log.prev_hash !== expectedPrevHash) {
        return {
          valid: false,
          error: `Hash chain broken at log ${log.id}`,
          log
        };
      }
      
      // Recalculate hash to verify integrity
      const hashPayload = {
        prev_hash: log.prev_hash || '',
        timestamp: log.timestamp,
        actor_id: log.actor_id,
        actor_role: log.actor_role,
        entity_type: log.entity_type,
        action: log.action,
        account_id: log.account_id,
        after: log.after
      };
      
      const expectedHash = this.calculateHash(hashPayload);
      if (log.hash !== expectedHash) {
        return {
          valid: false,
          error: `Hash mismatch at log ${log.id}`,
          log
        };
      }
    }
    
    return { valid: true };
  }

  // Get filtered logs with pagination
  getLogs(filters = {}, page = 1, limit = 25) {
    let filtered = [...this.logs];
    
    // Apply filters
    if (filters.account_id) {
      filtered = filtered.filter(log => log.account_id === filters.account_id);
    }
    if (filters.actor_id) {
      filtered = filtered.filter(log => log.actor_id === filters.actor_id);
    }
    if (filters.actor_role) {
      filtered = filtered.filter(log => log.actor_role === filters.actor_role);
    }
    if (filters.entity_type) {
      filtered = filtered.filter(log => log.entity_type === filters.entity_type);
    }
    if (filters.action) {
      filtered = filtered.filter(log => log.action === filters.action);
    }
    if (filters.success !== undefined) {
      filtered = filtered.filter(log => log.success === filters.success);
    }
    if (filters.start_date) {
      filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(filters.start_date));
    }
    if (filters.end_date) {
      filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(filters.end_date));
    }
    
    // Sort by timestamp desc
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Paginate
    const offset = (page - 1) * limit;
    const items = filtered.slice(offset, offset + limit);
    
    return {
      payload: items,
      meta: {
        current_page: page,
        next_page: offset + limit < filtered.length ? page + 1 : null,
        prev_page: page > 1 ? page - 1 : null,
        total_pages: Math.ceil(filtered.length / limit),
        total_count: filtered.length
      }
    };
  }

  // Export logs to CSV format
  exportToCSV(logs) {
    const headers = [
      'id', 'request_id', 'timestamp', 'actor_id', 'actor_role', 'actor_ip',
      'entity_type', 'action', 'account_id', 'cw_entity_id', 'success', 'error_message'
    ];
    
    const csvRows = [headers.join(',')];
    
    logs.forEach(log => {
      const row = headers.map(header => {
        let value = log[header];
        if (value === null || value === undefined) value = '';
        if (typeof value === 'string') value = `"${value.replace(/"/g, '""')}"`;
        return value;
      });
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }

  // Export logs to JSON format
  exportToJSON(logs) {
    return JSON.stringify(logs, null, 2);
  }
}

// Singleton instance
const auditService = new AuditService();

// Add example audit log data for development with focus on inbox operations
const initExampleData = () => {
  const now = new Date();
  const exampleLogs = [];
  
  // Generate realistic inbox audit logs over the past 30 days
  const inboxActions = ['create', 'update', 'delete', 'assign_members', 'oauth_start', 'oauth_complete'];
  const channelTypes = ['whatsapp', 'facebook', 'instagram', 'telegram'];
  const actors = [
    { id: 1, role: 'super_admin', ip: '192.168.1.100' },
    { id: 2, role: 'admin', ip: '192.168.1.105' },
    { id: 3, role: 'admin', ip: '10.0.0.50' }
  ];
  
  // Create 50+ inbox-related audit logs
  for (let i = 0; i < 60; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(now.getTime() - (daysAgo * 86400000) - (hoursAgo * 3600000) - (minutesAgo * 60000));
    
    const actor = actors[Math.floor(Math.random() * actors.length)];
    const action = inboxActions[Math.floor(Math.random() * inboxActions.length)];
    const channelType = channelTypes[Math.floor(Math.random() * channelTypes.length)];
    const accountId = Math.floor(Math.random() * 3) + 1;
    const inboxId = 1000 + i;
    const success = Math.random() > 0.15; // 85% success rate
    
    let before = null;
    let after = null;
    let errorMessage = null;
    
    if (action === 'create') {
      after = {
        name: `${channelType.charAt(0).toUpperCase() + channelType.slice(1)} ${Math.floor(Math.random() * 100)}`,
        channel_type: channelType,
        account_id: accountId
      };
      
      if (channelType === 'whatsapp') {
        after.phone_number = `+5511${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
        after.provider_config = { verified: true, token: '[MASKED]' };
      } else if (channelType === 'facebook') {
        after.provider_config = { 
          page_id: `page_${Math.floor(Math.random() * 10000)}`, 
          page_name: `Empresa ${Math.floor(Math.random() * 100)} LTDA`,
          access_token: '[MASKED]' 
        };
      } else if (channelType === 'instagram') {
        after.provider_config = { 
          business_account: `iba_${Math.floor(Math.random() * 10000)}`,
          username: `@empresa${Math.floor(Math.random() * 100)}`,
          access_token: '[MASKED]' 
        };
      }
      
      if (!success) {
        errorMessage = `Failed to create ${channelType} inbox: OAuth configuration invalid`;
      }
    } else if (action === 'update') {
      const inboxName = `${channelType.charAt(0).toUpperCase() + channelType.slice(1)} Inbox`;
      before = { name: inboxName, channel_type: channelType, greeting_enabled: false };
      after = { name: `${inboxName} - Atualizado`, channel_type: channelType, greeting_enabled: true };
      
      if (!success) {
        errorMessage = 'Update failed: Validation error in inbox configuration';
      }
    } else if (action === 'delete') {
      before = { 
        name: `${channelType.charAt(0).toUpperCase() + channelType.slice(1)} Temp`, 
        channel_type: channelType, 
        account_id: accountId 
      };
      
      if (!success) {
        errorMessage = 'Cannot delete inbox with active conversations';
      }
    } else if (action === 'assign_members') {
      const agentCount = Math.floor(Math.random() * 5) + 1;
      const agents = Array.from({length: agentCount}, (_, i) => i + 1);
      before = { assigned_agents: [] };
      after = { assigned_agents: agents, inbox_id: inboxId };
      
      if (!success) {
        errorMessage = 'Agent assignment failed: Some agents not found';
      }
    } else if (action === 'oauth_start') {
      after = { 
        provider: channelType, 
        oauth_initiated: true, 
        state: `${channelType}_${timestamp.getTime()}`,
        account_id: accountId
      };
      
      if (!success) {
        errorMessage = `OAuth initialization failed: ${channelType} API error`;
      }
    } else if (action === 'oauth_complete') {
      after = { 
        provider: channelType, 
        oauth_completed: true, 
        account_id: accountId
      };
      
      if (channelType === 'whatsapp') {
        after.phone_number = `+5511${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      } else if (channelType === 'facebook') {
        after.page_name = `Página ${Math.floor(Math.random() * 100)}`;
      } else if (channelType === 'instagram') {
        after.username = `@user${Math.floor(Math.random() * 100)}`;
      }
      
      if (!success) {
        errorMessage = `OAuth completion failed: Token exchange error with ${channelType}`;
      }
    }
    
    exampleLogs.push({
      id: i + 1,
      request_id: `req_inbox_${i.toString().padStart(3, '0')}`,
      timestamp: timestamp.toISOString(),
      actor_id: actor.id,
      actor_role: actor.role,
      actor_ip: actor.ip,
      entity_type: 'inbox',
      action: action,
      account_id: accountId,
      cw_entity_id: action === 'oauth_start' ? null : inboxId,
      before,
      after,
      success,
      error_message: errorMessage,
      hash: `hash_${i}`,
      prev_hash: i > 0 ? `hash_${i-1}` : null
    });
  }
  
  // Add some logs for other entity types for variety
  const otherEntities = ['account', 'label', 'agent', 'team'];
  for (let i = 0; i < 20; i++) {
    const entity = otherEntities[Math.floor(Math.random() * otherEntities.length)];
    const actions = ['create', 'update', 'delete'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const actor = actors[Math.floor(Math.random() * actors.length)];
    
    const daysAgo = Math.floor(Math.random() * 15);
    const timestamp = new Date(now.getTime() - (daysAgo * 86400000));
    
    exampleLogs.push({
      id: 100 + i,
      request_id: `req_${entity}_${i.toString().padStart(3, '0')}`,
      timestamp: timestamp.toISOString(),
      actor_id: actor.id,
      actor_role: actor.role,
      actor_ip: actor.ip,
      entity_type: entity,
      action: action,
      account_id: Math.floor(Math.random() * 3) + 1,
      cw_entity_id: 2000 + i,
      before: action !== 'create' ? { id: 2000 + i, name: `${entity} ${i}` } : null,
      after: action !== 'delete' ? { id: 2000 + i, name: `Updated ${entity} ${i}` } : null,
      success: Math.random() > 0.1,
      error_message: Math.random() > 0.9 ? `Random ${entity} error for testing` : null,
      hash: `hash_other_${i}`,
      prev_hash: i > 0 ? `hash_other_${i-1}` : null
    });
  }

  // Add logs to the service - sort by timestamp
  exampleLogs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  auditLogs.push(...exampleLogs);
  
  const inboxLogCount = exampleLogs.filter(log => log.entity_type === 'inbox').length;
  console.log(`✅ Added ${exampleLogs.length} example audit logs (${inboxLogCount} inbox-related)`);
};

// Initialize example data
initExampleData();

module.exports = { auditService, AuditService };