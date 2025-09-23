import React, { useState } from 'react';
import { Filter, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useUiStore } from '../state/uiStore';
import { useToast } from '../hooks/use-toast';
import { AdvancedFiltersModal } from './AdvancedFiltersModal';
import { SortByPopover } from './SortByPopover';
import { useFilterStore } from '../state/stores/filterStore';
import { useConversationStore } from '../state/stores/conversationStore';

export const ConversationToolbar: React.FC = () => {
  const { isExpanded, setIsExpanded } = useUiStore();
  const { filters, resetFilters } = useFilterStore();
  const { selectedConversationId } = useConversationStore();
  const { toast } = useToast();
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Check if any advanced filters are active (excluding assignee_type which is controlled by tabs)
  const hasActiveFilters = filters.status !== 'all' || 
    filters.inbox_id !== undefined || 
    filters.team_id !== undefined || 
    (filters.labels && filters.labels.length > 0) ||
    filters.updated_within !== undefined;

  const handleExpandToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClearFilters = () => {
    resetFilters();
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos.",
    });
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-3 bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFiltersModal(true)}
          className={`h-8 px-2 ${hasActiveFilters ? 'text-primary hover:text-primary/80' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Filter className={`h-4 w-4 mr-2 ${hasActiveFilters ? 'fill-current' : ''}`} />
          Filter conversations
        </Button>

        {hasActiveFilters && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear all filters</p>
            </TooltipContent>
          </Tooltip>
        )}

        <SortByPopover />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandToggle}
              disabled={!selectedConversationId}
              className={`h-8 w-8 p-0 ${!selectedConversationId ? 'text-muted-foreground/50' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {isExpanded ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{!selectedConversationId ? 'Selecione uma conversa para expandir a tela' : 'Switch the layout'}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <AdvancedFiltersModal 
        open={showFiltersModal}
        onOpenChange={setShowFiltersModal}
      />
    </TooltipProvider>
  );
};