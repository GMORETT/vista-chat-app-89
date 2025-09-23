/**
 * PKCE (Proof Key for Code Exchange) utility functions
 * Implements RFC 7636 for OAuth2 security enhancement
 */

/**
 * Generates a cryptographically random code verifier
 * @returns Base64URL-encoded string of 43-128 characters
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generates a code challenge from a code verifier using SHA256
 * @param verifier The code verifier string
 * @returns Base64URL-encoded SHA256 hash of the verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

/**
 * Encodes a byte array to Base64URL format (RFC 4648 Section 5)
 * @param array Byte array to encode
 * @returns Base64URL-encoded string
 */
function base64URLEncode(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Creates PKCE parameters for OAuth flow
 * @returns Object containing code_verifier and code_challenge
 */
export async function createPKCEParams(): Promise<{
  code_verifier: string;
  code_challenge: string;
  code_challenge_method: 'S256';
}> {
  const code_verifier = generateCodeVerifier();
  const code_challenge = await generateCodeChallenge(code_verifier);
  
  return {
    code_verifier,
    code_challenge,
    code_challenge_method: 'S256'
  };
}

/**
 * Validates code verifier format according to RFC 7636
 * @param verifier Code verifier to validate
 * @returns True if valid, false otherwise
 */
export function validateCodeVerifier(verifier: string): boolean {
  // RFC 7636: 43-128 characters, [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~"
  const validFormat = /^[A-Za-z0-9\-._~]{43,128}$/.test(verifier);
  return validFormat;
}

/**
 * Securely stores PKCE parameters with automatic cleanup
 * @param key Storage key
 * @param params PKCE parameters to store
 * @param ttlMs Time-to-live in milliseconds (default: 10 minutes)
 */
export function storePKCEParams(
  key: string, 
  params: { code_verifier: string; state: string }, 
  ttlMs: number = 10 * 60 * 1000
): void {
  const data = {
    ...params,
    expires_at: Date.now() + ttlMs
  };
  
  sessionStorage.setItem(key, JSON.stringify(data));
  
  // Auto-cleanup after TTL
  setTimeout(() => {
    sessionStorage.removeItem(key);
  }, ttlMs);
}

/**
 * Retrieves and validates stored PKCE parameters
 * @param key Storage key
 * @returns PKCE parameters if valid and not expired, null otherwise
 */
export function retrievePKCEParams(key: string): { code_verifier: string; state: string } | null {
  try {
    const stored = sessionStorage.getItem(key);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Check expiration
    if (Date.now() > data.expires_at) {
      sessionStorage.removeItem(key);
      return null;
    }
    
    // Validate verifier format
    if (!validateCodeVerifier(data.code_verifier)) {
      sessionStorage.removeItem(key);
      return null;
    }
    
    return {
      code_verifier: data.code_verifier,
      state: data.state
    };
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }
}

/**
 * Clears all PKCE-related storage
 */
export function clearPKCEStorage(): void {
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.includes('pkce') || key.includes('oauth')) {
      sessionStorage.removeItem(key);
    }
  });
}