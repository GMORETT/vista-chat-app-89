import React from 'react';
import { useForm } from 'react-hook-form';
import { Contact, Stage } from '../../types/crm';
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
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  contact?: Contact;
  stages: Stage[];
  defaultStageId?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  value: number;
  probability: number;
  stageId: string;
  notes: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contact,
  stages,
  defaultStageId,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: {
      name: contact?.name || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      company: contact?.company || '',
      value: contact?.value || 0,
      probability: contact?.probability || 50,
      stageId: contact?.stageId || defaultStageId || stages[0]?.id || '',
      notes: contact?.notes || '',
    },
  });

  const stageId = watch('stageId');

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: contact?.name || '',
        email: contact?.email || '',
        phone: contact?.phone || '',
        company: contact?.company || '',
        value: contact?.value || 0,
        probability: contact?.probability || 50,
        stageId: contact?.stageId || defaultStageId || stages[0]?.id || '',
        notes: contact?.notes || '',
      });
    }
  }, [isOpen, contact, defaultStageId, stages, reset]);

  const onSubmit = (data: ContactFormData) => {
    onSave({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      company: data.company || undefined,
      value: Number(data.value),
      probability: Number(data.probability),
      stageId: data.stageId,
      notes: data.notes || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {contact ? 'Editar Contato' : 'Novo Contato'}
          </DialogTitle>
          <DialogDescription>
            {contact 
              ? 'Edite as informações do contato'
              : 'Adicione um novo contato ao funil'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Nome é obrigatório' })}
                placeholder="Nome do contato"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'E-mail é obrigatório',
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'E-mail inválido'
                  }
                })}
                placeholder="email@exemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                {...register('company')}
                placeholder="Nome da empresa"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                min="0"
                {...register('value', { min: 0 })}
                placeholder="0,00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">Probabilidade (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                {...register('probability', { min: 0, max: 100 })}
                placeholder="50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stageId">Etapa</Label>
            <Select value={stageId} onValueChange={(value) => setValue('stageId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma etapa" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      {stage.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Adicione observações sobre o contato..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {contact ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};