import React, { useState, useMemo } from 'react';
import { Plus, ArrowLeft, UserCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from '../../hooks/admin/useAgents';
import { useAccounts } from '../../hooks/admin/useAccounts';
import { AgentsTable } from '../../components/admin/agents/AgentsTable';
import { AgentFormModal } from '../../components/admin/agents/AgentFormModal';
import { AgentEditModal } from '../../components/admin/agents/AgentEditModal';
import { ConfirmDeleteAgentDialog } from '../../components/admin/agents/ConfirmDeleteAgentDialog';
import { SearchField } from '../../components/admin/shared/SearchField';
import { ClientFilter } from '../../components/admin/shared/ClientFilter';
import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../../models/admin';

export const AgentsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('account_id');
  const accountName = searchParams.get('account_name');

  const { data: agents, isLoading } = useAgents();
  const { data: accounts = [] } = useAccounts();
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

  // Filter and search agents
  const filteredAgents = useMemo(() => {
    if (!agents) return [];
    
    let filtered = agents;
    
    // Filter by account_id from URL params or filter
    const filterAccountId = accountId ? parseInt(accountId) : selectedAccountId;
    if (filterAccountId) {
      filtered = filtered.filter(agent => agent.account_id === filterAccountId);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(agent => 
        agent.name.toLowerCase().includes(query) ||
        agent.email?.toLowerCase().includes(query) ||
        agent.role?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [agents, accountId, selectedAccountId, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          {accountId && accountName && (
            <div className="mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/clients">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar para Clientes
                </Link>
              </Button>
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {accountId && accountName ? `Agents - ${decodeURIComponent(accountName)}` : 'Agents'}
          </h1>
          <p className="text-muted-foreground">
            Manage agents and their permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {!accountId && (
        <div className="flex gap-4 items-center">
          <SearchField
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar por nome, email ou role..."
            className="flex-1"
          />
          <ClientFilter
            selectedAccountId={selectedAccountId}
            onAccountChange={setSelectedAccountId}
            accounts={accounts}
          />
        </div>
      )}

      {/* Agents Cloud */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Agents Cloud
          </CardTitle>
          <CardDescription>
            Visual overview of all agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {filteredAgents.length === 0 ? 'No agents created yet' : `${filteredAgents.length} agents available`}
          </p>
        </CardContent>
      </Card>

      <AgentsTable
        agents={filteredAgents || []}
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