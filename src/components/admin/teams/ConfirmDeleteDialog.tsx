import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
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
import { Team } from '../../../models/admin';
import { useDeleteTeam } from '../../../hooks/admin/useTeams';
import { useToast } from '../../../hooks/use-toast';

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onOpenChange,
  team,
}) => {
  const { toast } = useToast();
  const deleteTeam = useDeleteTeam();

  if (!team) return null;

  const handleDelete = async () => {
    try {
      await deleteTeam.mutateAsync(team.id);
      toast({
        title: 'Team deleted',
        description: `Team "${team.name}" has been deleted successfully.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete team.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Team
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{team.name}"? This action cannot be undone.
            All team members will be removed from this team.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteTeam.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTeam.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteTeam.isPending ? (
              <>
                <Trash2 className="h-4 w-4 mr-2 animate-pulse" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Team
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};