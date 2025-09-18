import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAgents } from '@/hooks/admin/useAgents';
import { useAssignInboxAgents } from '@/hooks/admin/useInboxes';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck } from 'lucide-react';

interface AgentAssignmentModalProps {
  inboxId: number;
  onClose: () => void;
  onSkip: () => void;
}

export const AgentAssignmentModal: React.FC<AgentAssignmentModalProps> = ({
  inboxId,
  onClose,
  onSkip
}) => {
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const { data: agents, isLoading } = useAgents();
  const assignAgents = useAssignInboxAgents();
  const { toast } = useToast();

  const handleAgentToggle = (agentId: number) => {
    setSelectedAgents(prev => 
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleSelectAll = () => {
    if (!agents) return;
    
    if (selectedAgents.length === agents.length) {
      setSelectedAgents([]);
    } else {
      setSelectedAgents(agents.map(agent => agent.id));
    }
  };

  const handleAssign = async () => {
    if (selectedAgents.length === 0) {
      toast({
        title: "Seleção necessária",
        description: "Selecione pelo menos um agente para atribuir à inbox",
        variant: "destructive"
      });
      return;
    }

    try {
      await assignAgents.mutateAsync({
        inboxId,
        agentIds: selectedAgents
      });

      toast({
        title: "Sucesso",
        description: `${selectedAgents.length} agente(s) atribuído(s) à inbox`,
        variant: "default"
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao atribuir agentes. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getAgentInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'busy':
        return 'Ocupado';
      case 'offline':
        return 'Offline';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Atribuir Agentes</span>
          </DialogTitle>
          <DialogDescription>
            Selecione os agentes que terão acesso a esta inbox
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : agents && agents.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8"
                >
                  {selectedAgents.length === agents.length ? 'Desmarcar todos' : 'Marcar todos'}
                </Button>
                <Badge variant="secondary">
                  {selectedAgents.length} de {agents.length} selecionados
                </Badge>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {agents.map((agent) => {
                    const isSelected = selectedAgents.includes(agent.id);
                    
                    return (
                      <div
                        key={agent.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/5 border-primary'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleAgentToggle(agent.id)}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleAgentToggle(agent.id)}
                        />
                        
                        <div className="relative">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs">
                              {getAgentInitials(agent.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(agent.availability_status)}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium truncate">{agent.name}</p>
                            {agent.role === 'administrator' && (
                              <Badge variant="secondary" className="text-xs">
                                Admin
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-xs text-muted-foreground truncate">
                              {agent.email}
                            </p>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                            >
                              {getStatusLabel(agent.availability_status)}
                            </Badge>
                          </div>
                        </div>

                        {isSelected && (
                          <UserCheck className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Nenhum agente encontrado
              </p>
            </div>
          )}

          <div className="flex justify-between space-x-2 pt-4">
            <Button variant="outline" onClick={onSkip}>
              Pular por enquanto
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={selectedAgents.length === 0 || assignAgents.isPending}
            >
              {assignAgents.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Atribuindo...
                </>
              ) : (
                `Atribuir ${selectedAgents.length} agente(s)`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};