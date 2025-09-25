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

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Card 
      className="mb-3 hover:shadow-md transition-shadow cursor-pointer bg-background border border-border/50 hover:border-primary/50"
      onClick={() => onClick(deal)}
      draggable
      onDragStart={handleDragStart}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Deal Title */}
          <h4 className="font-semibold text-sm text-foreground leading-tight">
            {deal.title}
          </h4>

          {/* Lead Name */}
          <div className="flex items-center gap-2">
            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">
              {lead?.name || 'Lead não encontrado'}
            </span>
          </div>

          {/* Company Name */}
          {company && (
            <div className="flex items-center gap-2">
              <Building2 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {company.name}
              </span>
            </div>
          )}

          {/* No Company indicator */}
          {!company && (
            <div className="flex items-center gap-2">
              <Building2 className="h-3 w-3 text-muted-foreground/50 flex-shrink-0" />
              <span className="text-xs text-muted-foreground/70 italic">
                Sem empresa
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};