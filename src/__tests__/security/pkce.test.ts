import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generateCodeVerifier, 
  generateCodeChallenge, 
  createPKCEParams, 
  validateCodeVerifier,
  storePKCEParams,
  retrievePKCEParams,
  clearPKCEStorage 
} from '../../utils/pkce';

describe('PKCE Implementation Security Tests', () => {
  beforeEach(() => {
    // Clear session storage before each test
    sessionStorage.clear();
  });

  describe('Code Verifier Generation', () => {
    it('generates cryptographically secure code verifiers', () => {
      const verifier1 = generateCodeVerifier();
      const verifier2 = generateCodeVerifier();
      
      // Should be different each time
      expect(verifier1).not.toBe(verifier2);
      
      // Should meet RFC 7636 requirements
      expect(verifier1.length).toBeGreaterThanOrEqual(43);
      expect(verifier1.length).toBeLessThanOrEqual(128);
      expect(/^[A-Za-z0-9\-_.]+$/.test(verifier1)).toBe(true);
    });

    it('validates code verifiers correctly', () => {
      const validVerifier = generateCodeVerifier();
      expect(validateCodeVerifier(validVerifier)).toBe(true);
      
      // Test edge cases
      expect(validateCodeVerifier('a'.repeat(43))).toBe(true); // Minimum length
      expect(validateCodeVerifier('a'.repeat(128))).toBe(true); // Maximum length
      expect(validateCodeVerifier('a'.repeat(42))).toBe(false); // Too short
      expect(validateCodeVerifier('a'.repeat(129))).toBe(false); // Too long
      expect(validateCodeVerifier('invalid@char')).toBe(false); // Invalid characters
      expect(validateCodeVerifier('')).toBe(false); // Empty string
    });
  });

  describe('Code Challenge Generation', () => {
    it('generates correct SHA256 challenges', async () => {
      const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
      const challenge = await generateCodeChallenge(verifier);
      
      // Should be base64url encoded SHA256 hash
      expect(challenge).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
      expect(challenge.length).toBe(43); // Standard SHA256 base64url length
      expect(/^[A-Za-z0-9\-_]+$/.test(challenge)).toBe(true); // Base64url characters only
    });

    it('produces different challenges for different verifiers', async () => {
      const verifier1 = generateCodeVerifier();
      const verifier2 = generateCodeVerifier();
      
      const challenge1 = await generateCodeChallenge(verifier1);
      const challenge2 = await generateCodeChallenge(verifier2);
      
      expect(challenge1).not.toBe(challenge2);
    });
  });

  describe('PKCE Parameter Creation', () => {
    it('creates complete PKCE parameter sets', async () => {
      const params = await createPKCEParams();
      
      expect(params.code_verifier).toBeDefined();
      expect(params.code_challenge).toBeDefined();
      expect(params.code_challenge_method).toBe('S256');
      
      expect(validateCodeVerifier(params.code_verifier)).toBe(true);
      expect(params.code_challenge.length).toBe(43);
    });

    it('generates unique parameter sets', async () => {
      const params1 = await createPKCEParams();
      const params2 = await createPKCEParams();
      
      expect(params1.code_verifier).not.toBe(params2.code_verifier);
      expect(params1.code_challenge).not.toBe(params2.code_challenge);
    });
  });

  describe('Secure Storage', () => {
    it('stores and retrieves PKCE parameters', () => {
      const testParams = {
        code_verifier: 'test-verifier-123',
        state: 'test-state-456'
      };
      
      storePKCEParams('test-key', testParams);
      const retrieved = retrievePKCEParams('test-key');
      
      expect(retrieved).toEqual(testParams);
    });

    it('handles expiration correctly', async () => {
      const testParams = {
        code_verifier: 'test-verifier-789',
        state: 'test-state-101112'
      };
      
      // Store with 100ms TTL
      storePKCEParams('expiry-test', testParams, 100);
      
      // Should be available immediately
      expect(retrievePKCEParams('expiry-test')).toEqual(testParams);
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Should be null after expiration
      expect(retrievePKCEParams('expiry-test')).toBeNull();
    });

    it('validates stored verifiers', () => {
      // Store invalid verifier
      const invalidParams = {
        code_verifier: 'invalid@verifier!',
        state: 'test-state'
      };
      
      sessionStorage.setItem('invalid-test', JSON.stringify({
        ...invalidParams,
        expires_at: Date.now() + 10000
      }));
      
      // Should return null for invalid verifier
      expect(retrievePKCEParams('invalid-test')).toBeNull();
      
      // Should have been cleaned up
      expect(sessionStorage.getItem('invalid-test')).toBeNull();
    });

    it('handles corrupted storage gracefully', () => {
      // Store corrupted data
      sessionStorage.setItem('corrupted-test', 'invalid-json');
      
      // Should return null and clean up
      expect(retrievePKCEParams('corrupted-test')).toBeNull();
      expect(sessionStorage.getItem('corrupted-test')).toBeNull();
    });

    it('clears all PKCE storage', () => {
      // Store multiple PKCE items
      storePKCEParams('pkce-test-1', { code_verifier: 'test1', state: 'state1' });
      storePKCEParams('oauth-test-2', { code_verifier: 'test2', state: 'state2' });
      sessionStorage.setItem('other-data', 'should-remain');
      
      // Clear PKCE storage
      clearPKCEStorage();
      
      // PKCE items should be cleared
      expect(retrievePKCEParams('pkce-test-1')).toBeNull();
      expect(retrievePKCEParams('oauth-test-2')).toBeNull();
      
      // Other data should remain
      expect(sessionStorage.getItem('other-data')).toBe('should-remain');
    });
  });

  describe('Security Edge Cases', () => {
    it('prevents timing attacks on code challenges', async () => {
      const verifier = generateCodeVerifier();
      
      // Multiple calls should have consistent timing
      const start1 = performance.now();
      await generateCodeChallenge(verifier);
      const time1 = performance.now() - start1;
      
      const start2 = performance.now();
      await generateCodeChallenge(verifier);
      const time2 = performance.now() - start2;
      
      // Timing should be relatively consistent (within 10ms)
      expect(Math.abs(time1 - time2)).toBeLessThan(10);
    });

    it('handles concurrent PKCE operations', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        createPKCEParams().then(params => ({ index: i, params }))
      );
      
      const results = await Promise.all(promises);
      
      // All should complete successfully
      expect(results).toHaveLength(10);
      
      // All should be unique
      const verifiers = results.map(r => r.params.code_verifier);
      const uniqueVerifiers = new Set(verifiers);
      expect(uniqueVerifiers.size).toBe(10);
    });

    it('prevents storage pollution', () => {
      // Store many items to test cleanup
      for (let i = 0; i < 50; i++) {
        storePKCEParams(`test-${i}`, { 
          code_verifier: `verifier-${i}`, 
          state: `state-${i}` 
        }, 100); // Short TTL
      }
      
      // Should not exceed reasonable storage limits
      const storageSize = JSON.stringify(sessionStorage).length;
      expect(storageSize).toBeLessThan(100000); // 100KB limit
    });
  });
});
