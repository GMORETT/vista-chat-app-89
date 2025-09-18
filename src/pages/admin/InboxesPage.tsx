import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useInboxes } from '../../hooks/admin/useInboxes';
import { InboxWizard } from '../../components/admin/InboxWizard';
import { format } from 'date-fns';

export const InboxesPage: React.FC = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get('account_id');
  const accountName = searchParams.get('account_name');
  
  const { data: inboxes, isLoading, refetch } = useInboxes();

  const handleInboxCreated = () => {
    setShowWizard(false);
    refetch();
  };

  const getChannelTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'website': 'Website',
      'whatsapp_cloud': 'WhatsApp',
      'twilio': 'SMS',
      'api': 'API'
    };
    return types[type] || type;
  };

  const getChannelTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      'website': 'bg-blue-100 text-blue-800',
      'whatsapp_cloud': 'bg-green-100 text-green-800',
      'twilio': 'bg-purple-100 text-purple-800',
      'api': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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

  // Filter inboxes by account_id if provided
  const filteredInboxes = accountId 
    ? inboxes?.filter(inbox => inbox.account_id === parseInt(accountId))
    : inboxes;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          {accountId && accountName && (
            <div className="mb-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/clients">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Voltar para Clientes
                </Link>
              </Button>
            </div>
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {accountId && accountName ? `Inboxes - ${decodeURIComponent(accountName)}` : 'Inboxes'}
          </h1>
          <p className="text-muted-foreground">
            Manage communication channels and inboxes
          </p>
        </div>
        <Button onClick={() => setShowWizard(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Inbox
        </Button>
      </div>

      {filteredInboxes && filteredInboxes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInboxes.map((inbox) => (
            <Card key={inbox.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{inbox.name}</CardTitle>
                    <Badge 
                      className={getChannelTypeBadgeColor(inbox.channel_type)}
                      variant="secondary"
                    >
                      {getChannelTypeLabel(inbox.channel_type)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {inbox.phone_number && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2 font-medium">{inbox.phone_number}</span>
                  </div>
                )}
                {inbox.webhook_url && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Webhook:</span>
                    <span className="ml-2 font-mono text-xs bg-muted px-2 py-1 rounded">
                      {inbox.webhook_url.length > 30 
                        ? `${inbox.webhook_url.substring(0, 30)}...`
                        : inbox.webhook_url
                      }
                    </span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  Created {format(new Date(inbox.created_at), 'MMM d, yyyy')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-muted-foreground mb-4">
              <div className="text-lg font-medium mb-2">
                {accountId ? `No inboxes for ${decodeURIComponent(accountName || 'this client')}` : 'No inboxes yet'}
              </div>
              <div className="text-sm">
                {accountId ? 'Create an inbox for this client' : 'Create your first inbox to start receiving messages'}
              </div>
            </div>
            <Button onClick={() => setShowWizard(true)} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Create Your First Inbox
            </Button>
          </CardContent>
        </Card>
      )}

      {showWizard && (
        <InboxWizard 
          onClose={() => setShowWizard(false)}
          onSuccess={handleInboxCreated}
        />
      )}
    </div>
  );
};