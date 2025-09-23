import React from 'react';
import { AuditLog } from '../../../models/audit';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea } from '../../ui/scroll-area';

interface AuditDetailModalProps {
  log: AuditLog;
  open: boolean;
  onClose: () => void;
}

export const AuditDetailModal: React.FC<AuditDetailModalProps> = ({
  log,
  open,
  onClose,
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

  const renderJsonDiff = (before: any, after: any) => {
    if (!before && !after) {
      return <p className="text-muted-foreground">Nenhum dado disponível</p>;
    }

    return (
      <div className="space-y-4">
        {before && (
          <div>
            <h4 className="font-medium mb-2 text-destructive">Antes:</h4>
            <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
              {JSON.stringify(before, null, 2)}
            </pre>
          </div>
        )}
        
        {after && (
          <div>
            <h4 className="font-medium mb-2 text-green-600">Depois:</h4>
            <pre className="bg-muted p-3 rounded-md text-sm overflow-auto">
              {JSON.stringify(after, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Detalhes do Log de Auditoria</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-full">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ID do Request</label>
                <p className="font-mono text-sm">{log.request_id}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
                <p className="font-mono text-sm">
                  {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Usuário</label>
                <div className="flex items-center gap-2">
                  <span>ID: {log.actor_id || 'N/A'}</span>
                  <Badge variant="outline">{getRoleLabel(log.actor_role)}</Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">IP do Usuário</label>
                <p className="font-mono text-sm">{log.actor_ip}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Entidade</label>
                <div className="flex items-center gap-2">
                  <span>{getEntityTypeLabel(log.entity_type)}</span>
                  {log.cw_entity_id && (
                    <span className="text-xs text-muted-foreground">
                      (CW ID: {log.cw_entity_id})
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ação</label>
                <Badge variant="outline">{getActionLabel(log.action)}</Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Conta</label>
                <p>{log.account_id ? `#${log.account_id}` : 'N/A'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Badge variant={log.success ? 'default' : 'destructive'}>
                  {log.success ? 'Sucesso' : 'Erro'}
                </Badge>
              </div>
            </div>

            {/* Error Message */}
            {log.error_message && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Mensagem de Erro</label>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  <p className="text-destructive text-sm">{log.error_message}</p>
                </div>
              </div>
            )}

            <Separator />

            {/* Hash Information */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Informações de Integridade</h3>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Hash Atual</label>
                  <p className="font-mono text-xs bg-muted p-2 rounded break-all">{log.hash}</p>
                </div>
                
                {log.prev_hash && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Hash Anterior</label>
                    <p className="font-mono text-xs bg-muted p-2 rounded break-all">{log.prev_hash}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Data Changes */}
            <div className="space-y-3">
              <h3 className="text-lg font-medium">Alterações nos Dados</h3>
              {renderJsonDiff(log.before, log.after)}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};