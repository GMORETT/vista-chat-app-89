import React, { useState } from 'react';
import { useConversationStore } from '../../state/stores/conversationStore';
import { useFilterStore } from '../../state/stores/filterStore';
import { useUiStore } from '../../state/uiStore';
import { useConversations } from '../../hooks/useConversations';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  CheckCircle, 
  Clock, 
  Pause, 
  Archive,
  AlertTriangle,
  ArrowUp,
  Minus,
  ArrowDown,
  ArrowLeft,
  Maximize2,
  Minimize2,
  Tags,
  X
} from 'lucide-react';
import { mockLabels } from '../../data/mockData';
import { Label } from '../../models/chat';

export const ActionsBar: React.FC = () => {
  const { selectedConversation } = useConversationStore();
  const { filters } = useFilterStore();
  const { toggleStatus, togglePriority, updateLabels, isStatusLoading, isPriorityLoading, isLabelsLoading } = useConversations(filters);
  const { isMobile, isExpanded, setActivePane, setIsExpanded } = useUiStore();
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);

  if (!selectedConversation) {
    return null;
  }

  // Get current values directly from the selected conversation
  const currentStatus = selectedConversation.status;
  const currentPriority = selectedConversation.priority;

  const handleStatusChange = (status: string) => {
    toggleStatus(selectedConversation.id, status as any);
  };

  const handlePriorityChange = (priority: string) => {
    togglePriority(selectedConversation.id, priority === 'none' ? null : priority as any);
  };

  const handleLabelToggle = (label: Label) => {
    const currentLabels = selectedConversation.labels || [];
    const isLabelSelected = currentLabels.some(l => l.id === label.id);
    
    let newLabels;
    if (isLabelSelected) {
      newLabels = currentLabels.filter(l => l.id !== label.id);
    } else {
      newLabels = [...currentLabels, label];
    }
    
    updateLabels(selectedConversation.id, newLabels);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'snoozed':
        return <Pause className="h-4 w-4" />;
      case 'resolved':
        return <Archive className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <ArrowUp className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <ArrowDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-3 border-b border-border bg-card">
      {/* Top row: Navigation controls and avatar */}
      <div className="flex items-center gap-3 mb-3">
        {/* Back button for mobile or expanded desktop view */}
        {(isMobile || isExpanded) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isMobile ? setActivePane('list') : setIsExpanded(false)}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Avatar */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={selectedConversation.meta.sender.avatar || undefined} />
          <AvatarFallback className="text-sm font-medium">
            {selectedConversation.meta.sender.name?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
        
        {/* Contact name */}
        <div className="font-heading text-foreground flex-1">
          {selectedConversation.meta.sender.name || selectedConversation.meta.sender.email || 'Sem nome'}
        </div>

        {/* Expand/collapse button (desktop only) */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-muted-foreground hover:text-foreground"
            title={isExpanded ? 'Minimizar' : 'Expandir'}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Bottom row: Status, Priority, and Labels controls in line */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Status selector */}
        <Select value={currentStatus} onValueChange={handleStatusChange} disabled={isStatusLoading}>
          <SelectTrigger className={`${isMobile ? 'w-24 text-xs' : 'w-32 text-sm'} h-8`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Aberta</span>
                <span className="sm:hidden">Aberta</span>
              </div>
            </SelectItem>
            <SelectItem value="pending">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Pendente</span>
                <span className="sm:hidden">Pend.</span>
              </div>
            </SelectItem>
            <SelectItem value="snoozed">
              <div className="flex items-center gap-2">
                <Pause className="h-4 w-4" />
                <span className="hidden sm:inline">Adiada</span>
                <span className="sm:hidden">Adiada</span>
              </div>
            </SelectItem>
            <SelectItem value="resolved">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4" />
                <span className="hidden sm:inline">Resolvida</span>
                <span className="sm:hidden">Resol.</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Priority selector */}
        <Select value={currentPriority || 'none'} onValueChange={handlePriorityChange} disabled={isPriorityLoading}>
          <SelectTrigger className={`${isMobile ? 'w-24 text-xs' : 'w-32 text-sm'} h-8`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-muted-foreground" />
                <span className="hidden sm:inline">Nenhuma</span>
                <span className="sm:hidden">Nenhuma</span>
              </div>
            </SelectItem>
            <SelectItem value="urgent">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="hidden sm:inline">Urgente</span>
                <span className="sm:hidden">Urg.</span>
              </div>
            </SelectItem>
            <SelectItem value="high">
              <div className="flex items-center gap-2">
                <ArrowUp className="h-4 w-4 text-orange-500" />
                <span className="hidden sm:inline">Alta</span>
                <span className="sm:hidden">Alta</span>
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-yellow-500" />
                <span className="hidden sm:inline">Média</span>
                <span className="sm:hidden">Méd.</span>
              </div>
            </SelectItem>
            <SelectItem value="low">
              <div className="flex items-center gap-2">
                <ArrowDown className="h-4 w-4 text-green-500" />
                <span className="hidden sm:inline">Baixa</span>
                <span className="sm:hidden">Baixa</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Labels selector */}
        <Popover open={isLabelPopoverOpen} onOpenChange={setIsLabelPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isLabelsLoading}
              className={`flex items-center gap-1 sm:gap-2 h-8 ${isMobile ? 'px-2 text-xs' : 'px-3 text-sm'}`}
            >
              <Tags className="h-4 w-4" />
              <span className="hidden sm:inline">Labels</span>
              <span className="sm:hidden text-xs">Tags</span>
              {selectedConversation.labels?.length > 0 && (
                <Badge variant="secondary" className="ml-0.5 sm:ml-1 h-3 sm:h-4 px-1 text-[10px] sm:text-xs">
                  {selectedConversation.labels.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="end">
            <div className="p-3 border-b">
              <h4 className="font-medium text-sm">Gerenciar Labels</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Selecione as labels para esta conversa
              </p>
            </div>
            <div className="p-2 max-h-64 overflow-y-auto">
              {mockLabels.map((label) => {
                const isSelected = selectedConversation.labels?.some(l => l.id === label.id) || false;
                return (
                  <button
                    key={label.id}
                    onClick={() => handleLabelToggle(label)}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: label.color }}
                      />
                      <span className="text-sm">{label.title}</span>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
                        <X className="w-2 h-2 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedConversation.labels?.length > 0 && (
              <div className="p-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Labels selecionadas:</p>
                <div className="flex flex-wrap gap-1">
                  {selectedConversation.labels.map((label) => (
                    <Badge 
                      key={label.id} 
                      variant="secondary" 
                      className="text-xs h-5"
                      style={{ backgroundColor: `${label.color}20`, color: label.color }}
                    >
                      {label.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};