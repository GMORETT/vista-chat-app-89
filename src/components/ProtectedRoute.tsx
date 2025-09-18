import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogoutConfirmation } from '@/hooks/useLogoutConfirmation';
import { ConfirmLogoutDialog } from '@/components/ConfirmLogoutDialog';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { user, isLoading } = useAuth();
  const {
    isModalOpen,
    isLoading: isLoggingOut,
    openLogoutConfirmation,
    closeLogoutConfirmation,
    confirmLogout
  } = useLogoutConfirmation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => user.roles.includes(role));
    if (!hasRequiredRole) {
      return <Navigate to="/" replace />;
    }
  }

  // Check if user has access to any inboxes (except super_admin)
  if (user.role !== 'super_admin' && (!user.assigned_inboxes || user.assigned_inboxes.length === 0)) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Aguardando Atribuição</h2>
            <p className="text-muted-foreground">
              Você ainda não foi atribuído a nenhum canal. Entre em contato com o administrador.
            </p>
            <Button 
              variant="outline" 
              onClick={openLogoutConfirmation}
              disabled={isLoggingOut}
              className="mt-6"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair da Conta
            </Button>
          </div>
        </div>
        
        <ConfirmLogoutDialog
          open={isModalOpen}
          onOpenChange={closeLogoutConfirmation}
          onConfirm={confirmLogout}
          isLoading={isLoggingOut}
        />
      </>
    );
  }

  return <>{children}</>;
};