import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useConversationStore } from '../state/conversationStore';

interface FilterRule {
  id: string;
  field: string;
  operator: 'equal_to' | 'not_equal_to';
  value: string;
  connector?: 'AND' | 'OR';
}

interface AdvancedFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const filterFields = [
  { value: 'status', label: 'Status' },
  { value: 'assignee_type', label: 'Activity' },
  { value: 'team_id', label: 'Team' },
  { value: 'assignee_id', label: 'Agent Name' },
  { value: 'labels', label: 'Label' },
  { value: 'inbox_id', label: 'Inbox' },
  { value: 'priority', label: 'Priority' },
];

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'pending', label: 'Pending' },
  { value: 'snoozed', label: 'Snoozed' },
  { value: 'resolved', label: 'Resolved' },
];

const activityOptions = [
  { value: 'me', label: 'Mine' },
  { value: 'unassigned', label: 'Unassigned' },
  { value: 'all', label: 'All' },
];

const priorityOptions = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { filters, setFilters } = useConversationStore();
  const [rules, setRules] = useState<FilterRule[]>([]);

  const addNewRule = () => {
    const newRule: FilterRule = {
      id: Date.now().toString(),
      field: 'status',
      operator: 'equal_to',
      value: '',
      connector: rules.length > 0 ? 'AND' : undefined,
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (id: string, updates: Partial<FilterRule>) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const getValueOptions = (field: string) => {
    switch (field) {
      case 'status': return statusOptions;
      case 'assignee_type': return activityOptions;
      case 'priority': return priorityOptions;
      default: return [];
    }
  };

  const applyFilters = () => {
    // Here you would convert the rules to the appropriate filter format
    // For now, we'll just close the modal
    onOpenChange(false);
  };

  const clearAllRules = () => {
    setRules([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {rules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No filters applied</p>
              <p className="text-sm">Click "Add filter" to start filtering conversations</p>
            </div>
          )}

          {rules.map((rule, index) => (
            <div key={rule.id} className="space-y-3">
              {index > 0 && (
                <div className="flex justify-center">
                  <Select
                    value={rule.connector}
                    onValueChange={(value: 'AND' | 'OR') => 
                      updateRule(rule.id, { connector: value })
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AND">AND</SelectItem>
                      <SelectItem value="OR">OR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card">
                <Select
                  value={rule.field}
                  onValueChange={(value) => updateRule(rule.id, { field: value, value: '' })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filterFields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={rule.operator}
                  onValueChange={(value: 'equal_to' | 'not_equal_to') => 
                    updateRule(rule.id, { operator: value })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equal_to">Equal to</SelectItem>
                    <SelectItem value="not_equal_to">Not equal to</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={rule.value}
                  onValueChange={(value) => updateRule(rule.id, { value })}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select value..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getValueOptions(rule.field).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(rule.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={addNewRule}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add filter
            </Button>

            {rules.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllRules}
                className="text-destructive hover:text-destructive"
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={applyFilters}>
              Apply filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};