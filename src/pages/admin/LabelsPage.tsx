import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useLabels, useCreateLabel, useUpdateLabel, useDeleteLabel } from '../../hooks/admin/useLabels';
import { useAccounts } from '../../hooks/admin/useAccounts';
import { useToast } from '../../hooks/use-toast';
import { format } from 'date-fns';
import { LabelFormModal } from '../../components/admin/labels/LabelFormModal';
import { LabelEditModal } from '../../components/admin/labels/LabelEditModal';
import { ConfirmDeleteLabelDialog } from '../../components/admin/labels/ConfirmDeleteLabelDialog';
import { LabelsTable } from '../../components/admin/labels/LabelsTable';
import { SearchField } from '../../components/admin/shared/SearchField';
import { ClientFilter } from '../../components/admin/shared/ClientFilter';
import { Label } from '../../models/admin';

export const LabelsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [deletingLabel, setDeletingLabel] = useState<Label | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  
  const { data: labels, isLoading } = useLabels();
  const { data: accounts = [] } = useAccounts();
  const createLabelMutation = useCreateLabel();
  const updateLabelMutation = useUpdateLabel();
  const deleteLabelMutation = useDeleteLabel();
  const { toast } = useToast();

  // Filter and search labels
  const filteredLabels = useMemo(() => {
    if (!labels) return [];
    
    let filtered = labels;
    
    // Filter by account
    if (selectedAccountId) {
      filtered = filtered.filter(label => label.account_id === selectedAccountId);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(label => 
        label.title.toLowerCase().includes(query) ||
        label.slug?.toLowerCase().includes(query) ||
        label.description?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [labels, selectedAccountId, searchQuery]);

  const handleCreateLabel = async (data: any) => {
    try {
      await createLabelMutation.mutateAsync(data);
      setShowCreateForm(false);
      toast({
        title: "Label criada",
        description: "Label criada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar label. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLabel = async (id: number, data: any) => {
    try {
      await updateLabelMutation.mutateAsync({ id, data });
      setEditingLabel(null);
      toast({
        title: "Label atualizada",
        description: "Label atualizada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar label. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLabel = async () => {
    if (!deletingLabel) return;
    
    try {
      await deleteLabelMutation.mutateAsync(deletingLabel.id);
      setDeletingLabel(null);
      toast({
        title: "Label excluída",
        description: "Label excluída com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir label. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Labels</h1>
          <p className="text-muted-foreground">
            Organize conversations and contacts with labels
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Label
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por nome, slug ou descrição..."
          className="flex-1"
        />
        <ClientFilter
          selectedAccountId={selectedAccountId}
          onAccountChange={setSelectedAccountId}
        />
      </div>

      {/* Labels Cloud */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Labels Cloud
          </CardTitle>
          <CardDescription>
            Visual overview of all labels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            {searchQuery || selectedAccountId ? 'Nenhuma label encontrada com os filtros aplicados' : 'No labels created yet'}
          </p>
        </CardContent>
      </Card>

      {/* Labels Table */}
      <LabelsTable
        labels={filteredLabels}
        isLoading={isLoading}
        onEdit={setEditingLabel}
        onDelete={setDeletingLabel}
        accounts={accounts}
      />

      {!isLoading && (!filteredLabels || filteredLabels.length === 0) && !searchQuery && !selectedAccountId && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">
              <div className="text-lg font-medium mb-2">No labels yet</div>
              <div className="text-sm">
                Create labels to organize conversations and contacts
              </div>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Create Your First Label
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <LabelFormModal
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSubmit={handleCreateLabel}
        isLoading={createLabelMutation.isPending}
      />

      <LabelEditModal
        open={!!editingLabel}
        onOpenChange={(open) => !open && setEditingLabel(null)}
        onSubmit={handleUpdateLabel}
        isLoading={updateLabelMutation.isPending}
        label={editingLabel}
      />

      <ConfirmDeleteLabelDialog
        open={!!deletingLabel}
        onOpenChange={(open) => !open && setDeletingLabel(null)}
        onConfirm={handleDeleteLabel}
        isLoading={deleteLabelMutation.isPending}
        label={deletingLabel}
      />
    </div>
  );
};