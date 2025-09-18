import React, { useState } from 'react';
import { Plus, Edit, Trash2, Shield, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { useAgents } from '../../hooks/admin/useAgents';
import { format } from 'date-fns';

export const AgentsPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { data: agents, isLoading } = useAgents();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'available': 'bg-green-100 text-green-800',
      'busy': 'bg-yellow-100 text-yellow-800',
      'offline': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    return role === 'administrator' ? Shield : UserCheck;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agents</h1>
          <p className="text-muted-foreground">
            Manage agents and their permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {agents && agents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const RoleIcon = getRoleIcon(agent.role);
            return (
              <Card key={agent.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{agent.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {agent.email}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RoleIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium capitalize">
                        {agent.role}
                      </span>
                    </div>
                    <Badge 
                      className={getStatusColor(agent.availability_status)}
                      variant="secondary"
                    >
                      {agent.availability_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={agent.confirmed ? "default" : "secondary"}>
                      {agent.confirmed ? "Confirmed" : "Pending"}
                    </Badge>
                    {agent.auto_offline && (
                      <Badge variant="outline">Auto-offline</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Joined {format(new Date(agent.created_at), 'MMM d, yyyy')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">
              <div className="text-lg font-medium mb-2">No agents yet</div>
              <div className="text-sm">
                Add agents to handle customer conversations
              </div>
            </div>
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Add Your First Agent
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};