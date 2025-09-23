const { auditService } = require('./auditService');
const crypto = require('crypto');

// Generate unique request ID
function generateRequestId() {
  return crypto.randomUUID();
}

// Extract actor information from request
function extractActor(req) {
  const user = req.currentUser;
  return {
    actor_id: user?.id || null,
    actor_role: user?.role || 'unknown',
    actor_ip: req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || 'unknown'
  };
}

// Audit middleware factory
function withAudit(handler, options = {}) {
  return async (req, res, next) => {
    const requestId = generateRequestId();
    const actor = extractActor(req);
    const startTime = Date.now();
    
    // Store request context
    req.auditContext = {
      requestId,
      actor,
      entityType: options.entity_type,
      action: options.action,
      resolveIds: options.resolveIds
    };
    
    // Capture request data
    const before = options.captureBefore ? await options.captureBefore(req) : null;
    
    try {
      // Execute the original handler
      await handler(req, res, next);
      
      // If response was successful, log success
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const after = options.captureAfter ? await options.captureAfter(req, res) : null;
        const entityIds = options.resolveIds ? await options.resolveIds(req, res) : {};
        
        await auditService.log({
          request_id: requestId,
          ...actor,
          entity_type: options.entity_type,
          action: options.action,
          account_id: entityIds.account_id || req.currentUser?.account_id || null,
          cw_entity_id: entityIds.cw_entity_id || null,
          before,
          after,
          success: true,
          error_message: null
        });
      }
    } catch (error) {
      // Log error
      await auditService.log({
        request_id: requestId,
        ...actor,
        entity_type: options.entity_type,
        action: options.action,
        account_id: req.currentUser?.account_id || null,
        cw_entity_id: null,
        before,
        after: null,
        success: false,
        error_message: error.message
      });
      
      // Re-throw the error
      throw error;
    }
  };
}

// Audit configuration for different entities
const auditConfigs = {
  account: {
    entity_type: 'account',
    captureBefore: async (req) => {
      if (req.method === 'PATCH' || req.method === 'DELETE') {
        // In real implementation, fetch current state from database
        return { operation: req.method, id: req.params.id };
      }
      return null;
    },
    captureAfter: async (req, res) => {
      return req.body;
    },
    resolveIds: async (req, res) => {
      // Extract IDs from response or request
      const body = res.locals?.responseData || req.body;
      return {
        account_id: body?.id || req.params.id,
        cw_entity_id: body?.chatwoot_account_id || null
      };
    }
  },
  
  inbox: {
    entity_type: 'inbox',
    captureBefore: async (req) => {
      if (req.method === 'PATCH' || req.method === 'DELETE') {
        return { operation: req.method, id: req.params.id };
      }
      return null;
    },
    captureAfter: async (req, res) => {
      return req.body;
    },
    resolveIds: async (req, res) => {
      const body = res.locals?.responseData || req.body;
      return {
        account_id: body?.account_id || req.currentUser?.account_id,
        cw_entity_id: body?.id || req.params.id
      };
    }
  },
  
  label: {
    entity_type: 'label',
    captureBefore: async (req) => {
      if (req.method === 'PATCH' || req.method === 'DELETE') {
        return { operation: req.method, id: req.params.id };
      }
      return null;
    },
    captureAfter: async (req, res) => {
      return req.body;
    },
    resolveIds: async (req, res) => {
      const body = res.locals?.responseData || req.body;
      return {
        account_id: body?.account_id || req.body?.account_id || req.currentUser?.account_id,
        cw_entity_id: body?.id || req.params.id
      };
    }
  },
  
  agent: {
    entity_type: 'agent',
    captureBefore: async (req) => {
      if (req.method === 'PATCH' || req.method === 'DELETE') {
        return { operation: req.method, id: req.params.id };
      }
      return null;
    },
    captureAfter: async (req, res) => {
      const data = { ...req.body };
      delete data.password; // Never log passwords
      return data;
    },
    resolveIds: async (req, res) => {
      const body = res.locals?.responseData || req.body;
      return {
        account_id: body?.account_id || req.body?.account_id || req.currentUser?.account_id,
        cw_entity_id: body?.id || req.params.id
      };
    }
  },
  
  team: {
    entity_type: 'team',
    captureBefore: async (req) => {
      if (req.method === 'PATCH' || req.method === 'DELETE') {
        return { operation: req.method, id: req.params.id };
      }
      return null;
    },
    captureAfter: async (req, res) => {
      return req.body;
    },
    resolveIds: async (req, res) => {
      const body = res.locals?.responseData || req.body;
      return {
        account_id: body?.account_id || req.currentUser?.account_id,
        cw_entity_id: body?.id || req.params.id
      };
    }
  }
};

// Helper function to create audit wrapper for specific entity
function createAuditWrapper(entityType, action) {
  const config = auditConfigs[entityType];
  if (!config) {
    throw new Error(`No audit config found for entity type: ${entityType}`);
  }
  
  return withAudit((req, res, next) => next(), {
    entity_type: entityType,
    action,
    ...config
  });
}

module.exports = {
  withAudit,
  createAuditWrapper,
  auditConfigs,
  generateRequestId,
  extractActor
};