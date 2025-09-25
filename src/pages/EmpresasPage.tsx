import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Search, Plus, Building2, Users, Globe, Phone, Calendar, MapPin } from 'lucide-react';
import { Company, Lead, Person } from '../types/crm';
import { format } from 'date-fns';

// Mock data
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Tech Solutions Ltda',
    industry: 'Tecnologia',
    size: 'medium',
    website: 'https://techsolutions.com',
    phone: '+55 11 3333-3333',
    address: 'São Paulo, SP',
    leadId: '1',
    lead: {
      id: '1',
      name: 'João Silva',
      email: 'joao@techsolutions.com',
      source: 'Website',
      status: 'qualified',
      createdAt: '2025-01-15T10:00:00Z',
      updatedAt: '2025-01-15T10:00:00Z'
    },
    assignedPersons: [
      {
        id: 'p1',
        name: 'Ana Costa',
        email: 'ana@empresa.com',
        role: 'Gerente Comercial',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'p2',
        name: 'Carlos Lima',
        email: 'carlos@empresa.com',
        role: 'Consultor',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ],
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    notes: 'Cliente potencial para soluções corporativas'
  },
  {
    id: '2',
    name: 'Startup Inovação',
    industry: 'Software',
    size: 'small',
    website: 'https://startup.com',
    phone: '+55 11 4444-4444',
    address: 'Rio de Janeiro, RJ',
    leadId: '2',
    lead: {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@startup.com',
      source: 'LinkedIn',
      status: 'contacted',
      createdAt: '2025-01-14T14:30:00Z',
      updatedAt: '2025-01-15T09:15:00Z'
    },
    assignedPersons: [
      {
        id: 'p3',
        name: 'Paula Ferreira',
        email: 'paula@empresa.com',
        role: 'Account Manager',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ],
    createdAt: '2025-01-14T14:30:00Z',
    updatedAt: '2025-01-15T09:15:00Z',
    notes: 'Startup em crescimento, boa oportunidade'
  },
  {
    id: '3',
    name: 'Corporação Global',
    industry: 'Financeiro',
    size: 'enterprise',
    website: 'https://global.com',
    phone: '+55 11 5555-5555',
    address: 'Brasília, DF',
    leadId: '3',
    lead: {
      id: '3',
      name: 'Pedro Oliveira',
      email: 'pedro@global.com',
      source: 'Referência',
      status: 'qualified',
      createdAt: '2025-01-13T16:45:00Z',
      updatedAt: '2025-01-15T11:20:00Z'
    },
    assignedPersons: [
      {
        id: 'p1',
        name: 'Ana Costa',
        email: 'ana@empresa.com',
        role: 'Gerente Comercial',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      },
      {
        id: 'p4',
        name: 'Roberto Santos',
        email: 'roberto@empresa.com',
        role: 'Diretor',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ],
    createdAt: '2025-01-13T16:45:00Z',
    updatedAt: '2025-01-15T11:20:00Z',
    notes: 'Grande corporação, processo longo mas alto valor'
  }
];

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

export const EmpresasPage: React.FC = () => {
  const [companies, setCompanies] = useState(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSize = sizeFilter === 'all' || company.size === sizeFilter;
    const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter;
    
    return matchesSearch && matchesSize && matchesIndustry;
  });

  const stats = {
    total: companies.length,
    small: companies.filter(c => c.size === 'small').length,
    medium: companies.filter(c => c.size === 'medium').length,
    large: companies.filter(c => c.size === 'large').length,
    enterprise: companies.filter(c => c.size === 'enterprise').length
  };

  const getPersonInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">Gerencie suas empresas clientes</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pequenas</p>
                <p className="text-2xl font-bold">{stats.small}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Médias</p>
                <p className="text-2xl font-bold">{stats.medium}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Grandes</p>
                <p className="text-2xl font-bold">{stats.large}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Corporações</p>
                <p className="text-2xl font-bold">{stats.enterprise}</p>
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
            
            <Select value={sizeFilter} onValueChange={setSizeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Porte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os portes</SelectItem>
                <SelectItem value="small">Pequena</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                <SelectItem value="enterprise">Corporação</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os setores</SelectItem>
                <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="Financeiro">Financeiro</SelectItem>
                <SelectItem value="Saúde">Saúde</SelectItem>
                <SelectItem value="Educação">Educação</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead>Contato</TableHead>
                <TableHead>Lead Origem</TableHead>
                <TableHead>Porte</TableHead>
                <TableHead>Responsáveis</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="font-semibold">{company.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        {company.industry && (
                          <Badge variant="outline" className="mr-2">
                            {company.industry}
                          </Badge>
                        )}
                        {company.address && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {company.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
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
                      {company.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {company.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{company.lead.name}</p>
                      <p className="text-xs text-muted-foreground">{company.lead.email}</p>
                      <Badge variant="outline" className="text-xs">
                        {company.lead.source}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.size && (
                      <Badge className={getSizeColor(company.size)}>
                        {getSizeLabel(company.size)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {company.assignedPersons.slice(0, 3).map((person) => (
                          <Avatar key={person.id} className="h-8 w-8 border-2 border-background">
                            <AvatarFallback className="text-xs">
                              {getPersonInitials(person.name)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {company.assignedPersons.length > 3 && (
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarFallback className="text-xs bg-muted">
                              +{company.assignedPersons.length - 3}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-3 w-3 mr-1" />
                        {company.assignedPersons.length}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(company.createdAt), 'dd/MM/yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Ver detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};