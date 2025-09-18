import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Edit, Trash2, Settings } from 'lucide-react';
import { Account } from '../../../models/chat';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { formatDistanceToNow } from 'date-fns';

interface AccountsTableProps {
  accounts: Account[];
  isLoading: boolean;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
}

export const AccountsTable: React.FC<AccountsTableProps> = ({
  accounts,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
                <TableCell><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-md">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum cliente encontrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Comece criando seu primeiro cliente.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspenso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-mono">{account.id}</TableCell>
              <TableCell className="font-medium">{account.name}</TableCell>
              <TableCell className="text-muted-foreground">{account.slug}</TableCell>
              <TableCell>{getStatusBadge(account.status)}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link to={`/admin/inboxes?account_id=${account.id}&account_name=${encodeURIComponent(account.name)}`}>
                      <Settings className="h-4 w-4 mr-1" />
                      Canais
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(account)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};