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

  // Companies
  getCompanies: async (): Promise<Company[]> => {
    const response = await crmApi.get<ApiResponse<Company[]>>(`/${CLIENT_ID}/companies`);
    return response.data.payload;
  },

  // Deals
  getDeals: async (): Promise<Deal[]> => {
    const response = await crmApi.get<ApiResponse<Deal[]>>(`/${CLIENT_ID}/deals`);
    return response.data.payload;
  },

  // Deal Stages
  getDealStages: async (): Promise<DealStage[]> => {
    const response = await crmApi.get<ApiResponse<DealStage[]>>(`/${CLIENT_ID}/deal-stages`);
    return response.data.payload;
  },

  // Events (último snapshot por lead)
  getEvents: async (): Promise<any[]> => {
    const response = await crmApi.get<ApiResponse<any[]>>(`/${CLIENT_ID}/events`);
    return response.data.payload;
  },
};
