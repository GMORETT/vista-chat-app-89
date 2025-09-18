import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Search } from 'lucide-react';
import { Input } from '../../../ui/input';
import { Checkbox } from '../../../ui/checkbox';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import { useAgents } from '../../../../hooks/admin/useAgents';
import { TeamFormData } from './CreateStep';

interface AddAgentsStepProps {
  form: UseFormReturn<TeamFormData>;
}

export const AddAgentsStep: React.FC<AddAgentsStepProps> = ({ form }) => {
  const { data: agents, isLoading } = useAgents();
  const [searchTerm, setSearchTerm] = React.useState('');
  const selectedAgents = form.watch('selectedAgents');

  const filteredAgents = agents?.filter(agent =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Add Agents</h2>
          <p className="text-muted-foreground">
            Add agents to the team
          </p>
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
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Add Agents</h2>
        <p className="text-muted-foreground">
          Add agents to the team
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search agents"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAgents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'No agents found matching your search.' : 'No agents available.'}
          </div>
        ) : (
          filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
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
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground">{agent.name}</div>
                <div className="text-sm text-muted-foreground truncate">{agent.email}</div>
              </div>
              <div className="text-xs text-muted-foreground capitalize">
                {agent.role}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedAgents.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};