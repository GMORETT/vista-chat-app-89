import React from 'react';
import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface ProgressStep {
  id: string;
  label: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

interface ConnectionProgressProps {
  steps: ProgressStep[];
  currentStep?: string;
  className?: string;
}

export const ConnectionProgress: React.FC<ConnectionProgressProps> = ({
  steps,
  currentStep,
  className
}) => {
  const getStepIcon = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'in-progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStepStatus = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-emerald-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'error':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getStepIcon(step)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className={cn('font-medium', getStepStatus(step))}>
              {step.label}
            </div>
            {step.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {step.description}
              </p>
            )}
          </div>
          
          {index < steps.length - 1 && (
            <div className="absolute left-2.5 mt-8 h-6 w-px bg-border" />
          )}
        </div>
      ))}
    </div>
  );
};