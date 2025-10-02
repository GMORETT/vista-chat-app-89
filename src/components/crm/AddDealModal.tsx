import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { useCrmDataStore } from '../../stores/crmDataStore';

const dealSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(200),
  annualRevenue: z.number().min(0, 'Valor deve ser positivo'),
  stage: z.string().min(1, 'Etapa é obrigatória'),
  leadId: z.string().min(1, 'Lead é obrigatório'),
  companyId: z.string().optional(),
});

type DealFormData = z.infer<typeof dealSchema>;

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<DealFormData, 'annualRevenue'> & { annualRevenue: number }) => Promise<void>;
}

export const AddDealModal: React.FC<AddDealModalProps> = ({ isOpen, onClose, onSave }) => {
  const { leads, companies, dealStages } = useCrmDataStore();
  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting }, reset } = useForm<DealFormData>();

  const selectedLeadId = watch('leadId');
  const leadCompanies = companies.filter(c => c.leadId === selectedLeadId);

  const onSubmit = async (data: DealFormData) => {
    try {
      const revenueValue = typeof data.annualRevenue === 'string' 
        ? parseFloat(data.annualRevenue) 
        : data.annualRevenue;
      
      await onSave({
        ...data,
        annualRevenue: revenueValue,
        companyId: data.companyId || undefined,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao criar negócio:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Negócio</DialogTitle>
          <DialogDescription>
            Adicione um novo negócio ao funil de vendas
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Negócio *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Ex: Implementação de CRM"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualRevenue">Faturamento Anual (R$) *</Label>
              <Input
                id="annualRevenue"
                type="number"
                step="0.01"
                {...register('annualRevenue', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.annualRevenue && (
                <p className="text-sm text-destructive">{errors.annualRevenue.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stage">Etapa *</Label>
              <Controller
                name="stage"
                control={control}
                rules={{ required: 'Etapa é obrigatória' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealStages
                        .filter(stage => stage.isActive)
                        .sort((a, b) => a.order - b.order)
                        .map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: stage.color }}
                              />
                              {stage.name}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.stage && (
                <p className="text-sm text-destructive">{errors.stage.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="leadId">Lead Responsável *</Label>
              <Controller
                name="leadId"
                control={control}
                rules={{ required: 'Lead é obrigatório' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.leadId && (
                <p className="text-sm text-destructive">{errors.leadId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyId">Empresa (Opcional)</Label>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!selectedLeadId || leadCompanies.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedLeadId 
                          ? "Selecione um lead primeiro" 
                          : leadCompanies.length === 0
                          ? "Sem empresas para este lead"
                          : "Selecione uma empresa"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {leadCompanies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {selectedLeadId && leadCompanies.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Este lead não possui empresas cadastradas
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : 'Criar Negócio'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
