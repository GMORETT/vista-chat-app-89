import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useChatStore } from '../state/useChatStore';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { useListAccounts } from '../hooks/admin/useAccounts';

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

const getFilterFields = (isSuperAdmin: boolean) => {
  const baseFields = [
    { value: 'status', label: 'Status' },
    { value: 'assignee_type', label: 'Activity' },
    { value: 'team_id', label: 'Team' },
    { value: 'assignee_id', label: 'Agent Name' },
    { value: 'labels', label: 'Label' },
    { value: 'inbox_id', label: 'Inbox' },
    { value: 'priority', label: 'Priority' },
    { value: 'updated_within', label: 'Updated Within' },
  ];

  if (isSuperAdmin) {
    return [
      { value: 'account_id', label: 'Cliente' },
      ...baseFields,
    ];
  }

  return baseFields;
};

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

const updatedWithinOptions = [
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { filters, setFilters, selectedAccountId } = useChatStore();
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<FilterRule[]>([]);
  const { data: accounts = [] } = useListAccounts();
  
  const isSuperAdmin = user?.role === 'super_admin';
  const filterFields = getFilterFields(isSuperAdmin);

  // Sync local rules with global filters when modal opens or filters change
  React.useEffect(() => {
    const newRules: FilterRule[] = [];
    
    // Add account filter for super admin
    if (isSuperAdmin && selectedAccountId) {
      newRules.push({
        id: Date.now().toString() + '_account',
        field: 'account_id',
        operator: 'equal_to',
        value: selectedAccountId.toString(),
        connector: newRules.length > 0 ? 'AND' : undefined,
      });
    }
    
    if (filters.status !== 'all') {
      newRules.push({
        id: Date.now().toString() + '_status',
        field: 'status',
        operator: 'equal_to',
        value: filters.status,
        connector: newRules.length > 0 ? 'AND' : undefined,
      });
    }
    
    if (filters.assignee_type !== 'all') {
      newRules.push({
        id: Date.now().toString() + '_assignee_type',
        field: 'assignee_type',
        operator: 'equal_to',
        value: filters.assignee_type,
        connector: newRules.length > 0 ? 'AND' : undefined,
      });
    }
    
    if (filters.inbox_id) {
      newRules.push({
        id: Date.now().toString() + '_inbox',
        field: 'inbox_id',
        operator: 'equal_to',
        value: filters.inbox_id.toString(),
        connector: newRules.length > 0 ? 'AND' : undefined,
      });
    }
    
    if (filters.team_id) {
      newRules.push({
        id: Date.now().toString() + '_team',
        field: 'team_id',
        operator: 'equal_to',
        value: filters.team_id.toString(),
        connector: newRules.length > 0 ? 'AND' : undefined,
      });
    }
    
    if (filters.priority) {
      newRules.push({
        id: Date.now().toString() + '_priority',
        field: 'priority',
        operator: 'equal_to',
        value: filters.priority,
        connector: newRules.length > 0 ? 'AND' : undefined,
      });
    }
    
    if (filters.updated_within) {
      newRules.push({
        id: Date.now().toString() + '_updated',
        field: 'updated_within',
        operator: 'equal_to',
        value: filters.updated_within,
        connector: newRules.length > 0 ? 'AND' : undefined,
      });
    }
    
    if (filters.labels && filters.labels.length > 0) {
      filters.labels.forEach((label, index) => {
        newRules.push({
          id: Date.now().toString() + '_label_' + index,
          field: 'labels',
          operator: 'equal_to',
          value: label,
          connector: newRules.length > 0 ? 'AND' : undefined,
        });
      });
    }
    
    setRules(newRules);
  }, [filters, open, selectedAccountId, isSuperAdmin]);

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
      case 'account_id': 
        return accounts.map(account => ({ 
          value: account.id.toString(), 
          label: account.name 
        }));
      case 'status': return statusOptions;
      case 'assignee_type': return activityOptions;
      case 'priority': return priorityOptions;
      case 'updated_within': return updatedWithinOptions;
      default: return [];
    }
  };

  const applyFilters = () => {
    try {
      const newFilters = { ...filters };
      const { setSelectedAccountId } = useChatStore.getState();
      
      rules.forEach(rule => {
        switch (rule.field) {
          case 'account_id':
            setSelectedAccountId(parseInt(rule.value));
            break;
          case 'status':
            newFilters.status = rule.value as any;
            break;
          case 'assignee_type':
            newFilters.assignee_type = rule.value as any;
            break;
          case 'team_id':
            newFilters.team_id = parseInt(rule.value);
            break;
          case 'inbox_id':
            newFilters.inbox_id = parseInt(rule.value);
            break;
          case 'updated_within':
            newFilters.updated_within = rule.value;
            break;
          case 'labels':
            if (!newFilters.labels) {
              newFilters.labels = [];
            }
            if (!newFilters.labels.includes(rule.value)) {
              newFilters.labels.push(rule.value);
            }
            break;
          default:
            break;
        }
      });
      
      setFilters(newFilters);
      toast({
        title: "Filtros aplicados",
        description: "Os filtros foram aplicados com sucesso.",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao aplicar filtros",
        description: "Ocorreu um erro ao aplicar os filtros.",
        variant: "destructive",
      });
    }
  };

  const clearAllRules = () => {
    setRules([]);
    // Also reset filters in the store to clear all applied filters
    const { resetFilters } = useChatStore.getState();
    resetFilters();
    toast({
      title: "Filtros limpos",
      description: "Todos os filtros foram removidos.",
    });
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