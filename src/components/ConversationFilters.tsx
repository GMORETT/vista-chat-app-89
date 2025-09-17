import React, { useState, useEffect } from 'react';
import { useConversationStore } from '../state/conversationStore';
import { AssignType, StatusType, SortBy } from '../models';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Search, X, Filter } from 'lucide-react';
import { mockInboxes, mockTeams, mockLabels, mockAgents } from '../data/mockData';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

export const ConversationFilters: React.FC = () => {
  const { filters, searchQuery, setFilters, setSearchQuery } = useConversationStore();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearchQuery, setSearchQuery]);

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

  const inboxOptions = [
    { value: 'all', label: 'Todas as Caixas' },
    ...mockInboxes.map(inbox => ({
      value: inbox.id.toString(),
      label: inbox.name
    }))
  ];

  const teamOptions = [
    { value: 'all', label: 'Todas as Equipes' },
    ...mockTeams.map(team => ({
      value: team.id.toString(),
      label: team.name
    }))
  ];

  const agentOptions = [
    { value: 'all', label: 'Todos os Agentes' },
    ...mockAgents.map(agent => ({
      value: agent.id.toString(),
      label: agent.name
    }))
  ];

  const handleLabelToggle = (labelId: number) => {
    setSelectedLabels(prev => 
      prev.includes(labelId)
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const clearAllFilters = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
    setSelectedLabels([]);
    setFilters({
      assignee_type: 'all',
      status: 'open',
      sort_by: 'last_activity_at_desc',
      page: 1
    });
  };

  const hasActiveFilters = localSearchQuery || 
    filters.assignee_type !== 'all' ||
    filters.status !== 'open' ||
    selectedLabels.length > 0;

  return (
    <div className="border-b border-border bg-card">
      {/* Search Bar */}
      <div className="p-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar conversas por nome, email ou conteúdo..."
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {localSearchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocalSearchQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Filters */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select
            value={filters.assignee_type}
            onValueChange={(value: AssignType) => setFilters({ assignee_type: value })}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Atribuição" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
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
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
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
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Ordenação" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value="all"
            onValueChange={() => {}}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Caixa de Entrada" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {inboxOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Secondary Filters */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            value="all"
            onValueChange={() => {}}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Equipe" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {teamOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value="all"
            onValueChange={() => {}}
          >
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Agente" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {agentOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Labels */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-heading text-foreground">Labels</span>
          {selectedLabels.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {selectedLabels.length}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {mockLabels.map(label => (
            <Button
              key={label.id}
              variant={selectedLabels.includes(label.id) ? "default" : "outline"}
              size="sm"
              onClick={() => handleLabelToggle(label.id)}
              className="h-7 text-xs"
            >
              <div 
                className="w-2 h-2 rounded-full mr-2" 
                style={{ backgroundColor: label.color }}
              />
              {label.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="px-4 pb-4 border-t border-border pt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};