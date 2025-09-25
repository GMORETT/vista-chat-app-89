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


  return (
    <Card className="w-64 flex-shrink-0 h-fit shadow-sm border-l-4" style={{ borderLeftColor: stage.color }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: stage.color }}
            />
            <CardTitle className="text-lg font-semibold text-foreground">
              {stage.name}
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm font-medium px-2 py-1">
              {contacts.length} leads
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
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
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div
          className="min-h-[400px] space-y-2 p-2 rounded-md bg-muted/30"
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
            <div className="flex items-center justify-center h-60 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-background/50">
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-medium mb-1">
                  Arraste leads aqui
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Esta etapa está vazia
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};