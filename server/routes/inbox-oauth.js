const express = require('express');
const { createAuditWrapper } = require('../auditMiddleware');
const router = express.Router();

// Simulate OAuth initiation for different providers
const simulateOAuthStart = async (provider, config) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
  
  // Simulate different success rates for different providers
  const successRates = {
    whatsapp: 0.85,
    facebook: 0.90,
    instagram: 0.80
  };
  
  const success = Math.random() < (successRates[provider] || 0.8);
  
  if (!success) {
    throw new Error(`Failed to initiate ${provider} OAuth flow`);
  }
  
  return {
    auth_url: `https://oauth.${provider}.com/authorize?client_id=${config.client_id}&redirect_uri=${config.redirect_uri}`,
    state: `${provider}_${Date.now()}`,
    expires_in: 3600
  };
};

// WhatsApp OAuth endpoints with audit logging
router.post('/whatsapp/start', createAuditWrapper('inbox', 'oauth_start'), async (req, res) => {
  try {
    const { client_id, redirect_uri, account_id } = req.body;
    
    const result = await simulateOAuthStart('whatsapp', { client_id, redirect_uri });
    
    // Store for audit (without sensitive data)
    res.locals.responseData = {
      provider: 'whatsapp',
      account_id,
      oauth_initiated: true,
      state: result.state
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/whatsapp/callback', createAuditWrapper('inbox', 'oauth_complete'), async (req, res) => {
  try {
    const { code, state, account_id } = req.body;
    
    // Simulate token exchange
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = Math.random() < 0.9; // 90% success rate
    
    if (!success) {
      throw new Error('Failed to exchange authorization code for access token');
    }
    
    const credentials = {
      access_token: '[MASKED]', // Never log actual tokens
      refresh_token: '[MASKED]',
      expires_in: 3600,
      phone_number: '+55119999999' + Math.floor(Math.random() * 100)
    };
    
    // Store for audit (masked)
    res.locals.responseData = {
      provider: 'whatsapp',
      account_id,
      oauth_completed: true,
      state,
      phone_number: credentials.phone_number
    };
    
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Facebook OAuth endpoints
router.post('/facebook/start', createAuditWrapper('inbox', 'oauth_start'), async (req, res) => {
  try {
    const { client_id, redirect_uri, account_id } = req.body;
    
    const result = await simulateOAuthStart('facebook', { client_id, redirect_uri });
    
    res.locals.responseData = {
      provider: 'facebook',
      account_id,
      oauth_initiated: true,
      state: result.state
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/facebook/callback', createAuditWrapper('inbox', 'oauth_complete'), async (req, res) => {
  try {
    const { code, state, account_id } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = Math.random() < 0.92;
    if (!success) {
      throw new Error('Facebook OAuth failed - permission denied');
    }
    
    const credentials = {
      access_token: '[MASKED]',
      page_id: 'page_' + Math.floor(Math.random() * 10000),
      page_name: 'Página do Facebook #' + Math.floor(Math.random() * 100)
    };
    
    res.locals.responseData = {
      provider: 'facebook',
      account_id,
      oauth_completed: true,
      state,
      page_id: credentials.page_id,
      page_name: credentials.page_name
    };
    
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Instagram OAuth endpoints  
router.post('/instagram/start', createAuditWrapper('inbox', 'oauth_start'), async (req, res) => {
  try {
    const { client_id, redirect_uri, account_id } = req.body;
    
    const result = await simulateOAuthStart('instagram', { client_id, redirect_uri });
    
    res.locals.responseData = {
      provider: 'instagram',
      account_id,
      oauth_initiated: true,
      state: result.state
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/instagram/callback', createAuditWrapper('inbox', 'oauth_complete'), async (req, res) => {
  try {
    const { code, state, account_id } = req.body;
    
    await new Promise(resolve => setTimeout(resolve, 900));
    
    const success = Math.random() < 0.88;
    if (!success) {
      throw new Error('Instagram OAuth failed - business account required');
    }
    
    const credentials = {
      access_token: '[MASKED]',
      instagram_business_account: 'iba_' + Math.floor(Math.random() * 10000),
      username: '@empresa' + Math.floor(Math.random() * 100)
    };
    
    res.locals.responseData = {
      provider: 'instagram',
      account_id,
      oauth_completed: true,
      state,
      instagram_business_account: credentials.instagram_business_account,
      username: credentials.username
    };
    
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;