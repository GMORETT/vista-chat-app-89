import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Eye, Download, Shield, AlertTriangle, Check, X } from 'lucide-react';
import { AuditLog } from '../../../models/audit';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InboxAuditTableProps {
  logs: AuditLog[];
  onRowClick: (log: AuditLog) => void;
  isLoading?: boolean;
}

export const InboxAuditTable: React.FC<InboxAuditTableProps> = ({
  logs,
  onRowClick,
  isLoading = false,
}) => {
  const getActionBadge = (action: string) => {
    const badges = {
      create: { variant: 'default' as const, label: 'Criar', icon: Shield },
      read: { variant: 'secondary' as const, label: 'Visualizar', icon: Eye },
      update: { variant: 'default' as const, label: 'Atualizar', icon: Shield },
      delete: { variant: 'destructive' as const, label: 'Excluir', icon: AlertTriangle },
    };
    
    const badge = badges[action as keyof typeof badges] || { 
      variant: 'outline' as const, 
      label: action, 
      icon: Shield 
    };
    
    const Icon = badge.icon;
    
    return (
      <Badge variant={badge.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {badge.label}
      </Badge>
    );
  };

  const getSuccessBadge = (success: boolean) => {
    return success ? (
      <Badge variant="default" className="gap-1 bg-green-100 text-green-800 border-green-200">
        <Check className="h-3 w-3" />
        Sucesso
      </Badge>
    ) : (
      <Badge variant="destructive" className="gap-1">
        <X className="h-3 w-3" />
        Erro
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      super_admin: { variant: 'default' as const, label: 'Super Admin' },
      admin: { variant: 'secondary' as const, label: 'Admin' },
      user: { variant: 'outline' as const, label: 'Usuário' },
      unknown: { variant: 'outline' as const, label: 'Desconhecido' },
    };
    
    const badge = badges[role as keyof typeof badges] || { 
      variant: 'outline' as const, 
      label: role 
    };
    
    return <Badge variant={badge.variant}>{badge.label}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    } catch {
      return timestamp;
    }
  };

  const getInboxDetails = (log: AuditLog) => {
    // Extract inbox name and type from the after data
    const after = log.after;
    if (after && typeof after === 'object') {
      const name = after.name || 'N/A';
      const channelType = after.channel_type || 'unknown';
      const phoneNumber = after.phone_number;
      
      return {
        name,
        channelType,
        phoneNumber,
        display: phoneNumber ? `${name} (${phoneNumber})` : name
      };
    }
    
    return {
      name: 'N/A',
      channelType: 'unknown',
      phoneNumber: null,
      display: 'N/A'
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria - Inboxes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="text-muted-foreground">Carregando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Logs de Auditoria - Inboxes
          <Badge variant="outline" className="ml-auto">
            {logs.length} registros
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum log de auditoria encontrado para os filtros selecionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Inbox</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const inboxDetails = getInboxDetails(log);
                  
                  return (
                    <TableRow 
                      key={log.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => onRowClick(log)}
                    >
                      <TableCell className="font-mono text-xs">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {log.actor_id ? `Usuário ${log.actor_id}` : 'Sistema'}
                          </div>
                          {getRoleBadge(log.actor_role)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getActionBadge(log.action)}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{inboxDetails.display}</div>
                          <div className="text-xs text-muted-foreground">
                            {inboxDetails.channelType.toUpperCase()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {log.account_id || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        {getSuccessBadge(log.success)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {log.actor_ip}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowClick(log);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};