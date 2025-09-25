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
  DollarSign
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {contact.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span>{contact.name}</span>
              {stage && (
                <Badge 
                  variant="outline" 
                  className="text-xs mt-1"
                  style={{ borderColor: stage.color, color: stage.color }}
                >
                  {stage.name}
                </Badge>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informações de Contato */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                Informações de Contato
              </h3>
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                  <div className="text-base font-medium">{contact.email}</div>
                </div>
                
                {contact.phone && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Telefone</div>
                    <div className="text-base font-medium">{contact.phone}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Informações da Empresa */}
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
                <Building className="h-5 w-5 text-green-500" />
                Informações da Empresa
              </h3>
              <div className="space-y-4">
                {contact.company && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Empresa</div>
                    <div className="text-base font-medium">{contact.company}</div>
                  </div>
                )}

                {contact.annualRevenue && (
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Faturamento Anual</div>
                    <div className="text-lg font-bold text-green-600">
                      {formatCurrency(contact.annualRevenue)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações do Negócio - Largura total */}
        <Card className="border-l-4 border-l-orange-500 mt-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-500" />
              Informações do Negócio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">Valor do Negócio</div>
                <div className="text-xl font-bold text-orange-600">
                  {formatCurrency(contact.value)}
                </div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="text-sm font-medium text-muted-foreground mb-1">Probabilidade</div>
                <div className="text-xl font-bold text-primary">
                  {contact.probability}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};