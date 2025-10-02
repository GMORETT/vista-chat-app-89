import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, Plus, User, Mail, Phone, Calendar, Target, Star, ExternalLink } from 'lucide-react';
import { Lead } from '../types/crm';
import { format } from 'date-fns';
import { useCrmDataStore } from '../stores/crmDataStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LeadDetailsModal } from '../components/crm/LeadDetailsModal';

export const LeadsPage: React.FC = () => {
  const { leads, companies, deals, getLeadById } = useCrmDataStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Check for highlight parameter and open modal
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId) {
      const lead = getLeadById(highlightId);
      if (lead) {
        setSelectedLead(lead);
      }
      // Remove the highlight parameter from URL
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('highlight');
        return newParams;
      });
    }
  }, [searchParams, getLeadById, setSearchParams]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    total: leads.length
  };

  const getRelatedInfo = (leadId: string) => {
    const relatedCompanies = companies.filter(c => c.leadId === leadId);
    const relatedDeals = deals.filter(d => d.leadId === leadId);
    return { companies: relatedCompanies, deals: relatedDeals };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe seus leads</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads ({filteredLeads.length})</CardTitle>
          <CardDescription>Acompanhe o progresso de seus leads</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Relacionamentos</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    <p>{lead.name}</p>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {lead.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {lead.role ? (
                      <span className="text-sm">{lead.role}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Não especificado</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(lead.createdAt), 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const related = getRelatedInfo(lead.id);
                      return (
                        <div className="space-y-1">
                          {related.companies.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {related.companies.length} empresa{related.companies.length > 1 ? 's' : ''}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-primary"
                                onClick={() => navigate('/empresas')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {related.deals.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {related.deals.length} negócio{related.deals.length > 1 ? 's' : ''}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-primary"
                                onClick={() => navigate('/funil')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                          {related.companies.length === 0 && related.deals.length === 0 && (
                            <span className="text-xs text-muted-foreground">Nenhum</span>
                          )}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                      Ver detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lead Details Modal */}
      <LeadDetailsModal 
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        lead={selectedLead}
      />
    </div>
  );
};