import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInboxes } from '../hooks/useInboxes';
import { useCurrentClient } from '../hooks/useCurrentClient';
import { useFilterStore } from '../state/stores/filterStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { MessageCircle } from 'lucide-react';

export const InboxSelector: React.FC = () => {
  const { user } = useAuth();
  const { currentAccountId } = useCurrentClient();
  const { data: inboxesResponse, isLoading } = useInboxes(currentAccountId);
  const { filters, setFilters } = useFilterStore();

  const inboxes = inboxesResponse?.payload || [];
  
  const handleInboxChange = (inboxId: string) => {
    const newInboxId = inboxId === 'all' ? undefined : parseInt(inboxId);
    setFilters({ inbox_id: newInboxId });
  };

  const selectedInbox = inboxes.find(inbox => inbox.id === filters.inbox_id);

  // Don't show for users with no inboxes access
  if (user?.role === 'user' && (!inboxes || inboxes.length === 0)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <MessageCircle className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">Canal:</span>
      
      <Select
        value={filters.inbox_id?.toString() || 'all'}
        onValueChange={handleInboxChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px] h-8">
          <SelectValue placeholder="Selecionar canal">
            {isLoading ? (
              "Carregando..."
            ) : selectedInbox ? (
              <div className="flex items-center gap-2">
                <span>{selectedInbox.name}</span>
                <Badge variant="outline" className="text-xs">
                  {selectedInbox.channel_type}
                </Badge>
              </div>
            ) : (
              "Todos os canais"
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">
            <div className="flex items-center gap-2">
              <span>Todos os canais</span>
              <Badge variant="outline" className="text-xs">
                Global
              </Badge>
            </div>
          </SelectItem>
          {inboxes.map((inbox) => (
            <SelectItem key={inbox.id} value={inbox.id.toString()}>
              <div className="flex items-center gap-2">
                <span>{inbox.name}</span>
                <Badge variant="outline" className="text-xs">
                  {inbox.channel_type}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};