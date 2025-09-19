import React from 'react';
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
import { Account } from '../../../models/chat';

interface ConfirmStatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  newStatus: 'active' | 'inactive';
  onConfirm: () => void;
  isLoading?: boolean;
}

export const ConfirmStatusChangeDialog: React.FC<ConfirmStatusChangeDialogProps> = ({
  open,
  onOpenChange,
  account,
  newStatus,
  onConfirm,
  isLoading,
}) => {
  const isChangingToInactive = newStatus === 'inactive';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Mudança de Status</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja mudar o status do cliente <strong>{account?.name}</strong> para{' '}
              <strong>{newStatus === 'active' ? 'Ativo' : 'Inativo'}</strong>?
            </p>
            {isChangingToInactive && (
              <>
                <p className="text-destructive font-medium">
                  ⚠️ Ao tornar o cliente inativo:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Todos os agentes associados perderão acesso à área de operador</li>
                  <li>As conversas serão pausadas</li>
                  <li>Novos atendimentos serão bloqueados</li>
                </ul>
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Não
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className={isChangingToInactive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {isLoading ? 'Alterando...' : 'Sim'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};