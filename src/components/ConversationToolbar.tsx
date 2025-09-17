import React, { useState } from 'react';
import { Filter, ArrowUpDown, Maximize, Minimize } from 'lucide-react';
import { Button } from './ui/button';
import { useUiStore } from '../state/uiStore';
import { AdvancedFiltersModal } from './AdvancedFiltersModal';
import { SortByPopover } from './SortByPopover';

export const ConversationToolbar: React.FC = () => {
  const { isExpanded, setIsExpanded } = useUiStore();
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2 p-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFiltersModal(true)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm">Filter conversations</span>
        </Button>

        <SortByPopover />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <Minimize className="h-4 w-4" />
              <span className="text-sm">Switch the layout</span>
            </>
          ) : (
            <>
              <Maximize className="h-4 w-4" />
              <span className="text-sm">Switch the layout</span>
            </>
          )}
        </Button>
      </div>

      <AdvancedFiltersModal 
        open={showFiltersModal}
        onOpenChange={setShowFiltersModal}
      />
    </>
  );
};