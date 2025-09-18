import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Check, Users } from 'lucide-react';
import { Badge } from '../../../ui/badge';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import { useAgents } from '../../../../hooks/admin/useAgents';
import { TeamFormData } from './CreateStep';

interface FinishStepProps {
  form: UseFormReturn<TeamFormData>;
}

export const FinishStep: React.FC<FinishStepProps> = ({ form }) => {
  const { data: agents } = useAgents();
  const formData = form.watch();
  
  const selectedAgents = agents?.filter(agent => 
    formData.selectedAgents.includes(agent.id)
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Finish</h2>
        <p className="text-muted-foreground">
          Review your team settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Team Details */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium text-foreground mb-3">Team Details</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-foreground">Name</div>
              <div className="text-sm text-muted-foreground">{formData.name || 'Not specified'}</div>
            </div>
            {formData.description && (
              <div>
                <div className="text-sm font-medium text-foreground">Description</div>
                <div className="text-sm text-muted-foreground">{formData.description}</div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-foreground">Auto-assign</div>
              <Badge variant={formData.allow_auto_assign ? 'default' : 'secondary'}>
                {formData.allow_auto_assign ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4" />
            <h3 className="font-medium text-foreground">
              Team Members ({selectedAgents.length})
            </h3>
          </div>
          
          {selectedAgents.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No agents selected for this team
            </div>
          ) : (
            <div className="space-y-3">
              {selectedAgents.map((agent) => (
                <div key={agent.id} className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {agent.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">{agent.name}</div>
                    <div className="text-sm text-muted-foreground">{agent.email}</div>
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {agent.role}
                  </div>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-800">
            <strong>Ready to create your team!</strong> Click "Create team" to finish the setup.
          </div>
        </div>
      </div>
    </div>
  );
};