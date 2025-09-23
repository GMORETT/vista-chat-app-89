import React from 'react';
import { Loader2, CheckCircle, AlertCircle, Clock, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';

export type InboxConnectionStatus = 
  | 'idle'
  | 'connecting' 
  | 'authorizing'
  | 'creating'
  | 'connected'
  | 'error'
  | 'token_expired'
  | 'reconnecting';

interface InboxStatusCardProps {
  status: InboxConnectionStatus;
  title?: string;
  description?: string;
  error?: string;
  progress?: number;
  onRetry?: () => void;
  onReconnect?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const InboxStatusCard: React.FC<InboxStatusCardProps> = ({
  status,
  title,
  description,
  error,
  progress,
  onRetry,
  onReconnect,
  isLoading,
  className
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: Clock,
          iconColor: 'text-muted-foreground',
          bgColor: 'bg-muted/20',
          title: title || 'Aguardando',
          description: description || 'Pronto para iniciar configuração'
        };
      
      case 'connecting':
        return {
          icon: Loader2,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          title: title || 'Conectando',
          description: description || 'Estabelecendo conexão com o provedor',
          animate: true
        };
      
      case 'authorizing':
        return {
          icon: Loader2,
          iconColor: 'text-orange-500',
          bgColor: 'bg-orange-50',
          title: title || 'Autorizando',
          description: description || 'Validando permissões OAuth',
          animate: true
        };
      
      case 'creating':
        return {
          icon: Loader2,
          iconColor: 'text-indigo-500',
          bgColor: 'bg-indigo-50',
          title: title || 'Criando Inbox',
          description: description || 'Configurando canal de comunicação',
          animate: true
        };
      
      case 'connected':
        return {
          icon: CheckCircle,
          iconColor: 'text-emerald-500',
          bgColor: 'bg-emerald-50',
          title: title || 'Conectado',
          description: description || 'Inbox configurado com sucesso'
        };
      
      case 'token_expired':
        return {
          icon: WifiOff,
          iconColor: 'text-amber-500',
          bgColor: 'bg-amber-50',
          title: title || 'Token Expirado',
          description: description || 'Necessário reconectar para renovar credenciais'
        };
      
      case 'reconnecting':
        return {
          icon: Wifi,
          iconColor: 'text-blue-500',
          bgColor: 'bg-blue-50',
          title: title || 'Reconectando',
          description: description || 'Renovando credenciais de acesso',
          animate: true
        };
      
      case 'error':
      default:
        return {
          icon: AlertCircle,
          iconColor: 'text-destructive',
          bgColor: 'bg-destructive/10',
          title: title || 'Erro',
          description: description || 'Falha na configuração do inbox'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <Card className={`border ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${config.bgColor}`}>
            <IconComponent 
              className={`h-6 w-6 ${config.iconColor} ${config.animate ? 'animate-spin' : ''}`} 
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">{config.title}</h3>
              {progress !== undefined && (
                <span className="text-xs text-muted-foreground">{progress}%</span>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">{config.description}</p>
            
            {progress !== undefined && (
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            
            {error && (
              <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              {status === 'error' && onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Tentando...
                    </>
                  ) : (
                    'Tentar novamente'
                  )}
                </Button>
              )}
              
              {(status === 'token_expired' || status === 'error') && onReconnect && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={onReconnect}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Reconectando...
                    </>
                  ) : (
                    'Reconectar'
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};