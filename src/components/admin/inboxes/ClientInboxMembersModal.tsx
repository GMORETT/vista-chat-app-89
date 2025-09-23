import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Loader2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { ScrollArea } from '../../ui/scroll-area';
import { Badge } from '../../ui/badge';
import { Alert, AlertDescription } from '../../ui/alert';
import { Channel } from '../../../models/admin';
import { useClientInboxMembers, useAssignClientInboxMembers } from '../../../hooks/admin/useClientInboxMembers';
import { useAgents } from '../../../hooks/admin/useAgents';
import { useToast } from '../../../hooks/use-toast';

interface ClientInboxMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inbox: Channel | null;
}

export const ClientInboxMembersModal: React.FC<ClientInboxMembersModalProps> = ({
  open,
  onOpenChange,
  inbox,
}) => {
  const { toast } = useToast();
  const [selectedAgentIds, setSelectedAgentIds] = useState<number[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const { data: allAgents, isLoading: agentsLoading } = useAgents(inbox?.account_id);
  const { data: currentMembers, isLoading: membersLoading } = useClientInboxMembers(
    inbox?.account_id || 0, 
    inbox?.id || 0
  );
  const assignMembers = useAssignClientInboxMembers();

  const currentMemberIds = currentMembers?.map(m => m.id) || [];

  useEffect(() => {
    setSelectedAgentIds(currentMemberIds);
  }, [currentMembers]);

  if (!inbox) return null;

  const handleAgentToggle = (agentId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedAgentIds(prev => [...prev, agentId]);
    } else {
      setSelectedAgentIds(prev => prev.filter(id => id !== agentId));
    }
  };

  const handleSelectAll = () => {
    if (allAgents) {
      if (selectedAgentIds.length === allAgents.length) {
        setSelectedAgentIds([]);
      } else {
        setSelectedAgentIds(allAgents.map(agent => agent.id));
      }
    }
  };

  const handleSaveChanges = async () => {
    if (!inbox) return;

    try {
      await assignMembers.mutateAsync({
        accountId: inbox.account_id,
        inboxId: inbox.id,
        agentIds: selectedAgentIds,
      });

      toast({
        title: 'Membros atualizados',
        description: `Membros do inbox "${inbox.name}" foram atualizados com sucesso.`,
      });

      setShowConfirmation(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao atualizar membros do inbox.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = agentsLoading || membersLoading;
  const isSaving = assignMembers.isPending;
  const hasChanges = JSON.stringify(selectedAgentIds.sort()) !== JSON.stringify(currentMemberIds.sort());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Gerenciar Membros
          </DialogTitle>
          <DialogDescription>
            Gerencie os agentes que têm acesso ao inbox "{inbox.name}".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Selecione os agentes que farão parte deste inbox
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {selectedAgentIds.length} selecionados
              </Badge>
              {allAgents && allAgents.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isLoading}
                >
                  {selectedAgentIds.length === allAgents.length ? 'Desmarcar todos' : 'Selecionar todos'}
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : allAgents && allAgents.length > 0 ? (
            <ScrollArea className="h-[350px] border rounded-md p-4">
              <div className="space-y-3">
                {allAgents.map((agent) => {
                  const isSelected = selectedAgentIds.includes(agent.id);
                  const wasMember = currentMemberIds.includes(agent.id);
                  
                  return (
                    <div
                      key={agent.id}
                      className="flex items-center space-x-3 p-3 rounded-md hover:bg-muted/50"
                    >
                      <Checkbox
                        id={`agent-${agent.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => 
                          handleAgentToggle(agent.id, checked as boolean)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {agent.role}
                        </Badge>
                        <Badge 
                          variant={agent.availability_status === 'available' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {agent.availability_status === 'available' ? 'Disponível' : 
                           agent.availability_status === 'busy' ? 'Ocupado' : 'Offline'}
                        </Badge>
                        {!wasMember && isSelected && (
                          <UserPlus className="h-3 w-3 text-green-600" />
                        )}
                        {wasMember && !isSelected && (
                          <UserMinus className="h-3 w-3 text-red-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agente encontrado para este cliente.</p>
              <p className="text-sm mt-2">
                Adicione agentes na seção de Agentes antes de gerenciar membros do inbox.
              </p>
            </div>
          )}

          {hasChanges && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Você tem alterações não salvas. As alterações substituirão completamente a lista atual de membros.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={hasChanges ? () => setShowConfirmation(true) : handleSaveChanges}
            disabled={!hasChanges || isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </DialogFooter>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Confirmar Alterações</DialogTitle>
              <DialogDescription>
                Esta ação substituirá completamente a lista atual de membros do inbox. Deseja continuar?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};