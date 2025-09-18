import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { MountOptions } from '../../mfe/types';

interface AdminLayoutProps {
  mountOptions: MountOptions;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ mountOptions }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex flex-col flex-1">
          {/* Header */}
          <header className="h-14 flex items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold text-foreground">
                Solabs Messages Admin
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {mountOptions.currentUser?.name || 'Admin User'}
              </span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};