import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface InboxContextType {
  activeInboxIds: number[];
  setActiveInboxIds: (inboxIds: number[]) => void;
  availableInboxIds: number[];
}

const InboxContext = createContext<InboxContextType | undefined>(undefined);

interface InboxProviderProps {
  children: ReactNode;
}

// Mock inboxes for now
const MOCK_INBOXES = [
  { id: 1, name: 'Cliente A - Website' },
  { id: 2, name: 'Cliente B - WhatsApp' },
  { id: 3, name: 'Cliente C - E-mail' },
];

export const InboxProvider: React.FC<InboxProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [activeInboxIds, setActiveInboxIds] = useState<number[]>([]);
  const [availableInboxIds, setAvailableInboxIds] = useState<number[]>([]);

  useEffect(() => {
    if (!user) return;

    let inboxes: number[] = [];

    if (user.role === 'super_admin') {
      // Super admin can see all inboxes
      inboxes = MOCK_INBOXES.map(inbox => inbox.id);
      setActiveInboxIds(inboxes); // Start with all inboxes active
    } else if (user.assigned_inboxes && user.assigned_inboxes.length > 0) {
      // Admin and user see only assigned inboxes
      inboxes = user.assigned_inboxes;
      setActiveInboxIds(inboxes); // Start with all assigned inboxes active
    }

    setAvailableInboxIds(inboxes);
  }, [user]);

  const value = {
    activeInboxIds,
    setActiveInboxIds,
    availableInboxIds,
  };

  return (
    <InboxContext.Provider value={value}>
      {children}
    </InboxContext.Provider>
  );
};

export const useInbox = () => {
  const context = useContext(InboxContext);
  if (context === undefined) {
    throw new Error('useInbox must be used within an InboxProvider');
  }
  return context;
};