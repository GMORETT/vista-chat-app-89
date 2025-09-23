import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { useToast } from '../../ui/use-toast';
import { Loader2, Facebook, Users, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAdminService } from '../../../services/AdminService';
import { useAgents } from '../../../hooks/admin/useAgents';
import { Checkbox } from '../../ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';

interface FacebookWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  onSuccess: () => void;
}

interface FacebookPage {
  id: string;
  name: string;
  followers_count?: number;
  picture?: string;
}

type WizardStep = 'name' | 'oauth' | 'pages' | 'agents';

export const FacebookWizard: React.FC<FacebookWizardProps> = ({
  open,
  onOpenChange,
  accountId,
  onSuccess
}) => {
  const [step, setStep] = useState<WizardStep>('name');
  const [inboxName, setInboxName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [createdInboxId, setCreatedInboxId] = useState<number | null>(null);
  
  const { toast } = useToast();
  const adminService = useAdminService();
  const { data: agents = [] } = useAgents(accountId);

  // Check for OAuth callback on mount
  useEffect(() => {
    if (open) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state) {
        try {
          const stateData = JSON.parse(atob(state));
          if (stateData.type === 'facebook' && stateData.accountId === accountId) {
            // Clear URL params
            window.history.replaceState({}, '', window.location.pathname);
            
            // Set inbox name from state and proceed to pages step
            setInboxName(stateData.name);
            setStep('pages');
            handleLoadPages();
          }
        } catch (error) {
          console.error('Error parsing OAuth state:', error);
        }
      }
    }
  }, [open, accountId]);

  const handleStartOAuth = async () => {
    if (!inboxName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a inbox.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await adminService.startFacebookIntegration(accountId, inboxName);
      
      // Store state in localStorage as backup
      localStorage.setItem('facebook_oauth_state', JSON.stringify({
        accountId,
        inboxName,
        step: 'oauth'
      }));
      
      // Redirect to Facebook OAuth
      window.location.href = response.authorization_url;
    } catch (error) {
      console.error('Error starting Facebook OAuth:', error);
      setError('Falha ao iniciar autorização com Facebook. Tente novamente.');
      toast({
        title: "Erro de autorização",
        description: "Não foi possível conectar com o Facebook. Verifique sua conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const facebookPages = await adminService.listFacebookPages(accountId);
      setPages(facebookPages);
      setStep('pages');
    } catch (error) {
      console.error('Error loading Facebook pages:', error);
      setError('Falha ao carregar páginas do Facebook. Tente novamente.');
      toast({
        title: "Erro ao carregar páginas",
        description: "Não foi possível carregar suas páginas do Facebook. Verifique suas permissões.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPage = async () => {
    if (!selectedPageId) {
      toast({
        title: "Página não selecionada",
        description: "Por favor, selecione uma página do Facebook.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const createdInbox = await adminService.selectFacebookPage(accountId, selectedPageId, inboxName);
      setCreatedInboxId(createdInbox.id);
      
      toast({
        title: "Inbox criada com sucesso!",
        description: `A inbox "${inboxName}" foi conectada ao Facebook.`,
      });

      if (agents.length > 0) {
        setStep('agents');
      } else {
        handleClose();
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating Facebook inbox:', error);
      setError('Falha ao criar Inbox no Chatwoot. Tente novamente.');
      toast({
        title: "Erro ao criar inbox",
        description: "Não foi possível criar a inbox. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignAgents = async () => {
    if (!createdInboxId || selectedAgents.length === 0) {
      // Skip if no agents selected
      handleClose();
      onSuccess();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await adminService.assignClientInboxMembers(accountId, createdInboxId, selectedAgents);
      
      toast({
        title: "Agentes adicionados!",
        description: `${selectedAgents.length} agente(s) foram adicionados à inbox.`,
      });

      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Error assigning agents:', error);
      toast({
        title: "Erro ao adicionar agentes",
        description: "Não foi possível adicionar os agentes. Você pode fazer isso depois.",
        variant: "destructive"
      });
      
      // Still close and call onSuccess since inbox was created
      handleClose();
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('name');
    setInboxName('');
    setError(null);
    setPages([]);
    setSelectedPageId(null);
    setSelectedAgents([]);
    setCreatedInboxId(null);
    localStorage.removeItem('facebook_oauth_state');
    onOpenChange(false);
  };

  const handleRetry = () => {
    setError(null);
    if (step === 'name') {
      handleStartOAuth();
    } else if (step === 'pages') {
      handleLoadPages();
    } else if (step === 'agents') {
      handleAssignAgents();
    }
  };

  const toggleAgentSelection = (agentId: number) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const getStepTitle = () => {
    switch (step) {
      case 'name': return 'Conectar Facebook Page';
      case 'oauth': return 'Autorizando...';
      case 'pages': return 'Selecionar Página';
      case 'agents': return 'Adicionar Membros';
      default: return 'Facebook Messenger';
    }
  };

  const selectedPage = pages.find(page => page.id === selectedPageId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Inbox Name */}
          {step === 'name' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inbox-name">Nome da Inbox</Label>
                <Input
                  id="inbox-name"
                  value={inboxName}
                  onChange={(e) => setInboxName(e.target.value)}
                  placeholder="Ex: Atendimento Facebook"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={handleStartOAuth} disabled={isLoading || !inboxName.trim()}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Conectar com Facebook
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: OAuth (handled externally) */}
          {step === 'oauth' && (
            <div className="text-center py-8 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
              <div>
                <h3 className="font-medium">Redirecionando para Facebook...</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Você será redirecionado para autorizar o acesso às suas páginas.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Page Selection */}
          {step === 'pages' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Selecione uma Página do Facebook</h3>
                <p className="text-sm text-muted-foreground">
                  Escolha qual página será conectada à inbox "{inboxName}".
                </p>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Carregando páginas...</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPageId === page.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPageId(page.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={page.picture} alt={page.name} />
                          <AvatarFallback>{page.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{page.name}</h4>
                            {selectedPageId === page.id && (
                              <CheckCircle className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          {page.followers_count && (
                            <Badge variant="secondary" className="text-xs">
                              {page.followers_count.toLocaleString()} seguidores
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                  <Button variant="outline" size="sm" onClick={handleRetry} className="ml-auto">
                    Tentar Novamente
                  </Button>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleClose}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button 
                  onClick={handleSelectPage} 
                  disabled={!selectedPageId || isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Conectar Página
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Agent Assignment */}
          {step === 'agents' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-md">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">
                  Inbox "{inboxName}" conectada com {selectedPage?.name}!
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4" />
                  <h3 className="font-medium">Adicionar Membros</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecione os agentes que poderão atender nesta inbox.
                </p>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`agent-${agent.id}`}
                        checked={selectedAgents.includes(agent.id)}
                        onCheckedChange={() => toggleAgentSelection(agent.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <label 
                          htmlFor={`agent-${agent.id}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {agent.name}
                        </label>
                        <p className="text-xs text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => {
                  handleClose();
                  onSuccess();
                }}>
                  Pular
                </Button>
                <Button onClick={handleAssignAgents} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {selectedAgents.length > 0 
                    ? `Adicionar ${selectedAgents.length} Agente(s)` 
                    : 'Finalizar'
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};