import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Checkbox } from '../../../ui/checkbox';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import { Button } from '../../../ui/button';
import { useAgents } from '../../../../hooks/admin/useAgents';
import { TeamFormData } from './CreateStep';

interface AddAgentsStepProps {
  form: UseFormReturn<TeamFormData>;
}

export const AddAgentsStep: React.FC<AddAgentsStepProps> = ({ form }) => {
  const { data: agents, isLoading } = useAgents();
  const selectedAgents = form.watch('selectedAgents');
  const teamName = form.watch('name');

  const handleAgentToggle = (agentId: number, checked: boolean) => {
    const currentSelected = form.getValues('selectedAgents');
    if (checked) {
      form.setValue('selectedAgents', [...currentSelected, agentId]);
    } else {
      form.setValue('selectedAgents', currentSelected.filter(id => id !== agentId));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Add agents to team - {teamName}
            </h2>
            <p className="text-muted-foreground">
              Agents can collaborate and work on conversations
            </p>
          </div>
          <Button disabled>Add agents</Button>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Add agents to team - {teamName}
          </h2>
          <p className="text-muted-foreground">
            Agents can collaborate and work on conversations
          </p>
        </div>
        <Button>Add agents</Button>
      </div>

      <div className="text-sm text-muted-foreground mb-4">
        Select at least one agent
      </div>

      <div className="border rounded-lg">
        <div className="grid grid-cols-2 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
          <div>AGENT</div>
          <div>EMAIL</div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {agents?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No agents available.
            </div>
          ) : (
            agents?.map((agent) => (
              <div
                key={agent.id}
                className="grid grid-cols-2 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`agent-${agent.id}`}
                    checked={selectedAgents.includes(agent.id)}
                    onCheckedChange={(checked) => handleAgentToggle(agent.id, !!checked)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium text-foreground">{agent.name}</div>
                </div>
                <div className="flex items-center text-muted-foreground">
                  {agent.email}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedAgents.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedAgents.length} out of {agents?.length || 0} agents selected
        </div>
      )}
    </div>
  );
};