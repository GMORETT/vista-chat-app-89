import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Agent, UpdateAgentRequest } from '../../../models/admin';
import { useToast } from '../../../hooks/use-toast';

const updateAgentSchema = z.object({
  display_name: z.string().optional(),
  availability_status: z.enum(['available', 'busy', 'offline']),
});

type UpdateAgentFormData = z.infer<typeof updateAgentSchema>;

interface AgentEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  onSubmit: (id: number, data: UpdateAgentRequest) => Promise<void>;
  isLoading: boolean;
}

export const AgentEditModal: React.FC<AgentEditModalProps> = ({
  open,
  onOpenChange,
  agent,
  onSubmit,
  isLoading,
}) => {
  const { toast } = useToast();
  
  const form = useForm<UpdateAgentFormData>({
    resolver: zodResolver(updateAgentSchema),
    defaultValues: {
      display_name: '',
      availability_status: 'available',
    },
  });

  React.useEffect(() => {
    if (agent && open) {
      form.reset({
        display_name: agent.display_name || '',
        availability_status: agent.availability_status,
      });
    }
  }, [agent, open, form]);

  const handleSubmit = async (data: UpdateAgentFormData) => {
    if (!agent) return;
    
    try {
      await onSubmit(agent.id, {
        display_name: data.display_name || undefined,
        availability_status: data.availability_status,
      });
      
      onOpenChange(false);
      toast({
        title: 'Agent updated',
        description: 'The agent has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating agent:', error);
      
      // Handle specific BFF errors
      let errorMessage = 'Failed to update agent. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('400')) {
          errorMessage = 'Invalid data provided. Please check your inputs.';
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to update this agent.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Agent not found.';
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isLoading) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Agent</DialogTitle>
          <DialogDescription>
            Update the display name and availability status for {agent.name}.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Full Name</div>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {agent.name}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                {agent.email}
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="display_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="John - Support Team" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="availability_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Agent
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};