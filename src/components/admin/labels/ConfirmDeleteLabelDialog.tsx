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
import { Label } from '../../../models/admin';

interface ConfirmDeleteLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  label: Label | null;
  isLoading?: boolean;
}

export const ConfirmDeleteLabelDialog: React.FC<ConfirmDeleteLabelDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  label,
  isLoading,
}) => {
  if (!label) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Inativação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja inativar a label "{label.title}"? 
            Ela não aparecerá mais nos filtros ativos, mas o histórico será mantido.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Inativando...' : 'Inativar Label'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};