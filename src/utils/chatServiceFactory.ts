import { IChatService } from '../api/IChatService';
import { MockChatService } from '../api/MockChatService';
import { BffChatService } from '../api/BffChatService';
import { ChatwootDirectService } from '../api/ChatwootDirectService';

/**
 * Factory for creating the appropriate chat service based on environment configuration
 */
export const createChatService = (chatwootConfig?: {
  token: string;
  accountId: number;
}): IChatService => {
  console.log('🔧 Chat Service Factory Debug:');
  console.log('- VITE_USE_MOCK:', import.meta.env.VITE_USE_MOCK);
  console.log('- VITE_USE_BFF:', import.meta.env.VITE_USE_BFF);
  console.log('- VITE_USE_CHATWOOT_DIRECT:', import.meta.env.VITE_USE_CHATWOOT_DIRECT);
  console.log('- chatwootConfig provided:', !!chatwootConfig);
  console.log('- chatwootConfig:', chatwootConfig);
  
  if (!chatwootConfig) {
    console.warn('⚠️ chatwootConfig is null/undefined - this will cause BFF fallback or error');
  }
  
  // Priority order: MOCK -> BFF -> DIRECT
  
  // 1. Use mock service if explicitly enabled
  const useMock = import.meta.env.VITE_USE_MOCK === 'true';
  if (useMock) {
    console.log('✅ Using MockChatService (explicitly enabled)');
    return new MockChatService();
  }
  
  // 2. Use BFF service if enabled and available
  const useBff = import.meta.env.VITE_USE_BFF === 'true';
  if (useBff) {
    console.log('✅ Using BffChatService');
    return new BffChatService();
  }
  
  // 3. Use direct Chatwoot service if config is available
  const useDirectChatwoot = import.meta.env.VITE_USE_CHATWOOT_DIRECT === 'true';
  if (useDirectChatwoot && chatwootConfig) {
    console.log('✅ Using ChatwootDirectService');
    return new ChatwootDirectService(chatwootConfig);
  }
  
  // 4. Error instead of fallback when Chatwoot is expected
  if (useDirectChatwoot && !chatwootConfig) {
    console.error('❌ Chatwoot Direct enabled but no valid config provided.');
    console.error('Cannot fall back to mock data when real Chatwoot is expected.');
    console.error('Check: user token, environment variables, and authentication.');
    throw new Error('Chatwoot configuration invalid - check console for details');
  }
  
  // 5. Error when no service is explicitly configured
  console.error('❌ No chat service configured');
  console.error('Available options:');
  console.error('- Set VITE_USE_MOCK=true for testing');
  console.error('- Set VITE_USE_BFF=true for BFF integration');
  console.error('- Set VITE_USE_CHATWOOT_DIRECT=true for direct Chatwoot');
  throw new Error('No chat service configured - check environment variables');
};

/**
 * Validates if direct Chatwoot connection is properly configured
 */
export const validateChatwootDirectConfig = (): {
  isValid: boolean;
  errors: string[];
  config?: { accountId: number };
} => {
  const errors: string[] = [];
  
  const baseUrl = import.meta.env.VITE_CHATWOOT_BASE_URL;
  const accountId = parseInt(import.meta.env.VITE_CHATWOOT_ACCOUNT_ID || '0');
  
  if (!baseUrl) {
    errors.push('VITE_CHATWOOT_BASE_URL is not configured');
  }
  
  if (!accountId || accountId <= 0) {
    errors.push('VITE_CHATWOOT_ACCOUNT_ID must be a positive number');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    config: errors.length === 0 ? { accountId } : undefined,
  };
};