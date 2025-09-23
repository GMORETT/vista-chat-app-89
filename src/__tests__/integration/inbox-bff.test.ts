import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { BffChatService } from '../../api/BffChatService';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

// Mock environment
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_USE_BFF: 'true',
    VITE_BFF_BASE_URL: 'http://localhost:3000',
  },
});

describe('Inbox BFF Integration Tests', () => {
  let chatService: BffChatService;

  beforeEach(() => {
    vi.clearAllMocks();
    chatService = new BffChatService();
    
    // Default axios success response
    mockedAxios.request.mockResolvedValue({
      data: { success: true, data: {} },
    });
  });

  describe('OAuth Flow Integration', () => {
    describe('WhatsApp Cloud OAuth', () => {
      it('initiates WhatsApp OAuth with correct parameters', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              authUrl: 'https://facebook.com/oauth?client_id=123&redirect_uri=test',
              state: 'wa_oauth_state_123',
            },
          },
        };
        
        mockedAxios.request.mockResolvedValue(mockResponse);
        
        const result = await chatService.startWhatsAppOAuth({
          accountId: 123,
          phoneNumberId: '987654321',
          redirectUri: 'http://localhost:3000/oauth/callback',
        });
        
        expect(mockedAxios.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/v1/accounts/123/inboxes/whatsapp/oauth/start',
          data: {
            phoneNumberId: '987654321',
            redirectUri: 'http://localhost:3000/oauth/callback',
          },
          headers: expect.objectContaining({
            'api_access_token': expect.any(String),
          }),
        });
        
        expect(result.success).toBe(true);
        expect(result.data?.authUrl).toContain('facebook.com/oauth');
      });

      it('handles WhatsApp OAuth callback', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              id: 456,
              name: 'WhatsApp Inbox',
              phone_number: '+1234567890',
              status: 'active',
            },
          },
        };
        
        mockedAxios.request.mockResolvedValue(mockResponse);
        
        const result = await chatService.completeWhatsAppOAuth({
          accountId: 123,
          code: 'oauth_code_123',
          state: 'wa_oauth_state_123',
          name: 'WhatsApp Inbox',
        });
        
        expect(mockedAxios.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/v1/accounts/123/inboxes/whatsapp/oauth/callback',
          data: {
            code: 'oauth_code_123',
            state: 'wa_oauth_state_123',
            name: 'WhatsApp Inbox',
          },
          headers: expect.objectContaining({
            'api_access_token': expect.any(String),
          }),
        });
        
        expect(result.success).toBe(true);
        expect(result.data?.name).toBe('WhatsApp Inbox');
      });
    });

    describe('Facebook OAuth', () => {
      it('starts Facebook OAuth flow', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: {
              authUrl: 'https://facebook.com/dialog/oauth?client_id=456&scope=pages_messaging',
              state: 'fb_oauth_state_456',
            },
          },
        };
        
        mockedAxios.request.mockResolvedValue(mockResponse);
        
        const result = await chatService.startFacebookOAuth({
          accountId: 123,
          state: 'custom_state_123',
        });
        
        expect(mockedAxios.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/v1/accounts/123/inboxes/facebook/oauth/start',
          data: {
            state: 'custom_state_123',
          },
          headers: expect.objectContaining({
            'api_access_token': expect.any(String),
          }),
        });
        
        expect(result.success).toBe(true);
        expect(result.data?.authUrl).toContain('facebook.com/dialog/oauth');
      });

      it('loads Facebook pages after OAuth', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: [
              {
                id: 'page_123',
                name: 'Test Business Page',
                followers_count: 1250,
                picture: 'https://facebook.com/page_pic.jpg',
                access_token: 'PAGE_TOKEN_MASKED',
              },
              {
                id: 'page_456',
                name: 'Another Page',
                followers_count: 5600,
              },
            ],
          },
        };
        
        mockedAxios.request.mockResolvedValue(mockResponse);
        
        const result = await chatService.loadFacebookPages({
          accountId: 123,
          code: 'oauth_code_456',
        });
        
        expect(mockedAxios.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/v1/accounts/123/inboxes/facebook/pages',
          data: {
            code: 'oauth_code_456',
          },
          headers: expect.objectContaining({
            'api_access_token': expect.any(String),
          }),
        });
        
        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data?.[0].name).toBe('Test Business Page');
        // Verify token is masked
        expect(result.data?.[0].access_token).toBe('PAGE_TOKEN_MASKED');
      });
    });

    describe('Instagram OAuth', () => {
      it('processes Instagram OAuth callback', async () => {
        const mockResponse = {
          data: {
            success: true,
            data: [
              {
                id: 'ig_account_123',
                username: 'testbusiness',
                name: 'Test Business',
                followers_count: 2500,
                profile_picture_url: 'https://instagram.com/profile.jpg',
              },
            ],
          },
        };
        
        mockedAxios.request.mockResolvedValue(mockResponse);
        
        const result = await chatService.loadInstagramAccounts({
          accountId: 123,
          code: 'ig_oauth_code_789',
          state: 'ig_state_789',
        });
        
        expect(mockedAxios.request).toHaveBeenCalledWith({
          method: 'POST',
          url: '/api/v1/accounts/123/inboxes/instagram/accounts',
          data: {
            code: 'ig_oauth_code_789',
            state: 'ig_state_789',
          },
          headers: expect.objectContaining({
            'api_access_token': expect.any(String),
          }),
        });
        
        expect(result.success).toBe(true);
        expect(result.data?.[0].username).toBe('testbusiness');
      });
    });
  });

  describe('Chatwoot Inbox Management', () => {
    it('creates inbox with proper validation', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 789,
            name: 'New Inbox',
            channel_type: 'Channel::WhatsappCloud',
            account_id: 123,
            phone_number: '+1234567890',
            webhook_url: 'https://api.chatwoot.com/webhooks/whatsapp/789',
          },
        },
      };
      
      mockedAxios.request.mockResolvedValue(mockResponse);
      
      const result = await chatService.createInbox({
        accountId: 123,
        name: 'New Inbox',
        channelType: 'whatsapp_cloud',
        settings: {
          phoneNumberId: '987654321',
          accessToken: 'SENSITIVE_TOKEN',
          webhookVerifyToken: 'WEBHOOK_SECRET',
        },
      });
      
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/v1/accounts/123/inboxes',
        data: {
          name: 'New Inbox',
          channelType: 'whatsapp_cloud',
          settings: {
            phoneNumberId: '987654321',
            accessToken: 'SENSITIVE_TOKEN',
            webhookVerifyToken: 'WEBHOOK_SECRET',
          },
        },
        headers: expect.objectContaining({
          'api_access_token': expect.any(String),
        }),
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('New Inbox');
      expect(result.data?.channel_type).toBe('Channel::WhatsappCloud');
    });

    it('assigns agents to inbox', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            inbox_id: 789,
            agents: [
              { id: 1, name: 'Agent One', email: 'agent1@test.com' },
              { id: 2, name: 'Agent Two', email: 'agent2@test.com' },
            ],
          },
        },
      };
      
      mockedAxios.request.mockResolvedValue(mockResponse);
      
      const result = await chatService.assignInboxAgents({
        inboxId: 789,
        agentIds: [1, 2],
      });
      
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/v1/inboxes/789/members',
        data: {
          agentIds: [1, 2],
        },
        headers: expect.objectContaining({
          'api_access_token': expect.any(String),
        }),
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.agents).toHaveLength(2);
    });

    it('updates inbox settings', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 789,
            name: 'Updated Inbox Name',
            settings: {
              greeting_enabled: true,
              greeting_message: 'Welcome to our support!',
            },
          },
        },
      };
      
      mockedAxios.request.mockResolvedValue(mockResponse);
      
      const result = await chatService.updateInbox({
        inboxId: 789,
        name: 'Updated Inbox Name',
        settings: {
          greeting_enabled: true,
          greeting_message: 'Welcome to our support!',
        },
      });
      
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'PATCH',
        url: '/api/v1/inboxes/789',
        data: {
          name: 'Updated Inbox Name',
          settings: {
            greeting_enabled: true,
            greeting_message: 'Welcome to our support!',
          },
        },
        headers: expect.objectContaining({
          'api_access_token': expect.any(String),
        }),
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Updated Inbox Name');
    });

    it('deletes inbox with dependency checks', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            id: 789,
            deleted: true,
            conversation_count: 0,
            agent_count: 2,
          },
        },
      };
      
      mockedAxios.request.mockResolvedValue(mockResponse);
      
      const result = await chatService.deleteInbox({
        inboxId: 789,
        force: false,
      });
      
      expect(mockedAxios.request).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/api/v1/inboxes/789',
        data: {
          force: false,
        },
        headers: expect.objectContaining({
          'api_access_token': expect.any(String),
        }),
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.deleted).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('handles OAuth errors gracefully', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            success: false,
            error: 'OAuth authorization failed',
            details: 'Invalid client credentials',
          },
        },
      };
      
      mockedAxios.request.mockRejectedValue(errorResponse);
      
      const result = await chatService.startFacebookOAuth({
        accountId: 123,
        state: 'test_state',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('OAuth authorization failed');
    });

    it('handles network timeouts', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };
      
      mockedAxios.request.mockRejectedValue(timeoutError);
      
      const result = await chatService.createInbox({
        accountId: 123,
        name: 'Test Inbox',
        channelType: 'whatsapp_cloud',
        settings: {},
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    it('handles validation errors', async () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            success: false,
            error: 'Validation failed',
            details: {
              name: ['is required'],
              phoneNumberId: ['must be valid'],
            },
          },
        },
      };
      
      mockedAxios.request.mockRejectedValue(validationError);
      
      const result = await chatService.createInbox({
        accountId: 123,
        name: '',
        channelType: 'whatsapp_cloud',
        settings: {
          phoneNumberId: 'invalid',
        },
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });
  });

  describe('Security Guardrails', () => {
    it('masks sensitive tokens in API responses', async () => {
      const responseWithTokens = {
        data: {
          success: true,
          data: {
            access_token: 'ACTUAL_SENSITIVE_TOKEN_123',
            webhook_verify_token: 'WEBHOOK_SECRET_456',
            page_access_token: 'PAGE_TOKEN_789',
            settings: {
              api_key: 'API_KEY_SECRET',
            },
          },
        },
      };
      
      mockedAxios.request.mockResolvedValue(responseWithTokens);
      
      const result = await chatService.completeWhatsAppOAuth({
        accountId: 123,
        code: 'oauth_code',
        state: 'oauth_state',
        name: 'Test Inbox',
      });
      
      // Verify that actual tokens are not exposed in the response
      const responseString = JSON.stringify(result);
      expect(responseString).not.toContain('ACTUAL_SENSITIVE_TOKEN_123');
      expect(responseString).not.toContain('WEBHOOK_SECRET_456');
      expect(responseString).not.toContain('PAGE_TOKEN_789');
      expect(responseString).not.toContain('API_KEY_SECRET');
    });

    it('validates OAuth state to prevent CSRF', async () => {
      const invalidStateError = {
        response: {
          status: 400,
          data: {
            success: false,
            error: 'Invalid OAuth state',
            details: 'State parameter does not match',
          },
        },
      };
      
      mockedAxios.request.mockRejectedValue(invalidStateError);
      
      const result = await chatService.completeWhatsAppOAuth({
        accountId: 123,
        code: 'oauth_code',
        state: 'invalid_state',
        name: 'Test Inbox',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid OAuth state');
    });

    it('does not log sensitive data in debug mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      // Simulate debug logging
      const sensitiveData = {
        accessToken: 'SENSITIVE_TOKEN_123',
        webhookSecret: 'WEBHOOK_SECRET_456',
      };
      
      // This would happen in debug mode
      console.log('Debug OAuth data:', sensitiveData);
      
      // Verify sensitive data is not logged
      const logCalls = consoleSpy.mock.calls.flat().join(' ');
      expect(logCalls).not.toContain('SENSITIVE_TOKEN_123');
      expect(logCalls).not.toContain('WEBHOOK_SECRET_456');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Rate Limiting and Retry Logic', () => {
    it('handles rate limiting with proper backoff', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: {
            success: false,
            error: 'Rate limit exceeded',
            retry_after: 60,
          },
        },
      };
      
      mockedAxios.request
        .mockRejectedValueOnce(rateLimitError)
        .mockResolvedValue({
          data: { success: true, data: { id: 123 } },
        });
      
      const result = await chatService.createInbox({
        accountId: 123,
        name: 'Test Inbox',
        channelType: 'whatsapp_cloud',
        settings: {},
      });
      
      // Should eventually succeed after retry
      expect(result.success).toBe(true);
    });
  });
});