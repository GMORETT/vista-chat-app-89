import React from 'react';
import { Stage } from '../../types/crm';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  GripVertical, 
  Edit, 
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface StageManagerProps {
  stages: Stage[];
  onAddStage: () => void;
  onEditStage: (stage: Stage) => void;
  onDeleteStage: (stageId: string) => void;
  onReorderStages: (stages: Stage[]) => void;
}

export const StageManager: React.FC<StageManagerProps> = ({
  stages,
  onAddStage,
  onEditStage,
  onDeleteStage,
  onReorderStages,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const newStages = [...stages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newStages.length) {
      [newStages[index], newStages[targetIndex]] = [newStages[targetIndex], newStages[index]];
      onReorderStages(newStages);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-1" />
          Gerenciar Etapas
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Etapas do Funil</DialogTitle>
          <DialogDescription>
            Adicione, edite, exclua e reordene as etapas do seu funil de vendas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Etapas Atuais</h4>
            <Button onClick={onAddStage} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Nova Etapa
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma etapa criada ainda.</p>
                <p className="text-sm">Clique em "Nova Etapa" para começar.</p>
              </div>
            ) : (
              stages.map((stage, index) => (
                <Card key={stage.id} className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => moveStage(index, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => moveStage(index, 'down')}
                        disabled={index === stages.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: stage.color }}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{stage.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Ordem: {stage.order}
                        </Badge>
                        {!stage.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditStage(stage)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteStage(stage.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Dica:</strong> Arraste os contatos entre as etapas para movê-los no funil. 
              Use as setas para reordenar as etapas.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};