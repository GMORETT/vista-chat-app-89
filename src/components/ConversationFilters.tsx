import React from 'react';
import { useConversationStore } from '../state/conversationStore';
import { AssignType, StatusType, SortBy } from '../models';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

export const ConversationFilters: React.FC = () => {
  const { filters, searchQuery, setFilters, setSearchQuery } = useConversationStore();

  const assigneeOptions: { value: AssignType; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'me', label: 'Minhas' },
    { value: 'assigned', label: 'Atribuídas' },
    { value: 'unassigned', label: 'Não atribuídas' },
  ];

  const statusOptions: { value: StatusType; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'open', label: 'Abertas' },
    { value: 'pending', label: 'Pendentes' },
    { value: 'snoozed', label: 'Adiadas' },
    { value: 'resolved', label: 'Resolvidas' },
  ];

  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'last_activity_at_desc', label: 'Atividade recente' },
    { value: 'last_activity_at_asc', label: 'Atividade antiga' },
    { value: 'created_at_desc', label: 'Mais recentes' },
    { value: 'created_at_asc', label: 'Mais antigas' },
    { value: 'priority_desc', label: 'Prioridade alta' },
    { value: 'priority_asc', label: 'Prioridade baixa' },
    { value: 'waiting_since_desc', label: 'Aguardando há mais tempo' },
    { value: 'waiting_since_asc', label: 'Aguardando há menos tempo' },
  ];

  return (
    <div className="p-4 border-b border-border bg-card">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted h-4 w-4" />
        <Input
          placeholder="Buscar conversas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Select
          value={filters.assignee_type}
          onValueChange={(value: AssignType) => setFilters({ assignee_type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Atribuição" />
          </SelectTrigger>
          <SelectContent>
            {assigneeOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value: StatusType) => setFilters({ status: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.sort_by}
          onValueChange={(value: SortBy) => setFilters({ sort_by: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Ordenação" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};