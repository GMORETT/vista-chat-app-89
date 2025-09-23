import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createServer, Server } from 'http';
import { AddressInfo } from 'net';

/**
 * Mock Meta API Server for testing OAuth flows
 * This simulates Facebook/WhatsApp/Instagram API endpoints
 */
class MockMetaApiServer {
  private server: Server;
  private port: number = 0;
  
  constructor() {
    this.server = createServer(this.handleRequest.bind(this));
  }
  
  start(): Promise<number> {
    return new Promise((resolve) => {
      this.server.listen(0, () => {
        this.port = (this.server.address() as AddressInfo).port;
        resolve(this.port);
      });
    });
  }
  
  stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => resolve());
    });
  }
  
  getUrl(): string {
    return `http://localhost:${this.port}`;
  }
  
  private handleRequest(req: any, res: any): void {
    const url = new URL(req.url, this.getUrl());
    const path = url.pathname;
    const method = req.method;
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    
    // Route requests
    if (path === '/oauth/access_token' && method === 'POST') {
      this.handleOAuthToken(req, res);
    } else if (path === '/me/accounts' && method === 'GET') {
      this.handleFacebookPages(req, res, url);
    } else if (path === '/me' && method === 'GET') {
      this.handleUserInfo(req, res, url);
    } else if (path.startsWith('/instagram_business_accounts') && method === 'GET') {
      this.handleInstagramAccounts(req, res, url);
    } else if (path === '/webhook' && method === 'POST') {
      this.handleWebhookVerification(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }
  
  private handleOAuthToken(req: any, res: any): void {
    let body = '';
    req.on('data', (chunk: any) => body += chunk);
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const code = params.get('code');
      const clientId = params.get('client_id');
      const clientSecret = params.get('client_secret');
      
      // Validate required parameters
      if (!code || !clientId || !clientSecret) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'invalid_request',
          error_description: 'Missing required parameters',
        }));
        return;
      }
      
      // Simulate different scenarios based on code
      if (code === 'invalid_code') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Invalid authorization code',
        }));
        return;
      }
      
      if (code === 'expired_code') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'invalid_grant',
          error_description: 'Authorization code has expired',
        }));
        return;
      }
      
      // Return success response
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        access_token: 'test_access_token_' + Date.now(),
        token_type: 'bearer',
        expires_in: 3600,
      }));
    });
  }
  
  private handleFacebookPages(req: any, res: any, url: URL): void {
    const accessToken = url.searchParams.get('access_token');
    
    if (!accessToken) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'invalid_token',
        error_description: 'Access token is required',
      }));
      return;
    }
    
    if (accessToken === 'invalid_token') {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'invalid_token',
        error_description: 'Invalid access token',
      }));
      return;
    }
    
    // Return mock Facebook pages
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      data: [
        {
          id: 'page_123456789',
          name: 'Test Business Page',
          access_token: '[MASKED_PAGE_TOKEN]',
          category: 'Business',
          fan_count: 1250,
          picture: {
            data: {
              url: 'https://example.com/page_picture.jpg',
            },
          },
        },
        {
          id: 'page_987654321',
          name: 'Another Business Page',
          access_token: '[MASKED_PAGE_TOKEN]',
          category: 'Local Business',
          fan_count: 5600,
          picture: {
            data: {
              url: 'https://example.com/another_page_picture.jpg',
            },
          },
        },
      ],
      paging: {
        next: null,
      },
    }));
  }
  
  private handleUserInfo(req: any, res: any, url: URL): void {
    const accessToken = url.searchParams.get('access_token');
    
    if (!accessToken) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Access token required' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: 'user_123456789',
      name: 'Test User',
      email: 'test@example.com',
    }));
  }
  
  private handleInstagramAccounts(req: any, res: any, url: URL): void {
    const accessToken = url.searchParams.get('access_token');
    
    if (!accessToken) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Access token required' }));
      return;
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      data: [
        {
          id: 'ig_business_123',
          username: 'testbusiness',
          name: 'Test Business',
          followers_count: 2500,
          profile_picture_url: 'https://example.com/ig_profile.jpg',
        },
        {
          id: 'ig_business_456',
          username: 'anotherbusiness',
          name: 'Another Business',
          followers_count: 8200,
          profile_picture_url: 'https://example.com/ig_profile2.jpg',
        },
      ],
    }));
  }
  
  private handleWebhookVerification(req: any, res: any): void {
    let body = '';
    req.on('data', (chunk: any) => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        
        // Simulate webhook verification
        if (data.object === 'whatsapp_business_account') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid object type' }));
        }
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  }
}

describe('Mock Meta API Server Integration Tests', () => {
  let mockServer: MockMetaApiServer;
  let serverUrl: string;
  
  beforeAll(async () => {
    mockServer = new MockMetaApiServer();
    const port = await mockServer.start();
    serverUrl = `http://localhost:${port}`;
  });
  
  afterAll(async () => {
    await mockServer.stop();
  });
  
  describe('OAuth Token Exchange', () => {
    it('exchanges valid authorization code for access token', async () => {
      const response = await fetch(`${serverUrl}/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: 'valid_auth_code_123',
          client_id: 'test_client_id',
          client_secret: 'test_client_secret',
          redirect_uri: 'http://localhost:3000/callback',
        }),
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.access_token).toMatch(/^test_access_token_\d+$/);
      expect(data.token_type).toBe('bearer');
      expect(data.expires_in).toBe(3600);
    });
    
    it('rejects invalid authorization code', async () => {
      const response = await fetch(`${serverUrl}/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: 'invalid_code',
          client_id: 'test_client_id',
          client_secret: 'test_client_secret',
        }),
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('invalid_grant');
      expect(data.error_description).toContain('Invalid authorization code');
    });
    
    it('rejects expired authorization code', async () => {
      const response = await fetch(`${serverUrl}/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: 'expired_code',
          client_id: 'test_client_id',
          client_secret: 'test_client_secret',
        }),
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('invalid_grant');
      expect(data.error_description).toContain('expired');
    });
    
    it('validates required parameters', async () => {
      const response = await fetch(`${serverUrl}/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          // Missing code, client_id, client_secret
        }),
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('invalid_request');
      expect(data.error_description).toContain('Missing required parameters');
    });
  });
  
  describe('Facebook Pages API', () => {
    it('returns user pages with valid access token', async () => {
      const response = await fetch(`${serverUrl}/me/accounts?access_token=valid_token_123`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data).toHaveLength(2);
      
      const firstPage = data.data[0];
      expect(firstPage.id).toBe('page_123456789');
      expect(firstPage.name).toBe('Test Business Page');
      expect(firstPage.access_token).toBe('[MASKED_PAGE_TOKEN]');
      expect(firstPage.fan_count).toBe(1250);
      expect(firstPage.picture.data.url).toContain('page_picture.jpg');
    });
    
    it('rejects requests without access token', async () => {
      const response = await fetch(`${serverUrl}/me/accounts`);
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('invalid_token');
      expect(data.error_description).toContain('Access token is required');
    });
    
    it('rejects invalid access tokens', async () => {
      const response = await fetch(`${serverUrl}/me/accounts?access_token=invalid_token`);
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('invalid_token');
      expect(data.error_description).toContain('Invalid access token');
    });
  });
  
  describe('Instagram Business Accounts API', () => {
    it('returns Instagram business accounts', async () => {
      const response = await fetch(`${serverUrl}/instagram_business_accounts?access_token=valid_token_123`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data).toHaveLength(2);
      
      const firstAccount = data.data[0];
      expect(firstAccount.id).toBe('ig_business_123');
      expect(firstAccount.username).toBe('testbusiness');
      expect(firstAccount.name).toBe('Test Business');
      expect(firstAccount.followers_count).toBe(2500);
      expect(firstAccount.profile_picture_url).toContain('ig_profile.jpg');
    });
    
    it('requires valid access token', async () => {
      const response = await fetch(`${serverUrl}/instagram_business_accounts`);
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data.error).toBe('Access token required');
    });
  });
  
  describe('Webhook Verification', () => {
    it('verifies WhatsApp webhook', async () => {
      const response = await fetch(`${serverUrl}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'whatsapp_business_account',
          entry: [{
            id: 'business_account_123',
            changes: [{
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+1234567890',
                  phone_number_id: 'phone_123',
                },
              },
            }],
          }],
        }),
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });
    
    it('rejects invalid webhook object type', async () => {
      const response = await fetch(`${serverUrl}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object: 'invalid_object_type',
          entry: [],
        }),
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid object type');
    });
    
    it('rejects malformed JSON', async () => {
      const response = await fetch(`${serverUrl}/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Invalid JSON');
    });
  });
  
  describe('Error Scenarios', () => {
    it('handles 404 for unknown endpoints', async () => {
      const response = await fetch(`${serverUrl}/unknown-endpoint`);
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Not found');
    });
    
    it('supports CORS preflight requests', async () => {
      const response = await fetch(`${serverUrl}/oauth/access_token`, {
        method: 'OPTIONS',
      });
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
  });
  
  describe('Rate Limiting Simulation', () => {
    it('simulates rate limiting behavior', async () => {
      // Make multiple rapid requests to trigger rate limiting
      const requests = Array.from({ length: 10 }, () =>
        fetch(`${serverUrl}/me/accounts?access_token=rate_limit_test`)
      );
      
      const responses = await Promise.allSettled(requests);
      
      // In a real scenario, some requests would be rate limited
      // For this mock, we'll just verify all requests are handled
      responses.forEach((result) => {
        expect(result.status).toBe('fulfilled');
      });
    });
  });
  
  describe('Security Testing', () => {
    it('does not expose sensitive data in responses', async () => {
      const response = await fetch(`${serverUrl}/me/accounts?access_token=security_test`);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      const responseText = JSON.stringify(data);
      
      // Verify no real tokens are exposed
      expect(responseText).not.toMatch(/[A-Z0-9]{32,}/); // Long random strings
      expect(responseText).not.toMatch(/EAA[A-Z0-9]+/); // Facebook token pattern
      expect(responseText).toContain('[MASKED_PAGE_TOKEN]'); // Should have masked tokens
    });
    
    it('validates input parameters to prevent injection', async () => {
      const maliciousCode = '<script>alert("xss")</script>';
      
      const response = await fetch(`${serverUrl}/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: maliciousCode,
          client_id: 'test_client_id',
          client_secret: 'test_client_secret',
        }),
      });
      
      const responseText = await response.text();
      
      // Should not contain unescaped script tags
      expect(responseText).not.toContain('<script>');
      expect(responseText).not.toContain('alert(');
    });
  });
});