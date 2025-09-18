import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Button } from '../../ui/button';
import { Team, CreateTeamRequest } from '../../../models/admin';
import { useCreateTeam, useUpdateTeam } from '../../../hooks/admin/useTeams';
import { useToast } from '../../../hooks/use-toast';

const teamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  allow_auto_assign: z.boolean(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface TeamFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: Team;
}

export const TeamFormModal: React.FC<TeamFormModalProps> = ({
  open,
  onOpenChange,
  team,
}) => {
  const { toast } = useToast();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  
  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
      allow_auto_assign: false,
    },
  });

  const isEditing = !!team;

  useEffect(() => {
    if (team) {
      form.reset({
        name: team.name,
        description: team.description || '',
        allow_auto_assign: team.allow_auto_assign,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        allow_auto_assign: false,
      });
    }
  }, [team, form]);

  const onSubmit = async (data: TeamFormData) => {
    try {
      if (isEditing) {
        await updateTeam.mutateAsync({
          id: team.id,
          data: data as Partial<CreateTeamRequest>,
        });
        toast({
          title: 'Team updated',
          description: 'Team has been updated successfully.',
        });
      } else {
        await createTeam.mutateAsync(data as CreateTeamRequest);
        toast({
          title: 'Team created',
          description: 'Team has been created successfully.',
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} team.`,
        variant: 'destructive',
      });
    }
  };

  const isLoading = createTeam.isPending || updateTeam.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Team' : 'Create Team'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the team details below.'
              : 'Create a new team to organize your agents.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter team description (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allow_auto_assign"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Auto-assign conversations</FormLabel>
                    <FormDescription>
                      Automatically assign new conversations to team members
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};