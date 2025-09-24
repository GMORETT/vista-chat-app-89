import React from 'react';
import { Stage, Contact } from '../../types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import { ContactCard } from './ContactCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface FunnelStageProps {
  stage: Stage;
  contacts: Contact[];
  onEditStage: (stage: Stage) => void;
  onDeleteStage: (stageId: string) => void;
  onContactClick: (contact: Contact) => void;
  onContactDrop: (contactId: string, newStageId: string) => void;
}

export const FunnelStage: React.FC<FunnelStageProps> = ({
  stage,
  contacts,
  onEditStage,
  onDeleteStage,
  onContactClick,
  onContactDrop,
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData('text/plain');
    if (contactId) {
      onContactDrop(contactId, stage.id);
    }
  };

  const totalValue = contacts.reduce((sum, contact) => sum + contact.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="w-80 flex-shrink-0 h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <CardTitle className="text-base font-semibold">
              {stage.name}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {contacts.length}
            </Badge>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditStage(stage)}>
                Editar Etapa
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteStage(stage.id)}
                className="text-destructive"
              >
                Excluir Etapa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {totalValue > 0 && (
          <p className="text-sm text-muted-foreground">
            Total: {formatCurrency(totalValue)}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div
          className="min-h-[200px] space-y-2"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onClick={onContactClick}
            />
          ))}
          
          {contacts.length === 0 && (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/20 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Arraste contatos aqui
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};