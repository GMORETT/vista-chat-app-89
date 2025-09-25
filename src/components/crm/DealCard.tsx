import React from 'react';
import { Deal } from '../../types/crm';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { User, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useCrmDataStore } from '../../stores/crmDataStore';
import { useNavigate } from 'react-router-dom';

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, onClick }) => {
  const { getLeadById, getCompanyById } = useCrmDataStore();
  const navigate = useNavigate();

  const lead = getLeadById(deal.leadId);
  const company = deal.companyId ? getCompanyById(deal.companyId) : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card 
      className="mb-3 hover:shadow-md transition-shadow cursor-pointer bg-background border border-border/50"
      onClick={() => onClick(deal)}
      draggable
      onDragStart={handleDragStart}
    >
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

          {/* Assigned Person & Date */}
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