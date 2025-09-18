import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ConversationToolbar } from './ConversationToolbar';
import { SuperAdminInboxFilter } from './SuperAdminInboxFilter';

export const RoleBasedFilters: React.FC = () => {
  const { user } = useAuth();

  // For users with 'user' role, don't show advanced filters
  if (user?.role === 'user') {
    return (
      <div className="border-b border-border bg-card">
        {/* Simplified toolbar for users - only search */}
        <div className="p-4">
          <div className="text-sm text-muted-foreground">
            Visualizando apenas suas conversas atribuídas
          </div>
        </div>
      </div>
    );
  }

  // For admin and super_admin, show full toolbar
  return (
    <div className="border-b border-border bg-card">
      {/* Super admin inbox filter */}
      {user?.role === 'super_admin' && <SuperAdminInboxFilter />}
      
      {/* Main conversation toolbar */}
      <ConversationToolbar />
    </div>
  );
};