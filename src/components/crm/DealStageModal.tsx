import React, { useState, useEffect } from 'react';
import { DealStage } from '../../stores/crmDataStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface DealStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stage: Omit<DealStage, 'id'>) => void;
  stage?: DealStage;
}

const PREDEFINED_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green  
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export const DealStageModal: React.FC<DealStageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  stage,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (stage) {
      setName(stage.name);
      setColor(stage.color);
      setOrder(stage.order);
      setIsActive(stage.isActive);
    } else {
      setName('');
      setColor('#3B82F6');
      setOrder(1);
      setIsActive(true);
    }
  }, [stage, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      color,
      order,
      isActive,
    });

    handleClose();
  };

  const handleClose = () => {
    setName('');
    setColor('#3B82F6');
    setOrder(1);
    setIsActive(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {stage ? 'Editar Etapa' : 'Nova Etapa'}
          </DialogTitle>
          <DialogDescription>
            {stage 
              ? 'Edite as informações da etapa do funil.' 
              : 'Crie uma nova etapa para seu funil de vendas.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Etapa</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Prospecção, Proposta, Negociação..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cor da Etapa</Label>
            <div className="flex gap-2 flex-wrap">
              {PREDEFINED_COLORS.map((predefinedColor) => (
                <button
                  key={predefinedColor}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === predefinedColor 
                      ? 'border-foreground scale-110' 
                      : 'border-muted-foreground/30 hover:border-foreground/50'
                  }`}
                  style={{ backgroundColor: predefinedColor }}
                  onClick={() => setColor(predefinedColor)}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-16 h-8 p-0 border rounded cursor-pointer"
              />
              <span className="text-sm text-muted-foreground">ou escolha uma cor personalizada</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Ordem</Label>
            <Input
              id="order"
              type="number"
              min="1"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
              className="w-24"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Etapa ativa</Label>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {stage ? 'Salvar Alterações' : 'Criar Etapa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};