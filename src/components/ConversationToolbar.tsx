import React, { useState } from 'react';
import { Filter, ArrowUpDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useUiStore } from '../state/uiStore';
import { useConversationStore } from '../state/conversationStore';
import { useToast } from '../hooks/use-toast';
import { AdvancedFiltersModal } from './AdvancedFiltersModal';
import { SortByPopover } from './SortByPopover';

export const ConversationToolbar: React.FC = () => {
  const { isExpanded, setIsExpanded } = useUiStore();
  const { selectedConversationId } = useConversationStore();
  const { toast } = useToast();
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const handleExpandToggle = () => {
    if (!isExpanded && !selectedConversationId) {
      toast({
        title: "Selecione uma conversa",
        description: "Você precisa selecionar uma conversa antes de expandir a tela.",
        variant: "destructive",
      });
      return;
    }
    setIsExpanded(!isExpanded);
  };

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
          onClick={handleExpandToggle}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <>
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Switch the layout</span>
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" />
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