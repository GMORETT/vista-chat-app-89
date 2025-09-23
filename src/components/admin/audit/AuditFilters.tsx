import React from 'react';
import { AuditLogFilters } from '../../../models/audit';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Data Inicial</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.start_date ? 
                  format(new Date(filters.start_date), 'dd/MM/yyyy', { locale: ptBR }) : 
                  'Selecionar data'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.start_date ? new Date(filters.start_date) : undefined}
                onSelect={(date) => 
                  handleFilterChange('start_date', date ? date.toISOString().split('T')[0] : undefined)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Data Final</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.end_date ? 
                  format(new Date(filters.end_date), 'dd/MM/yyyy', { locale: ptBR }) : 
                  'Selecionar data'
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.end_date ? new Date(filters.end_date) : undefined}
                onSelect={(date) => 
                  handleFilterChange('end_date', date ? date.toISOString().split('T')[0] : undefined)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Actor Role */}
        <div className="space-y-2">
          <Label>Função</Label>
          <Select
            value={filters.actor_role || ''}
            onValueChange={(value) => 
              handleFilterChange('actor_role', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as funções" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as funções</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Entity Type */}
        <div className="space-y-2">
          <Label>Tipo de Entidade</Label>
          <Select
            value={filters.entity_type || ''}
            onValueChange={(value) => 
              handleFilterChange('entity_type', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as entidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as entidades</SelectItem>
              <SelectItem value="account">Conta</SelectItem>
              <SelectItem value="inbox">Inbox</SelectItem>
              <SelectItem value="label">Label</SelectItem>
              <SelectItem value="agent">Agente</SelectItem>
              <SelectItem value="team">Team</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action */}
        <div className="space-y-2">
          <Label>Ação</Label>
          <Select
            value={filters.action || ''}
            onValueChange={(value) => 
              handleFilterChange('action', value === 'all' ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas as ações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="create">Criar</SelectItem>
              <SelectItem value="update">Atualizar</SelectItem>
              <SelectItem value="delete">Excluir</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Success */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.success !== undefined ? filters.success.toString() : ''}
            onValueChange={(value) => 
              handleFilterChange('success', value === 'all' ? undefined : value === 'true')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="true">Sucesso</SelectItem>
              <SelectItem value="false">Erro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Account ID */}
        <div className="space-y-2">
          <Label>ID da Conta</Label>
          <Input
            type="number"
            placeholder="ID da conta"
            value={filters.account_id || ''}
            onChange={(e) => 
              handleFilterChange('account_id', e.target.value ? parseInt(e.target.value) : undefined)
            }
          />
        </div>

        {/* Actor ID */}
        <div className="space-y-2">
          <Label>ID do Usuário</Label>
          <Input
            type="number"
            placeholder="ID do usuário"
            value={filters.actor_id || ''}
            onChange={(e) => 
              handleFilterChange('actor_id', e.target.value ? parseInt(e.target.value) : undefined)
            }
          />
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
};