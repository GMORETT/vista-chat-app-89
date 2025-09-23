import React, { useCallback, useEffect } from 'react';
import { Smartphone } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { useToast } from '../../../hooks/use-toast';
import { useAdminService } from '../../../services/AdminService';
import { useAgents } from '../../../hooks/admin/useAgents';
import { useQueryClient } from '@tanstack/react-query';
import { useInboxWizardState } from '../../../hooks/admin/useInboxWizardState';
import { InboxStatusCard } from '../shared/InboxStatusCard';
import { InboxErrorType, createInboxError, getErrorMessage } from '../../../types/inboxErrors';
import { AgentAssignmentModal } from '../InboxWizard/AgentAssignmentModal';

interface StandardizedWaCloudWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  onFinished?: () => void;
}

const WA_CLOUD_STATE_KEY = 'waCloudState';

export const StandardizedWaCloudWizard: React.FC<StandardizedWaCloudWizardProps> = ({ 
  open, 
  onOpenChange, 
  accountId, 
  onFinished 
}) => {
  const adminService = useAdminService();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [name, setName] = React.useState('');
  const [createdInboxId, setCreatedInboxId] = React.useState<number | null>(null);
  const [showAgentModal, setShowAgentModal] = React.useState(false);

  const { data: agents = [] } = useAgents(accountId);

  const handleRetryOperation = useCallback(async () => {
    if (wizardState.step === 1) {
      await handleConnect();
    } else if (wizardState.step === 3) {
      startPollingForInbox(name);
    }
  }, []);

  const handleReconnectOperation = useCallback(async () => {
    if (createdInboxId) {
      const response = await adminService.reconnectWaCloud(accountId, createdInboxId);
      window.location.href = response.authorization_url;
    } else {
      await handleConnect();
    }
  }, [createdInboxId, accountId, name]);

  const [wizardState, wizardActions] = useInboxWizardState({
    initialStep: 1,
    onRetry: handleRetryOperation,
    onReconnect: handleReconnectOperation,
    persistKey: `wa_cloud_${accountId}`
  });

  // Resume flow after OAuth redirect
  useEffect(() => {
    if (!open) return;

    try {
      const raw = localStorage.getItem(WA_CLOUD_STATE_KEY);
      if (!raw) return;
      const st = JSON.parse(raw);
      if (st && st.accountId === accountId && st.name) {
        setName(st.name);
        wizardActions.setStep(3);
        wizardActions.setStatus('creating');
        startPollingForInbox(st.name);
      }
    } catch (_) {
      // ignore
    }
  }, [open, accountId]);

  useEffect(() => {
    if (!open) {
      wizardActions.reset();
      setName('');
      setCreatedInboxId(null);
      setShowAgentModal(false);
    }
  }, [open]);

  const parseError = (error: any): void => {
    const errorMessage = error?.message || error || 'Unknown error';
    
    if (errorMessage.includes('TOKEN_EXPIRED')) {
      wizardActions.setError(createInboxError(
        InboxErrorType.TOKEN_EXPIRED,
        'Token do WhatsApp expirado',
        { requiresReconnect: true }
      ));
    } else if (errorMessage.includes('PROVIDER_ERROR')) {
      wizardActions.setError(createInboxError(
        InboxErrorType.PROVIDER_ERROR,
        'Serviço WhatsApp temporariamente indisponível',
        { retryable: true }
      ));
    } else if (errorMessage.includes('VALIDATION')) {
      wizardActions.setError(createInboxError(
        InboxErrorType.VALIDATION,
        'Nome do inbox inválido',
        { retryable: false }
      ));
    } else if (errorMessage.includes('NETWORK')) {
      wizardActions.setError(createInboxError(
        InboxErrorType.NETWORK,
        'Erro de conexão',
        { retryable: true }
      ));
    } else {
      wizardActions.setError(createInboxError(
        InboxErrorType.UNKNOWN,
        errorMessage,
        { retryable: true }
      ));
    }
  };

  const startPollingForInbox = useCallback(async (expectedName: string) => {
    wizardActions.setStatus('creating');
    wizardActions.setProgress(10);

    let attempts = 0;
    const maxAttempts = 15;

    const interval = setInterval(async () => {
      attempts += 1;
      const progress = Math.min(90, 10 + (attempts / maxAttempts) * 80);
      wizardActions.setProgress(progress);

      try {
        const inboxes = await adminService.listClientInboxes(accountId);
        const found = inboxes.find(i => 
          i.name === expectedName && 
          (i.channel_type === 'whatsapp' || i.channel_type === 'whatsapp_cloud')
        );
        
        if (found) {
          clearInterval(interval);
          setCreatedInboxId(found.id);
          wizardActions.setProgress(100);
          wizardActions.setStatus('connected');
          wizardActions.setStep(4);
          
          queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'client-inboxes', accountId] });
          localStorage.removeItem(WA_CLOUD_STATE_KEY);
          
          toast({ 
            title: 'Conectado', 
            description: 'WhatsApp Cloud conectado com sucesso.' 
          });
          
          if (agents.length > 0) {
            setShowAgentModal(true);
          }
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          parseError('Timeout: Failed to create inbox');
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          parseError(err);
        }
      }
    }, 2000);
  }, [adminService, accountId, queryClient, toast, agents.length]);

  const handleConnect = async () => {
    if (!name.trim()) {
      wizardActions.setError(createInboxError(
        InboxErrorType.VALIDATION,
        'Nome da inbox é obrigatório'
      ));
      return;
    }

    wizardActions.setLoading(true);
    wizardActions.setStatus('connecting');
    wizardActions.setError(null);

    try {
      const res = await adminService.startWaCloudIntegration(accountId, name.trim());
      
      localStorage.setItem(WA_CLOUD_STATE_KEY, JSON.stringify({ 
        accountId, 
        name: name.trim(), 
        startedAt: Date.now() 
      }));
      
      window.location.href = res.authorization_url;
    } catch (e) {
      parseError(e);
    }
  };

  const handleFinish = () => {
    onOpenChange(false);
    onFinished?.();
  };

  const getStepContent = () => {
    switch (wizardState.step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wa-name">Nome da Inbox</Label>
              <Input 
                id="wa-name" 
                placeholder="Ex: Suporte WhatsApp" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            
            {wizardState.error && (
              <InboxStatusCard
                status="error"
                title="Erro de Configuração"
                description={getErrorMessage(wizardState.error)}
                error={wizardState.error.details}
                onRetry={wizardState.canRetry ? wizardActions.handleRetry : undefined}
                onReconnect={wizardState.needsReconnect ? wizardActions.handleReconnect : undefined}
                isLoading={wizardState.isLoading}
              />
            )}
          </div>
        );

      case 3:
        return (
          <InboxStatusCard
            status={wizardState.status}
            title="Conectando WhatsApp"
            description="Criando inbox e validando credenciais..."
            progress={wizardState.progress}
            error={wizardState.error ? getErrorMessage(wizardState.error) : undefined}
            onRetry={wizardState.canRetry ? wizardActions.handleRetry : undefined}
            onReconnect={wizardState.needsReconnect ? wizardActions.handleReconnect : undefined}
            isLoading={wizardState.isLoading}
          />
        );

      case 4:
        return (
          <InboxStatusCard
            status="connected"
            title="WhatsApp Conectado!"
            description={`Inbox "${name}" criado com sucesso.`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Adicionar Inbox WhatsApp Cloud
            </DialogTitle>
            <DialogDescription>
              Conecte sua conta WABA via Meta com segurança. Tokens nunca são expostos no front-end.
            </DialogDescription>
          </DialogHeader>

          {getStepContent()}

          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              
              <div className="flex-1" />
              
              {wizardState.step === 1 && (
                <Button 
                  onClick={handleConnect} 
                  disabled={!name.trim() || wizardState.isLoading}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Conectar com Meta
                </Button>
              )}
              
              {wizardState.step === 4 && (
                <Button onClick={handleFinish}>
                  Concluir
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showAgentModal && createdInboxId && (
        <AgentAssignmentModal
          inboxId={createdInboxId}
          accountId={accountId}
          onClose={() => setShowAgentModal(false)}
          onSkip={handleFinish}
        />
      )}
    </>
  );
};