const express = require('express');
const { createAuditWrapper } = require('../auditMiddleware');
const router = express.Router();

// In-memory storage for PKCE code verifiers (in production, use Redis with TTL)
const pkceStorage = new Map();

// Auto-cleanup expired PKCE entries
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pkceStorage.entries()) {
    if (value.expires_at < now) {
      pkceStorage.delete(key);
    }
  }
}, 60000); // Cleanup every minute

// Validates PKCE code challenge format
const validateCodeChallenge = (challenge) => {
  return /^[A-Za-z0-9\-._~]{43,128}$/.test(challenge);
};

// Simulate OAuth initiation for different providers with PKCE
const simulateOAuthStart = async (provider, config) => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
  
  // Validate required PKCE parameters
  if (!config.code_challenge || !config.code_challenge_method) {
    throw new Error('PKCE parameters (code_challenge, code_challenge_method) are required');
  }
  
  if (config.code_challenge_method !== 'S256') {
    throw new Error('Only S256 code_challenge_method is supported');
  }
  
  if (!validateCodeChallenge(config.code_challenge)) {
    throw new Error('Invalid code_challenge format');
  }
  
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
  
  const state = `${provider}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  
  // Store code_challenge for later verification (expires in 10 minutes)
  pkceStorage.set(state, {
    code_challenge: config.code_challenge,
    code_challenge_method: config.code_challenge_method,
    account_id: config.account_id,
    expires_at: Date.now() + (10 * 60 * 1000)
  });
  
  return {
    auth_url: `https://oauth.${provider}.com/authorize?client_id=${config.client_id}&redirect_uri=${config.redirect_uri}&state=${state}&code_challenge=${config.code_challenge}&code_challenge_method=${config.code_challenge_method}`,
    state,
    expires_in: 3600
  };
};

// WhatsApp OAuth endpoints with audit logging
router.post('/whatsapp/start', createAuditWrapper('inbox', 'oauth_start'), async (req, res) => {
  try {
    const { client_id, redirect_uri, account_id, code_challenge, code_challenge_method } = req.body;
    
    const result = await simulateOAuthStart('whatsapp', { 
      client_id, 
      redirect_uri, 
      account_id,
      code_challenge,
      code_challenge_method
    });
    
    // Store for audit (without sensitive data)
    res.locals.responseData = {
      provider: 'whatsapp',
      account_id,
      oauth_initiated: true,
      state: result.state,
      pkce_used: true
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/whatsapp/callback', createAuditWrapper('inbox', 'oauth_complete'), async (req, res) => {
  try {
    const { code, state, account_id, code_verifier } = req.body;
    
    // Validate required PKCE parameters
    if (!code_verifier) {
      return res.status(400).json({ error: 'code_verifier is required for PKCE flow' });
    }
    
    // Retrieve stored PKCE challenge
    const storedPKCE = pkceStorage.get(state);
    if (!storedPKCE) {
      return res.status(400).json({ error: 'Invalid or expired state parameter' });
    }
    
    // Validate account_id matches
    if (storedPKCE.account_id !== account_id) {
      return res.status(400).json({ error: 'Account ID mismatch' });
    }
    
    // Verify PKCE challenge
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(code_verifier).digest();
    const computedChallenge = hash.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    if (computedChallenge !== storedPKCE.code_challenge) {
      // Clean up storage
      pkceStorage.delete(state);
      return res.status(400).json({ error: 'PKCE verification failed' });
    }
    
    // Clean up storage after successful verification
    pkceStorage.delete(state);
    
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
      phone_number: credentials.phone_number,
      pkce_verified: true
    };
    
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Facebook OAuth endpoints
router.post('/facebook/start', createAuditWrapper('inbox', 'oauth_start'), async (req, res) => {
  try {
    const { client_id, redirect_uri, account_id, code_challenge, code_challenge_method } = req.body;
    
    const result = await simulateOAuthStart('facebook', { 
      client_id, 
      redirect_uri, 
      account_id,
      code_challenge,
      code_challenge_method
    });
    
    res.locals.responseData = {
      provider: 'facebook',
      account_id,
      oauth_initiated: true,
      state: result.state,
      pkce_used: true
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/facebook/callback', createAuditWrapper('inbox', 'oauth_complete'), async (req, res) => {
  try {
    const { code, state, account_id, code_verifier } = req.body;
    
    // Validate required PKCE parameters
    if (!code_verifier) {
      return res.status(400).json({ error: 'code_verifier is required for PKCE flow' });
    }
    
    // Retrieve stored PKCE challenge
    const storedPKCE = pkceStorage.get(state);
    if (!storedPKCE) {
      return res.status(400).json({ error: 'Invalid or expired state parameter' });
    }
    
    // Validate account_id matches
    if (storedPKCE.account_id !== account_id) {
      return res.status(400).json({ error: 'Account ID mismatch' });
    }
    
    // Verify PKCE challenge
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(code_verifier).digest();
    const computedChallenge = hash.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    if (computedChallenge !== storedPKCE.code_challenge) {
      pkceStorage.delete(state);
      return res.status(400).json({ error: 'PKCE verification failed' });
    }
    
    // Clean up storage after successful verification
    pkceStorage.delete(state);
    
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
      page_name: credentials.page_name,
      pkce_verified: true
    };
    
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Instagram OAuth endpoints  
router.post('/instagram/start', createAuditWrapper('inbox', 'oauth_start'), async (req, res) => {
  try {
    const { client_id, redirect_uri, account_id, code_challenge, code_challenge_method } = req.body;
    
    const result = await simulateOAuthStart('instagram', { 
      client_id, 
      redirect_uri, 
      account_id,
      code_challenge,
      code_challenge_method
    });
    
    res.locals.responseData = {
      provider: 'instagram',
      account_id,
      oauth_initiated: true,
      state: result.state,
      pkce_used: true
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/instagram/callback', createAuditWrapper('inbox', 'oauth_complete'), async (req, res) => {
  try {
    const { code, state, account_id, code_verifier } = req.body;
    
    // Validate required PKCE parameters
    if (!code_verifier) {
      return res.status(400).json({ error: 'code_verifier is required for PKCE flow' });
    }
    
    // Retrieve stored PKCE challenge
    const storedPKCE = pkceStorage.get(state);
    if (!storedPKCE) {
      return res.status(400).json({ error: 'Invalid or expired state parameter' });
    }
    
    // Validate account_id matches
    if (storedPKCE.account_id !== account_id) {
      return res.status(400).json({ error: 'Account ID mismatch' });
    }
    
    // Verify PKCE challenge
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(code_verifier).digest();
    const computedChallenge = hash.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    if (computedChallenge !== storedPKCE.code_challenge) {
      pkceStorage.delete(state);
      return res.status(400).json({ error: 'PKCE verification failed' });
    }
    
    // Clean up storage after successful verification
    pkceStorage.delete(state);
    
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
      username: credentials.username,
      pkce_verified: true
    };
    
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;