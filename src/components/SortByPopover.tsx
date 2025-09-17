import React from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { useConversationStore } from '../state/conversationStore';
import { SortBy } from '../models';

interface SortOption {
  value: SortBy;
  label: string;
  group: string;
}

const sortOptions: SortOption[] = [
  { value: 'last_activity_at_desc', label: 'Newest first', group: 'Last activity' },
  { value: 'last_activity_at_asc', label: 'Oldest first', group: 'Last activity' },
  { value: 'created_at_desc', label: 'Newest first', group: 'Created at' },
  { value: 'created_at_asc', label: 'Oldest first', group: 'Created at' },
  { value: 'priority_desc', label: 'Highest first', group: 'Priority' },
  { value: 'priority_asc', label: 'Lowest first', group: 'Priority' },
  { value: 'waiting_since_desc', label: 'Longest first', group: 'Pending Response' },
  { value: 'waiting_since_asc', label: 'Shortest first', group: 'Pending Response' },
];

export const SortByPopover: React.FC = () => {
  const { filters, setFilters } = useConversationStore();

  const currentSort = sortOptions.find(option => option.value === filters.sort_by);
  
  // Group options by category
  const groupedOptions = sortOptions.reduce((acc, option) => {
    if (!acc[option.group]) {
      acc[option.group] = [];
    }
    acc[option.group].push(option);
    return acc;
  }, {} as Record<string, SortOption[]>);

  const handleSortChange = (sortBy: SortBy) => {
    setFilters({ ...filters, sort_by: sortBy });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span className="text-sm">Sort by</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="p-3">
          <h4 className="font-medium text-sm mb-3">Sort conversations by</h4>
          
          {Object.entries(groupedOptions).map(([group, options]) => (
            <div key={group} className="mb-3 last:mb-0">
              <div className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                {group}
              </div>
              <div className="space-y-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`
                      w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors
                      ${currentSort?.value === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};