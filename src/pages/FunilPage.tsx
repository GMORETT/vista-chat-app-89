import React, { useState, useEffect } from 'react';
import { Deal, Lead, Company } from '../types/crm';
import { Button } from '../components/ui/button';
import { BarChart3, ExternalLink, User, Building2, TrendingUp, Calendar, DollarSign, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useCrmDataStore, DealStage } from '../stores/crmDataStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DealStageManager } from '../components/crm/DealStageManager';
import { DealStageModal } from '../components/crm/DealStageModal';
import { DealFunnelStage } from '../components/crm/DealFunnelStage';

export const FunilPage: React.FC = () => {
  const { 
    deals, 
    dealStages, 
    getLeadById, 
    getCompanyById, 
    getDealById,
    moveDeal, 
    addDealStage, 
    updateDealStage, 
    deleteDealStage, 
    reorderDealStages 
  } = useCrmDataStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<DealStage | undefined>();

  // Check for highlight parameter and open deal modal
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId) {
      const deal = getDealById(highlightId);
      if (deal) {
        setSelectedDeal(deal);
      }
      // Remove the highlight parameter from URL
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('highlight');
        return newParams;
      });
    }
  }, [searchParams, getDealById, setSearchParams]);

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const handleAddStage = () => {
    setEditingStage(undefined);
    setStageModalOpen(true);
  };

  const handleEditStage = (stage: DealStage) => {
    setEditingStage(stage);
    setStageModalOpen(true);
  };

  const handleSaveStage = (stageData: Omit<DealStage, 'id'>) => {
    if (editingStage) {
      updateDealStage(editingStage.id, stageData);
      toast.success('Etapa atualizada com sucesso!');
    } else {
      const newOrder = Math.max(...dealStages.map(s => s.order), 0) + 1;
      addDealStage({ ...stageData, order: newOrder });
      toast.success('Etapa criada com sucesso!');
    }
    setStageModalOpen(false);
    setEditingStage(undefined);
  };

  const handleDeleteStage = (stageId: string) => {
    const stageDeals = getDealsByStage(stageId);
    if (stageDeals.length > 0) {
      toast.error('Não é possível excluir uma etapa que possui negócios. Mova os negócios primeiro.');
      return;
    }
    deleteDealStage(stageId);
    toast.success('Etapa excluída com sucesso!');
  };

  const handleDealDrop = (dealId: string, newStageId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (deal && deal.stage !== newStageId) {
      moveDeal(dealId, newStageId);
      toast.success('Negócio movido com sucesso!');
    }
  };

  // Sort stages by order
  const sortedStages = [...dealStages].sort((a, b) => a.order - b.order);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
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

              <DealStageManager
                stages={sortedStages}
                onAddStage={handleAddStage}
                onEditStage={handleEditStage}
                onDeleteStage={handleDeleteStage}
                onReorderStages={reorderDealStages}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {sortedStages.length === 0 ? (
            <Card className="w-full p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Nenhuma etapa criada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie sua primeira etapa para começar a organizar seus negócios
                </p>
                <Button onClick={handleAddStage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Etapa
                </Button>
              </div>
            </Card>
          ) : (
            sortedStages.map((stage) => {
              const stageDeals = getDealsByStage(stage.id);
              return (
                <DealFunnelStage
                  key={stage.id}
                  stage={stage}
                  deals={stageDeals}
                  onEditStage={handleEditStage}
                  onDeleteStage={handleDeleteStage}
                  onDealClick={setSelectedDeal}
                  onDealDrop={handleDealDrop}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      <DealStageModal
        isOpen={stageModalOpen}
        onClose={() => {
          setStageModalOpen(false);
          setEditingStage(undefined);
        }}
        onSave={handleSaveStage}
        stage={editingStage}
      />

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
                      navigate(`/leads?highlight=${selectedDeal.leadId}`);
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
                        navigate(`/empresas?highlight=${selectedDeal.companyId}`);
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