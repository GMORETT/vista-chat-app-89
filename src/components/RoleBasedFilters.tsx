import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ConversationToolbar } from './ConversationToolbar';
import { ClientAccountFilter } from './ClientAccountFilter';
import { InboxSelector } from './InboxSelector';

export const RoleBasedFilters: React.FC = () => {
  const { user } = useAuth();

  // For users with 'user' role, show simplified view
  if (user?.role === 'user') {
    return (
      <div className="border-b border-border bg-card">
        {/* Channel filter for users */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border">
          <InboxSelector />
        </div>
        
        {/* Main conversation toolbar */}
        <ConversationToolbar />
      </div>
    );
  }

  // For admin and super_admin, show full hierarchical filters
  return (
    <div className="border-b border-border bg-card">
      {/* Hierarchical filters: Client → Channel */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-6">
          {/* Super admin client filter */}
          {user?.role === 'super_admin' && <ClientAccountFilter />}
          
          {/* Channel filter for all admin roles */}
          <InboxSelector />
        </div>
      </div>
      
      {/* Main conversation toolbar */}
      <ConversationToolbar />
    </div>
  );
};