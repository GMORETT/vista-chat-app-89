import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, Target, Users, DollarSign } from 'lucide-react';

export const FunilPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Funil de Vendas</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe seu pipeline de vendas e conversões
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leads Qualificados
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              +12% desde a semana passada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Propostas Enviadas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              +8% este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vendas Fechadas
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              Taxa de conversão: 53%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 89.5K</div>
            <p className="text-xs text-muted-foreground">
              +25% este mês
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline de Vendas</CardTitle>
            <CardDescription>Estágios do funil de vendas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Leads (100)</span>
                  <span className="text-sm text-muted-foreground">100%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Qualificados (45)</span>
                  <span className="text-sm text-muted-foreground">45%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Propostas (28)</span>
                  <span className="text-sm text-muted-foreground">28%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '28%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fechadas (15)</span>
                  <span className="text-sm text-muted-foreground">15%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oportunidades em Destaque</CardTitle>
            <CardDescription>Leads com maior potencial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Empresa ABC Ltda</p>
                  <p className="text-sm text-muted-foreground">Proposta: R$ 25.000</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">85% chance</p>
                  <p className="text-xs text-muted-foreground">Fecha em 3 dias</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Tech Solutions</p>
                  <p className="text-sm text-muted-foreground">Proposta: R$ 18.500</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-yellow-600">70% chance</p>
                  <p className="text-xs text-muted-foreground">Fecha em 7 dias</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Startup XYZ</p>
                  <p className="text-sm text-muted-foreground">Proposta: R$ 12.000</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">60% chance</p>
                  <p className="text-xs text-muted-foreground">Fecha em 10 dias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};