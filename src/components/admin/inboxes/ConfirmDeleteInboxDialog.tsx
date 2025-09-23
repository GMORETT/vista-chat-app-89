import React from 'react';
import { Trash2 } from 'lucide-react';
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
import { Channel } from '../../../models/admin';

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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
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
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};