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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-600 bg-green-50';
    if (probability >= 60) return 'text-yellow-600 bg-yellow-50';
    if (probability >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
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
          {/* Informações básicas */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              {contact.company && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{contact.company}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{contact.email}</span>
              </div>
              
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informações comerciais */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Valor do Negócio</span>
                </div>
                <span className="font-semibold text-lg">
                  {formatCurrency(contact.value)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Probabilidade</span>
                </div>
                <Badge 
                  className={`${getProbabilityColor(contact.probability)} border-0`}
                >
                  {contact.probability}%
                </Badge>
              </div>

              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  Valor Esperado: <span className="font-medium text-foreground">
                    {formatCurrency(contact.value * contact.probability / 100)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {contact.notes && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium mb-1">Observações</div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {contact.notes}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações de sistema */}
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Criado em: {formatDate(contact.createdAt)}</span>
              </div>
              
              {contact.updatedAt.getTime() !== contact.createdAt.getTime() && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Última atualização: {formatDate(contact.updatedAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};