import React from 'react';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminClientProvider } from '../contexts/AdminClientProvider';
import { AccessGuard } from '../components/AccessGuard';
import { MountOptions } from '../mfe/types';

interface AdminAppProps {
  mountOptions: MountOptions;
}

export const AdminApp: React.FC<AdminAppProps> = ({ mountOptions }) => {
  const adminConfig = {
    apiBaseUrl: mountOptions.apiBaseUrl || 'http://localhost:3001',
    getAuthToken: mountOptions.getAuthToken || (() => 'mock-token'),
    chatwootAccountId: mountOptions.chatwootAccountId || 'mock-account-id',
  };

  return (
    <AccessGuard 
      currentUser={mountOptions.currentUser}
      onUnauthorized={mountOptions.onUnauthorized}
    >
      <AdminClientProvider config={adminConfig}>
        <AdminLayout mountOptions={mountOptions} />
      </AdminClientProvider>
    </AccessGuard>
  );
};