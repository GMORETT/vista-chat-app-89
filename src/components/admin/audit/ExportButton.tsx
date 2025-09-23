import React from 'react';
import { AuditLogFilters } from '../../../models/audit';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Download, FileText, FileJson } from 'lucide-react';
import { useExportAuditLogs } from '../../../hooks/admin/useAuditLogs';
import { useToast } from '../../../hooks/use-toast';

interface ExportButtonProps {
  filters: AuditLogFilters;
}

export const ExportButton: React.FC<ExportButtonProps> = ({ filters }) => {
  const exportMutation = useExportAuditLogs();
  const { toast } = useToast();

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const blob = await exportMutation.mutateAsync({ format, filters });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `audit-logs-${timestamp}.${format}`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Concluído",
        description: `Logs exportados em formato ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Erro no Export",
        description: "Não foi possível exportar os logs",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          disabled={exportMutation.isPending}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {exportMutation.isPending ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="mr-2 h-4 w-4" />
          Exportar JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};