import React, { useState, useEffect, useMemo } from 'react';
import { Deal, Lead, Company } from '../types/crm';
import { Button } from '../components/ui/button';
import { ExternalLink, User, Building2, TrendingUp, DollarSign, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useCrmDataStore, DealStage } from '../stores/crmDataStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DealStageManager } from '../components/crm/DealStageManager';
import { DealStageModal } from '../components/crm/DealStageModal';
import { DealFunnelStage } from '../components/crm/DealFunnelStage';
import { DealsFilter, DealFilters } from '../components/DealsFilter';
import { crmApiService } from '../api/crm';
import { AddDealModal } from '../components/crm/AddDealModal';

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
    reorderDealStages,
    fetchAllData,
    isLoading
  } = useCrmDataStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<DealStage | undefined>();
  const [addDealModalOpen, setAddDealModalOpen] = useState(false);
  const [filters, setFilters] = useState<DealFilters>({
    search: '',
    minValue: '',
    maxValue: '',
    minProbability: '',
    maxProbability: '',
    assignedPerson: 'all',
    leadId: 'all',
    companyId: 'all'
  });

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

  // Filter deals based on criteria
  const filteredDeals = useMemo(() => {
    return deals.filter(deal => {
      const lead = getLeadById(deal.leadId);
      const company = deal.companyId ? getCompanyById(deal.companyId) : null;

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = deal.title.toLowerCase().includes(searchLower);
        const leadMatch = lead?.name.toLowerCase().includes(searchLower);
        const companyMatch = company?.name.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !leadMatch && !companyMatch) {
          return false;
        }
      }

      // Value range filter
      if (filters.minValue && deal.annualRevenue < Number(filters.minValue)) {
        return false;
      }
      if (filters.maxValue && deal.annualRevenue > Number(filters.maxValue)) {
        return false;
      }

      // Lead filter
      if (filters.leadId && filters.leadId !== 'all' && deal.leadId !== filters.leadId) {
        return false;
      }

      // Company filter
      if (filters.companyId && filters.companyId !== 'all' && deal.companyId !== filters.companyId) {
        return false;
      }

      return true;
    });
  }, [deals, filters, getLeadById, getCompanyById]);

  const getDealsByStage = (stageId: string) => {
    return filteredDeals.filter(deal => deal.stage === stageId);
  };

  const handleAddStage = () => {
    setEditingStage(undefined);
    setStageModalOpen(true);
  };

  const handleEditStage = (stage: DealStage) => {
    setEditingStage(stage);
    setStageModalOpen(true);
  };

  const handleSaveStage = async (stageData: Omit<DealStage, 'id'>) => {
    try {
      if (editingStage) {
        await crmApiService.updateDealStage(editingStage.id, stageData);
        updateDealStage(editingStage.id, stageData);
        toast.success('Etapa atualizada com sucesso!');
      } else {
        const newOrder = Math.max(...dealStages.map(s => s.order), 0) + 1;
        const newStage = await crmApiService.createDealStage({ ...stageData, order: newOrder });
        addDealStage(newStage);
        toast.success('Etapa criada com sucesso!');
      }
      setStageModalOpen(false);
      setEditingStage(undefined);
    } catch (error) {
      toast.error('Erro ao salvar etapa');
      console.error(error);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    const stageDeals = getDealsByStage(stageId);
    if (stageDeals.length > 0) {
      toast.error('Não é possível excluir uma etapa que possui negócios. Mova os negócios primeiro.');
      return;
    }
    try {
      await crmApiService.deleteDealStage(stageId);
      deleteDealStage(stageId);
      toast.success('Etapa excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir etapa');
      console.error(error);
    }
  };

  const handleDealDrop = (dealId: string, newStageId: string) => {
    const deal = deals.find(d => d.id === dealId);
    if (deal && deal.stage !== newStageId) {
      moveDeal(dealId, newStageId);
      toast.success('Negócio movido com sucesso!');
    }
  };

  const handleCreateDeal = async (data: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await crmApiService.createDeal(data);
      toast.success('Negócio criado com sucesso!');
      await fetchAllData();
    } catch (error) {
      toast.error('Erro ao criar negócio');
      console.error(error);
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

  const totalDeals = filteredDeals.length;
  const totalRevenue = filteredDeals.reduce((sum, deal) => sum + deal.annualRevenue, 0);

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
              <Button onClick={() => setAddDealModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Negócio
              </Button>

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
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(totalRevenue)}</span>
                    <span className="text-xs text-muted-foreground">total</span>
                  </div>
                </div>
              </Card>

              <DealsFilter
                filters={filters}
                onFiltersChange={setFilters}
                filteredCount={totalDeals}
                totalCount={deals.length}
              />

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

      <AddDealModal 
        isOpen={addDealModalOpen}
        onClose={() => setAddDealModalOpen(false)}
        onSave={handleCreateDeal}
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
              <div>
                <label className="text-sm font-medium">Faturamento Anual</label>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(selectedDeal.annualRevenue)}
                </p>
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};