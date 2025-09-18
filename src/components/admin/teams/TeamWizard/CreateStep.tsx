import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../ui/form';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Switch } from '../../../ui/switch';

export interface TeamFormData {
  name: string;
  description: string;
  allow_auto_assign: boolean;
  selectedAgents: number[];
}

interface CreateStepProps {
  form: UseFormReturn<TeamFormData>;
}

export const CreateStep: React.FC<CreateStepProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Create</h2>
        <p className="text-muted-foreground">
          Add a team name and description
        </p>
      </div>

      <Form {...form}>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Please enter a team name" 
                    {...field} 
                  />
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
                <FormLabel>Team description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please enter a description for the team"
                    className="min-h-[100px]"
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
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Allow auto assign for this team
                  </FormLabel>
                  <FormDescription>
                    Automatically assign conversations to team members
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
        </div>
      </Form>
    </div>
  );
};