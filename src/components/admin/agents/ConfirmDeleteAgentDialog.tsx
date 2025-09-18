import React from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { Agent } from '../../../models/admin';
import { useToast } from '../../../hooks/use-toast';

interface ConfirmDeleteAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  onConfirm: (id: number) => Promise<void>;
  isLoading: boolean;
}

export const ConfirmDeleteAgentDialog: React.FC<ConfirmDeleteAgentDialogProps> = ({
  open,
  onOpenChange,
  agent,
  onConfirm,
  isLoading,
}) => {
  const { toast } = useToast();

  const handleConfirm = async () => {
    if (!agent) return;
    
    try {
      await onConfirm(agent.id);
      onOpenChange(false);
      toast({
        title: 'Agent deleted',
        description: `${agent.name} has been removed from the system.`,
      });
    } catch (error) {
      console.error('Error deleting agent:', error);
      
      // Handle specific BFF errors
      let errorMessage = 'Failed to delete agent. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to delete this agent.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Agent not found.';
        } else if (error.message.includes('409')) {
          errorMessage = 'Cannot delete agent. They may have active conversations.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Internal server error. Please try again later.';
        }
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (!agent) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <div>
              Are you sure you want to delete <strong>{agent.name}</strong>?
            </div>
            <div className="text-sm bg-muted p-2 rounded">
              <div><strong>Email:</strong> {agent.email}</div>
              <div><strong>Role:</strong> {agent.role}</div>
              {agent.display_name && (
                <div><strong>Display Name:</strong> {agent.display_name}</div>
              )}
            </div>
            <div className="text-destructive font-medium">
              This action cannot be undone. The agent will be permanently removed from the system.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Agent
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};