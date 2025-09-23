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

module.exports = { auditService, AuditService };