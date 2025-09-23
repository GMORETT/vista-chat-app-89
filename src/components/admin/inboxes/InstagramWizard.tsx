import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { toast } from 'sonner';
import { Instagram, Loader2, CheckCircle, AlertCircle, ArrowLeft, Users } from 'lucide-react';
import { useAdminService } from '../../../services/AdminService';
import { AgentAssignmentModal } from '../InboxWizard/AgentAssignmentModal';
import { useAgents } from '../../../hooks/admin/useAgents';
import { Channel } from '../../../models/admin';

interface InstagramWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  onFinished: (inbox: Channel) => void;
}

type WizardStep = 'name' | 'connecting' | 'accounts' | 'success';

interface InstagramAccount {
  ig_business_account_id: string;
  username: string;
  name: string;
  profile_picture_url: string;
  followers_count: number;
  page_id: string;
  page_name: string;
}

export const InstagramWizard: React.FC<InstagramWizardProps> = ({
  open,
  onOpenChange,
  accountId,
  onFinished
}) => {
  const [step, setStep] = useState<WizardStep>('name');
  const [inboxName, setInboxName] = useState('');
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInbox, setCreatedInbox] = useState<Channel | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);

  const adminService = useAdminService();
  const { data: agents } = useAgents(accountId);

  useEffect(() => {
    if (!open) {
      // Reset wizard state when dialog closes
      setStep('name');
      setInboxName('');
      setAccounts([]);
      setSelectedAccount(null);
      setIsLoading(false);
      setError(null);
      setCreatedInbox(null);
      setShowAgentModal(false);
    }
  }, [open]);

  useEffect(() => {
    // Check for Instagram OAuth callback
    const checkOAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state && step === 'connecting') {
        handleOAuthCallback(code, state);
      }
    };

    checkOAuthCallback();
  }, [step]);

  const handleStartIntegration = async () => {
    if (!inboxName.trim()) {
      toast.error('Por favor, insira um nome para o inbox');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await adminService.startInstagramIntegration(accountId, inboxName);
      setStep('connecting');
      
      // In a real app, this would redirect to Instagram OAuth
      // For mock purposes, we'll simulate the flow
      setTimeout(() => {
        handleMockOAuthSuccess();
      }, 2000);
      
    } catch (error) {
      console.error('Error starting Instagram integration:', error);
      setError('Erro ao iniciar integração com Instagram');
      toast.error('Erro ao conectar com Instagram');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockOAuthSuccess = async () => {
    try {
      const instagramAccounts = await adminService.listInstagramAccounts(accountId);
      setAccounts(instagramAccounts);
      setStep('accounts');
      
      if (instagramAccounts.length === 0) {
        setError('Nenhuma conta comercial do Instagram foi encontrada. Verifique se sua conta está vinculada a uma página do Facebook.');
      }
    } catch (error) {
      console.error('Error fetching Instagram accounts:', error);
      setError('Erro ao buscar contas do Instagram');
      toast.error('Erro ao buscar contas do Instagram');
    }
  };

  const handleOAuthCallback = async (code: string, state: string) => {
    // This would normally be handled by the server
    handleMockOAuthSuccess();
  };

  const handleAccountSelect = async () => {
    if (!selectedAccount) {
      toast.error('Por favor, selecione uma conta do Instagram');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const inbox = await adminService.selectInstagramAccount(accountId, selectedAccount, inboxName);
      setCreatedInbox(inbox);
      setStep('success');
      toast.success('Inbox Instagram criado com sucesso!');
      
      // Show agent assignment modal if agents are available
      if (agents && agents.length > 0) {
        setShowAgentModal(true);
      }
    } catch (error) {
      console.error('Error creating Instagram inbox:', error);
      setError('Erro ao criar inbox Instagram');
      toast.error('Erro ao criar inbox Instagram');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    if (createdInbox) {
      onFinished(createdInbox);
    }
    onOpenChange(false);
  };

  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'name':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Instagram className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Conectar Instagram</h3>
              <p className="text-muted-foreground">
                Configure um inbox para Direct Messages do Instagram
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="inbox-name">Nome do Inbox</Label>
                <Input
                  id="inbox-name"
                  value={inboxName}
                  onChange={(e) => setInboxName(e.target.value)}
                  placeholder="ex: Instagram Atendimento"
                  className="mt-1"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case 'connecting':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <h3 className="text-lg font-semibold">Conectando ao Instagram</h3>
            <p className="text-muted-foreground">
              Aguarde enquanto validamos suas permissões...
            </p>
          </div>
        );

      case 'accounts':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Contas Instagram Disponíveis</h3>
              <p className="text-muted-foreground">
                Selecione a conta comercial do Instagram para conectar
              </p>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {accounts.map((account) => (
                <div
                  key={account.ig_business_account_id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedAccount === account.ig_business_account_id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedAccount(account.ig_business_account_id)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={account.profile_picture_url}
                      alt={account.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">@{account.username}</h4>
                        {selectedAccount === account.ig_business_account_id && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{account.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{formatFollowerCount(account.followers_count)} seguidores</span>
                        <span>Página: {account.page_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {accounts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <p className="font-medium mb-2">Nenhuma conta comercial encontrada</p>
                <p className="text-sm">
                  Certifique-se de que sua conta Instagram é comercial e está vinculada a uma página do Facebook.
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-lg font-semibold">Instagram Conectado!</h3>
            <p className="text-muted-foreground">
              O inbox "{inboxName}" foi criado com sucesso.
            </p>
            {agents && agents.length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  Deseja adicionar agentes a este inbox?
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const getStepButtons = () => {
    switch (step) {
      case 'name':
        return (
          <>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleStartIntegration} disabled={isLoading || !inboxName.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                'Conectar com Instagram'
              )}
            </Button>
          </>
        );

      case 'connecting':
        return (
          <Button variant="outline" onClick={() => setStep('name')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        );

      case 'accounts':
        return (
          <>
            <Button variant="outline" onClick={() => setStep('name')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button 
              onClick={handleAccountSelect} 
              disabled={isLoading || !selectedAccount || accounts.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando Inbox...
                </>
              ) : (
                'Criar Inbox'
              )}
            </Button>
          </>
        );

      case 'success':
        return (
          <>
            {agents && agents.length > 0 && (
              <Button variant="outline" onClick={() => setShowAgentModal(true)}>
                <Users className="w-4 h-4 mr-2" />
                Adicionar Agentes
              </Button>
            )}
            <Button onClick={handleFinish}>
              Concluir
            </Button>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {step === 'success' ? 'Instagram Conectado' : 'Adicionar Inbox Instagram'}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            {renderStepContent()}
          </div>

          <div className="flex justify-between">
            {getStepButtons()}
          </div>
        </DialogContent>
      </Dialog>

      {showAgentModal && createdInbox && (
        <AgentAssignmentModal
          inboxId={createdInbox.id}
          accountId={accountId}
          onClose={() => setShowAgentModal(false)}
          onSkip={handleFinish}
        />
      )}
    </>
  );
};