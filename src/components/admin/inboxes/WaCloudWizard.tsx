import React from 'react';
import { Smartphone, Loader2, CheckCircle, Users } from 'lucide-react';
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
import { Checkbox } from '../../ui/checkbox';
import { useToast } from '../../../hooks/use-toast';
import { useAdminService } from '../../../services/AdminService';
import { useAgents } from '../../../hooks/admin/useAgents';
import { useQueryClient } from '@tanstack/react-query';

interface WaCloudWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: number;
  onFinished?: () => void;
}

// Local storage key used to resume the flow after OAuth redirect
const WA_CLOUD_STATE_KEY = 'waCloudState';

export const WaCloudWizard: React.FC<WaCloudWizardProps> = ({ open, onOpenChange, accountId, onFinished }) => {
  const adminService = useAdminService();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [step, setStep] = React.useState<1 | 3 | 4>(1); // Step 2 is the external redirect
  const [name, setName] = React.useState('');
  const [authLoading, setAuthLoading] = React.useState(false);
  const [authError, setAuthError] = React.useState<string | null>(null);

  const [createdInboxId, setCreatedInboxId] = React.useState<number | null>(null);
  const [polling, setPolling] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  const [selectedAgents, setSelectedAgents] = React.useState<number[]>([]);
  const [assigning, setAssigning] = React.useState(false);

  const { data: agents = [], isLoading: loadingAgents } = useAgents(accountId);

  // Resume flow after OAuth redirect
  React.useEffect(() => {
    if (!open) return;

    try {
      const raw = localStorage.getItem(WA_CLOUD_STATE_KEY);
      if (!raw) return;
      const st = JSON.parse(raw);
      if (st && st.accountId === accountId && st.name) {
        // Move to step 3 and start polling until the inbox appears
        setName(st.name);
        setStep(3);
        startPollingForInbox(st.name);
      }
    } catch (_) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, accountId]);

  React.useEffect(() => {
    if (!open) {
      // Cleanup when closing
      setStep(1);
      setName('');
      setAuthError(null);
      setCreateError(null);
      setSelectedAgents([]);
      setCreatedInboxId(null);
    }
  }, [open]);

  const startPollingForInbox = React.useCallback(async (expectedName: string) => {
    if (polling) return;
    setPolling(true);
    setCreateError(null);

    let attempts = 0;
    const maxAttempts = 15; // ~30s with 2s interval

    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const inboxes = await adminService.listClientInboxes(accountId);
        const found = inboxes.find(i => i.name === expectedName && (i.channel_type === 'whatsapp' || i.channel_type === 'whatsapp_cloud'));
        if (found) {
          clearInterval(interval);
          setCreatedInboxId(found.id);
          setPolling(false);
          // Ensure list refresh
          queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'client-inboxes', accountId] });
          // Go to step 4
          setStep(4);
          // Clear state
          localStorage.removeItem(WA_CLOUD_STATE_KEY);
          toast({ title: 'Conectado', description: 'WhatsApp Cloud conectado com sucesso.' });
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPolling(false);
          setCreateError('Falha ao criar Inbox no Chatwoot.');
        }
      } catch (err) {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setPolling(false);
          setCreateError('Erro ao verificar status.');
        }
      }
    }, 2000);
  }, [adminService, accountId, polling, queryClient, toast]);

  const handleConnect = async () => {
    if (!name.trim()) return;
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await adminService.startWaCloudIntegration(accountId, name.trim());
      // Persist state so we can resume after redirect
      localStorage.setItem(WA_CLOUD_STATE_KEY, JSON.stringify({ accountId, name: name.trim(), startedAt: Date.now() }));
      // Redirect to Meta authorization URL (server-side OAuth)
      window.location.href = res.authorization_url;
    } catch (e) {
      setAuthError('Falha na autorização');
      setAuthLoading(false);
    }
  };

  const handleRetryAuth = () => {
    setAuthError(null);
    setCreateError(null);
    setStep(1);
  };

  const toggleAgent = (id: number) => {
    setSelectedAgents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAssignMembers = async () => {
    if (!createdInboxId) return;
    setAssigning(true);
    try {
      await adminService.assignClientInboxMembers(accountId, createdInboxId, selectedAgents);
      await queryClient.invalidateQueries({ queryKey: ['solabs-admin', 'client-inboxes', accountId] });
      toast({ title: 'Membros adicionados', description: 'Agentes atribuídos ao inbox.' });
      onOpenChange(false);
      onFinished?.();
    } catch (e) {
      toast({ title: 'Erro ao adicionar membros', description: 'Tente novamente.', variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  const closeAndClear = (open: boolean) => {
    if (!open) {
      localStorage.removeItem(WA_CLOUD_STATE_KEY);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={closeAndClear}>
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

        {/* Step content */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wa-name">Nome da Inbox</Label>
              <Input id="wa-name" placeholder="Ex: Suporte WhatsApp" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {authError && (
              <div className="text-destructive text-sm">{authError}</div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            {createError ? (
              <>
                <div className="text-destructive text-sm">{createError}</div>
                <Button variant="outline" onClick={handleRetryAuth}>Tentar novamente</Button>
              </>
            ) : (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div className="text-sm text-muted-foreground">Conectando e criando inbox no Chatwoot...</div>
              </>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              <span>Conectado</span>
            </div>
            <div className="space-y-2">
              <Label>Adicionar membros</Label>
              <div className="rounded-md border p-3 max-h-64 overflow-auto">
                {loadingAgents ? (
                  <div className="text-sm text-muted-foreground">Carregando agentes...</div>
                ) : agents.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Nenhum agente encontrado para este cliente.</div>
                ) : (
                  <ul className="space-y-2">
                    {agents.map(agent => (
                      <li key={agent.id} className="flex items-center gap-2">
                        <Checkbox id={`agent-${agent.id}`} checked={selectedAgents.includes(agent.id)} onCheckedChange={() => toggleAgent(agent.id)} />
                        <label htmlFor={`agent-${agent.id}`} className="text-sm cursor-pointer select-none">
                          {agent.name} <span className="text-muted-foreground">({agent.email})</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="flex gap-2 w-full">
            <Button variant="outline" onClick={() => closeAndClear(false)}>Cancelar</Button>
            <div className="flex-1" />
            {step === 1 && (
              <Button onClick={handleConnect} disabled={!name.trim() || authLoading}>
                {authLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Conectar com Meta
                  </>
                )}
              </Button>
            )}
            {step === 4 && (
              <Button onClick={handleAssignMembers} disabled={assigning || !createdInboxId || selectedAgents.length === 0}>
                {assigning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Adicionar membros
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
