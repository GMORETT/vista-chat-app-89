import { z } from 'zod';
import { WizardData } from './InboxWizard';

const step1Schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  selectedChannel: z.object({
    id: z.string(),
    name: z.string(),
    fields: z.array(z.any())
  }).nullable().refine(val => val !== null, 'Selecione um canal')
});

const step2Schema = z.object({
  selectedChannel: z.object({
    fields: z.array(z.object({
      name: z.string(),
      required: z.boolean(),
      sensitive: z.boolean().optional()
    }))
  }),
  credentials: z.record(z.string(), z.any()),
  credentialIds: z.record(z.string(), z.string())
});

const step3Schema = step1Schema.merge(step2Schema);

export const validateWizardStep = (step: number, data: WizardData) => {
  switch (step) {
    case 1:
      return step1Schema.parse(data);
    case 2:
      // Validate required fields are filled
      if (!data.selectedChannel) {
        throw new Error('Canal não selecionado');
      }
      
      const missingFields = data.selectedChannel.fields
        .filter(field => field.required)
        .filter(field => {
          // Check if field has value or credential ID
          const hasValue = data.credentials[field.name];
          const hasCredentialId = data.credentialIds[field.name];
          return !hasValue && !hasCredentialId;
        });
      
      if (missingFields.length > 0) {
        const fieldNames = missingFields.map(f => f.label).join(', ');
        throw new Error(`Campos obrigatórios não preenchidos: ${fieldNames}`);
      }
      
      return step2Schema.parse(data);
    case 3:
      return step3Schema.parse(data);
    default:
      throw new Error('Passo inválido');
  }
};