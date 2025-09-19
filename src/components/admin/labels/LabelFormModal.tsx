import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { ColorPicker } from './ColorPicker';
import { CreateLabelRequest } from '../../../models/admin';
import { useAccounts } from '../../../hooks/admin/useAccounts';

const formSchema = z.object({
  title: z.string().min(1, 'Nome da label é obrigatório'),
  slug: z.string().optional(),
  description: z.string().optional(),
  color: z.string().min(1, 'Cor é obrigatória'),
  status: z.enum(['active', 'inactive']).default('active'),
  account_id: z.number().min(1, 'Cliente é obrigatório'),
});

type FormData = z.infer<typeof formSchema>;

interface LabelFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateLabelRequest) => void;
  isLoading?: boolean;
}

export const LabelFormModal: React.FC<LabelFormModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const { data: accounts = [] } = useAccounts();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      color: '#3b82f6',
      status: 'active',
      account_id: undefined,
    },
  });

  const generateSlug = (title: string): string => {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  const handleSubmit = (data: FormData) => {
    const labelData: CreateLabelRequest = {
      title: data.title,
      slug: data.slug || generateSlug(data.title),
      description: data.description,
      color: data.color,
      status: data.status,
      account_id: data.account_id,
    };
    
    onSubmit(labelData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Label</DialogTitle>
          <DialogDescription>
            Crie uma nova label para organizar conversas e contatos por cliente.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nome da Label *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Ex: Bug, Feature Request"
              onChange={(e) => {
                form.setValue('title', e.target.value);
                form.setValue('slug', generateSlug(e.target.value));
              }}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...form.register('slug')}
              placeholder="slug-da-label"
            />
            <p className="text-xs text-muted-foreground">
              Identificador único usado internamente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Descrição opcional da label"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Cliente Associado *</Label>
            <Select
              value={form.watch('account_id')?.toString()}
              onValueChange={(value) => form.setValue('account_id', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cliente" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.account_id && (
              <p className="text-sm text-destructive">{form.formState.errors.account_id.message}</p>
            )}
          </div>

          <ColorPicker
            selectedColor={form.watch('color')}
            onColorChange={(color) => form.setValue('color', color)}
          />

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value: 'active' | 'inactive') => form.setValue('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>


          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Criando...' : 'Criar Label'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};