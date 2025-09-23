export enum InboxErrorType {
  NETWORK = 'network',
  OAUTH = 'oauth',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  TOKEN_EXPIRED = 'token_expired',
  PROVIDER_ERROR = 'provider_error',
  CONFIGURATION = 'configuration',
  UNKNOWN = 'unknown'
}

export interface InboxError {
  type: InboxErrorType;
  code?: string;
  message: string;
  details?: string;
  retryable: boolean;
  requiresReconnect: boolean;
  context?: Record<string, any>;
}

export const createInboxError = (
  type: InboxErrorType,
  message: string,
  options: Partial<InboxError> = {}
): InboxError => ({
  type,
  message,
  retryable: false,
  requiresReconnect: false,
  ...options
});

export const isRetryableError = (error: InboxError): boolean => {
  return error.retryable || error.type === InboxErrorType.NETWORK;
};

export const requiresReconnection = (error: InboxError): boolean => {
  return error.requiresReconnect || 
         error.type === InboxErrorType.TOKEN_EXPIRED ||
         error.type === InboxErrorType.OAUTH;
};

export const getErrorMessage = (error: InboxError): string => {
  switch (error.type) {
    case InboxErrorType.NETWORK:
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    
    case InboxErrorType.OAUTH:
      return 'Falha na autorização. É necessário reconectar sua conta.';
    
    case InboxErrorType.TOKEN_EXPIRED:
      return 'Sua sessão expirou. Clique em "Reconectar" para renovar o acesso.';
    
    case InboxErrorType.VALIDATION:
      return error.message || 'Dados inválidos. Verifique as informações fornecidas.';
    
    case InboxErrorType.PERMISSION:
      return 'Permissões insuficientes. Verifique se sua conta tem acesso aos recursos necessários.';
    
    case InboxErrorType.PROVIDER_ERROR:
      return error.message || 'Erro no provedor de serviço. Tente novamente mais tarde.';
    
    case InboxErrorType.CONFIGURATION:
      return 'Erro na configuração. Verifique os dados do inbox.';
    
    default:
      return error.message || 'Erro inesperado. Tente novamente.';
  }
};

export const getRetryStrategy = (error: InboxError): {
  maxRetries: number;
  initialDelay: number;
  backoffMultiplier: number;
} => {
  switch (error.type) {
    case InboxErrorType.NETWORK:
      return { maxRetries: 3, initialDelay: 1000, backoffMultiplier: 2 };
    
    case InboxErrorType.PROVIDER_ERROR:
      return { maxRetries: 2, initialDelay: 2000, backoffMultiplier: 1.5 };
    
    default:
      return { maxRetries: 1, initialDelay: 0, backoffMultiplier: 1 };
  }
};