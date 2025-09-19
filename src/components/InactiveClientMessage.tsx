import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export const InactiveClientMessage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Alert className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Cliente Inativo</AlertTitle>
        <AlertDescription>
          Este cliente está inativo. Entre em contato com o administrador para reativar o acesso.
        </AlertDescription>
      </Alert>
    </div>
  );
};