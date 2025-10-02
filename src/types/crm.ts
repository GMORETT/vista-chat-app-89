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

// Simplified CRM entities
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  website?: string;
  leadId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  annualRevenue: number;
  stage: string;
  leadId: string;
  companyId?: string;
  createdAt: string;
  updatedAt: string;
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