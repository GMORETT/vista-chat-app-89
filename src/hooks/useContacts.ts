import { useQuery } from '@tanstack/react-query';
import { Contact, ContactQuery, ContactsResponse } from '../models';
import { MockChatService } from '../api/MockChatService';
import { BffChatService } from '../api/BffChatService';
import { useMemo } from 'react';

// Helper function to filter and sort contacts
const filterContacts = (contacts: Contact[], query: ContactQuery): Contact[] => {
  let filtered = [...contacts];

  // Apply filters
  if (query.name) {
    const name = query.name.toLowerCase();
    filtered = filtered.filter(contact => 
      contact.name?.toLowerCase().includes(name)
    );
  }

  if (query.email) {
    const email = query.email.toLowerCase();
    filtered = filtered.filter(contact => 
      contact.email?.toLowerCase().includes(email)
    );
  }

  if (query.phone_number) {
    filtered = filtered.filter(contact => 
      contact.phone_number?.includes(query.phone_number!)
    );
  }

  if (query.identifier) {
    const identifier = query.identifier.toLowerCase();
    filtered = filtered.filter(contact => 
      contact.identifier?.toLowerCase().includes(identifier)
    );
  }

  // Apply sorting
  if (query.sort) {
    const [field, direction] = query.sort.split(':');
    filtered.sort((a, b) => {
      const aVal = (a as any)[field] || '';
      const bVal = (b as any)[field] || '';
      const result = aVal.localeCompare(bVal);
      return direction === 'desc' ? -result : result;
    });
  } else {
    // Default sort by name
    filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }

  return filtered;
};

export const useContacts = (query: ContactQuery = {}) => {
  const useBff = import.meta.env.VITE_USE_BFF === 'true';
  const chatService = useBff ? new BffChatService() : new MockChatService();
  
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

export const useContactSearch = (searchQuery: string) => {
  const useBff = import.meta.env.VITE_USE_BFF === 'true';
  const chatService = useBff ? new BffChatService() : new MockChatService();
  
  return useQuery({
    queryKey: ['contacts', 'search', searchQuery],
    queryFn: async (): Promise<Contact[]> => {
      if (searchQuery.length < 2) {
        return [];
      }

      const query: ContactQuery = {
        name: searchQuery,
      };

      const response = await chatService.listContacts(query);
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Return only first 10 results for search
      return response.data!.payload.slice(0, 10);
    },
    enabled: searchQuery.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};