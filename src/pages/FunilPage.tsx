import React, { useState } from 'react';
import { Deal, Lead, Company } from '../types/crm';
import { Button } from '../components/ui/button';
import { BarChart3, ExternalLink, User, Building2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useCrmDataStore } from '../stores/crmDataStore';
import { useNavigate } from 'react-router-dom';

const DEAL_STAGES = [
  { id: 'prospect', name: 'Prospecção', color: '#3B82F6' },
  { id: 'proposal', name: 'Proposta', color: '#F59E0B' },
  { id: 'negotiation', name: 'Negociação', color: '#EF4444' },
  { id: 'closed_won', name: 'Fechado - Ganho', color: '#10B981' },
  { id: 'closed_lost', name: 'Fechado - Perdido', color: '#6B7280' }
];

export const FunilPage: React.FC = () => {
  const { deals, getLeadById, getCompanyById } = useCrmDataStore();
  const navigate = useNavigate();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const getStageStats = (stageId: string) => {
    const stageDeals = getDealsByStage(stageId);
    const totalValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
    return {
      count: stageDeals.length,
      value: totalValue,
      probability: stageDeals.length > 0 ? Math.round(stageDeals.reduce((sum, deal) => sum + deal.probability, 0) / stageDeals.length) : 0
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStageColor = (stageId: string) => {
    const stage = DEAL_STAGES.find(s => s.id === stageId);
    return stage?.color || '#6B7280';
  };

  const totalDeals = deals.length;
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  const DealCard: React.FC<{ deal: Deal }> = ({ deal }) => {
    const lead = getLeadById(deal.leadId);
    const company = deal.companyId ? getCompanyById(deal.companyId) : null;

    return (
      <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDeal(deal)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{deal.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{formatCurrency(deal.value)}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {deal.probability}%
              </Badge>
            </div>

            {/* Lead Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/leads');
                  }}
                >
                  {lead?.name || 'Lead não encontrado'}
                </Button>
              </div>
              {company && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-primary hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/empresas');
                  }}
                >
                  <Building2 className="h-3 w-3 mr-1" />
                  {company.name}
                </Button>
              )}
            </div>

            {/* Assigned Person */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Responsável: {deal.assignedPerson.name}</span>
              </div>
              {deal.expectedCloseDate && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(deal.expectedCloseDate), 'dd/MM')}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-background via-background/95 to-background border-b border-border/40">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold text-foreground">Funil de Vendas</h1>
              <p className="text-base text-muted-foreground">
                Visualize e gerencie seu pipeline de vendas
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Stats Cards */}
              <Card className="px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-primary/10 rounded">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">{totalDeals}</span>
                    <span className="text-xs text-muted-foreground">negócios</span>
                  </div>
                </div>
              </Card>
              
              <Card className="px-3 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-100 rounded">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(totalValue)}</span>
                    <span className="text-xs text-muted-foreground">total</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {DEAL_STAGES.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stats = getStageStats(stage.id);
            
            return (
              <div key={stage.id} className="flex-shrink-0 w-80">
                <Card className="h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: stage.color }}
                        />
                        <CardTitle className="text-base">{stage.name}</CardTitle>
                      </div>
                      <Badge variant="outline">
                        {stats.count}
                      </Badge>
                    </div>
                    {stats.count > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(stats.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Probabilidade média: {stats.probability}%
                        </p>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {stageDeals.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                      ))}
                      {stageDeals.length === 0 && (
                        <p className="text-center text-muted-foreground text-sm py-8">
                          Nenhum negócio nesta etapa
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Deal Details Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedDeal.title}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedDeal(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Valor</label>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(selectedDeal.value)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Probabilidade</label>
                  <p className="text-lg">{selectedDeal.probability}%</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Lead Responsável</label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDeal(null);
                      navigate('/leads');
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {getLeadById(selectedDeal.leadId)?.name}
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              {selectedDeal.companyId && (
                <div>
                  <label className="text-sm font-medium">Empresa</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDeal(null);
                        navigate('/empresas');
                      }}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      {getCompanyById(selectedDeal.companyId)?.name}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Responsável pelo Negócio</label>
                <p>{selectedDeal.assignedPerson.name}</p>
              </div>

              {selectedDeal.expectedCloseDate && (
                <div>
                  <label className="text-sm font-medium">Data Prevista de Fechamento</label>
                  <p>{format(new Date(selectedDeal.expectedCloseDate), 'dd/MM/yyyy')}</p>
                </div>
              )}

              {selectedDeal.notes && (
                <div>
                  <label className="text-sm font-medium">Observações</label>
                  <p className="text-muted-foreground">{selectedDeal.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};