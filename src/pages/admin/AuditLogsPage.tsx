import React, { useState } from 'react';
import { AuditFilters } from '../../components/admin/audit/AuditFilters';
import { AuditTable } from '../../components/admin/audit/AuditTable';
import { AuditDetailModal } from '../../components/admin/audit/AuditDetailModal';
import { ExportButton } from '../../components/admin/audit/ExportButton';
import { useAuditLogs } from '../../hooks/admin/useAuditLogs';
import { AuditLogFilters, AuditLog } from '../../models/audit';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Shield, AlertTriangle } from 'lucide-react';
import { useValidateAuditChain } from '../../hooks/admin/useAuditLogs';
import { Button } from '../../components/ui/button';
import { useToast } from '../../hooks/use-toast';

export const AuditLogsPage: React.FC = () => {
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const { toast } = useToast();
  
  const { data: logsData, isLoading, error } = useAuditLogs(filters, currentPage);
  const validateChain = useValidateAuditChain();

  const handleFilterChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleValidateChain = async () => {
    try {
      const result = await validateChain.mutateAsync(undefined);
      
      if (result.valid) {
        toast({
          title: "Integridade Verificada",
          description: "A cadeia de hash está íntegra. Nenhuma alteração detectada.",
        });
      } else {
        toast({
          title: "Integridade Comprometida",
          description: result.error || "Alterações detectadas na cadeia de auditoria.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na Validação",
        description: "Não foi possível validar a integridade da cadeia.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p>Erro ao carregar logs de auditoria: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logs de Auditoria</h1>
          <p className="text-muted-foreground">
            Visualize e monitore todas as atividades administrativas
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleValidateChain}
            disabled={validateChain.isPending}
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {validateChain.isPending ? 'Validando...' : 'Validar Integridade'}
          </Button>
          
          <ExportButton filters={filters} />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditFilters filters={filters} onFiltersChange={handleFilterChange} />
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Logs de Auditoria
            {logsData && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({logsData.meta.total_count} registros)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AuditTable
            data={logsData}
            isLoading={isLoading}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onRowClick={setSelectedLog}
          />
        </CardContent>
      </Card>

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