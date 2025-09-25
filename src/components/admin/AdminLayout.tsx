import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { MountOptions } from '../../mfe/types';
import { Button } from '../ui/button';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmLogoutDialog } from '../ConfirmLogoutDialog';
import { useLogoutConfirmation } from '@/hooks/useLogoutConfirmation';
interface AdminLayoutProps {
  mountOptions: MountOptions;
}
export const AdminLayout: React.FC<AdminLayoutProps> = ({
  mountOptions
}) => {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    isModalOpen,
    isLoading,
    openLogoutConfirmation,
    closeLogoutConfirmation,
    confirmLogout
  } = useLogoutConfirmation();
  const currentUser = user || mountOptions.currentUser;
  return <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex flex-col flex-1">
          {/* Header */}
          <header className="h-14 flex items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold text-foreground">Solabs Admin</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentUser?.name || 'Admin User'}
              </span>
              
              {/* Back to operator mode */}
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Início
              </Button>
              
              {/* Logout button */}
              <Button variant="ghost" size="sm" onClick={openLogoutConfirmation} title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
      
      {/* Logout confirmation dialog */}
      <ConfirmLogoutDialog open={isModalOpen} onOpenChange={closeLogoutConfirmation} onConfirm={confirmLogout} isLoading={isLoading} />
    </SidebarProvider>;
};