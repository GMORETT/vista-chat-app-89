import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from './ui/sidebar';
import { MainSidebar } from './MainSidebar';

export const MainLayout: React.FC = () => {
  return (
    <SidebarProvider style={{ ['--sidebar-width' as any]: '14rem', ['--sidebar-width-icon' as any]: '4.5rem' } as React.CSSProperties}>
      <div className="min-h-screen flex w-full bg-background">
        <MainSidebar />
        
        <div className="flex flex-col flex-1 min-w-0">
          {/* Main Content */}
          <main className="flex-1 bg-muted/30 min-h-0 overflow-hidden p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};