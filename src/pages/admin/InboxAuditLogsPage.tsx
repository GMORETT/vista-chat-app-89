import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Shield, Download, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { InboxAuditFilters } from '../../components/admin/audit/InboxAuditFilters';
import { InboxAuditTable } from '../../components/admin/audit/InboxAuditTable';
import { AuditDetailModal } from '../../components/admin/audit/AuditDetailModal';
import { useAuditLogs, useValidateAuditChain, useExportAuditLogs } from '../../hooks/admin/useAuditLogs';
import { AuditLog, AuditLogFilters } from '../../models/audit';

export const InboxAuditLogsPage: React.FC = () => {
  const [filters, setFilters] = useState<AuditLogFilters>({ 
    entity_type: 'inbox' // Start with inbox filter active
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // API hooks
  const { data: auditData, isLoading, error } = useAuditLogs(filters, currentPage);
  const validateChainMutation = useValidateAuditChain();
  const exportMutation = useExportAuditLogs();

  const handleFilterChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleValidateChain = async () => {
    try {
      const result = await validateChainMutation.mutateAsync(filters.account_id);
      if (result.valid) {
        toast.success('Integridade da cadeia de auditoria verificada com sucesso!');
      } else {
        toast.error(`Erro na verificação da integridade: ${result.error}`);
      }
    } catch (error) {
      toast.error('Erro ao validar a cadeia de auditoria');
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const blob = await exportMutation.mutateAsync({ format, filters });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inbox-audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Logs exportados em formato ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Erro ao exportar logs de auditoria');
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Auditoria de Inboxes</h1>
            <p className="text-muted-foreground">
              Trilha de auditoria para operações em inboxes
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar logs de auditoria: {error.message}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Auditoria de Inboxes</h1>
          <p className="text-muted-foreground">
            Trilha de auditoria para operações em inboxes - criação, edição, exclusão e atribuições
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleValidateChain}
            disabled={validateChainMutation.isPending}
            className="gap-2"
          >
            <Shield className="h-4 w-4" />
            {validateChainMutation.isPending ? 'Validando...' : 'Verificar Integridade'}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              disabled={exportMutation.isPending}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('json')}
              disabled={exportMutation.isPending}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditData?.meta.total_count || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operações com Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {auditData?.payload.filter(log => log.success).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operações com Erro</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {auditData?.payload.filter(log => !log.success).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtros Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(filters).filter(v => v !== undefined && v !== '').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <InboxAuditFilters filters={filters} onFiltersChange={handleFilterChange} />

      {/* Table */}
      <InboxAuditTable
        logs={auditData?.payload || []}
        onRowClick={setSelectedLog}
        isLoading={isLoading}
      />

      {/* Pagination */}
      {auditData?.meta && auditData.meta.total_pages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {auditData.meta.current_page} de {auditData.meta.total_pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!auditData.meta.prev_page}
                  onClick={() => setCurrentPage(auditData.meta.prev_page!)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!auditData.meta.next_page}
                  onClick={() => setCurrentPage(auditData.meta.next_page!)}
                >
                  Próximo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <AuditDetailModal
          log={selectedLog}
          open={!!selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};