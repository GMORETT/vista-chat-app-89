import React from 'react';
import { Contact } from '../../types/crm';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Building, Mail, Phone, DollarSign } from 'lucide-react';

interface ContactCardProps {
  contact: Contact;
  onClick: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onClick,
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', contact.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click during drag
    if (e.detail === 0) return;
    onClick(contact);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'bg-green-500';
    if (probability >= 60) return 'bg-yellow-500';
    if (probability >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all duration-200 mb-2 hover:scale-105"
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <CardContent className="p-2">
        <div className="flex items-start justify-between mb-1.5">
          <div className="flex-1">
            <h4 className="font-semibold text-xs text-foreground mb-0.5">
              {contact.name}
            </h4>
            {contact.company && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                <Building className="h-3 w-3" />
                <span>{contact.company}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1">
          {contact.email && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          
          {contact.phone && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{contact.phone}</span>
            </div>
          )}

          {contact.annualRevenue && (
            <div className="flex items-center gap-1 text-xs font-medium text-primary">
              <DollarSign className="h-3 w-3" />
              <span>{formatCurrency(contact.annualRevenue)}</span>
            </div>
          )}

          {contact.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5">
              {contact.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};