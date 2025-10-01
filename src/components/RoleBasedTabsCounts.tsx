import React from 'react';
import { useFilterStore } from '../state/stores/filterStore';
import { useConversationsMeta } from '../hooks/useConversations';
import { AssignType } from '../models';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentClient } from '../hooks/useCurrentClient';

export const RoleBasedTabsCounts: React.FC = () => {
  const { user } = useAuth();
  const { filters, activeTab, setActiveTab } = useFilterStore();
  const { currentAccountId } = useCurrentClient();
  
  // Use current active filters for tab counts to reflect filtered results
  const tabCountsFilters = { 
    ...filters,
    assignee_type: 'all' as const, // Don't filter by assignee_type for counts
    account_id: currentAccountId, // Include current account filter
  };
  
  const { data: metaData, isLoading } = useConversationsMeta(tabCountsFilters);

  // Use real data or fallback to mock
  const counts = metaData || { mine_count: 0, unassigned_count: 0, assigned_count: 0, all_count: 0 };

  // Define tabs based on user role
  const getAllTabs = () => [
    { value: 'me', label: 'Minhas', shortLabel: 'Minhas', countKey: 'mine_count' as keyof typeof counts },
    { value: 'unassigned', label: 'Não Atribuídas', shortLabel: 'Não atrib.', countKey: 'unassigned_count' as keyof typeof counts },
    { value: 'all', label: 'Todas', shortLabel: 'Todas', countKey: 'all_count' as keyof typeof counts },
  ];

  const getUserTabs = () => [
    { value: 'me', label: 'Minhas Conversas', shortLabel: 'Minhas', countKey: 'mine_count' as keyof typeof counts },
  ];

  const tabs = user?.role === 'user' ? getUserTabs() : getAllTabs();

  const handleTabChange = (value: string) => {
    const assigneeType = value as AssignType;
    setActiveTab(assigneeType);
  };

  // For users with 'user' role, don't show tabs if there's only one option
  if (user?.role === 'user') {
    return (
      <div className="border-b border-border bg-card">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Minhas Conversas</span>
            <Badge 
              variant="secondary" 
              className="min-w-[24px] h-5 text-xs font-semibold px-2"
            >
              {isLoading ? '...' : counts.mine_count}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto border-b border-border bg-card">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleTabChange(tab.value)}
          className={`
            relative shrink-0 inline-flex items-center justify-center gap-1.5 py-3 px-2.5 text-xs font-heading 
            transition-all duration-200 hover:bg-accent/10 focus:outline-none focus:ring-2 focus:ring-primary/20
            ${activeTab === tab.value
              ? 'text-primary bg-primary/5 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <span className="truncate text-center">{tab.label}</span>
          <Badge 
            variant="secondary" 
            className={`
              min-w-[20px] h-4 text-xs font-semibold transition-colors px-1 shrink-0
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