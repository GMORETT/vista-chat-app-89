import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

interface LabelSearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | 'active' | 'inactive';
  onStatusChange: (status: 'all' | 'active' | 'inactive') => void;
}

export const LabelSearchFilter: React.FC<LabelSearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}) => {
  return (
    <div className="flex gap-4 items-end">
      <div className="space-y-2 flex-1">
        <Label htmlFor="search">Buscar Labels</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Buscar por nome, slug ou descrição..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={statusFilter}
          onValueChange={(value: 'all' | 'active' | 'inactive') => onStatusChange(value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};