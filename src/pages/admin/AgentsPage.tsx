import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from '../../hooks/admin/useAgents';
import { AgentsTable } from '../../components/admin/agents/AgentsTable';
import { AgentFormModal } from '../../components/admin/agents/AgentFormModal';
import { AgentEditModal } from '../../components/admin/agents/AgentEditModal';
import { ConfirmDeleteAgentDialog } from '../../components/admin/agents/ConfirmDeleteAgentDialog';
import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../../models/admin';

export const AgentsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const { data: agents, isLoading } = useAgents();
  const createAgentMutation = useCreateAgent();
  const updateAgentMutation = useUpdateAgent();
  const deleteAgentMutation = useDeleteAgent();

  const handleCreateAgent = async (data: CreateAgentRequest) => {
    await createAgentMutation.mutateAsync(data);
  };

  const handleUpdateAgent = async (id: number, data: UpdateAgentRequest) => {
    await updateAgentMutation.mutateAsync({ id, data });
  };

  const handleDeleteAgent = async (id: number) => {
    await deleteAgentMutation.mutateAsync(id);
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowEditForm(true);
  };

  const handleDelete = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agents</h1>
          <p className="text-muted-foreground">
            Manage agents and their permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Agent
        </Button>
      </div>

      <AgentsTable
        agents={agents || []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AgentFormModal
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateAgent}
        isLoading={createAgentMutation.isPending}
      />

      <AgentEditModal
        open={showEditForm}
        onOpenChange={setShowEditForm}
        agent={selectedAgent}
        onSubmit={handleUpdateAgent}
        isLoading={updateAgentMutation.isPending}
      />

      <ConfirmDeleteAgentDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        agent={selectedAgent}
        onConfirm={handleDeleteAgent}
        isLoading={deleteAgentMutation.isPending}
      />
    </div>
  );
};