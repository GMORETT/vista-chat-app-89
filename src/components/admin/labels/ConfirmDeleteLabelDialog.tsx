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
          <AlertDialogTitle>Confirmar Exclusão de Label</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a label "{label.title}"?
            <br /><br />
            <strong>Esta ação não pode ser desfeita.</strong> A label será removida permanentemente e não aparecerá mais em:
            <br />
            • Filtros de conversas e contatos
            <br />
            • Histórico de mensagens
            <br />
            • Relatórios e analytics
            <br /><br />
            Conversas e contatos que possuem esta label perderão essa marcação.
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
            {isLoading ? 'Excluindo...' : 'Excluir Label'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};