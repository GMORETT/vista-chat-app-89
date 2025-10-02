import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Search, Plus, Building2, Globe, Calendar, ExternalLink, TrendingUp } from 'lucide-react';
import { Company, Lead } from '../types/crm';
import { format } from 'date-fns';
import { useCrmDataStore } from '../stores/crmDataStore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CompanyDetailsModal } from '../components/crm/CompanyDetailsModal';
import { AddCompanyModal } from '../components/crm/AddCompanyModal';
import { crmApiService } from '../api/crm';
import { toast } from 'sonner';

export const EmpresasPage: React.FC = () => {
  const { companies, deals, getCompanyById, fetchAllData, isLoading } = useCrmDataStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Check for highlight parameter and open modal
  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (highlightId) {
      const company = getCompanyById(highlightId);
      if (company) {
        setSelectedCompany(company);
      }
      // Remove the highlight parameter from URL
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.delete('highlight');
        return newParams;
      });
    }
  }, [searchParams, getCompanyById, setSearchParams]);

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const stats = {
    total: companies.length
  };

  const getCompanyDeals = (companyId: string) => {
    return deals.filter(deal => deal.companyId === companyId);
  };

  const handleCreateCompany = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await crmApiService.createCompany(data);
      toast.success('Empresa criada com sucesso!');
      await fetchAllData();
    } catch (error) {
      toast.error('Erro ao criar empresa');
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">Gerencie suas empresas clientes</p>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Empresas</p>
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
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Empresas ({filteredCompanies.length})</CardTitle>
          <CardDescription>Acompanhe suas empresas clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Lead Origem</TableHead>
                <TableHead>Negócios</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <p className="font-semibold">{company.name}</p>
                  </TableCell>
                  <TableCell>
                    {company.website && (
                      <div className="flex items-center text-sm">
                        <Globe className="h-3 w-3 mr-1 text-muted-foreground" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-sm font-medium text-primary hover:underline"
                      onClick={() => navigate(`/leads?highlight=${company.leadId}`)}
                    >
                      Ver lead
                    </Button>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const companyDeals = getCompanyDeals(company.id);
                      return (
                        <div className="space-y-1">
                          {companyDeals.length > 0 ? (
                            <div className="flex items-center gap-1">
                              <Badge variant="secondary" className="text-xs">
                                {companyDeals.length} negócio{companyDeals.length > 1 ? 's' : ''}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto p-0 text-xs text-primary"
                                onClick={() => navigate('/funil')}
                              >
                                <TrendingUp className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Nenhum negócio</span>
                          )}
                          {companyDeals.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              Total: R$ {companyDeals.reduce((sum, deal) => sum + deal.annualRevenue, 0).toLocaleString()}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(company.createdAt), 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCompany(company)}>
                      Ver detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Company Details Modal */}
      <CompanyDetailsModal 
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        company={selectedCompany}
      />

      {/* Add Company Modal */}
      <AddCompanyModal 
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSave={handleCreateCompany}
      />
    </div>
  );
};