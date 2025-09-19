import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { useAccounts } from '../../../hooks/admin/useAccounts';

interface ClientFilterProps {
  selectedAccountId?: number | null;
  onAccountChange: (accountId: number | null) => void;
  className?: string;
}

export const ClientFilter: React.FC<ClientFilterProps> = ({
  selectedAccountId,
  onAccountChange,
  className = "",
}) => {
  const { data: accounts = [] } = useAccounts();

  const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={`gap-2 ${className}`}>
          <Filter className="h-4 w-4" />
          {selectedAccount ? selectedAccount.name : 'Todos os Clientes'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => onAccountChange(null)}>
          Todos os Clientes
        </DropdownMenuItem>
        {accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onClick={() => onAccountChange(account.id)}
          >
            {account.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};