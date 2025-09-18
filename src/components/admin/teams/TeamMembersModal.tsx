import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Loader2 } from 'lucide-react';
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
import { Team, Agent } from '../../../models/admin';
import { useTeamMembers, useAddTeamMembers, useRemoveTeamMember } from '../../../hooks/admin/useTeams';
import { useAgents } from '../../../hooks/admin/useAgents';
import { useToast } from '../../../hooks/use-toast';

interface TeamMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team;
}

export const TeamMembersModal: React.FC<TeamMembersModalProps> = ({
  open,
  onOpenChange,
  team,
}) => {
  const { toast } = useToast();
  const [selectedAgentIds, setSelectedAgentIds] = useState<number[]>([]);
  
  const { data: allAgents, isLoading: agentsLoading } = useAgents();
  const { data: currentMembers, isLoading: membersLoading } = useTeamMembers(team?.id || 0);
  const addMembers = useAddTeamMembers();
  const removeMember = useRemoveTeamMember();

  const currentMemberIds = currentMembers?.map(m => m.id) || [];

  useEffect(() => {
    setSelectedAgentIds(currentMemberIds);
  }, [currentMembers]);

  if (!team) return null;

  const handleAgentToggle = (agentId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedAgentIds(prev => [...prev, agentId]);
    } else {
      setSelectedAgentIds(prev => prev.filter(id => id !== agentId));
    }
  };

  const handleSaveChanges = async () => {
    if (!team) return;

    try {
      // Find agents to add and remove
      const agentsToAdd = selectedAgentIds.filter(id => !currentMemberIds.includes(id));
      const agentsToRemove = currentMemberIds.filter(id => !selectedAgentIds.includes(id));

      // Add new members
      if (agentsToAdd.length > 0) {
        await addMembers.mutateAsync({
          teamId: team.id,
          agentIds: agentsToAdd,
        });
      }

      // Remove members
      for (const agentId of agentsToRemove) {
        await removeMember.mutateAsync({
          teamId: team.id,
          agentId,
        });
      }

      toast({
        title: 'Team members updated',
        description: `Successfully updated team membership.`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update team members.',
        variant: 'destructive',
      });
    }
  };

  const isLoading = agentsLoading || membersLoading;
  const isSaving = addMembers.isPending || removeMember.isPending;
  const hasChanges = JSON.stringify(selectedAgentIds.sort()) !== JSON.stringify(currentMemberIds.sort());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manage Team Members
          </DialogTitle>
          <DialogDescription>
            Add or remove agents from "{team.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Select agents to be part of this team
            </div>
            <Badge variant="outline">
              {selectedAgentIds.length} selected
            </Badge>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <ScrollArea className="h-[300px] border rounded-md p-4">
              <div className="space-y-3">
                {allAgents?.map((agent) => {
                  const isSelected = selectedAgentIds.includes(agent.id);
                  const wasMember = currentMemberIds.includes(agent.id);
                  
                  return (
                    <div
                      key={agent.id}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted"
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
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};