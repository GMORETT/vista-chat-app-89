import { useQuery } from '@tanstack/react-query';
import { Contact, ContactsResponse, ContactQuery } from '../models';
import { mockContacts } from '../data/mockData';

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
  return useQuery({
    queryKey: ['contacts', query],
    queryFn: async (): Promise<ContactsResponse> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const filteredContacts = filterContacts(mockContacts, query);
      
      // Simulate pagination
      const page = query.page || 1;
      const limit = 25;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedContacts = filteredContacts.slice(start, end);
      
      return {
        payload: paginatedContacts,
        meta: {
          count: paginatedContacts.length,
          current_page: page,
          total_count: filteredContacts.length,
          total_pages: Math.ceil(filteredContacts.length / limit),
        },
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for searching contacts with debounce
export const useContactSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: ['contacts', 'search', searchQuery],
    queryFn: async (): Promise<Contact[]> => {
      if (!searchQuery.trim()) return [];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const query = searchQuery.toLowerCase();
      return mockContacts.filter(contact =>
        contact.name.toLowerCase().includes(query) ||
        contact.email?.toLowerCase().includes(query) ||
        contact.phone_number?.includes(searchQuery)
      ).slice(0, 10); // Limit to 10 results for search
    },
    enabled: searchQuery.length >= 2, // Only search with 2+ characters
    staleTime: 30000, // 30 seconds
  });
};