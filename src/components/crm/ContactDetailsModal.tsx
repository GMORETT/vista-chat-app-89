import React from 'react';
import { Contact, Stage } from '../../types/crm';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  Building, 
  Mail, 
  Phone, 
  DollarSign,
  MessageCircle
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
  const navigate = useNavigate();

  if (!contact) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleViewMessages = () => {
    navigate('/mensageria');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
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

        <div className="space-y-4">
          {/* Informações de Contato */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-3">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Nome Completo</div>
                  <div className="text-sm font-medium">{contact.name}</div>
                </div>

                <div className="bg-muted/30 p-3 rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground mb-1">Email</div>
                  <div className="text-sm font-medium">{contact.email}</div>
                </div>
                
                {contact.phone && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Telefone</div>
                    <div className="text-sm font-medium">{contact.phone}</div>
                  </div>
                )}

                {contact.company && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Empresa</div>
                    <div className="text-sm font-medium">{contact.company}</div>
                  </div>
                )}

                {contact.annualRevenue && (
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Faturamento Anual</div>
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(contact.annualRevenue)}
                    </div>
                  </div>
                 )}
               </div>
             </CardContent>
           </Card>

           {/* Botão Ver Mensagens */}
           <div className="flex justify-center pt-2">
             <Button 
               onClick={handleViewMessages}
               className="flex items-center gap-2"
               size="lg"
             >
               <MessageCircle className="h-4 w-4" />
               Ver Mensagens
             </Button>
           </div>
         </div>
      </DialogContent>
    </Dialog>
  );
};