import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Inbox, Users, UserCheck, Tags, Building2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const cards = [
    {
      title: 'Clients',
      description: 'Manage client accounts and configurations',
      icon: Building2,
      href: '/admin/clients',
      color: 'text-blue-600'
    },
    {
      title: 'Inboxes',
      description: 'Manage communication channels',
      icon: Inbox,
      href: '/admin/inboxes',
      color: 'text-indigo-600'
    },
    {
      title: 'Teams',
      description: 'Organize your agents into teams',
      icon: Users,
      href: '/admin/teams',
      color: 'text-green-600'
    },
    {
      title: 'Agents',
      description: 'Manage agent accounts and permissions',
      icon: UserCheck,
      href: '/admin/agents',
      color: 'text-purple-600'
    },
    {
      title: 'Labels',
      description: 'Create and manage conversation labels',
      icon: Tags,
      href: '/admin/labels',
      color: 'text-orange-600'
    },
    {
      title: 'Logs',
      description: 'View and monitor audit logs',
      icon: Shield,
      href: '/admin/logs',
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your Solabs Messages configuration
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link key={card.title} to={card.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};