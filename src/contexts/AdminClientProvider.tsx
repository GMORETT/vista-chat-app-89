import React, { createContext, useContext, ReactNode } from 'react';

interface AdminClientConfig {
  apiBaseUrl: string;
  getAuthToken: () => string | Promise<string>;
  chatwootAccountId: string;
}

const AdminClientContext = createContext<AdminClientConfig | null>(null);

interface AdminClientProviderProps {
  children: ReactNode;
  config: AdminClientConfig;
}

export const AdminClientProvider: React.FC<AdminClientProviderProps> = ({
  children,
  config,
}) => {
  return (
    <AdminClientContext.Provider value={config}>
      {children}
    </AdminClientContext.Provider>
  );
};

export const useAdminClient = (): AdminClientConfig => {
  const context = useContext(AdminClientContext);
  if (!context) {
    throw new Error('useAdminClient must be used within AdminClientProvider');
  }
  return context;
};