import { create } from 'zustand';
import { Lead, Company, Deal, Person } from '../types/crm';

interface CrmDataState {
  // Data
  leads: Lead[];
  companies: Company[];
  deals: Deal[];
  persons: Person[];
  
  // Actions
  setLeads: (leads: Lead[]) => void;
  setCompanies: (companies: Company[]) => void;
  setDeals: (deals: Deal[]) => void;
  setPersons: (persons: Person[]) => void;
  
  // Getters
  getLeadById: (id: string) => Lead | undefined;
  getCompanyById: (id: string) => Company | undefined;
  getDealById: (id: string) => Deal | undefined;
  getPersonById: (id: string) => Person | undefined;
  
  // Relationships
  getCompaniesByLeadId: (leadId: string) => Company[];
  getDealsByLeadId: (leadId: string) => Deal[];
  getDealsByCompanyId: (companyId: string) => Deal[];
}

// Mock data - centralized
const mockPersons: Person[] = [
  {
    id: 'p1',
    name: 'Ana Costa',
    email: 'ana@empresa.com',
    role: 'Gerente Comercial',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'p2',
    name: 'Carlos Lima',
    email: 'carlos@empresa.com',
    role: 'Consultor',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'p3',
    name: 'Paula Ferreira',
    email: 'paula@empresa.com',
    role: 'Account Manager',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'p4',
    name: 'Roberto Santos',
    email: 'roberto@empresa.com',
    role: 'Diretor',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  }
];

const mockLeads: Lead[] = [
  {
    id: 'l1',
    name: 'João Silva',
    email: 'joao@techsolutions.com',
    phone: '+55 11 99999-9999',
    source: 'Website',
    status: 'qualified',
    assignedTo: mockPersons[0], // Ana Costa
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    notes: 'Interessado em soluções corporativas',
    tags: ['corporativo', 'urgente']
  },
  {
    id: 'l2',
    name: 'Maria Santos',
    email: 'maria@startup.com',
    phone: '+55 11 88888-8888',
    source: 'LinkedIn',
    status: 'contacted',
    assignedTo: mockPersons[2], // Paula Ferreira
    createdAt: '2025-01-14T14:30:00Z',
    updatedAt: '2025-01-15T09:15:00Z',
    notes: 'Precisa de solução para equipe pequena',
    tags: ['startup']
  },
  {
    id: 'l3',
    name: 'Pedro Oliveira',
    email: 'pedro@global.com',
    phone: '+55 11 77777-7777',
    source: 'Referência',
    status: 'qualified',
    assignedTo: mockPersons[0], // Ana Costa
    createdAt: '2025-01-13T16:45:00Z',
    updatedAt: '2025-01-15T11:20:00Z',
    notes: 'Orçamento aprovado, aguardando proposta',
    tags: ['tech', 'qualificado']
  },
  {
    id: 'l4',
    name: 'Lucas Pereira',
    email: 'lucas@inovacao.com',
    phone: '+55 11 66666-6666',
    source: 'Indicação',
    status: 'new',
    assignedTo: mockPersons[1], // Carlos Lima
    createdAt: '2025-01-16T08:30:00Z',
    updatedAt: '2025-01-16T08:30:00Z',
    notes: 'Primeira empresa, em fase de crescimento',
    tags: ['startup', 'primeira-empresa']
  }
];

const mockCompanies: Company[] = [
  {
    id: 'c1',
    name: 'Tech Solutions Ltda',
    industry: 'Tecnologia',
    size: 'medium',
    website: 'https://techsolutions.com',
    phone: '+55 11 3333-3333',
    address: 'São Paulo, SP',
    leadId: 'l1',
    lead: mockLeads[0],
    assignedPersons: [mockPersons[0], mockPersons[1]], // Ana e Carlos
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    notes: 'Cliente potencial para soluções corporativas'
  },
  {
    id: 'c2',
    name: 'Startup Inovação',
    industry: 'Software',
    size: 'small',
    website: 'https://startup.com',
    phone: '+55 11 4444-4444',
    address: 'Rio de Janeiro, RJ',
    leadId: 'l2',
    lead: mockLeads[1],
    assignedPersons: [mockPersons[2]], // Paula
    createdAt: '2025-01-14T14:30:00Z',
    updatedAt: '2025-01-15T09:15:00Z',
    notes: 'Startup em crescimento, boa oportunidade'
  },
  {
    id: 'c3',
    name: 'Corporação Global',
    industry: 'Financeiro',
    size: 'enterprise',
    website: 'https://global.com',
    phone: '+55 11 5555-5555',
    address: 'Brasília, DF',
    leadId: 'l3',
    lead: mockLeads[2],
    assignedPersons: [mockPersons[0], mockPersons[3]], // Ana e Roberto
    createdAt: '2025-01-13T16:45:00Z',
    updatedAt: '2025-01-15T11:20:00Z',
    notes: 'Grande corporação, processo longo mas alto valor'
  }
];

const mockDeals: Deal[] = [
  {
    id: 'd1',
    title: 'Sistema CRM Corporativo',
    value: 85000,
    currency: 'BRL',
    stage: 'proposal',
    probability: 75,
    expectedCloseDate: '2025-02-28T00:00:00Z',
    assignedPerson: mockPersons[0], // Ana Costa - uma pessoa por deal
    leadId: 'l1',
    lead: mockLeads[0],
    companyId: 'c1',
    company: mockCompanies[0],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    notes: 'Proposta técnica aprovada, aguardando aprovação financeira'
  },
  {
    id: 'd2',
    title: 'Plataforma de Gestão',
    value: 25000,
    currency: 'BRL',
    stage: 'negotiation',
    probability: 60,
    expectedCloseDate: '2025-02-15T00:00:00Z',
    assignedPerson: mockPersons[2], // Paula Ferreira
    leadId: 'l2',
    lead: mockLeads[1],
    companyId: 'c2',
    company: mockCompanies[1],
    createdAt: '2025-01-14T14:30:00Z',
    updatedAt: '2025-01-15T09:15:00Z',
    notes: 'Negociando prazo de implementação'
  },
  {
    id: 'd3',
    title: 'Consultoria Estratégica',
    value: 150000,
    currency: 'BRL',
    stage: 'prospect',
    probability: 90,
    expectedCloseDate: '2025-03-15T00:00:00Z',
    assignedPerson: mockPersons[0], // Ana Costa
    leadId: 'l3',
    lead: mockLeads[2],
    companyId: 'c3',
    company: mockCompanies[2],
    createdAt: '2025-01-13T16:45:00Z',
    updatedAt: '2025-01-15T11:20:00Z',
    notes: 'Cliente muito interessado, processo avançado'
  },
  {
    id: 'd4',
    title: 'Solução Inicial',
    value: 15000,
    currency: 'BRL',
    stage: 'prospect',
    probability: 40,
    expectedCloseDate: '2025-02-01T00:00:00Z',
    assignedPerson: mockPersons[1], // Carlos Lima
    leadId: 'l4',
    lead: mockLeads[3],
    createdAt: '2025-01-16T08:30:00Z',
    updatedAt: '2025-01-16T08:30:00Z',
    notes: 'Primeiro contato, verificando necessidades'
  }
];

export const useCrmDataStore = create<CrmDataState>((set, get) => ({
  // Initial data
  leads: mockLeads,
  companies: mockCompanies,
  deals: mockDeals,
  persons: mockPersons,
  
  // Actions
  setLeads: (leads) => set({ leads }),
  setCompanies: (companies) => set({ companies }),
  setDeals: (deals) => set({ deals }),
  setPersons: (persons) => set({ persons }),
  
  // Getters
  getLeadById: (id) => get().leads.find(lead => lead.id === id),
  getCompanyById: (id) => get().companies.find(company => company.id === id),
  getDealById: (id) => get().deals.find(deal => deal.id === id),
  getPersonById: (id) => get().persons.find(person => person.id === id),
  
  // Relationships
  getCompaniesByLeadId: (leadId) => get().companies.filter(company => company.leadId === leadId),
  getDealsByLeadId: (leadId) => get().deals.filter(deal => deal.leadId === leadId),
  getDealsByCompanyId: (companyId) => get().deals.filter(deal => deal.companyId === companyId),
}));