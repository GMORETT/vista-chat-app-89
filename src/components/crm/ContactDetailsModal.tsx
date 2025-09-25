import React from 'react';
import { Contact, Stage } from '../../types/crm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { 
  Building, 
  Mail, 
  Phone, 
  DollarSign, 
  Target,
  Calendar,
  FileText
} from 'lucide-react';

interface ContactDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact;
  stage?: Stage;
}

export const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({
  isOpen,
  onClose,
  contact,
  stage,
}) => {
  if (!contact) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{contact.name}</span>
            {stage && (
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: stage.color, color: stage.color }}
              >
                {stage.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações do contato */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <span>{contact.email}</span>
              </div>
              
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Telefone:</span>
                  <span>{contact.phone}</span>
                </div>
              )}

              {contact.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Empresa:</span>
                  <span>{contact.company}</span>
                </div>
              )}

              {contact.annualRevenue && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Faturamento Anual:</span>
                  <span className="font-semibold">{formatCurrency(contact.annualRevenue)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};