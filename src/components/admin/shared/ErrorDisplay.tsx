import React from 'react';
import { AlertCircle, Wifi, WifiOff, Shield, Settings } from 'lucide-react';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { InboxError, InboxErrorType, getErrorMessage } from '../../../types/inboxErrors';

interface ErrorDisplayProps {
  error: InboxError;
  onRetry?: () => void;
  onReconnect?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onReconnect,
  isRetrying,
  className
}) => {
  const getErrorIcon = () => {
    switch (error.type) {
      case InboxErrorType.NETWORK:
        return WifiOff;
      case InboxErrorType.TOKEN_EXPIRED:
      case InboxErrorType.OAUTH:
        return Shield;
      case InboxErrorType.CONFIGURATION:
        return Settings;
      case InboxErrorType.PROVIDER_ERROR:
        return Wifi;
      default:
        return AlertCircle;
    }
  };

  const getErrorVariant = () => {
    switch (error.type) {
      case InboxErrorType.TOKEN_EXPIRED:
        return 'default' as const;
      case InboxErrorType.NETWORK:
      case InboxErrorType.PROVIDER_ERROR:
        return 'default' as const;
      default:
        return 'destructive' as const;
    }
  };

  const IconComponent = getErrorIcon();
  const variant = getErrorVariant();

  return (
    <Alert variant={variant} className={className}>
      <IconComponent className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-3">
          <div>
            <p className="font-medium">{getErrorMessage(error)}</p>
            {error.details && (
              <p className="text-sm text-muted-foreground mt-1">{error.details}</p>
            )}
          </div>
          
          <div className="flex gap-2">
            {error.retryable && onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                disabled={isRetrying}
              >
                {isRetrying ? 'Tentando...' : 'Tentar novamente'}
              </Button>
            )}
            
            {error.requiresReconnect && onReconnect && (
              <Button 
                size="sm" 
                onClick={onReconnect}
                disabled={isRetrying}
              >
                Reconectar
              </Button>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};