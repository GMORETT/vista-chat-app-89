import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Tag } from 'lucide-react';
import { LabelManager } from './LabelManager';

interface ApplyLabelsModalProps {
  title: string;
  description: string;
  onApply: (labels: string[]) => Promise<void>;
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export const ApplyLabelsModal: React.FC<ApplyLabelsModalProps> = ({
  title,
  description,
  onApply,
  trigger,
  children,
}) => {
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async (labels: string[]) => {
    setIsLoading(true);
    try {
      await onApply(labels);
      setSelectedLabels([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Error applying labels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Tag className="h-4 w-4 mr-2" />
      Gerenciar Labels
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || children || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <LabelManager
          selectedLabels={selectedLabels}
          onLabelsChange={setSelectedLabels}
          onApply={handleApply}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};