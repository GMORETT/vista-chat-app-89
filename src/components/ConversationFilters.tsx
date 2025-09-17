import React from 'react';
import { ConversationToolbar } from './ConversationToolbar';

export const ConversationFilters: React.FC = () => {
  return (
    <div className="border-b border-border bg-card">
      {/* Toolbar */}
      <ConversationToolbar />
    </div>
  );
};