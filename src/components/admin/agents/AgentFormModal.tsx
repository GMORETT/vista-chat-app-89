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
import { CreateAgentRequest } from '../../../models/admin';
import { useToast } from '../../../hooks/use-toast';

const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  display_name: z.string().optional(),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
  role: z.enum(['agent', 'administrator']).default('agent'),
});

type CreateAgentFormData = z.infer<typeof createAgentSchema>;

interface AgentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateAgentRequest) => Promise<void>;
  isLoading: boolean;
}

export const AgentFormModal: React.FC<AgentFormModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}) => {
  const { toast } = useToast();
  
  const form = useForm<CreateAgentFormData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: '',
      display_name: '',
      email: '',
      password: '',
      role: 'agent',
    },
  });

  const handleSubmit = async (data: CreateAgentFormData) => {
    try {
      await onSubmit({
        name: data.name,
        display_name: data.display_name || undefined,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      
      form.reset();
      onOpenChange(false);
      toast({
        title: 'Agent created',
        description: 'The agent has been created successfully.',
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      
      // Handle specific BFF errors
      let errorMessage = 'Failed to create agent. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('409')) {
          errorMessage = 'An agent with this email already exists.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid data provided. Please check your inputs.';
        } else if (error.message.includes('403')) {
          errorMessage = 'You do not have permission to create agents.';
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Add a new agent to handle customer conversations. They will receive an invitation email.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@company.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="administrator">Administrator</SelectItem>
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
                Create Agent
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};