import React from 'react';
import { useConversationStore } from '../state/conversationStore';
import { AssignType } from '../models';
import { Badge } from './ui/badge';
import { mockConversationMeta } from '../data/mockData';

export const TabsCounts: React.FC = () => {
  const { filters, setFilters } = useConversationStore();

  // Use mock data with fallback to store meta
  const meta = mockConversationMeta;

  const tabs: { value: AssignType; label: string; count: number }[] = [
    { value: 'me', label: 'Minhas', count: meta.mine_count },
    { value: 'unassigned', label: 'Não Atribuídas', count: meta.unassigned_count },
    { value: 'assigned', label: 'Atribuídas', count: meta.assigned_count },
    { value: 'all', label: 'Todas', count: meta.all_count },
  ];

  return (
    <div className="flex border-b border-border bg-card">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => setFilters({ assignee_type: tab.value })}
          className={`
            relative flex-1 flex items-center justify-center gap-2 py-4 px-3 text-sm font-heading 
            transition-all duration-200 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/20
            ${filters.assignee_type === tab.value
              ? 'text-primary bg-primary/5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <span className="truncate">{tab.label}</span>
          <Badge 
            variant="secondary" 
            className={`
              min-w-[24px] h-5 text-xs font-semibold transition-colors
              ${filters.assignee_type === tab.value 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-muted text-muted-foreground'
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