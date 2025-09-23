import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccounts } from '../hooks/admin/useAccounts';
import { Account } from '../models/chat';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useCurrentClient } from '../hooks/useCurrentClient';
import { Building2 } from 'lucide-react';

export const ClientSelector: React.FC = () => {
  const { user } = useAuth();
  const { data: accounts, isLoading } = useAccounts();
  const { selectedAccountId, setSelectedAccountId } = useCurrentClient();

  // Only show for super admin
  if (user?.role !== 'super_admin') {
    return null;
  }

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId === 'all' ? null : parseInt(accountId));
  };

  const selectedAccount = accounts?.find(acc => acc.id === selectedAccountId);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-card">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">Cliente:</span>
      
      <Select
        value={selectedAccountId?.toString() || 'all'}
        onValueChange={handleAccountChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px] h-8">
          <SelectValue placeholder="Selecionar cliente">
            {isLoading ? (
              "Carregando..."
            ) : selectedAccount ? (
              <div className="flex items-center gap-2">
                <span>{selectedAccount.name}</span>
                <Badge 
                  variant={selectedAccount.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {selectedAccount.status}
                </Badge>
              </div>
            ) : (
              "Todos os clientes"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <span>Todos os clientes</span>
              <Badge variant="outline" className="text-xs">
                Global
              </Badge>
            </div>
          </SelectItem>
          {accounts?.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              <div className="flex items-center gap-2">
                <span>{account.name}</span>
                <Badge 
                  variant={account.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {account.status}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};