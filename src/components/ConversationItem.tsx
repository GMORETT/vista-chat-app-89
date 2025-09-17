import React from 'react';
import { Conversation } from '../models';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  index?: number;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  onClick,
  index = 0,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500 text-white';
      case 'pending':
        return 'bg-yellow-500 text-white';
      case 'snoozed':
        return 'bg-blue-500 text-white';
      case 'resolved':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Aberta';
      case 'pending':
        return 'Pendente';
      case 'snoozed':
        return 'Adiada';
      case 'resolved':
        return 'Resolvida';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return null;
    }
  };

  const getPriorityLabel = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return 'Urgente';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Média';
      case 'low':
        return 'Baixa';
      default:
        return 'Nenhuma';
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

  const hasUnreadMessages = conversation.unread_count > 0;

  return (
    <div
      className={`
        group relative flex items-start p-4 border-b border-border cursor-pointer 
        transition-all duration-200 hover:bg-accent/5 focus:outline-none focus:ring-2 
        focus:ring-primary/20 focus:bg-accent/10
        ${isSelected 
          ? 'bg-primary/5 border-l-4 border-l-primary shadow-sm' 
          : hasUnreadMessages 
            ? 'bg-accent/3 hover:bg-accent/8' 
            : 'hover:bg-accent/5'
        }
        ${hasUnreadMessages ? 'font-medium' : ''}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-pressed={isSelected}
      aria-label={`Conversa com ${conversation.meta.sender.name || 'contato'}`}
    >
      {/* Avatar with status indicator */}
      <div className="flex-shrink-0 mr-3 relative">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-heading
          transition-all duration-200 group-hover:scale-105
          ${hasUnreadMessages ? 'bg-primary shadow-md' : 'bg-muted-foreground'}
        `}>
          {conversation.meta.sender.name?.charAt(0).toUpperCase() || '?'}
        </div>
        {hasUnreadMessages && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`
            text-sm font-heading truncate transition-colors
            ${hasUnreadMessages 
              ? 'text-foreground font-semibold' 
              : 'text-foreground group-hover:text-primary'
            }
          `}>
            {conversation.meta.sender.name || conversation.meta.sender.email || 'Sem nome'}
          </h3>
          <span className={`
            text-xs ml-2 font-medium transition-colors
            ${hasUnreadMessages ? 'text-primary' : 'text-muted-foreground'}
          `}>
            {formattedTime}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Badge 
            variant="secondary" 
            className={`
              text-xs transition-all duration-200 
              ${getStatusColor(conversation.status)}
              ${isSelected ? 'shadow-sm' : ''}
            `}
          >
            {getStatusLabel(conversation.status)}
          </Badge>
          
          {conversation.priority && (
            <Badge 
              variant="secondary" 
              className={`
                text-xs transition-all duration-200
                ${getPriorityColor(conversation.priority)}
                ${isSelected ? 'shadow-sm' : ''}
              `}
            >
              {getPriorityLabel(conversation.priority)}
            </Badge>
          )}
          
          {conversation.unread_count > 0 && (
            <Badge 
              variant="destructive" 
              className="text-xs bg-primary text-primary-foreground font-semibold shadow-sm animate-pulse"
            >
              {conversation.unread_count}
            </Badge>
          )}
        </div>

        {/* Labels */}
        {conversation.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {conversation.labels.slice(0, 2).map((label) => (
              <Badge 
                key={label.id} 
                variant="outline" 
                className="text-xs border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                style={{ 
                  borderColor: `${label.color}40`,
                  color: label.color,
                }}
              >
                <div 
                  className="w-1.5 h-1.5 rounded-full mr-1" 
                  style={{ backgroundColor: label.color }}
                />
                {label.title}
              </Badge>
            ))}
            {conversation.labels.length > 2 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-xs text-muted-foreground cursor-help">
                    +{conversation.labels.length - 2}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">Labels adicionais:</p>
                    {conversation.labels.slice(2).map((label) => (
                      <div key={label.id} className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm">{label.title}</span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}

        {/* Quick preview of last message */}
        <div className="text-xs text-muted-foreground truncate mb-1 leading-relaxed">
          {hasUnreadMessages 
            ? "Nova mensagem recebida" 
            : "Última atividade há " + formattedTime.replace('há ', '')
          }
        </div>

        {/* Assignee */}
        {conversation.meta.assignee && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            Atribuído a {conversation.meta.assignee.name}
          </div>
        )}

        {/* Inbox info */}
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
          <span className="capitalize">{conversation.meta.channel}</span>
          <span>•</span>
          <span>ID: {conversation.id}</span>
        </div>
      </div>
    </div>
  );
};