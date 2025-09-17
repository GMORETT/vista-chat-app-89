import React, { useState } from 'react';
import { Filter, ArrowUpDown, ArrowRight, ArrowLeft, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useUiStore } from '../state/uiStore';
import { useChatStore } from '../state/useChatStore';
import { useToast } from '../hooks/use-toast';
import { AdvancedFiltersModal } from './AdvancedFiltersModal';
import { SortByPopover } from './SortByPopover';

export const ConversationToolbar: React.FC = () => {
  const { isExpanded, setIsExpanded } = useUiStore();
  const { selectedConversationId, searchQuery, setSearchQuery } = useChatStore();
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
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-8"
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFiltersModal(true)}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>

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