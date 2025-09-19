import React, { useEffect } from 'react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Button } from '../../ui/button';
import { Checkbox } from '../../ui/checkbox';
import { ColorPicker } from './ColorPicker';
import { Label, CreateLabelRequest } from '../../../models/admin';
import { useAccounts } from '../../../hooks/admin/useAccounts';

const formSchema = z.object({
  title: z.string().min(1, 'Nome é obrigatório').min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  color: z.string().min(1, 'Cor é obrigatória'),
  account_id: z.number().min(1, 'Cliente é obrigatório'),
});

type FormData = z.infer<typeof formSchema>;

interface LabelEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: number, data: Partial<CreateLabelRequest>) => void;
  isLoading?: boolean;
  label: Label | null;
}

export const LabelEditModal: React.FC<LabelEditModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  label,
}) => {
  const { data: accounts } = useAccounts();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      color: '#f97316',
      account_id: undefined,
    },
  });

  // Reset form with label data when label changes
  useEffect(() => {
    if (label) {
      form.reset({
        title: label.title,
        description: label.description || '',
        color: label.color,
        account_id: label.account_id,
      });
    }
  }, [label, form]);

  const handleSubmit = (data: FormData) => {
    if (!label) return;
    
    onSubmit(label.id, {
      title: data.title,
      description: data.description || undefined,
      color: data.color,
      account_id: data.account_id,
    });
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
          <DialogTitle>Editar Label</DialogTitle>
          <DialogDescription>
            Atualize as informações da label selecionada.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Label</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Suporte, Vendas, Bug..."
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva o propósito desta label..."
                      className="min-h-[80px]"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente Associado</FormLabel>
                  <Select 
                    value={field.value?.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ColorPicker
                      selectedColor={field.value}
                      onColorChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


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
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};