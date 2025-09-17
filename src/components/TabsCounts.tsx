import React from 'react';
import { useConversationStore } from '../state/conversationStore';
import { AssignType } from '../models';
import { Badge } from './ui/badge';

export const TabsCounts: React.FC = () => {
  const { filters, meta, setFilters } = useConversationStore();

  const tabs: { value: AssignType; label: string; count: number }[] = [
    { value: 'all', label: 'Todas', count: meta?.all_count || 0 },
    { value: 'me', label: 'Minhas', count: meta?.mine_count || 0 },
    { value: 'assigned', label: 'Atribuídas', count: meta?.assigned_count || 0 },
    { value: 'unassigned', label: 'Não atribuídas', count: meta?.unassigned_count || 0 },
  ];

  return (
    <div className="flex border-b border-border bg-card">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setFilters({ assignee_type: tab.value })}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors
            ${filters.assignee_type === tab.value
              ? 'text-primary border-b-2 border-primary bg-primary/5'
              : 'text-muted hover:text-foreground hover:bg-accent/5'
            }
          `}
        >
          <span>{tab.label}</span>
          <Badge 
            variant="secondary" 
            className={`
              ${filters.assignee_type === tab.value 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted'
              }
            `}
          >
            {tab.count}
          </Badge>
        </button>
      ))}
    </div>
  );
};