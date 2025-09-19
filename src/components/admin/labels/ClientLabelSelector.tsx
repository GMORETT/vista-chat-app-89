import React from 'react';
import { useAccounts } from '../../../hooks/admin/useAccounts';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Label } from '../../ui/label';

export const ClientLabelSelector: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { data: accounts = [] } = useAccounts();

  const currentAccount = accounts.find(account => account.id === parseInt(accountId || '0'));

  const handleAccountChange = (value: string) => {
    if (value === 'all') {
      navigate('/admin/labels');
    } else {
      navigate(`/admin/clients/${value}/labels`);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Filtrar por Cliente</Label>
      <Select
        value={accountId || 'all'}
        onValueChange={handleAccountChange}
      >
        <SelectTrigger className="w-64">
          <SelectValue>
            {currentAccount ? currentAccount.name : 'Todos os Clientes'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Clientes</SelectItem>
          {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id.toString()}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};