import React from 'react';
import { useConversationStore } from '../../state/conversationStore';
import { useConversations } from '../../hooks/useConversations';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  CheckCircle, 
  Clock, 
  Pause, 
  Archive,
  UserCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  Tag,
  MoreHorizontal
} from 'lucide-react';
import { Badge } from '../ui/badge';

export const ActionsBar: React.FC = () => {
  const { selectedConversation } = useConversationStore();
  const { toggleStatus, togglePriority } = useConversations();

  if (!selectedConversation) {
    return null;
  }

  const handleStatusChange = (status: string) => {
    toggleStatus({ 
      id: selectedConversation.id, 
      status,
      snoozed_until: status === 'snoozed' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined
    });
  };

  const handlePriorityChange = (priority: string) => {
    togglePriority({ 
      id: selectedConversation.id, 
      priority 
    });
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
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border bg-card">
      {/* Conversation info */}
      <div className="flex items-center gap-4">
        {/* Contact name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
            {selectedConversation.meta.sender.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div className="font-medium text-foreground">
              {selectedConversation.meta.sender.name || selectedConversation.meta.sender.email || 'Sem nome'}
            </div>
            <div className="text-xs text-muted">
              {selectedConversation.meta.channel} • ID: {selectedConversation.id}
            </div>
          </div>
        </div>

        {/* Status and priority badges */}
        <div className="flex gap-2">
          <Badge variant="secondary" className="gap-1">
            {getStatusIcon(selectedConversation.status)}
            {selectedConversation.status}
          </Badge>
          
          {selectedConversation.priority && (
            <Badge variant="secondary" className="gap-1">
              {getPriorityIcon(selectedConversation.priority)}
              {selectedConversation.priority}
            </Badge>
          )}
          
          {selectedConversation.unread_count > 0 && (
            <Badge variant="destructive">
              {selectedConversation.unread_count} não lidas
            </Badge>
          )}
        </div>

        {/* Labels */}
        {selectedConversation.labels.length > 0 && (
          <div className="flex gap-1">
            {selectedConversation.labels.slice(0, 3).map((label) => (
              <Badge key={label} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {label}
              </Badge>
            ))}
            {selectedConversation.labels.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{selectedConversation.labels.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
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

        {/* Priority selector */}
        <Select 
          value={selectedConversation.priority || 'none'} 
          onValueChange={(value) => handlePriorityChange(value === 'none' ? '' : value)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="medium">Média</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>

        {/* Assign button */}
        <Button variant="outline" size="sm">
          <UserCheck className="h-4 w-4 mr-1" />
          Atribuir
        </Button>

        {/* More actions */}
        <Button variant="outline" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};