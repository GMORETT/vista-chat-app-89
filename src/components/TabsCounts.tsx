import React from 'react';
import { useFilterStore } from '../state/stores/filterStore';
import { useConversationsMeta } from '../hooks/useConversations';
import { AssignType } from '../models';
import { Badge } from './ui/badge';
import { mockConversationMeta } from '../data/mockData';

export const TabsCounts: React.FC = () => {
  const { filters, activeTab, setActiveTab } = useFilterStore();
  
  // Use current active filters for tab counts to reflect filtered results
  const tabCountsFilters = { 
    ...filters,
    assignee_type: 'all' as const // Don't filter by assignee_type for counts
  };
  
  const { data: metaData, isLoading } = useConversationsMeta(tabCountsFilters);

  // Use real data or fallback to mock
  const counts = metaData || mockConversationMeta;

  const tabs: { value: AssignType; label: string; shortLabel: string; countKey: keyof typeof counts }[] = [
    { value: 'me', label: 'Minhas', shortLabel: 'Minhas', countKey: 'mine_count' },
    { value: 'unassigned', label: 'Não Atribuídas', shortLabel: 'Não atrib.', countKey: 'unassigned_count' },
    { value: 'all', label: 'Todas', shortLabel: 'Todas', countKey: 'all_count' },
  ];

  const handleTabChange = (value: string) => {
    const assigneeType = value as 'all' | 'assigned' | 'me' | 'unassigned';
    setActiveTab(assigneeType);
  };

  return (
    <div className="flex overflow-x-auto border-b border-border bg-card">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleTabChange(tab.value)}
          className={`
            relative shrink-0 inline-flex items-center justify-center gap-2 py-3 px-3 text-xs sm:text-sm font-heading 
            transition-all duration-200 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/20
            sm:py-4
            ${activeTab === tab.value
              ? 'text-primary bg-primary/5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <><span className="sm:hidden truncate text-center">{tab.shortLabel}</span><span className="hidden sm:inline truncate text-left">{tab.label}</span></>
          <Badge 
            variant="secondary" 
            className={`
              min-w-[20px] h-4 text-[10px] font-semibold transition-colors px-1 shrink-0
              sm:min-w-[24px] sm:h-5 sm:text-xs sm:px-2
              ${activeTab === tab.value 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-muted text-muted-foreground'
              }
              ${isLoading ? 'animate-pulse' : ''}
            `}
          >
            {isLoading ? '...' : counts[tab.countKey]}
          </Badge>
        </button>
      ))}
    </div>
  );
};