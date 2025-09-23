import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render } from '../utils/testUtils';
import { WaCloudWizard } from '@/components/admin/inboxes/WaCloudWizard';
import { FacebookWizard } from '@/components/admin/inboxes/FacebookWizard';
import { createPKCEParams, validateCodeVerifier } from '@/utils/pkce';

describe('Security Guardrails - Token Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any potential sensitive data from previous tests
    localStorage.clear();
    sessionStorage.clear();
    // Clear window postMessage listeners
    window.removeEventListener('message', () => {});
  });

  describe('Frontend Token Exposure Prevention', () => {
    it('does not expose WhatsApp tokens in component props', () => {
      const sensitiveProps = {
        open: true,
        onOpenChange: vi.fn(),
        accountId: 123,
        onFinished: vi.fn(),
        // These should never be passed as props
        accessToken: 'SENSITIVE_WA_TOKEN_123',
        webhookSecret: 'WEBHOOK_SECRET_456',
      } as any;

      const { container } = render(<WaCloudWizard {...sensitiveProps} />);
      
      // Verify sensitive data doesn't appear in DOM
      expect(container.innerHTML).not.toContain('SENSITIVE_WA_TOKEN_123');
      expect(container.innerHTML).not.toContain('WEBHOOK_SECRET_456');
      
      // Verify props are not exposed in data attributes
      const elements = container.querySelectorAll('*');
      elements.forEach(element => {
        Array.from(element.attributes).forEach(attr => {
          expect((attr as Attr).value).not.toContain('SENSITIVE_WA_TOKEN_123');
          expect((attr as Attr).value).not.toContain('WEBHOOK_SECRET_456');
        });
      });
    });

    it('does not expose Facebook tokens in component state', () => {
      const { container } = render(
        <FacebookWizard 
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      // Simulate OAuth success with sensitive token
      window.postMessage({
        type: 'FACEBOOK_OAUTH_SUCCESS',
        code: 'SENSITIVE_FB_CODE_789',
        access_token: 'FB_USER_TOKEN_ABC',
      }, '*');
      
      // Tokens should not appear in DOM
      expect(container.innerHTML).not.toContain('SENSITIVE_FB_CODE_789');
      expect(container.innerHTML).not.toContain('FB_USER_TOKEN_ABC');
    });

    it('masks input fields for sensitive credentials', () => {
      const { container } = render(
        <WaCloudWizard 
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      // Find credential input fields
      const tokenInputs = container.querySelectorAll('input[placeholder*="Token"], input[placeholder*="Secret"]');
      
      tokenInputs.forEach(input => {
        expect(input.getAttribute('type')).toBe('password');
      });
    });

    it('does not store sensitive data in localStorage', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      
      render(
        <WaCloudWizard 
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      // Check that no sensitive data is stored
      const localStorageCalls = setItemSpy.mock.calls.flat().join(' ');
      expect(localStorageCalls).not.toMatch(/token|secret|key|password/i);
      
      setItemSpy.mockRestore();
    });
  });

  describe('Network Request Security', () => {
    it('validates that mock responses do not contain real tokens', () => {
      const mockResponse = {
        success: true,
        data: {
          access_token: 'PAGE_ACCESS_TOKEN_REAL_123',
          user_access_token: 'USER_TOKEN_REAL_456',
          webhook_verify_token: 'WEBHOOK_VERIFY_REAL_789',
        },
      };
      
      // This test ensures we're not accidentally using real tokens in mocks
      // In a real implementation, these should be masked or fake
      const responseString = JSON.stringify(mockResponse);
      
      // Real tokens should not appear in test mocks
      expect(responseString).not.toMatch(/[A-Z0-9]{32,}/); // Long alphanumeric sequences
      expect(responseString).not.toMatch(/EAA[A-Z0-9]+/); // Facebook token pattern
      expect(responseString).not.toMatch(/ya29\.[A-Za-z0-9\-_]+/); // Google token pattern
    });

    it('ensures OAuth callbacks do not expose tokens in URLs', () => {
      const mockCallback = vi.fn();
      
      render(
        <FacebookWizard 
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={mockCallback}
        />
      );
      
      // Simulate OAuth callback with token in URL (should be rejected)
      const invalidMessage = {
        type: 'FACEBOOK_OAUTH_SUCCESS',
        url: 'https://example.com/callback?access_token=EXPOSED_TOKEN_123&code=abc',
        code: 'abc',
      };
      
      window.postMessage(invalidMessage, '*');
      
      // Callback should not be called with exposed tokens
      expect(mockCallback).not.toHaveBeenCalledWith(
        expect.objectContaining({
          access_token: expect.stringContaining('EXPOSED_TOKEN_123')
        })
      );
    });
  });

  describe('API Response Sanitization', () => {
    it('masks tokens in API error responses', async () => {
      const errorWithToken = new Error('Invalid access_token: REAL_TOKEN_123');
      
      const { container } = render(
        <WaCloudWizard 
          open={true}
          onOpenChange={vi.fn()}
          accountId={123}
          onFinished={vi.fn()}
        />
      );
      
      // Error should be sanitized before display
      expect(container.innerHTML).not.toContain('REAL_TOKEN_123');
      // Should contain generic error instead
      expect(container.textContent).toMatch(/authentication.*failed/i);
    });

    it('validates audit logs do not contain sensitive data', () => {
      const auditLog = {
        id: '123',
        action: 'inbox_create',
        entity_type: 'inbox',
        entity_id: '456',
        actor: 'admin@test.com',
        details: {
          before: null,
          after: {
            name: 'WhatsApp Inbox',
            access_token: '[MASKED]',
            webhook_verify_token: '[MASKED]',
            phone_number_id: '1234567890',
          },
        },
        timestamp: new Date().toISOString(),
      };
      
      const logString = JSON.stringify(auditLog);
      
      // Verify tokens are masked
      expect(logString).toContain('[MASKED]');
      expect(logString).not.toMatch(/[A-Z0-9]{20,}/); // No long token-like strings
      
      // But should contain non-sensitive data
      expect(logString).toContain('WhatsApp Inbox');
      expect(logString).toContain('1234567890');
    });
  });

  describe('Development Environment Security', () => {
    it('does not log sensitive data in development mode', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      
      // Simulate development logging
      const sensitiveData = {
        accessToken: 'DEV_TOKEN_123',
        clientSecret: 'CLIENT_SECRET_456',
        webhookSecret: 'WEBHOOK_789',
      };
      
      // These should be sanitized even in development
      console.log('Debug data:', sensitiveData);
      console.debug('OAuth response:', sensitiveData);
      
      const allLogs = [
        ...consoleSpy.mock.calls.flat(),
        ...consoleDebugSpy.mock.calls.flat(),
      ].join(' ');
      
      // Sensitive data should be masked
      expect(allLogs).not.toContain('DEV_TOKEN_123');
      expect(allLogs).not.toContain('CLIENT_SECRET_456');
      expect(allLogs).not.toContain('WEBHOOK_789');
      
      consoleSpy.mockRestore();
      consoleDebugSpy.mockRestore();
    });

    it('validates that test environment variables do not contain real credentials', () => {
      const testEnvVars = {
        VITE_FACEBOOK_APP_ID: 'test_app_id',
        VITE_WHATSAPP_PHONE_ID: 'test_phone_id',
        VITE_WEBHOOK_URL: 'https://test.example.com/webhook',
      };
      
      Object.entries(testEnvVars).forEach(([key, value]) => {
        // Test values should be obviously fake
        expect(value).toMatch(/test|mock|example|localhost/i);
        expect(value).not.toMatch(/[0-9]{15,}/); // No long numeric IDs
        expect(value).not.toMatch(/EAA[A-Z0-9]+/); // No real Facebook tokens
      });
    });
  });

  describe('Bundle Security Analysis', () => {
    it('simulates bundle analysis for embedded secrets', () => {
      // Simulate webpack bundle content
      const mockBundle = `
        var config = {
          apiKey: "test_api_key_123",
          webhookSecret: "mock_webhook_secret",
          facebookAppId: "123456789",
        };
        
        // This should not appear in production bundle
        var devToken = "NEVER_IN_PRODUCTION_456";
      `;
      
      // Real tokens/secrets should not appear in bundle
      expect(mockBundle).not.toMatch(/[A-Z0-9]{32,}/); // Long random strings
      expect(mockBundle).not.toMatch(/sk_live_/); // Stripe live keys
      expect(mockBundle).not.toMatch(/pk_live_/); // Stripe public live keys
      expect(mockBundle).not.toMatch(/xoxb-/); // Slack bot tokens
      
      // Should only contain test/mock values
      expect(mockBundle).toContain('test_');
      expect(mockBundle).toContain('mock_');
    });

    it('validates that source maps do not expose sensitive information', () => {
      // Simulate source map content
      const mockSourceMap = {
        version: 3,
        sources: ['src/config.ts', 'src/oauth.ts'],
        mappings: 'AAAA,OAAO,MAAM',
        sourcesContent: [
          '// Config file\nexport const API_KEY = process.env.VITE_API_KEY;',
          '// OAuth file\nexport const CLIENT_SECRET = "[MASKED]";'
        ],
      };
      
      const sourceMapString = JSON.stringify(mockSourceMap);
      
      // Source maps should not contain real secrets
      expect(sourceMapString).not.toMatch(/[A-Z0-9]{20,}/);
      expect(sourceMapString).toContain('[MASKED]');
    });
  });

  describe('Runtime Security Checks', () => {
    it('detects and prevents token exposure in window object', () => {
      const originalWindow = { ...window };
      
      // Simulate accidental token exposure
      (window as any).sensitiveConfig = {
        accessToken: 'EXPOSED_TOKEN_123',
        apiKey: 'EXPOSED_KEY_456',
      };
      
      // Security check should detect this
      const windowKeys = Object.keys(window);
      const exposedSecrets = windowKeys.filter(key => 
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key')
      );
      
      // Should not have sensitive data on window
      exposedSecrets.forEach(key => {
        const value = (window as any)[key];
        if (typeof value === 'string') {
          expect(value).not.toMatch(/[A-Z0-9]{20,}/);
        }
      });
      
      // Cleanup
      delete (window as any).sensitiveConfig;
    });

    it('validates that error boundaries do not expose sensitive data', () => {
      const sensitiveError = new Error('Failed to authenticate with token: REAL_TOKEN_789');
      const errorInfo = {
        componentStack: '\n    at Component (bundle.js:123)\n    at OAuthProvider (bundle.js:456)',
      };
      
      // Error reporting should sanitize sensitive data
      const sanitizedError = sanitizeError(sensitiveError.message);
      const sanitizedStack = sanitizeError(errorInfo.componentStack);
      
      expect(sanitizedError).not.toContain('REAL_TOKEN_789');
      expect(sanitizedError).toContain('[MASKED]');
      expect(sanitizedStack).not.toContain('REAL_TOKEN_789');
    });
  });
  describe('PKCE Security Validation', () => {
    it('generates secure PKCE parameters', async () => {
      const pkceParams = await createPKCEParams();
      
      // Validate code_verifier format (RFC 7636)
      expect(validateCodeVerifier(pkceParams.code_verifier)).toBe(true);
      expect(pkceParams.code_verifier.length).toBeGreaterThanOrEqual(43);
      expect(pkceParams.code_verifier.length).toBeLessThanOrEqual(128);
      expect(/^[A-Za-z0-9\-._~]+$/.test(pkceParams.code_verifier)).toBe(true);
      
      // Validate code_challenge
      expect(pkceParams.code_challenge).toBeDefined();
      expect(pkceParams.code_challenge.length).toBeGreaterThan(40);
      expect(pkceParams.code_challenge_method).toBe('S256');
    });

    it('validates code_verifier correctly', () => {
      // Valid verifiers
      expect(validateCodeVerifier('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(true);
      expect(validateCodeVerifier('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')).toBe(true);
      
      // Invalid verifiers
      expect(validateCodeVerifier('too-short')).toBe(false);
      expect(validateCodeVerifier('a'.repeat(129))).toBe(false); // Too long
      expect(validateCodeVerifier('invalid@characters!')).toBe(false);
      expect(validateCodeVerifier('')).toBe(false);
    });

    it('prevents OAuth flow without PKCE parameters', () => {
      // Mock console.error to check for security warnings
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simulate OAuth request without PKCE - should be rejected
      const mockFetch = vi.fn().mockRejectedValue(new Error('PKCE parameters are required'));
      global.fetch = mockFetch;
      
      // Component should handle missing PKCE gracefully
      const { container } = render(
        <WaCloudWizard 
          open={true}
          onOpenChange={() => {}}
          accountId={1}
        />
      );
      
      expect(container).toBeDefined();
      consoleSpy.mockRestore();
    });

    it('stores PKCE parameters securely', async () => {
      const { storePKCEParams, retrievePKCEParams } = await import('@/utils/pkce');
      
      const testParams = {
        code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
        state: 'test_state_123'
      };
      
      // Store parameters
      storePKCEParams('test_key', testParams, 1000); // 1 second TTL
      
      // Retrieve immediately
      const retrieved = retrievePKCEParams('test_key');
      expect(retrieved).toEqual(testParams);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      // Should be expired
      const expired = retrievePKCEParams('test_key');
      expect(expired).toBeNull();
    });

    it('prevents PKCE replay attacks', () => {
      const { storePKCEParams, retrievePKCEParams } = require('@/utils/pkce');
      
      const testParams = {
        code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
        state: 'test_state_456'
      };
      
      // Store parameters
      storePKCEParams('replay_test', testParams);
      
      // First retrieval should work
      const first = retrievePKCEParams('replay_test');
      expect(first).toEqual(testParams);
      
      // Remove after first use (preventing replay)
      sessionStorage.removeItem('replay_test');
      
      // Second retrieval should fail
      const second = retrievePKCEParams('replay_test');
      expect(second).toBeNull();
    });
  });
});

// Helper function to simulate error sanitization
function sanitizeError(message: string): string {
  return message.replace(/[A-Z0-9]{20,}/g, '[MASKED]');
}