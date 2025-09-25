import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { MainSidebar } from './MainSidebar';
import { Button } from './ui/button';
import { LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmLogoutDialog } from './ConfirmLogoutDialog';
import { useLogoutConfirmation } from '@/hooks/useLogoutConfirmation';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    isModalOpen,
    isLoading,
    openLogoutConfirmation,
    closeLogoutConfirmation,
    confirmLogout
  } = useLogoutConfirmation();

  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  return (
    <SidebarProvider style={{ ['--sidebar-width' as any]: '14rem', ['--sidebar-width-icon' as any]: '4.5rem' } as React.CSSProperties}>
      <div className="min-h-screen flex w-full bg-background">
        <MainSidebar />
        
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <header className="h-14 flex items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="ml-5" />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {user?.name || 'Usuário'}
              </span>
              
              {/* Admin access */}
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Button>
              )}
              
              {/* Logout button */}
              <Button variant="ghost" size="sm" onClick={openLogoutConfirmation} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-muted/30 min-h-0 overflow-hidden pl-5 pr-6 py-4">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Logout confirmation dialog */}
      <ConfirmLogoutDialog 
        open={isModalOpen} 
        onOpenChange={closeLogoutConfirmation} 
        onConfirm={confirmLogout} 
        isLoading={isLoading} 
      />
    </SidebarProvider>
  );
};