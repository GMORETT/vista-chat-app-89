import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button } from '../../../ui/button';
import { TeamFormData } from './CreateStep';

interface FinishStepProps {
  form: UseFormReturn<TeamFormData>;
  onNext?: () => void;
}

export const FinishStep: React.FC<FinishStepProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-foreground mb-2">Your team is ready!</h2>
        <p className="text-muted-foreground">
          Agents in this team can collaborate and work on conversations
        </p>
      </div>

      <div className="flex justify-center pt-8">
        <Button 
          type="submit" 
          size="lg"
          className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white"
        >
          Finish
        </Button>
      </div>
    </div>
  );
};