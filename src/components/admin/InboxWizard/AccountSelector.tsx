import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';
import { Account } from '@/models/chat';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccount: Account | null;
  onSelectAccount: (account: Account) => void;
  isLoading?: boolean;
  disabled?: boolean;
  currentUserRole?: string;
}

export const AccountSelector: React.FC<AccountSelectorProps> = ({
  accounts,
  selectedAccount,
  onSelectAccount,
  isLoading = false,
  disabled = false,
  currentUserRole
}) => {
  const isSuperAdmin = currentUserRole === 'super_admin';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="account-select" className="flex items-center space-x-1">
          <Building2 className="w-4 h-4" />
          <span>Cliente</span>
          <span className="text-destructive">*</span>
        </Label>
        {!isSuperAdmin && (
          <Badge variant="secondary" className="text-xs">
            Pré-selecionado
          </Badge>
        )}
      </div>
      
      <Select
        value={selectedAccount?.id.toString() || ''}
        onValueChange={(value) => {
          const account = accounts.find(acc => acc.id.toString() === value);
          if (account) {
            onSelectAccount(account);
          }
        }}
        disabled={disabled || isLoading || !isSuperAdmin}
      >
        <SelectTrigger>
          <SelectValue 
            placeholder={
              isLoading 
                ? "Carregando clientes..." 
                : "Selecione um cliente"
            } 
          />
        </SelectTrigger>
        <SelectContent>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{account.name}</span>
                {account.status && (
                  <Badge 
                    variant={account.status === 'active' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {account.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {!isSuperAdmin && selectedAccount && (
        <p className="text-xs text-muted-foreground">
          Como {currentUserRole || 'admin'}, você só pode criar inboxes para sua conta: <strong>{selectedAccount.name}</strong>
        </p>
      )}
      
      {isSuperAdmin && !selectedAccount && (
        <p className="text-xs text-muted-foreground">
          Selecione o cliente para o qual deseja criar esta inbox
        </p>
      )}
    </div>
  );
};