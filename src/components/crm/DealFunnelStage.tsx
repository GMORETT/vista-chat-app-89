import React from 'react';
import { DealStage } from '../../stores/crmDataStore';
import { Deal } from '../../types/crm';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import { DealCard } from './DealCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface DealFunnelStageProps {
  stage: DealStage;
  deals: Deal[];
  onEditStage: (stage: DealStage) => void;
  onDeleteStage: (stageId: string) => void;
  onDealClick: (deal: Deal) => void;
  onDealDrop: (dealId: string, newStageId: string) => void;
}

export const DealFunnelStage: React.FC<DealFunnelStageProps> = ({
  stage,
  deals,
  onEditStage,
  onDeleteStage,
  onDealClick,
  onDealDrop,
}) => {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      onDealDrop(dealId, stage.id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const avgProbability = deals.length > 0 
    ? Math.round(deals.reduce((sum, deal) => sum + deal.probability, 0) / deals.length) 
    : 0;

  return (
    <Card className="w-80 flex-shrink-0 shadow-sm border-l-4" style={{ borderLeftColor: stage.color }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: stage.color }}
            />
            <CardTitle className="text-base">{stage.name}</CardTitle>
          </div>
          
          <div className="flex items-center gap-1.5">
            <Badge variant="outline">
              {deals.length}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditStage(stage)}>
                  Editar Etapa
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDeleteStage(stage.id)}
                  className="text-destructive"
                >
                  Excluir Etapa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {deals.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {formatCurrency(totalValue)}
            </p>
            <p className="text-xs text-muted-foreground">
              Probabilidade média: {avgProbability}%
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div
          className="min-h-[400px] space-y-2 p-2 rounded-md bg-muted/30"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onClick={onDealClick}
            />
          ))}
          
          {deals.length === 0 && (
            <div className="flex items-center justify-center h-52 border-2 border-dashed border-muted-foreground/30 rounded-lg bg-background/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Arraste negócios aqui
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Esta etapa está vazia
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};