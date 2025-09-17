import React, { useState } from 'react';
import { Filter, ArrowUpDown, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
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
    <TooltipProvider>
      <div className="flex items-center gap-2 p-3 bg-card">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFiltersModal(true)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Filter conversations</p>
          </TooltipContent>
        </Tooltip>

        <SortByPopover />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandToggle}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch the layout</p>
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