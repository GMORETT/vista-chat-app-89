import { useQuery } from '@tanstack/react-query';
import { crmApiService } from '../api/crm';

export const useLeads = () => {
  return useQuery({
    queryKey: ['leads'],
    queryFn: crmApiService.getLeads,
    staleTime: 30000, // 30 segundos
  });
};

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: crmApiService.getCompanies,
    staleTime: 30000,
  });
};

export const useDeals = () => {
  return useQuery({
    queryKey: ['deals'],
    queryFn: crmApiService.getDeals,
    staleTime: 30000,
  });
};

export const useDealStages = () => {
  return useQuery({
    queryKey: ['dealStages'],
    queryFn: crmApiService.getDealStages,
    staleTime: 30000,
  });
};

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: crmApiService.getEvents,
    staleTime: 30000,
  });
};
