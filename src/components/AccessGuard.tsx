import React, { useEffect } from 'react';
import { MountOptions } from '@/mfe/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AccessGuardProps {
  children: React.ReactNode;
  currentUser?: MountOptions['currentUser'];
  onUnauthorized?: () => void;
  requiredRoles?: string[];
}

const AccessDeniedPage: React.FC<{ onUnauthorized?: () => void }> = ({ onUnauthorized }) => {
  const { logout } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">Acesso Negado</CardTitle>
          <CardDescription>
            Você não possui permissões para acessar esta área administrativa.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <Shield className="mr-2 h-4 w-4" />
            Permissão necessária: super_admin
          </div>
          <Button onClick={logout} variant="outline" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Entrar com outra conta
          </Button>
          {onUnauthorized && (
            <Button onClick={onUnauthorized} variant="ghost" className="w-full">
              Voltar
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const AccessGuard: React.FC<AccessGuardProps> = ({ 
  children, 
  currentUser, 
  onUnauthorized,
  requiredRoles = ['super_admin']
}) => {
  const { user: authUser } = useAuth();
  
  // Use authenticated user from context, fallback to currentUser prop
  const user = authUser || currentUser;
  const userRoles = user?.roles || [];
  const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

  useEffect(() => {
    if (!hasRequiredRole && onUnauthorized) {
      onUnauthorized();
    }
  }, [hasRequiredRole, onUnauthorized]);

  if (!hasRequiredRole) {
    return <AccessDeniedPage onUnauthorized={onUnauthorized} />;
  }

  return <>{children}</>;
};