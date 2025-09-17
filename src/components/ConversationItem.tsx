import React from 'react';
import { Conversation } from '../models';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from './ui/badge';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-success text-white';
      case 'pending':
        return 'bg-warning text-white';
      case 'snoozed':
        return 'bg-accent text-white';
      case 'resolved':
        return 'bg-muted text-foreground';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return 'bg-danger text-white';
      case 'high':
        return 'bg-warning text-white';
      case 'medium':
        return 'bg-accent text-white';
      case 'low':
        return 'bg-muted text-foreground';
      default:
        return null;
    }
  };

  const formattedTime = React.useMemo(() => {
    try {
      return formatDistanceToNow(new Date(conversation.last_activity_at * 1000), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return '';
    }
  }, [conversation.last_activity_at]);

  return (
    <div
      className={`
        flex items-start p-4 border-b border-border cursor-pointer transition-colors hover:bg-card
        ${isSelected ? 'bg-accent/10 border-l-4 border-l-primary' : ''}
      `}
      onClick={onClick}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mr-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
          {conversation.meta.sender.name?.charAt(0).toUpperCase() || '?'}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-medium text-foreground truncate">
            {conversation.meta.sender.name || conversation.meta.sender.email || 'Sem nome'}
          </h3>
          <span className="text-xs text-muted ml-2">{formattedTime}</span>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className={getStatusColor(conversation.status)}>
            {conversation.status}
          </Badge>
          
          {conversation.priority && (
            <Badge variant="secondary" className={getPriorityColor(conversation.priority)}>
              {conversation.priority}
            </Badge>
          )}
          
          {conversation.unread_count > 0 && (
            <Badge variant="destructive" className="bg-danger text-white">
              {conversation.unread_count}
            </Badge>
          )}
        </div>

        {/* Labels */}
        {conversation.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {conversation.labels.slice(0, 2).map((label) => (
              <Badge key={label} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
            {conversation.labels.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{conversation.labels.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Assignee */}
        {conversation.meta.assignee && (
          <div className="text-xs text-muted">
            Atribuído a: {conversation.meta.assignee.name}
          </div>
        )}

        {/* Inbox info */}
        <div className="text-xs text-muted mt-1">
          {conversation.meta.channel} • ID: {conversation.id}
        </div>
      </div>
    </div>
  );
};