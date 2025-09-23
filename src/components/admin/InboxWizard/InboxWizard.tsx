import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { useChannelTypes, useCreateInbox } from '@/hooks/admin/useInboxes';
import { useAgents } from '@/hooks/admin/useAgents';
import { ChannelType } from '@/models/admin';
import { Account } from '@/models/chat';
import { ChannelSelector } from './ChannelSelector';
import { CredentialsForm } from './CredentialsForm';
import { SummaryStep } from './SummaryStep';
import { AgentAssignmentModal } from './AgentAssignmentModal';
import { useToast } from '@/hooks/use-toast';
import { validateWizardStep } from './validation';
import { useListAccounts } from '@/hooks/admin/useAccounts';

export interface WizardData {
  name: string;
  selectedAccount: Account | null;
  selectedChannel: ChannelType | null;
  credentials: Record<string, string | number>;
  credentialIds: Record<string, string>;
}

interface InboxWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const InboxWizard: React.FC<InboxWizardProps> = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    name: '',
    selectedAccount: null,
    selectedChannel: null,
    credentials: {},
    credentialIds: {}
  });
  const [showAgentAssignment, setShowAgentAssignment] = useState(false);
  const [createdInboxId, setCreatedInboxId] = useState<number | null>(null);

  const { data: channelTypes, isLoading: loadingChannels } = useChannelTypes();
  const { data: accounts, isLoading: loadingAccounts } = useListAccounts();
  const { data: agents } = useAgents();
  const createInbox = useCreateInbox();
  const { toast } = useToast();

  // Detect current user role and auto-select account for non-super admins
  const currentUserRole = 'super_admin'; // TODO: Get from auth context
  const isSuperAdmin = currentUserRole === 'super_admin';

  // Auto-select account for non-super admins
  React.useEffect(() => {
    if (!isSuperAdmin && accounts && accounts.length > 0 && !wizardData.selectedAccount) {
      // For non-super admins, auto-select their account
      const userAccount = accounts[0]; // In real app, get user's specific account
      setWizardData(prev => ({ ...prev, selectedAccount: userAccount }));
    }
  }, [accounts, isSuperAdmin, wizardData.selectedAccount]);

  const steps = [
    { id: 1, title: 'Canal', description: 'Selecione o tipo de canal' },
    { id: 2, title: 'Credenciais', description: 'Configure as credenciais' },
    { id: 3, title: 'Resumo', description: 'Revise as configurações' }
  ];

  const canProceed = () => {
    try {
      validateWizardStep(currentStep, wizardData);
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast({
        title: "Validação",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCreate();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    try {
      if (!wizardData.selectedChannel) return;

      const providerConfig = { ...wizardData.credentials };
      
      // Replace sensitive fields with credential IDs
      wizardData.selectedChannel.fields.forEach(field => {
        if (field.sensitive && wizardData.credentialIds[field.name]) {
          providerConfig[`${field.name}_credential_id`] = wizardData.credentialIds[field.name];
          delete providerConfig[field.name];
        }
      });

      if (!wizardData.selectedAccount) {
        toast({
          title: "Erro",
          description: "Cliente não selecionado",
          variant: "destructive"
        });
        return;
      }

      const inboxData = {
        name: wizardData.name,
        channel_type: wizardData.selectedChannel.id,
        provider_config: providerConfig,
        account_id: wizardData.selectedAccount.id
      };

      const result = await createInbox.mutateAsync(inboxData);
      setCreatedInboxId(result.id);
      
      toast({
        title: "Sucesso",
        description: "Inbox criada com sucesso!",
        variant: "default"
      });

      // Check if there are agents for this account
      if (agents && agents.length > 0 && wizardData.selectedAccount) {
        setShowAgentAssignment(true);
      } else {
        onSuccess();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao criar inbox. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleAgentAssignmentComplete = () => {
    setShowAgentAssignment(false);
    onSuccess();
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ChannelSelector
            accounts={accounts || []}
            selectedAccount={wizardData.selectedAccount}
            onSelectAccount={(account) => 
              setWizardData(prev => ({ ...prev, selectedAccount: account }))
            }
            channels={channelTypes || []}
            selectedChannel={wizardData.selectedChannel}
            onSelectChannel={(channel) => 
              setWizardData(prev => ({ ...prev, selectedChannel: channel }))
            }
            name={wizardData.name}
            onNameChange={(name) => 
              setWizardData(prev => ({ ...prev, name }))
            }
            isLoadingAccounts={loadingAccounts}
            currentUserRole={currentUserRole}
          />
        );
      case 2:
        return wizardData.selectedChannel ? (
          <CredentialsForm
            channel={wizardData.selectedChannel}
            credentials={wizardData.credentials}
            credentialIds={wizardData.credentialIds}
            onCredentialsChange={(credentials) =>
              setWizardData(prev => ({ ...prev, credentials }))
            }
            onCredentialIdsChange={(credentialIds) =>
              setWizardData(prev => ({ ...prev, credentialIds }))
            }
          />
        ) : null;
      case 3:
        return (
          <SummaryStep
            wizardData={wizardData}
          />
        );
      default:
        return null;
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>Nova Inbox</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Passo {currentStep} de {steps.length}</span>
                <span>{Math.round(progress)}% concluído</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Steps indicator */}
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    currentStep >= step.id 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-4" />
                  )}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="min-h-[300px]">
              {(loadingChannels || loadingAccounts) ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
                  </div>
                </div>
              ) : (
                renderStepContent()
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Voltar
                </Button>
              </div>
              <Button
                onClick={handleNext}
                disabled={!canProceed() || createInbox.isPending}
              >
                {createInbox.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Criando...
                  </>
                ) : currentStep === 3 ? (
                  'Criar Inbox'
                ) : (
                  'Próximo'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showAgentAssignment && createdInboxId && wizardData.selectedAccount && (
        <AgentAssignmentModal
          inboxId={createdInboxId}
          accountId={wizardData.selectedAccount.id}
          onClose={handleAgentAssignmentComplete}
          onSkip={handleAgentAssignmentComplete}
        />
      )}
    </>
  );
};