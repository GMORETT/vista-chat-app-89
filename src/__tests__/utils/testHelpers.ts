import { vi } from 'vitest';

/**
 * Mock OAuth flow simulation utilities for testing
 */
export const createMockOAuthFlow = () => {
  const mockState = Math.random().toString(36).substring(7);
  
  return {
    state: mockState,
    
    simulateWhatsAppOAuth: () => ({
      authUrl: `https://facebook.com/oauth?client_id=test&state=${mockState}`,
      state: mockState,
    }),
    
    simulateFacebookOAuth: () => ({
      authUrl: `https://facebook.com/dialog/oauth?client_id=test&state=${mockState}`,
      state: mockState,
    }),
    
    simulateInstagramOAuth: () => ({
      authUrl: `https://api.instagram.com/oauth/authorize?client_id=test&state=${mockState}`,
      state: mockState,
    }),
    
    simulateOAuthCallback: (type: 'success' | 'error', data?: any) => {
      const baseMessage = {
        type: type === 'success' ? 'OAUTH_SUCCESS' : 'OAUTH_ERROR',
        state: mockState,
      };
      
      if (type === 'success') {
        return {
          ...baseMessage,
          code: 'oauth_code_' + Math.random().toString(36).substring(7),
          ...data,
        };
      } else {
        return {
          ...baseMessage,
          error: 'access_denied',
          error_description: 'User cancelled the dialog',
          ...data,
        };
      }
    },
  };
};

/**
 * Mock API responses with realistic data structures
 */
export const createMockApiResponses = () => ({
  whatsappPages: () => ({
    success: true,
    data: [
      {
        id: 'phone_123456789',
        name: '+1 (555) 123-4567',
        verified: true,
        status: 'CONNECTED',
      },
    ],
  }),
  
  facebookPages: () => ({
    success: true,
    data: [
      {
        id: 'page_123',
        name: 'Test Business Page',
        followers_count: 1250,
        picture: 'https://example.com/page_pic.jpg',
        access_token: '[MASKED_PAGE_TOKEN]',
      },
      {
        id: 'page_456',
        name: 'Another Business Page',
        followers_count: 5600,
        picture: 'https://example.com/page_pic2.jpg',
        access_token: '[MASKED_PAGE_TOKEN]',
      },
    ],
  }),
  
  instagramAccounts: () => ({
    success: true,
    data: [
      {
        id: 'ig_123',
        username: 'testbusiness',
        name: 'Test Business',
        followers_count: 2500,
        profile_picture_url: 'https://example.com/ig_profile.jpg',
      },
      {
        id: 'ig_456',
        username: 'anotherbusiness',
        name: 'Another Business',
        followers_count: 8200,
        profile_picture_url: 'https://example.com/ig_profile2.jpg',
      },
    ],
  }),
  
  agents: () => ({
    success: true,
    data: [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@test.com',
        role: 'agent',
        status: 'active',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@test.com',
        role: 'agent',
        status: 'active',
      },
      {
        id: 3,
        name: 'Bob Wilson',
        email: 'bob@test.com',
        role: 'supervisor',
        status: 'active',
      },
    ],
  }),
  
  inboxCreated: (type: 'whatsapp' | 'facebook' | 'instagram') => ({
    success: true,
    data: {
      id: Math.floor(Math.random() * 1000) + 100,
      name: `Test ${type.charAt(0).toUpperCase() + type.slice(1)} Inbox`,
      channel_type: `Channel::${type.charAt(0).toUpperCase() + type.slice(1)}`,
      account_id: 123,
      status: 'active',
      webhook_url: `https://api.chatwoot.com/webhooks/${type}/${Math.random().toString(36).substring(7)}`,
      created_at: new Date().toISOString(),
    },
  }),
  
  error: (message: string, details?: any) => ({
    success: false,
    error: message,
    details,
  }),
});

/**
 * Security testing utilities
 */
export const securityHelpers = {
  /**
   * Check if a string contains patterns that look like real tokens
   */
  containsSensitiveData: (text: string): boolean => {
    const sensitivePatterns = [
      /[A-Z0-9]{32,}/, // Long alphanumeric sequences
      /EAA[A-Z0-9]+/, // Facebook tokens
      /ya29\.[A-Za-z0-9\-_]+/, // Google tokens
      /sk_live_[A-Za-z0-9]+/, // Stripe live secret keys
      /pk_live_[A-Za-z0-9]+/, // Stripe live public keys
      /xoxb-[A-Za-z0-9\-]+/, // Slack bot tokens
      /ghp_[A-Za-z0-9]+/, // GitHub personal access tokens
    ];
    
    return sensitivePatterns.some(pattern => pattern.test(text));
  },
  
  /**
   * Sanitize error messages to remove sensitive data
   */
  sanitizeError: (error: string): string => {
    return error
      .replace(/[A-Z0-9]{20,}/g, '[MASKED]')
      .replace(/token[:\s]+[A-Za-z0-9\-_]+/gi, 'token: [MASKED]')
      .replace(/key[:\s]+[A-Za-z0-9\-_]+/gi, 'key: [MASKED]')
      .replace(/secret[:\s]+[A-Za-z0-9\-_]+/gi, 'secret: [MASKED]');
  },
  
  /**
   * Validate that mock data doesn't contain real credentials
   */
  validateMockData: (data: any): boolean => {
    const dataString = JSON.stringify(data);
    return !securityHelpers.containsSensitiveData(dataString);
  },
  
  /**
   * Create safe test credentials that are obviously fake
   */
  createTestCredentials: () => ({
    accessToken: 'test_access_token_' + Math.random().toString(36).substring(7),
    clientSecret: 'test_client_secret_' + Math.random().toString(36).substring(7),
    webhookSecret: 'test_webhook_secret_' + Math.random().toString(36).substring(7),
    phoneNumberId: 'test_phone_' + Math.floor(Math.random() * 1000000),
    appId: 'test_app_' + Math.floor(Math.random() * 1000000),
  }),
};

/**
 * Performance testing helpers
 */
export const performanceHelpers = {
  /**
   * Measure component render time
   */
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const start = performance.now();
    renderFn();
    const end = performance.now();
    return end - start;
  },
  
  /**
   * Simulate slow network for testing loading states
   */
  createSlowNetworkMock: (delay: number = 2000) => {
    return vi.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, delay))
    );
  },
  
  /**
   * Create a mock that fails after several attempts
   */
  createFlakyMock: (failureCount: number = 2) => {
    let attempts = 0;
    return vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts <= failureCount) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({ success: true, data: {} });
    });
  },
};

/**
 * Wizard testing utilities
 */
export const wizardHelpers = {
  /**
   * Navigate through wizard steps
   */
  completeWizardStep: async (
    container: HTMLElement,
    stepData: Record<string, any>
  ) => {
    for (const [field, value] of Object.entries(stepData)) {
      const input = container.querySelector(`[name="${field}"], [placeholder*="${field}"]`) as HTMLInputElement;
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    
    const nextButton = container.querySelector('button[type="submit"], button:contains("Next")') as HTMLButtonElement;
    if (nextButton) {
      nextButton.click();
    }
  },
  
  /**
   * Simulate complete inbox creation flow
   */
  simulateCompleteInboxFlow: async (
    type: 'whatsapp' | 'facebook' | 'instagram',
    container: HTMLElement
  ) => {
    const steps = {
      whatsapp: [
        { name: 'Test WhatsApp Inbox' },
        { 
          phoneNumberId: '123456789',
          accessToken: 'test_token_123',
          webhookVerifyToken: 'test_verify_123',
        },
      ],
      facebook: [
        { name: 'Test Facebook Inbox' },
        // OAuth simulation would happen here
      ],
      instagram: [
        { name: 'Test Instagram Inbox' },
        // OAuth simulation would happen here
      ],
    };
    
    for (const stepData of steps[type]) {
      await wizardHelpers.completeWizardStep(container, stepData);
    }
  },
};

/**
 * Network request mocking helpers
 */
export const networkHelpers = {
  /**
   * Create comprehensive network mock setup
   */
  setupNetworkMocks: () => {
    const mocks = createMockApiResponses();
    
    return {
      mockSuccessFlow: () => {
        vi.mocked(global.fetch).mockImplementation(async (url) => {
          if (url.toString().includes('/oauth/start')) {
            return new Response(JSON.stringify(mocks.whatsappPages()));
          }
          if (url.toString().includes('/pages')) {
            return new Response(JSON.stringify(mocks.facebookPages()));
          }
          if (url.toString().includes('/accounts')) {
            return new Response(JSON.stringify(mocks.instagramAccounts()));
          }
          if (url.toString().includes('/agents')) {
            return new Response(JSON.stringify(mocks.agents()));
          }
          return new Response(JSON.stringify(mocks.error('Unknown endpoint')));
        });
      },
      
      mockErrorFlow: (errorType: string) => {
        vi.mocked(global.fetch).mockRejectedValue(new Error(errorType));
      },
      
      mockRateLimitFlow: () => {
        let callCount = 0;
        vi.mocked(global.fetch).mockImplementation(async () => {
          callCount++;
          if (callCount <= 2) {
            const response = new Response(JSON.stringify(mocks.error('Rate limit exceeded')), {
              status: 429,
              headers: { 'Retry-After': '60' },
            });
            throw response;
          }
          return new Response(JSON.stringify(mocks.facebookPages()));
        });
      },
    };
  },
};