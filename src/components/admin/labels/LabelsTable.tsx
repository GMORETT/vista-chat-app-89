import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
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
import { Skeleton } from '../../ui/skeleton';
import { Label } from '../../../models/admin';

interface LabelsTableProps {
  labels: Label[];
  isLoading: boolean;
  onEdit: (label: Label) => void;
  onDelete: (label: Label) => void;
  accounts?: Array<{ id: number; name: string }>;
}

export const LabelsTable: React.FC<LabelsTableProps> = ({
  labels,
  isLoading,
  onEdit,
  onDelete,
  accounts = [],
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!labels || labels.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="text-lg font-medium mb-2">Nenhuma label encontrada</div>
        <div className="text-sm">
          Crie sua primeira label para começar a organizar conversas
        </div>
      </div>
    );
  }

  const getAccountName = (accountId: number) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || `Cliente ${accountId}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">Cor</TableHead>
            <TableHead className="w-16">ID</TableHead>
            <TableHead>Nome da Label</TableHead>
            <TableHead className="w-20">Status</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="w-32">Criado em</TableHead>
            <TableHead className="w-32 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {labels.map((label) => (
            <TableRow key={label.id}>
              <TableCell>
                <div 
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: label.color }}
                />
              </TableCell>
              <TableCell className="font-mono text-sm">
                {label.id}
              </TableCell>
              <TableCell className="font-medium">
                {label.title}
              </TableCell>
              <TableCell>
                {getStatusBadge(label.status || 'active')}
              </TableCell>
              <TableCell className="text-sm">
                {label.account_id ? getAccountName(label.account_id) : 'Global'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(label.created_at), { addSuffix: true })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(label)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(label)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
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