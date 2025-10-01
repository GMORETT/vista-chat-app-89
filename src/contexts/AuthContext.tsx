import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConversationStore } from '../state/stores/conversationStore';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  roles: string[];
  assigned_inboxes?: number[];
  account_id?: number | null; // null for super_admin, number for admin/user
  chatwoot_token?: string; // JWT token for Chatwoot API authentication
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  getChatwootConfig: () => ChatwootConfig | null;
}

interface ChatwootConfig {
  baseUrl: string;
  websocketUrl: string;
  token: string;
  pubsubToken?: string;
  accountId: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fake users for demo
const FAKE_USERS: User[] = [
  {
    id: 1,
    name: 'Super Admin',
    email: 'superadmin@solabs.com',
    role: 'super_admin',
    roles: ['super_admin', 'admin', 'user'],
    assigned_inboxes: [], // Super admin has access to all inboxes
    account_id: null, // Super admin is not tied to any account
    chatwoot_token: 'kwPgULQj9LuGPBYaP5FRVza5'
  },
  {
    id: 2,
    name: 'Admin Cliente A',
    email: 'admin@solabs.com',
    role: 'admin',
    roles: ['admin', 'user'],
    assigned_inboxes: [1], // Admin assigned to specific inboxes
    account_id: 1, // Tied to Account ID 1 (SoLabs)
    chatwoot_token: 'kwPgULQj9LuGPBYaP5FRVza5'
  },
  {
    id: 3,
    name: 'Operador Cliente A',
    email: 'operador@solabs.com',
    role: 'user',
    roles: ['user'],
    assigned_inboxes: [1], // User assigned to specific inboxes
    account_id: 1, // Tied to Account ID 1 (SoLabs)
    chatwoot_token: 'kwPgULQj9LuGPBYaP5FRVza5'
  },
  {
    id: 4,
    name: 'Admin Cliente B',
    email: 'admin.beta@company.com',
    role: 'admin',
    roles: ['admin', 'user'],
    assigned_inboxes: [2],
    account_id: 2, // Tied to Account ID 2 (Beta Corp)
    chatwoot_token: 'kwPgULQj9LuGPBYaP5FRVza5'
  },
  {
    id: 5,
    name: 'Operador Cliente B',
    email: 'user.beta@company.com',
    role: 'user',
    roles: ['user'],
    assigned_inboxes: [2],
    account_id: 2, // Tied to Account ID 2 (Beta Corp)
    chatwoot_token: 'kwPgULQj9LuGPBYaP5FRVza5'
  }
];

const FAKE_CREDENTIALS = {
  'superadmin@solabs.com': 'super123',
  'admin@solabs.com': 'admin123',
  'operador@solabs.com': 'operador123',
  'admin.beta@company.com': 'beta123',
  'user.beta@company.com': 'beta123'
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { clearSelection } = useConversationStore();

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('solabs-auth-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('solabs-auth-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check credentials
    const expectedPassword = FAKE_CREDENTIALS[email as keyof typeof FAKE_CREDENTIALS];
    if (!expectedPassword || expectedPassword !== password) {
      setIsLoading(false);
      return false;
    }
    
    // Find user
    const foundUser = FAKE_USERS.find(u => u.email === email);
    if (!foundUser) {
      setIsLoading(false);
      return false;
    }
    
    setUser(foundUser);
    localStorage.setItem('solabs-auth-user', JSON.stringify(foundUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('solabs-auth-user');
    clearSelection(); // Clear conversation selection on logout
  };

  const getChatwootConfig = (): ChatwootConfig | null => {
    console.log('🔧 AuthContext getChatwootConfig Debug:');
    console.log('- user:', user);
    console.log('- user.chatwoot_token:', user?.chatwoot_token);
    console.log('- VITE_CHATWOOT_BASE_URL:', import.meta.env.VITE_CHATWOOT_BASE_URL);
    console.log('- VITE_CHATWOOT_WEBSOCKET_URL:', import.meta.env.VITE_CHATWOOT_WEBSOCKET_URL);
    
    if (!user?.chatwoot_token) {
      console.warn('❌ No user or chatwoot_token found');
      return null;
    }

    const baseUrl = import.meta.env.VITE_CHATWOOT_BASE_URL;
    const websocketUrl = import.meta.env.VITE_CHATWOOT_WEBSOCKET_URL;
    const accountId = user.account_id || parseInt(import.meta.env.VITE_CHATWOOT_ACCOUNT_ID || '1');

    if (!baseUrl || !websocketUrl) {
      console.warn('❌ Chatwoot configuration incomplete. Check environment variables.');
      console.warn('baseUrl:', baseUrl);
      console.warn('websocketUrl:', websocketUrl);
      return null;
    }

    const config = {
      baseUrl,
      websocketUrl,
      token: user.chatwoot_token,
      // Note: pubsubToken will be fetched separately when needed
      accountId,
    };
    
    console.log('✅ Chatwoot config created:', config);
    return config;
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    getChatwootConfig
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};