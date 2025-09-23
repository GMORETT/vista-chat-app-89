import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { CalendarDays, RotateCcw } from 'lucide-react';
import { AuditLogFilters } from '../../../models/audit';

interface InboxAuditFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
}

export const InboxAuditFilters: React.FC<InboxAuditFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      entity_type: 'inbox', // Keep inbox filter always active
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Filtros de Auditoria - Inboxes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Account ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="account-filter" className="text-xs font-medium text-muted-foreground">
              Conta
            </Label>
            <Input
              id="account-filter"
              type="number"
              placeholder="ID da conta"
              value={filters.account_id || ''}
              onChange={(e) => handleFilterChange('account_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="h-8"
            />
          </div>

          {/* Actor ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="actor-filter" className="text-xs font-medium text-muted-foreground">
              Usuário
            </Label>
            <Input
              id="actor-filter"
              type="number"
              placeholder="ID do usuário"
              value={filters.actor_id || ''}
              onChange={(e) => handleFilterChange('actor_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="h-8"
            />
          </div>

          {/* Actor Role Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Perfil
            </Label>
            <Select
              value={filters.actor_role || ''}
              onValueChange={(value) => handleFilterChange('actor_role', value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos os perfis" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os perfis</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="unknown">Desconhecido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Ação
            </Label>
            <Select
              value={filters.action || ''}
              onValueChange={(value) => handleFilterChange('action', value)}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todas as ações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as ações</SelectItem>
                <SelectItem value="create">Criar</SelectItem>
                <SelectItem value="read">Visualizar</SelectItem>
                <SelectItem value="update">Atualizar</SelectItem>
                <SelectItem value="delete">Excluir</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Success Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">
              Status
            </Label>
            <Select
              value={filters.success !== undefined ? String(filters.success) : ''}
              onValueChange={(value) => handleFilterChange('success', value === '' ? undefined : value === 'true')}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="true">Sucesso</SelectItem>
                <SelectItem value="false">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filters */}
          <div className="space-y-2">
            <Label htmlFor="start-date" className="text-xs font-medium text-muted-foreground">
              Data Inicial
            </Label>
            <Input
              id="start-date"
              type="datetime-local"
              value={filters.start_date || ''}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="h-8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date" className="text-xs font-medium text-muted-foreground">
              Data Final
            </Label>
            <Input
              id="end-date"
              type="datetime-local"
              value={filters.end_date || ''}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="h-8"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="h-8"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};