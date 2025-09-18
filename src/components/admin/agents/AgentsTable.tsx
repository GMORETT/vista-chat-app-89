import React from 'react';
import { Edit, Trash2, Shield, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Agent } from '../../../models/admin';

interface AgentsTableProps {
  agents: Agent[];
  isLoading: boolean;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export const AgentsTable: React.FC<AgentsTableProps> = ({
  agents,
  isLoading,
  onEdit,
  onDelete,
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'available': 'bg-green-500/10 text-green-700 border-green-500/20',
      'busy': 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
      'offline': 'bg-gray-500/10 text-gray-700 border-gray-500/20'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-500/20';
  };

  const getRoleIcon = (role: string) => {
    return role === 'administrator' ? Shield : UserCheck;
  };

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <div className="w-8 h-8 bg-muted animate-pulse rounded" />
                    <div className="w-8 h-8 bg-muted animate-pulse rounded" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Agent</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No agents found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Agent</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-24">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent) => {
            const RoleIcon = getRoleIcon(agent.role);
            return (
              <TableRow key={agent.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {agent.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {agent.display_name || agent.name}
                      </div>
                      {agent.display_name && (
                        <div className="text-sm text-muted-foreground">
                          {agent.name}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{agent.email}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <RoleIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium capitalize">
                      {agent.role}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={getStatusColor(agent.availability_status)}
                      variant="outline"
                    >
                      {agent.availability_status}
                    </Badge>
                    {!agent.confirmed && (
                      <Badge variant="secondary" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(agent.created_at), 'MMM d, yyyy')}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(agent)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(agent)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};