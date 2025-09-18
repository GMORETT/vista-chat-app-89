import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { useLabels, useCreateLabel } from '../hooks/useLabels';

interface LabelManagerProps {
  selectedLabels: string[];
  onLabelsChange: (labels: string[]) => void;
  onApply: (labels: string[]) => void;
  isLoading?: boolean;
}

export const LabelManager: React.FC<LabelManagerProps> = ({
  selectedLabels,
  onLabelsChange,
  onApply,
  isLoading = false,
}) => {
  const [newLabelText, setNewLabelText] = useState('');
  const { data: allLabels = [] } = useLabels();
  const createLabelMutation = useCreateLabel();

  const handleAddLabel = (labelText: string) => {
    if (labelText.trim() && !selectedLabels.includes(labelText.trim())) {
      const newLabels = [...selectedLabels, labelText.trim()];
      onLabelsChange(newLabels);
    }
  };

  const handleRemoveLabel = (labelText: string) => {
    const newLabels = selectedLabels.filter(label => label !== labelText);
    onLabelsChange(newLabels);
  };

  const handleCreateAndAddLabel = async () => {
    if (!newLabelText.trim()) return;
    
    const trimmedText = newLabelText.trim();
    
    // Check if label already exists
    const existingLabel = allLabels.find(label => 
      label.title.toLowerCase() === trimmedText.toLowerCase()
    );
    
    if (existingLabel) {
      handleAddLabel(existingLabel.title);
    } else {
      // Create new label
      await createLabelMutation.mutateAsync({ title: trimmedText });
      handleAddLabel(trimmedText);
    }
    
    setNewLabelText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateAndAddLabel();
    }
  };

  const handleToggleExistingLabel = (label: { title: string }, checked: boolean) => {
    if (checked) {
      handleAddLabel(label.title);
    } else {
      handleRemoveLabel(label.title);
    }
  };

  return (
    <div className="space-y-4">
      {/* New Label Input */}
      <div className="space-y-2">
        <Label htmlFor="new-label">Nova Label</Label>
        <div className="flex gap-2">
          <Input
            id="new-label"
            placeholder="Digite o nome da label..."
            value={newLabelText}
            onChange={(e) => setNewLabelText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleCreateAndAddLabel}
            disabled={!newLabelText.trim() || createLabelMutation.isPending}
            size="sm"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div className="space-y-2">
          <Label>Labels Selecionadas</Label>
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map((label) => (
              <Badge
                key={label}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <Tag className="h-3 w-3" />
                {label}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={() => handleRemoveLabel(label)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Existing Labels */}
      {allLabels.length > 0 && (
        <div className="space-y-2">
          <Label>Labels Existentes</Label>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {allLabels.map((label) => (
                <div key={label.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`label-${label.id}`}
                    checked={selectedLabels.includes(label.title)}
                    onCheckedChange={(checked) => 
                      handleToggleExistingLabel(label, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`label-${label.id}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.title}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Apply Button */}
      <Button
        onClick={() => onApply(selectedLabels)}
        disabled={selectedLabels.length === 0 || isLoading}
        className="w-full"
      >
        {isLoading ? 'Aplicando...' : `Aplicar ${selectedLabels.length} Label(s)`}
      </Button>
    </div>
  );
};
