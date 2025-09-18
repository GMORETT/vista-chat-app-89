import React, { useState } from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';
import { Account, UpdateAccountRequest } from '../../models/chat';
import { AccountsTable } from '../../components/admin/accounts/AccountsTable';
import { AccountFormModal } from '../../components/admin/accounts/AccountFormModal';
import { AccountEditModal } from '../../components/admin/accounts/AccountEditModal';
import { ConfirmDeleteAccountDialog } from '../../components/admin/accounts/ConfirmDeleteAccountDialog';
import {
  useListAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from '../../hooks/admin/useAccounts';

export const ClientsPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const { toast } = useToast();

  // Queries and mutations
  const { data: accounts = [], isLoading } = useListAccounts();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();

  const handleCreateAccount = async (data: { name: string }) => {
    try {
      await createAccountMutation.mutateAsync(data);
      setShowCreateModal(false);
      toast({
        title: 'Cliente criado',
        description: 'O cliente foi criado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar cliente',
        description: 'Ocorreu um erro ao criar o cliente. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowEditModal(true);
  };

  const handleUpdateAccount = async (id: number, data: Partial<UpdateAccountRequest>) => {
    try {
      await updateAccountMutation.mutateAsync({ id, data });
      setShowEditModal(false);
      setSelectedAccount(null);
      toast({
        title: 'Cliente atualizado',
        description: 'O cliente foi atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar cliente',
        description: 'Ocorreu um erro ao atualizar o cliente. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAccount) return;

    try {
      await deleteAccountMutation.mutateAsync(selectedAccount.id);
      setShowDeleteDialog(false);
      setSelectedAccount(null);
      toast({
        title: 'Cliente excluído',
        description: 'O cliente foi excluído com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir cliente',
        description: 'Ocorreu um erro ao excluir o cliente. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie os clientes do sistema
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Criar Cliente
        </Button>
      </div>

      <AccountsTable
        accounts={accounts}
        isLoading={isLoading}
        onEdit={handleEditAccount}
        onDelete={handleDeleteAccount}
      />

      <AccountFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateAccount}
        isLoading={createAccountMutation.isPending}
      />

      <AccountEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        account={selectedAccount}
        onSubmit={handleUpdateAccount}
        isLoading={updateAccountMutation.isPending}
      />

      <ConfirmDeleteAccountDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        account={selectedAccount}
        onConfirm={handleConfirmDelete}
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  );
};