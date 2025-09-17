import React from 'react';
import { useConversationStore } from '../../state/conversationStore';
import { useConversations } from '../../hooks/useConversations';
import { useChatStore } from '../../state/useChatStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  CheckCircle, 
  Clock, 
  Pause, 
  Archive
} from 'lucide-react';

export const ActionsBar: React.FC = () => {
  const { selectedConversation } = useConversationStore();
  const { filters } = useChatStore();
  const { toggleStatus, togglePriority } = useConversations(filters);

  if (!selectedConversation) {
    return null;
  }

  const handleStatusChange = (status: string) => {
    toggleStatus(selectedConversation.id, status as any);
  };

  const handlePriorityChange = (priority: string) => {
    togglePriority(selectedConversation.id, priority === 'none' ? null : priority as any);
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
      case 'high':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      {/* Lead name and avatar */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-heading">
          {selectedConversation.meta.sender.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div className="font-heading text-foreground">
          {selectedConversation.meta.sender.name || selectedConversation.meta.sender.email || 'Sem nome'}
        </div>
      </div>

      {/* Status selector */}
      <Select value={selectedConversation.status} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="open">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aberta
            </div>
          </SelectItem>
          <SelectItem value="pending">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendente
            </div>
          </SelectItem>
          <SelectItem value="snoozed">
            <div className="flex items-center gap-2">
              <Pause className="h-4 w-4" />
              Adiada
            </div>
          </SelectItem>
          <SelectItem value="resolved">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Resolvida
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};