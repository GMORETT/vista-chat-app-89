import React from 'react';
import { Company } from '../../types/crm';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Building2, Globe, Phone, MapPin, Calendar, User, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useCrmDataStore } from '../../stores/crmDataStore';
import { useNavigate } from 'react-router-dom';

interface CompanyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
}

const getSizeColor = (size: Company['size']) => {
  const colors = {
    small: 'bg-blue-100 text-blue-800',
    medium: 'bg-green-100 text-green-800',
    large: 'bg-orange-100 text-orange-800',
    enterprise: 'bg-purple-100 text-purple-800'
  };
  return colors[size];
};

const getSizeLabel = (size: Company['size']) => {
  const labels = {
    small: 'Pequena',
    medium: 'Média',
    large: 'Grande',
    enterprise: 'Corporação'
  };
  return labels[size];
};

export const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  isOpen,
  onClose,
  company
}) => {
  const { deals, dealStages } = useCrmDataStore();
  const navigate = useNavigate();

  if (!company) return null;

  const companyDeals = deals.filter(d => d.companyId === company.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getPersonInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const totalDealsValue = companyDeals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Detalhes da Empresa: {company.name}
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
                  <label className="text-sm font-medium text-muted-foreground">Nome da Empresa</label>
                  <p className="text-sm font-medium">{company.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Porte</label>
                  <div className="mt-1">
                    {company.size && (
                      <Badge className={getSizeColor(company.size)}>
                        {getSizeLabel(company.size)}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {company.industry && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Setor</label>
                  <p className="text-sm">{company.industry}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {company.website && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Website</label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  </div>
                )}
                {company.phone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{company.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {company.address && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{company.address}</p>
                  </div>
                </div>
              )}

              {company.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Observações</label>
                  <p className="text-sm bg-muted p-3 rounded-md">{company.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Criado em: {format(new Date(company.createdAt), 'dd/MM/yyyy')}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Atualizado em: {format(new Date(company.updatedAt), 'dd/MM/yyyy')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead de Origem */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Lead de Origem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium text-sm">{company.lead.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {company.lead.email} • Fonte: {company.lead.source}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate(`/leads?highlight=${company.lead.id}`);
                  }}
                >
                  Ver lead
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Responsáveis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Responsáveis ({company.assignedPersons.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {company.assignedPersons.map((person) => (
                  <div key={person.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getPersonInitials(person.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{person.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {person.email} {person.role && `• ${person.role}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Negócios Relacionados */}
          {companyDeals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Negócios Relacionados ({companyDeals.length})
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Valor total: {formatCurrency(totalDealsValue)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {companyDeals.map((deal) => (
                    <div key={deal.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(deal.value)} • {deal.probability}% de probabilidade
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