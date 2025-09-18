import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '../../../ui/button';
import { CreateStep, TeamFormData } from './CreateStep';
import { AddAgentsStep } from './AddAgentsStep';
import { FinishStep } from './FinishStep';
import { useCreateTeam, useAddTeamMembers } from '../../../../hooks/admin/useTeams';
import { useToast } from '../../../../hooks/use-toast';

const teamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string(),
  allow_auto_assign: z.boolean(),
  selectedAgents: z.array(z.number()),
});

const steps = [
  { id: 'create', title: 'Create', component: CreateStep },
  { id: 'agents', title: 'Add Agents', component: AddAgentsStep },
  { id: 'finish', title: 'Finish', component: FinishStep },
];

export const TeamWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const createTeam = useCreateTeam();
  const addTeamMembers = useAddTeamMembers();

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      description: '',
      allow_auto_assign: false,
      selectedAgents: [],
    },
  });

  const currentStepData = steps[currentStep];
  const StepComponent = currentStepData.component;

  const canProceed = () => {
    if (currentStep === 0) {
      return form.getValues('name').trim().length > 0;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateTeam = async () => {
    if (!canProceed()) return;

    setIsCreating(true);
    try {
      const formData = form.getValues();
      
      // Create the team
      const newTeam = await createTeam.mutateAsync({
        name: formData.name,
        description: formData.description,
        allow_auto_assign: formData.allow_auto_assign,
      });

      // Add agents to the team if any were selected
      if (formData.selectedAgents.length > 0) {
        await addTeamMembers.mutateAsync({
          teamId: newTeam.id,
          agentIds: formData.selectedAgents,
        });
      }

      toast({
        title: 'Team created',
        description: `Team "${formData.name}" has been created successfully.`,
      });

      navigate('/admin/teams');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create team. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/teams')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Create Team</h1>
                <p className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                const isAccessible = index <= currentStep;

                return (
                  <button
                    key={step.id}
                    onClick={() => isAccessible && setCurrentStep(index)}
                    disabled={!isAccessible}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : isCompleted
                        ? 'bg-muted text-foreground hover:bg-muted/80'
                        : 'text-muted-foreground cursor-not-allowed'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                      isActive
                        ? 'bg-primary-foreground text-primary'
                        : isCompleted
                        ? 'bg-green-100 text-green-600'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <span className="font-medium">{step.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg border p-8">
              <StepComponent 
                form={form} 
                onNext={currentStep === 1 ? handleNext : undefined}
                onCreateTeam={currentStep === 2 ? handleCreateTeam : undefined}
                isCreating={isCreating}
              />

              {/* Actions - Hide on finish step */}
              {currentStep < 2 && (
                <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Previous
                </Button>

                <div className="flex gap-3">
                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed()}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreateTeam}
                      disabled={!canProceed() || isCreating}
                    >
                      {isCreating ? 'Creating...' : 'Create team'}
                    </Button>
                  )}
                 </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};