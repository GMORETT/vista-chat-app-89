import React, { useEffect, useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../ui/alert-dialog';
import { Alert, AlertDescription } from '../../ui/alert';
import { useAdminService } from '../../../services/AdminService';
import { Channel } from '../../../models/admin';

interface InboxDependencies {
  activeConversations: number;
  activeCredentials: number;
  assignedAgents: number;
}

interface ConfirmDeleteInboxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inbox: Channel | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export const ConfirmDeleteInboxDialog: React.FC<ConfirmDeleteInboxDialogProps> = ({
  open,
  onOpenChange,
  inbox,
  onConfirm,
  isLoading,
}) => {
  const [dependencies, setDependencies] = useState<InboxDependencies | null>(null);
  const [checkingDependencies, setCheckingDependencies] = useState(false);
  const adminService = useAdminService();

  useEffect(() => {
    if (open && inbox) {
      setCheckingDependencies(true);
      // Simulate dependency check - replace with actual API call
      setTimeout(() => {
        const mockDependencies: InboxDependencies = {
          activeConversations: Math.floor(Math.random() * 5),
          activeCredentials: Math.floor(Math.random() * 2),
          assignedAgents: Math.floor(Math.random() * 3),
        };
        setDependencies(mockDependencies);
        setCheckingDependencies(false);
      }, 800);
    }
  }, [open, inbox]);

  const hasDependencies = dependencies && (
    dependencies.activeConversations > 0 || 
    dependencies.activeCredentials > 0 || 
    dependencies.assignedAgents > 0
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Excluir Inbox
          </AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza de que deseja excluir o inbox "{inbox?.name}"?
            <br />
            <br />
            <strong className="text-destructive">
              Esta ação não pode ser desfeita e todos os dados relacionados serão perdidos.
            </strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {checkingDependencies && (
          <div className="py-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        )}

        {dependencies && hasDependencies && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="font-medium mb-2">Atenção: Este inbox possui dependências ativas:</div>
              <ul className="text-sm space-y-1">
                {dependencies.activeConversations > 0 && (
                  <li>• {dependencies.activeConversations} conversas ativas</li>
                )}
                {dependencies.activeCredentials > 0 && (
                  <li>• {dependencies.activeCredentials} credenciais ativas no provedor</li>
                )}
                {dependencies.assignedAgents > 0 && (
                  <li>• {dependencies.assignedAgents} agentes atribuídos</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading || checkingDependencies}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading || checkingDependencies}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Excluindo...' : checkingDependencies ? 'Verificando...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};