import { useQuery } from '@tanstack/react-query';
import { Inbox, InboxesResponse } from '../models';
import { MockChatService } from '../api/MockChatService';
import { BffChatService } from '../api/BffChatService';

export const useInboxes = (accountId?: number | null) => {
  const useBff = import.meta.env.VITE_USE_BFF === 'true';
  const chatService = useBff ? new BffChatService() : new MockChatService();
  
  return useQuery({
    queryKey: ['inboxes', accountId],
    queryFn: async (): Promise<InboxesResponse> => {
      const response = await chatService.listInboxes();
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Filter inboxes by account_id if specified
      const inboxesData = response.data!;
      if (accountId !== null && accountId !== undefined) {
        return {
          ...inboxesData,
          payload: inboxesData.payload.filter(inbox => inbox.account_id === accountId)
        };
      }
      
      return inboxesData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};