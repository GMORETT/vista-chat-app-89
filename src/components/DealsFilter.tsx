import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Filter, X, Search, DollarSign, User, Building2, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Deal } from '../types/crm';
import { useCrmDataStore } from '../stores/crmDataStore';

export interface DealFilters {
  search: string;
  minValue: string;
  maxValue: string;
  minProbability: string;
  maxProbability: string;
  assignedPerson: string;
  leadId: string;
  companyId: string;
}

interface DealsFilterProps {
  filters: DealFilters;
  onFiltersChange: (filters: DealFilters) => void;
  filteredCount: number;
  totalCount: number;
}

const initialFilters: DealFilters = {
  search: '',
  minValue: '',
  maxValue: '',
  minProbability: '',
  maxProbability: '',
  assignedPerson: '',
  leadId: '',
  companyId: ''
};

export const DealsFilter: React.FC<DealsFilterProps> = ({
  filters,
  onFiltersChange,
  filteredCount,
  totalCount
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { leads, companies, deals } = useCrmDataStore();

  // Get unique assigned persons from deals
  const uniqueAssignedPersons = Array.from(
    new Set(deals.map(deal => deal.assignedPerson.name))
  ).sort();

  const hasActiveFilters = Object.values(filters).some(value => value !== '');
  const activeFiltersCount = Object.values(filters).filter(value => value !== '').length;

  const handleFilterChange = (key: keyof DealFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange(initialFilters);
  };

  const clearSingleFilter = (key: keyof DealFilters) => {
    handleFilterChange(key, '');
  };

  return (
    <div className="flex items-center gap-2">
      {/* Filter Results Info */}
      {hasActiveFilters && (
        <div className="text-sm text-muted-foreground">
          {filteredCount} de {totalCount} negócios
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 max-w-md overflow-x-auto">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              <Search className="h-3 w-3" />
              {filters.search}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={() => clearSingleFilter('search')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {(filters.minValue || filters.maxValue) && (
            <Badge variant="secondary" className="gap-1">
              <DollarSign className="h-3 w-3" />
              {filters.minValue && `≥ ${filters.minValue}`}
              {filters.minValue && filters.maxValue && ' - '}
              {filters.maxValue && `≤ ${filters.maxValue}`}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={() => {
                  clearSingleFilter('minValue');
                  clearSingleFilter('maxValue');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {(filters.minProbability || filters.maxProbability) && (
            <Badge variant="secondary" className="gap-1">
              %
              {filters.minProbability && `≥ ${filters.minProbability}%`}
              {filters.minProbability && filters.maxProbability && ' - '}
              {filters.maxProbability && `≤ ${filters.maxProbability}%`}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={() => {
                  clearSingleFilter('minProbability');
                  clearSingleFilter('maxProbability');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.assignedPerson && (
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              {filters.assignedPerson}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={() => clearSingleFilter('assignedPerson')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.leadId && (
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              {leads.find(l => l.id === filters.leadId)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={() => clearSingleFilter('leadId')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.companyId && (
            <Badge variant="secondary" className="gap-1">
              <Building2 className="h-3 w-3" />
              {companies.find(c => c.id === filters.companyId)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 hover:bg-transparent"
                onClick={() => clearSingleFilter('companyId')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filtros de Negócios</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar todos
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Buscar</Label>
              <Input
                placeholder="Nome do negócio, lead ou empresa..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Value Range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Valor mínimo</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minValue}
                  onChange={(e) => handleFilterChange('minValue', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Valor máximo</Label>
                <Input
                  type="number"
                  placeholder="999999"
                  value={filters.maxValue}
                  onChange={(e) => handleFilterChange('maxValue', e.target.value)}
                />
              </div>
            </div>

            {/* Probability Range */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Probabilidade mín (%)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  min="0"
                  max="100"
                  value={filters.minProbability}
                  onChange={(e) => handleFilterChange('minProbability', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Probabilidade máx (%)</Label>
                <Input
                  type="number"
                  placeholder="100"
                  min="0"
                  max="100"
                  value={filters.maxProbability}
                  onChange={(e) => handleFilterChange('maxProbability', e.target.value)}
                />
              </div>
            </div>

            {/* Assigned Person */}
            <div className="space-y-2">
              <Label>Responsável</Label>
              <Select
                value={filters.assignedPerson}
                onValueChange={(value) => handleFilterChange('assignedPerson', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os responsáveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os responsáveis</SelectItem>
                  {uniqueAssignedPersons.map((person) => (
                    <SelectItem key={person} value={person}>
                      {person}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lead */}
            <div className="space-y-2">
              <Label>Lead</Label>
              <Select
                value={filters.leadId}
                onValueChange={(value) => handleFilterChange('leadId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os leads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os leads</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select
                value={filters.companyId}
                onValueChange={(value) => handleFilterChange('companyId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as empresas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as empresas</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};