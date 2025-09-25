import { create } from 'zustand';
import { CRMState, Stage, Contact } from '../../types/crm';

// Mock initial data
const initialStages: Stage[] = [
  { id: '1', name: 'Leads', color: '#3b82f6', order: 1, isActive: true },
  { id: '2', name: 'Qualificados', color: '#10b981', order: 2, isActive: true },
  { id: '3', name: 'Proposta', color: '#f59e0b', order: 3, isActive: true },
  { id: '4', name: 'Negociação', color: '#ef4444', order: 4, isActive: true },
  { id: '5', name: 'Fechados', color: '#8b5cf6', order: 5, isActive: true },
];

const initialContacts: Contact[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    phone: '(11) 99999-9999',
    company: 'Empresa ABC',
    value: 25000,
    annualRevenue: 500000,
    probability: 80,
    stageId: '3',
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: 'Cliente interessado em solução completa'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@startup.com',
    phone: '(11) 88888-8888',
    company: 'Startup XYZ',
    value: 15000,
    annualRevenue: 150000,
    probability: 60,
    stageId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
    notes: 'Precisa aprovar orçamento'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@tech.com',
    company: 'Tech Solutions',
    value: 35000,
    annualRevenue: 1200000,
    probability: 90,
    stageId: '4',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Ana Oliveira',
    email: 'ana@inovacao.com',
    company: 'Inovação Digital',
    value: 8000,
    annualRevenue: 80000,
    probability: 40,
    stageId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useCRMStore = create<CRMState>((set, get) => ({
  stages: initialStages,
  contacts: initialContacts,

  addStage: (stage) =>
    set((state) => ({
      stages: [...state.stages, { ...stage, id: Date.now().toString() }],
    })),

  updateStage: (id, updates) =>
    set((state) => ({
      stages: state.stages.map((stage) =>
        stage.id === id ? { ...stage, ...updates } : stage
      ),
    })),

  deleteStage: (id) =>
    set((state) => ({
      stages: state.stages.filter((stage) => stage.id !== id),
      // Move contacts from deleted stage to first stage
      contacts: state.contacts.map((contact) =>
        contact.stageId === id
          ? { ...contact, stageId: state.stages[0]?.id || '' }
          : contact
      ),
    })),

  reorderStages: (stages) =>
    set(() => ({
      stages: stages.map((stage, index) => ({ ...stage, order: index + 1 })),
    })),

  addContact: (contact) =>
    set((state) => ({
      contacts: [
        ...state.contacts,
        {
          ...contact,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),

  updateContact: (id, updates) =>
    set((state) => ({
      contacts: state.contacts.map((contact) =>
        contact.id === id
          ? { ...contact, ...updates, updatedAt: new Date() }
          : contact
      ),
    })),

  deleteContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((contact) => contact.id !== id),
    })),

  moveContact: (contactId, newStageId) =>
    set((state) => ({
      contacts: state.contacts.map((contact) =>
        contact.id === contactId
          ? { ...contact, stageId: newStageId, updatedAt: new Date() }
          : contact
      ),
    })),
}));