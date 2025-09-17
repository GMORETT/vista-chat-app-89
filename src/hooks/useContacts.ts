import { useQuery } from '@tanstack/react-query';
import { Contact, ContactQuery, ContactsResponse } from '../models/chat';
import { MockChatService } from '../api/MockChatService';

// Filter contacts based on query
const filterContacts = (contacts: Contact[], query: ContactQuery): Contact[] => {
  let filtered = [...contacts];

  // Filter by name
  if (query.name) {
    const nameQuery = query.name.toLowerCase();
    filtered = filtered.filter(contact =>
      contact.name.toLowerCase().includes(nameQuery)
    );
  }

  // Filter by email
  if (query.email) {
    const emailQuery = query.email.toLowerCase();
    filtered = filtered.filter(contact =>
      contact.email?.toLowerCase().includes(emailQuery)
    );
  }

  // Filter by phone
  if (query.phone_number) {
    filtered = filtered.filter(contact =>
      contact.phone_number?.includes(query.phone_number!)
    );
  }

  // Filter by identifier
  if (query.identifier) {
    filtered = filtered.filter(contact =>
      contact.identifier?.includes(query.identifier!)
    );
  }

  // Sort contacts
  if (query.sort) {
    filtered.sort((a, b) => {
      switch (query.sort) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'created_at_asc':
          return a.created_at - b.created_at;
        case 'created_at_desc':
          return b.created_at - a.created_at;
        case 'last_activity_at_asc':
          return (a.last_activity_at || 0) - (b.last_activity_at || 0);
        case 'last_activity_at_desc':
          return (b.last_activity_at || 0) - (a.last_activity_at || 0);
        default:
          return b.created_at - a.created_at;
      }
    });
  }

  return filtered;
};

export const useContacts = (query: ContactQuery = {}) => {
  const chatService = new MockChatService();
  
  return useQuery({
    queryKey: ['contacts', query],
    queryFn: async (): Promise<ContactsResponse> => {
      const response = await chatService.listContacts(query);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data!;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for searching contacts with debounce
export const useContactSearch = (searchQuery: string) => {
  const chatService = new MockChatService();
  
  return useQuery({
    queryKey: ['contacts', 'search', searchQuery],
    queryFn: async (): Promise<Contact[]> => {
      if (!searchQuery.trim()) return [];
      
      const query: ContactQuery = {
        name: searchQuery,
        email: searchQuery,
        page: 1,
      };
      
      const response = await chatService.listContacts(query);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Return max 10 results for search
      return response.data!.payload.slice(0, 10);
    },
    enabled: searchQuery.length >= 2, // Only search with 2+ characters
    staleTime: 30000, // 30 seconds
  });
};