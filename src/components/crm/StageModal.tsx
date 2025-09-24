import React from 'react';
import { useForm } from 'react-hook-form';
import { Stage } from '../../types/crm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface StageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stage: Omit<Stage, 'id'>) => void;
  stage?: Stage;
}

interface StageFormData {
  name: string;
  color: string;
}

const defaultColors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
];

export const StageModal: React.FC<StageModalProps> = ({
  isOpen,
  onClose,
  onSave,
  stage,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StageFormData>({
    defaultValues: {
      name: stage?.name || '',
      color: stage?.color || defaultColors[0],
    },
  });

  const selectedColor = watch('color');

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: stage?.name || '',
        color: stage?.color || defaultColors[0],
      });
    }
  }, [isOpen, stage, reset]);

  const onSubmit = (data: StageFormData) => {
    onSave({
      name: data.name,
      color: data.color,
      order: stage?.order || 1,
      isActive: stage?.isActive ?? true,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {stage ? 'Editar Etapa' : 'Nova Etapa'}
          </DialogTitle>
          <DialogDescription>
            {stage 
              ? 'Edite as informações da etapa'
              : 'Adicione uma nova etapa ao funil'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Etapa *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              placeholder="Ex: Leads, Qualificados, Propostas..."
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Cor da Etapa</Label>
            <div className="flex gap-2 flex-wrap">
              {defaultColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-foreground scale-110' 
                      : 'border-muted-foreground/20 hover:border-muted-foreground/40'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setValue('color', color)}
                />
              ))}
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <Label htmlFor="customColor" className="text-sm">Ou escolha:</Label>
              <input
                id="customColor"
                type="color"
                value={selectedColor}
                onChange={(e) => setValue('color', e.target.value)}
                className="w-8 h-8 rounded border border-muted-foreground/20 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm font-medium">
              Pré-visualização: {watch('name') || 'Nome da Etapa'}
            </span>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {stage ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};