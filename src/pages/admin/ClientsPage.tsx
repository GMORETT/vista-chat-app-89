import React, { useState, useMemo } from 'react';
import { Plus, Building2, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useToast } from '../../hooks/use-toast';
import { Account, UpdateAccountRequest } from '../../models/chat';
import { AccountsTable } from '../../components/admin/accounts/AccountsTable';
import { AccountFormModal } from '../../components/admin/accounts/AccountFormModal';
import { AccountEditModal } from '../../components/admin/accounts/AccountEditModal';
import { ConfirmDeleteAccountDialog } from '../../components/admin/accounts/ConfirmDeleteAccountDialog';
import { ConfirmStatusChangeDialog } from '../../components/admin/accounts/ConfirmStatusChangeDialog';
import {
  useListAccounts,
  useCreateAccount,
  useUpdateAccount,
  useUpdateAccountStatus,
  useDeleteAccount,
} from '../../hooks/admin/useAccounts';
import { useOptimisticAccounts } from '../../hooks/admin/useOptimisticAccounts';

export const ClientsPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [pendingStatus, setPendingStatus] = useState<'active' | 'inactive'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [serverSearch, setServerSearch] = useState('');

  const { toast } = useToast();

  // Queries and mutations
  const { data: serverAccounts = [], isLoading, refetch } = useListAccounts();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const updateAccountStatusMutation = useUpdateAccountStatus();
  const deleteAccountMutation = useDeleteAccount();

  const {
    accounts,
    addOptimisticAccount,
    replaceOptimisticAccount,
    markAccountError,
    removeOptimisticAccount,
  } = useOptimisticAccounts(serverAccounts);

  // Client-side filter for immediate feedback
  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return accounts;
    return accounts.filter(account => 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  // Handle search with Enter key for server-side search
  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setServerSearch(searchTerm);
      refetch();
    }
  };

  const handleCreateAccount = async (data: { name: string }) => {
    const tempId = addOptimisticAccount({
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setShowCreateModal(false);
    
    try {
      const realAccount = await createAccountMutation.mutateAsync(data);
      replaceOptimisticAccount(tempId, realAccount);
      toast({
        title: 'Cliente criado',
        description: 'O cliente foi criado com sucesso.',
      });
    } catch (error) {
      console.error('Error creating account:', error);
      markAccountError(tempId, 'Erro ao criar cliente');
      toast({
        title: 'Cliente criado localmente',
        description: `O cliente "${data.name}" foi criado localmente. Será sincronizado quando possível.`,
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

  const handleToggleStatus = (account: Account, newStatus: 'active' | 'inactive') => {
    setSelectedAccount(account);
    setPendingStatus(newStatus);
    setShowStatusDialog(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedAccount) return;

    try {
      await updateAccountStatusMutation.mutateAsync({ 
        id: selectedAccount.id, 
        status: pendingStatus
      });
      setShowStatusDialog(false);
      setSelectedAccount(null);
      
      // Effects based on status change
      if (pendingStatus === 'inactive') {
        console.log(`[CLIENT_MANAGEMENT] Cliente ${selectedAccount.name} inativado - acesso de agentes desabilitado`);
        toast({
          title: 'Cliente desativado',
          description: 'O cliente foi desativado e todos os agentes associados perderam acesso.',
        });
      } else {
        console.log(`[CLIENT_MANAGEMENT] Cliente ${selectedAccount.name} reativado - acesso de agentes restaurado`);
        toast({
          title: 'Cliente ativado',
          description: 'O cliente foi ativado com sucesso.',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao alterar status',
        description: 'Ocorreu um erro ao alterar o status do cliente. Tente novamente.',
        variant: 'destructive',
      });
    }
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

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar clientes por nome ou slug... (Enter para busca no servidor)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="pl-10"
          />
        </div>
      </div>

      <AccountsTable
        accounts={filteredAccounts}
        isLoading={isLoading}
        onEdit={handleEditAccount}
        onDelete={handleDeleteAccount}
        onToggleStatus={handleToggleStatus}
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

      <ConfirmStatusChangeDialog
        open={showStatusDialog}
        onOpenChange={setShowStatusDialog}
        account={selectedAccount}
        newStatus={pendingStatus}
        onConfirm={handleConfirmStatusChange}
        isLoading={updateAccountStatusMutation.isPending}
      />
    </div>
  );
};