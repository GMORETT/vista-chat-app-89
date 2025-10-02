import { create } from 'zustand';
import { Lead, Company, Deal } from '../types/crm';
import { crmApiService } from '../api/crm';

// Adicionar interface para Stage dos Deals
export interface DealStage {
  id: string;
  name: string;
  color: string;
  order: number;
  isActive: boolean;
}

interface CrmDataState {
  // Data
  leads: Lead[];
  companies: Company[];
  deals: Deal[];
  dealStages: DealStage[];
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  fetchAllData: () => Promise<void>;
  setLeads: (leads: Lead[]) => void;
  setCompanies: (companies: Company[]) => void;
  setDeals: (deals: Deal[]) => void;
  
  // Deal Stages Actions
  addDealStage: (stage: Omit<DealStage, 'id'>) => void;
  updateDealStage: (id: string, updates: Partial<DealStage>) => void;
  deleteDealStage: (id: string) => void;
  reorderDealStages: (stages: DealStage[]) => void;
  
  // Deal Actions
  moveDeal: (dealId: string, newStage: string) => void;
  
  // Getters
  getLeadById: (id: string) => Lead | undefined;
  getCompanyById: (id: string) => Company | undefined;
  getDealById: (id: string) => Deal | undefined;
  
  // Relationships
  getCompaniesByLeadId: (leadId: string) => Company[];
  getDealsByLeadId: (leadId: string) => Deal[];
  getDealsByCompanyId: (companyId: string) => Deal[];
}

// Mock data - centralized
const mockLeads: Lead[] = [
  {
    id: 'l1',
    name: 'João Silva',
    email: 'joao@techsolutions.com',
    phone: '+55 11 99999-9999',
    role: 'Gerente Comercial',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'l2',
    name: 'Maria Santos',
    email: 'maria@startup.com',
    phone: '+55 11 88888-8888',
    role: 'Consultora',
    createdAt: '2025-01-14T14:30:00Z',
    updatedAt: '2025-01-15T09:15:00Z'
  },
  {
    id: 'l3',
    name: 'Pedro Oliveira',
    email: 'pedro@global.com',
    phone: '+55 11 77777-7777',
    role: 'Diretor',
    createdAt: '2025-01-13T16:45:00Z',
    updatedAt: '2025-01-15T11:20:00Z'
  },
  {
    id: 'l4',
    name: 'Lucas Pereira',
    email: 'lucas@inovacao.com',
    phone: '+55 11 66666-6666',
    role: 'CEO',
    createdAt: '2025-01-16T08:30:00Z',
    updatedAt: '2025-01-16T08:30:00Z'
  }
];

const mockCompanies: Company[] = [
  {
    id: 'c1',
    name: 'Tech Solutions Ltda',
    website: 'https://techsolutions.com',
    leadId: 'l1',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'c2',
    name: 'Startup Inovação',
    website: 'https://startup.com',
    leadId: 'l2',
    createdAt: '2025-01-14T14:30:00Z',
    updatedAt: '2025-01-15T09:15:00Z'
  },
  {
    id: 'c3',
    name: 'Corporação Global',
    website: 'https://global.com',
    leadId: 'l3',
    createdAt: '2025-01-13T16:45:00Z',
    updatedAt: '2025-01-15T11:20:00Z'
  }
];

const mockDeals: Deal[] = [
  {
    id: 'd1',
    title: 'Sistema CRM Corporativo',
    annualRevenue: 85000,
    stage: 'stage2',
    leadId: 'l1',
    companyId: 'c1',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z'
  },
  {
    id: 'd2',
    title: 'Plataforma de Gestão',
    annualRevenue: 25000,
    stage: 'stage3',
    leadId: 'l2',
    companyId: 'c2',
    createdAt: '2025-01-14T14:30:00Z',
    updatedAt: '2025-01-15T09:15:00Z'
  },
  {
    id: 'd3',
    title: 'Consultoria Estratégica',
    annualRevenue: 150000,
    stage: 'stage1',
    leadId: 'l3',
    companyId: 'c3',
    createdAt: '2025-01-13T16:45:00Z',
    updatedAt: '2025-01-15T11:20:00Z'
  },
  {
    id: 'd4',
    title: 'Solução Inicial',
    annualRevenue: 15000,
    stage: 'stage1',
    leadId: 'l4',
    createdAt: '2025-01-16T08:30:00Z',
    updatedAt: '2025-01-16T08:30:00Z'
  }
];

// Etapas customizáveis para deals
const mockDealStages: DealStage[] = [
  { id: 'stage1', name: 'Prospecção', color: '#3B82F6', order: 1, isActive: true },
  { id: 'stage2', name: 'Proposta', color: '#F59E0B', order: 2, isActive: true },
  { id: 'stage3', name: 'Negociação', color: '#EF4444', order: 3, isActive: true },
  { id: 'stage4', name: 'Fechado', color: '#10B981', order: 4, isActive: true },
];

export const useCrmDataStore = create<CrmDataState>((set, get) => ({
  // Initial data
  leads: [],
  companies: [],
  deals: [],
  dealStages: [],
  isLoading: false,
  
  // Fetch all data from API
  fetchAllData: async () => {
    set({ isLoading: true });
    try {
      const [leads, companies, deals, dealStages] = await Promise.all([
        crmApiService.getLeads(),
        crmApiService.getCompanies(),
        crmApiService.getDeals(),
        crmApiService.getDealStages(),
      ]);
      
      set({ leads, companies, deals, dealStages, isLoading: false });
    } catch (error) {
      console.error('Error fetching CRM data:', error);
      set({ isLoading: false });
    }
  },
  
  // Actions
  setLeads: (leads) => set({ leads }),
  setCompanies: (companies) => set({ companies }),
  setDeals: (deals) => set({ deals }),
  
  // Deal Stages Actions
  addDealStage: (stage) => {
    const newStage: DealStage = {
      ...stage,
      id: `stage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    set(state => ({
      dealStages: [...state.dealStages, newStage]
    }));
  },
  
  updateDealStage: (id, updates) => {
    set(state => ({
      dealStages: state.dealStages.map(stage => 
        stage.id === id ? { ...stage, ...updates } : stage
      )
    }));
  },
  
  deleteDealStage: (id) => {
    set(state => ({
      dealStages: state.dealStages.filter(stage => stage.id !== id)
    }));
  },
  
  reorderDealStages: (stages) => {
    set({ dealStages: stages });
  },
  
  // Deal Actions
  moveDeal: (dealId, newStage) => {
    set(state => ({
      deals: state.deals.map(deal => 
        deal.id === dealId ? { ...deal, stage: newStage } : deal
      )
    }));
  },
  
  // Getters
  getLeadById: (id) => get().leads.find(lead => lead.id === id),
  getCompanyById: (id) => get().companies.find(company => company.id === id),
  getDealById: (id) => get().deals.find(deal => deal.id === id),
  
  // Relationships
  getCompaniesByLeadId: (leadId) => get().companies.filter(company => company.leadId === leadId),
  getDealsByLeadId: (leadId) => get().deals.filter(deal => deal.leadId === leadId),
  getDealsByCompanyId: (companyId) => get().deals.filter(deal => deal.companyId === companyId),
}));