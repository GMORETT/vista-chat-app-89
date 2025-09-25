export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  value: number;
  annualRevenue?: number; // Faturamento anual
  probability: number;
  stageId: string;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface Stage {
  id: string;
  name: string;
  color: string;
  order: number;
  isActive: boolean;
}

export interface CRMState {
  stages: Stage[];
  contacts: Contact[];
  // Actions
  addStage: (stage: Omit<Stage, 'id'>) => void;
  updateStage: (id: string, updates: Partial<Stage>) => void;
  deleteStage: (id: string) => void;
  reorderStages: (stages: Stage[]) => void;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  moveContact: (contactId: string, newStageId: string) => void;
}

// New CRM entities
export interface Person {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: Person;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  website?: string;
  phone?: string;
  address?: string;
  assignedPersons: Person[]; // Pode ter várias pessoas
  leadId: string; // Obrigatório ter um lead associado
  lead: Lead;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: 'prospect' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number; // 0-100
  expectedCloseDate?: string;
  assignedPerson: Person; // Apenas uma pessoa por negócio
  leadId: string; // Obrigatório ter um lead associado
  lead: Lead;
  companyId?: string; // Opcional
  company?: Company;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  activities?: DealActivity[];
}

export interface DealActivity {
  id: string;
  dealId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  subject: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  completedDate?: string;
  createdBy: Person;
  createdAt: string;
}

export interface CrmFilters {
  status?: string[];
  assignedTo?: string[];
  source?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}