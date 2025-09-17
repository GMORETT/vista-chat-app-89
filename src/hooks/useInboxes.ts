import { useQuery } from '@tanstack/react-query';
import { Inbox, InboxesResponse } from '../models';
import { mockInboxes } from '../data/mockData';

export const useInboxes = () => {
  return useQuery({
    queryKey: ['inboxes'],
    queryFn: async (): Promise<InboxesResponse> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        payload: mockInboxes,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};