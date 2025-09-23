import React from 'react';
import { Edit, Users, Trash2, MessageSquare } from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Channel } from '../../../models/admin';

interface ClientInboxesTableProps {
  inboxes: Channel[];
  onEdit: (inbox: Channel) => void;
  onManageMembers: (inbox: Channel) => void;
  onDelete: (inbox: Channel) => void;
  getStatusBadge: (inbox: Channel) => React.ReactNode;
}

export const ClientInboxesTable: React.FC<ClientInboxesTableProps> = ({
  inboxes,
  onEdit,
  onManageMembers,
  onDelete,
  getStatusBadge,
}) => {
  const getChannelTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'api': 'API Genérica',
      'whatsapp': 'WhatsApp Cloud',
      'facebook': 'Facebook Messenger',
      'instagram': 'Instagram Direct',
      'telegram': 'Telegram',
      'twilio_sms': 'Twilio SMS',
      'web_widget': 'Widget Web',
    };
    return typeMap[type] || type;
  };

  const getChannelIcon = (type: string) => {
    // For now, use MessageSquare for all types
    return <MessageSquare className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Inboxes Configurados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inboxes.map((inbox) => (
              <TableRow key={inbox.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getChannelIcon(inbox.channel_type)}
                    <div>
                      <div className="font-medium">{inbox.name}</div>
                      {inbox.phone_number && (
                        <div className="text-sm text-muted-foreground">
                          {inbox.phone_number}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getChannelTypeLabel(inbox.channel_type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {getStatusBadge(inbox)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(inbox)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onManageMembers(inbox)}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(inbox)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};