/**
 * Utility functions for Chatwoot configuration validation and setup
 */

export interface ChatwootCredentials {
  baseUrl: string;
  websocketUrl: string;
  token: string;
  accountId: number;
}

/**
 * Validates Chatwoot configuration
 */
export const validateChatwootConfig = (config: Partial<ChatwootCredentials>): string[] => {
  const errors: string[] = [];

  if (!config.baseUrl) {
    errors.push('VITE_CHATWOOT_BASE_URL is required');
  } else if (!isValidUrl(config.baseUrl)) {
    errors.push('VITE_CHATWOOT_BASE_URL must be a valid URL');
  }

  if (!config.websocketUrl) {
    errors.push('VITE_CHATWOOT_WEBSOCKET_URL is required');
  } else if (!isValidWebSocketUrl(config.websocketUrl)) {
    errors.push('VITE_CHATWOOT_WEBSOCKET_URL must be a valid WebSocket URL (ws:// or wss://)');
  }

  if (!config.token) {
    errors.push('User chatwoot_token is required');
  } else if (!isValidJwtToken(config.token)) {
    errors.push('User chatwoot_token appears to be invalid JWT format');
  }

  if (!config.accountId || config.accountId <= 0) {
    errors.push('Account ID must be a positive number');
  }

  return errors;
};

/**
 * Validates URL format
 */
const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validates WebSocket URL format
 */
const isValidWebSocketUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'ws:' || parsed.protocol === 'wss:';
  } catch {
    return false;
  }
};

/**
 * Basic API token validation (Chatwoot uses simple tokens, not JWT)
 */
const isValidJwtToken = (token: string): boolean => {
  return token && token.length > 10; // Simple validation for Chatwoot API tokens
};

/**
 * Gets environment configuration with validation
 */
export const getChatwootEnvConfig = () => {
  const config = {
    baseUrl: import.meta.env.VITE_CHATWOOT_BASE_URL,
    websocketUrl: import.meta.env.VITE_CHATWOOT_WEBSOCKET_URL,
    accountId: parseInt(import.meta.env.VITE_CHATWOOT_ACCOUNT_ID || '0'),
    realTimeEnabled: import.meta.env.VITE_ENABLE_REALTIME === 'true',
  };

  const errors = validateChatwootConfig({
    baseUrl: config.baseUrl,
    websocketUrl: config.websocketUrl,
    accountId: config.accountId,
    token: 'placeholder', // Will be validated per user
  });

  return {
    config,
    errors: errors.filter(e => !e.includes('token')), // Remove token error for env check
    isValid: errors.filter(e => !e.includes('token')).length === 0,
  };
};

/**
 * Creates WebSocket URL with proper authentication
 */
export const createChatwootWebSocketUrl = (config: ChatwootCredentials): string => {
  const url = new URL(config.websocketUrl);
  url.searchParams.set('token', config.token);
  url.searchParams.set('account_id', config.accountId.toString());
  return url.toString();
};

/**
 * Error handling for WebSocket connection issues
 */
export const getChatwootErrorMessage = (error: any): string => {
  if (error.code === 1006) {
    return 'Connection failed - check Chatwoot server status and credentials';
  }
  
  if (error.code === 1008) {
    return 'Authentication failed - invalid token or account ID';
  }
  
  if (error.code === 4001) {
    return 'Unauthorized - check your Chatwoot permissions';
  }
  
  if (error.message?.includes('ENOTFOUND')) {
    return 'Server not found - check CHATWOOT_WEBSOCKET_URL';
  }
  
  return `Connection error: ${error.message || 'Unknown error'}`;
};