import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Inbox, Edit, Users, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Channel } from '../../models/admin';
import { 
  useClientInboxes, 
  useCreateClientInbox, 
  useUpdateClientInbox, 
  useDeleteClientInbox 
} from '../../hooks/admin/useClientInboxes';
import { ClientInboxesTable } from '../../components/admin/inboxes/ClientInboxesTable';
import { ClientInboxWizard } from '../../components/admin/inboxes/ClientInboxWizard';
import { ClientInboxEditModal } from '../../components/admin/inboxes/ClientInboxEditModal';
import { ClientInboxMembersModal } from '../../components/admin/inboxes/ClientInboxMembersModal';
import { ConfirmDeleteInboxDialog } from '../../components/admin/inboxes/ConfirmDeleteInboxDialog';
import { Skeleton } from '../../components/ui/skeleton';

export const ClientInboxesPage: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showWizard, setShowWizard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedInbox, setSelectedInbox] = useState<Channel | null>(null);

  const accountIdNum = accountId ? parseInt(accountId, 10) : 0;

  // Queries and mutations
  const { data: inboxes = [], isLoading, error } = useClientInboxes(accountIdNum);
  const createInboxMutation = useCreateClientInbox();
  const updateInboxMutation = useUpdateClientInbox();
  const deleteInboxMutation = useDeleteClientInbox();

  const handleCreateInbox = async (data: any) => {
    try {
      await createInboxMutation.mutateAsync({
        accountId: accountIdNum,
        data: {
          ...data,
          account_id: accountIdNum,
          channel_type: 'api', // Generic API channel for now
        }
      });
      setShowWizard(false);
      toast({
        title: 'Inbox criado',
        description: 'O inbox foi criado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar inbox',
        description: 'Ocorreu um erro ao criar o inbox. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleEditInbox = (inbox: Channel) => {
    setSelectedInbox(inbox);
    setShowEditModal(true);
  };

  const handleUpdateInbox = async (data: Partial<Channel>) => {
    if (!selectedInbox) return;

    try {
      await updateInboxMutation.mutateAsync({
        accountId: accountIdNum,
        inboxId: selectedInbox.id,
        data,
      });
      setShowEditModal(false);
      setSelectedInbox(null);
      toast({
        title: 'Inbox atualizado',
        description: 'O inbox foi atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar inbox',
        description: 'Ocorreu um erro ao atualizar o inbox. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleManageMembers = (inbox: Channel) => {
    setSelectedInbox(inbox);
    setShowMembersModal(true);
  };

  const handleDeleteInbox = (inbox: Channel) => {
    setSelectedInbox(inbox);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInbox) return;

    try {
      await deleteInboxMutation.mutateAsync({
        accountId: accountIdNum,
        inboxId: selectedInbox.id,
      });
      setShowDeleteDialog(false);
      setSelectedInbox(null);
      toast({
        title: 'Inbox excluído',
        description: 'O inbox foi excluído com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir inbox',
        description: 'Ocorreu um erro ao excluir o inbox. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (inbox: Channel) => {
    // Mock status logic - this would come from the backend
    const isConnected = Math.random() > 0.3; // 70% connected
    const isError = !isConnected && Math.random() > 0.5; // Some errors
    
    if (isConnected) {
      return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">Conectado</Badge>;
    } else if (isError) {
      return <Badge variant="destructive">Erro</Badge>;
    } else {
      return <Badge variant="outline">Desconectado</Badge>;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar inboxes</h2>
          <p className="text-muted-foreground mb-4">Ocorreu um erro ao carregar os inboxes deste cliente.</p>
          <Button onClick={() => navigate('/admin/clients')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/clients')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Clientes
          </Button>
          <div className="h-6 w-px bg-border" />
          <Inbox className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Inboxes do Cliente</h1>
            <p className="text-muted-foreground">
              Cliente #{accountId} - Gerencie os canais de comunicação
            </p>
          </div>
        </div>
        <Button onClick={() => setShowWizard(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Inbox
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : inboxes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Nenhum inbox configurado</CardTitle>
            <CardDescription className="text-center">
              Este cliente ainda não possui inboxes configurados.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => setShowWizard(true)} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Criar Primeiro Inbox
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ClientInboxesTable
          inboxes={inboxes}
          onEdit={handleEditInbox}
          onManageMembers={handleManageMembers}
          onDelete={handleDeleteInbox}
          getStatusBadge={getStatusBadge}
        />
      )}

      {/* Modals */}
      <ClientInboxWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onSubmit={handleCreateInbox}
        isLoading={createInboxMutation.isPending}
      />

      <ClientInboxEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        inbox={selectedInbox}
        onSubmit={handleUpdateInbox}
        isLoading={updateInboxMutation.isPending}
      />

      <ClientInboxMembersModal
        open={showMembersModal}
        onOpenChange={setShowMembersModal}
        inbox={selectedInbox}
      />

      <ConfirmDeleteInboxDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        inbox={selectedInbox}
        onConfirm={handleConfirmDelete}
        isLoading={deleteInboxMutation.isPending}
      />
    </div>
  );
};