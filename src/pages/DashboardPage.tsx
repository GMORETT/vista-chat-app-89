import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart';
import { MessageSquare, TrendingUp, Users, BarChart3, CalendarIcon, Filter } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { cn } from '../lib/utils';

export const DashboardPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [chartMetric, setChartMetric] = useState('conversations');

  // Mock data for charts
  const mockData = {
    conversations: [
      { date: '2024-01-01', value: 45 },
      { date: '2024-01-05', value: 52 },
      { date: '2024-01-10', value: 48 },
      { date: '2024-01-15', value: 61 },
      { date: '2024-01-20', value: 75 },
      { date: '2024-01-25', value: 68 },
      { date: '2024-01-30', value: 82 },
    ],
    leads: [
      { date: '2024-01-01', value: 23 },
      { date: '2024-01-05', value: 28 },
      { date: '2024-01-10', value: 35 },
      { date: '2024-01-15', value: 42 },
      { date: '2024-01-20', value: 38 },
      { date: '2024-01-25', value: 55 },
      { date: '2024-01-30', value: 62 },
    ],
    contacts: [
      { date: '2024-01-01', value: 120 },
      { date: '2024-01-05', value: 125 },
      { date: '2024-01-10', value: 135 },
      { date: '2024-01-15', value: 145 },
      { date: '2024-01-20', value: 150 },
      { date: '2024-01-25', value: 152 },
      { date: '2024-01-30', value: 156 },
    ],
    conversion: [
      { date: '2024-01-01', value: 65 },
      { date: '2024-01-05', value: 68 },
      { date: '2024-01-10', value: 62 },
      { date: '2024-01-15', value: 70 },
      { date: '2024-01-20', value: 75 },
      { date: '2024-01-25', value: 72 },
      { date: '2024-01-30', value: 68 },
    ]
  };

  const chartConfig = {
    conversations: {
      label: "Conversas",
      color: "hsl(var(--primary))",
    },
    leads: {
      label: "Leads",
      color: "hsl(var(--primary))",
    },
    contacts: {
      label: "Contatos",
      color: "hsl(var(--primary))",
    },
    conversion: {
      label: "Taxa de Conversão (%)",
      color: "hsl(var(--primary))",
    },
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'conversations': return 'Conversas';
      case 'leads': return 'Leads';
      case 'contacts': return 'Contatos';
      case 'conversion': return 'Taxa de Conversão';
      default: return 'Conversas';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Visão geral das suas atividades
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>
          
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">De:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Até:</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversas Ativas
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leads
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              +5 esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contatos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              Total de contatos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              +12% este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{getMetricLabel(chartMetric)} ao Longo do Tempo</CardTitle>
                <CardDescription>
                  Análise de {getMetricLabel(chartMetric).toLowerCase()} no período selecionado
                </CardDescription>
              </div>
              <Select value={chartMetric} onValueChange={setChartMetric}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecionar métrica" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversations">Conversas</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="contacts">Contatos</SelectItem>
                  <SelectItem value="conversion">Taxa de Conversão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData[chartMetric as keyof typeof mockData]}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Nova conversa iniciada</p>
                  <p className="text-xs text-muted-foreground">há 2 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Lead qualificado</p>
                  <p className="text-xs text-muted-foreground">há 15 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Contato adicionado</p>
                  <p className="text-xs text-muted-foreground">há 1 hora</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tempo de resposta médio</span>
                  <span className="text-sm text-muted-foreground">2m 30s</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Satisfação do cliente</span>
                  <span className="text-sm text-muted-foreground">94%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 mt-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};