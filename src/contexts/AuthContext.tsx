import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'user';
  roles: string[];
  assigned_inboxes?: number[];
  account_id?: number | null; // null for super_admin, number for admin/user
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
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
    account_id: null // Super admin is not tied to any account
  },
  {
    id: 2,
    name: 'Admin Cliente A',
    email: 'admin@solabs.com',
    role: 'admin',
    roles: ['admin', 'user'],
    assigned_inboxes: [1], // Admin assigned to specific inboxes
    account_id: 1 // Tied to Account ID 1 (SoLabs)
  },
  {
    id: 3,
    name: 'Operador Cliente A',
    email: 'operador@solabs.com',
    role: 'user',
    roles: ['user'],
    assigned_inboxes: [1], // User assigned to specific inboxes
    account_id: 1 // Tied to Account ID 1 (SoLabs)
  },
  {
    id: 4,
    name: 'Admin Cliente B',
    email: 'admin.beta@company.com',
    role: 'admin',
    roles: ['admin', 'user'],
    assigned_inboxes: [2],
    account_id: 2 // Tied to Account ID 2 (Beta Corp)
  },
  {
    id: 5,
    name: 'Operador Cliente B',
    email: 'user.beta@company.com',
    role: 'user',
    roles: ['user'],
    assigned_inboxes: [2],
    account_id: 2 // Tied to Account ID 2 (Beta Corp)
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
  };

  const value = {
    user,
    login,
    logout,
    isLoading
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