import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInbox } from '../contexts/InboxContext';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Building } from 'lucide-react';

// Mock inboxes for demonstration
const MOCK_INBOXES = [
  { id: 1, name: 'Cliente A - Website' },
  { id: 2, name: 'Cliente B - WhatsApp' },
  { id: 3, name: 'Cliente C - E-mail' },
];

export const SuperAdminInboxFilter: React.FC = () => {
  const { user } = useAuth();
  const { activeInboxIds, setActiveInboxIds, availableInboxIds } = useInbox();

  // Only show for super admins
  if (user?.role !== 'super_admin') {
    return null;
  }

  const selectedCount = activeInboxIds.length;
  const totalCount = availableInboxIds.length;

  const handleInboxToggle = (inboxId: number) => {
    const newActiveIds = activeInboxIds.includes(inboxId)
      ? activeInboxIds.filter(id => id !== inboxId)
      : [...activeInboxIds, inboxId];
    
    setActiveInboxIds(newActiveIds);
  };

  const handleSelectAll = () => {
    setActiveInboxIds(availableInboxIds);
  };

  const handleSelectNone = () => {
    setActiveInboxIds([]);
  };

  return (
    <div className="px-4 py-2 border-b border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filtro de Canais:</span>
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {selectedCount === totalCount ? (
                'Todos os canais'
              ) : selectedCount === 0 ? (
                'Nenhum canal'
              ) : (
                `${selectedCount} de ${totalCount} canais`
              )}
              <Badge variant="secondary" className="ml-2 h-4 text-xs">
                {selectedCount}
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Selecionar Canais</h4>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                    Todos
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleSelectNone}>
                    Nenhum
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {MOCK_INBOXES.map((inbox) => (
                  <div key={inbox.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`inbox-${inbox.id}`}
                      checked={activeInboxIds.includes(inbox.id)}
                      onCheckedChange={() => handleInboxToggle(inbox.id)}
                    />
                    <label
                      htmlFor={`inbox-${inbox.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {inbox.name}
                    </label>
                  </div>
                ))}
              </div>
              
              {selectedCount === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Selecione pelo menos um canal para visualizar conversas
                </p>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};