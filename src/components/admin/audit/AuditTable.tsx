import React from 'react';
import { AuditLog, AuditLogResponse } from '../../../models/audit';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Skeleton } from '../../ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditTableProps {
  data?: AuditLogResponse;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onRowClick: (log: AuditLog) => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({
  data,
  isLoading,
  currentPage,
  onPageChange,
  onRowClick,
}) => {
  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      account: 'Conta',
      inbox: 'Inbox',
      label: 'Label',
      agent: 'Agente',
      team: 'Team',
    };
    return labels[type] || type;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Criar',
      update: 'Atualizar',
      delete: 'Excluir',
    };
    return labels[action] || action;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      user: 'Usuário',
      unknown: 'Desconhecido',
    };
    return labels[role] || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'user':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.payload.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum log de auditoria encontrado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Conta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.payload.map((log) => (
              <TableRow
                key={log.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onRowClick(log)}
              >
                <TableCell className="font-mono text-sm">
                  {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">ID: {log.actor_id || 'N/A'}</span>
                    <span className="text-xs text-muted-foreground">
                      {log.actor_ip}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(log.actor_role)}>
                    {getRoleLabel(log.actor_role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {getEntityTypeLabel(log.entity_type)}
                  </span>
                  {log.cw_entity_id && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (#{log.cw_entity_id})
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getActionLabel(log.action)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {log.account_id ? `#${log.account_id}` : 'N/A'}
                </TableCell>
                <TableCell>
                  <Badge variant={log.success ? 'default' : 'destructive'}>
                    {log.success ? 'Sucesso' : 'Erro'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(log);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.meta.total_pages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {data.meta.current_page} de {data.meta.total_pages} 
            ({data.meta.total_count} registros)
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!data.meta.prev_page}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!data.meta.next_page}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};