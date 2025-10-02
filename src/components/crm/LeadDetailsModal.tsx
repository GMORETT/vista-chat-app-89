import React from 'react';
import { Lead } from '../../types/crm';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { User, Mail, Phone, Calendar, Building2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useCrmDataStore } from '../../stores/crmDataStore';
import { useNavigate } from 'react-router-dom';

interface LeadDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  isOpen,
  onClose,
  lead
}) => {
  const { companies, deals, dealStages } = useCrmDataStore();
  const navigate = useNavigate();

  if (!lead) return null;

  const relatedCompanies = companies.filter(c => c.leadId === lead.id);
  const relatedDeals = deals.filter(d => d.leadId === lead.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Lead: {lead.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-sm">{lead.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Função</label>
                  <p className="text-sm">{lead.role || 'Não especificado'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{lead.email}</p>
                  </div>
                </div>
                {lead.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{lead.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Criado em: {format(new Date(lead.createdAt), 'dd/MM/yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Atualizado em: {format(new Date(lead.updatedAt), 'dd/MM/yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empresas Relacionadas */}
          {relatedCompanies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Empresas Relacionadas ({relatedCompanies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedCompanies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{company.name}</p>
                        {company.website && (
                          <p className="text-xs text-muted-foreground">{company.website}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onClose();
                          navigate(`/empresas?highlight=${company.id}`);
                        }}
                      >
                        Ver detalhes
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Negócios Relacionados */}
          {relatedDeals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Negócios Relacionados ({relatedDeals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedDeals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(deal.annualRevenue)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {(() => {
                            const stage = dealStages.find(s => s.id === deal.stage);
                            return stage?.name || 'N/A';
                          })()}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onClose();
                            navigate(`/funil?highlight=${deal.id}`);
                          }}
                        >
                          Ver no funil
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};