import axios from 'axios';
import { Lead, Company, Deal } from '../types/crm';
import { DealStage } from '../stores/crmDataStore';

const CRM_API_BASE_URL = import.meta.env.VITE_CRM_API_URL || 'http://localhost:8000/api/v1';
const CLIENT_ID = '1'; // Fixo por enquanto

interface ApiResponse<T> {
  payload: T;
}

const crmApi = axios.create({
  baseURL: CRM_API_BASE_URL,
  timeout: 10000,
});

export const crmApiService = {
  // Leads
  getLeads: async (): Promise<Lead[]> => {
    const response = await crmApi.get<ApiResponse<Lead[]>>(`/${CLIENT_ID}/leads`);
    return response.data.payload;
  },

  createLead: async (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> => {
    const response = await crmApi.post<ApiResponse<Lead>>(`/${CLIENT_ID}/leads`, leadData);
    return response.data.payload;
  },

  // Companies
  getCompanies: async (): Promise<Company[]> => {
    const response = await crmApi.get<ApiResponse<Company[]>>(`/${CLIENT_ID}/companies`);
    return response.data.payload;
  },

  createCompany: async (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> => {
    const response = await crmApi.post<ApiResponse<Company>>(`/${CLIENT_ID}/companies`, companyData);
    return response.data.payload;
  },

  // Deals
  getDeals: async (): Promise<Deal[]> => {
    const response = await crmApi.get<ApiResponse<Deal[]>>(`/${CLIENT_ID}/deals`);
    return response.data.payload;
  },

  createDeal: async (dealData: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> => {
    const response = await crmApi.post<ApiResponse<Deal>>(`/${CLIENT_ID}/deals`, dealData);
    return response.data.payload;
  },

  // Deal Stages
  getDealStages: async (): Promise<DealStage[]> => {
    const response = await crmApi.get<ApiResponse<DealStage[]>>(`/${CLIENT_ID}/deal-stages`);
    return response.data.payload;
  },

  createDealStage: async (stageData: Omit<DealStage, 'id'>): Promise<DealStage> => {
    const response = await crmApi.post<ApiResponse<DealStage>>(`/${CLIENT_ID}/deal-stages`, stageData);
    return response.data.payload;
  },

  updateDealStage: async (stageId: string, stageData: Partial<DealStage>): Promise<DealStage> => {
    const response = await crmApi.put<ApiResponse<DealStage>>(`/${CLIENT_ID}/deal-stages/${stageId}`, stageData);
    return response.data.payload;
  },

  deleteDealStage: async (stageId: string): Promise<void> => {
    await crmApi.delete(`/${CLIENT_ID}/deal-stages/${stageId}`);
  },

  // Events (último snapshot por lead)
  getEvents: async (): Promise<any[]> => {
    const response = await crmApi.get<ApiResponse<any[]>>(`/${CLIENT_ID}/events`);
    return response.data.payload;
  },
};
