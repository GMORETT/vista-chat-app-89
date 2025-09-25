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
  // Filter states (what user is selecting)
  const [startDate, setStartDate] = useState<Date>(new Date('2024-12-31'));
  const [endDate, setEndDate] = useState<Date>(new Date('2025-01-15'));
  
  // Applied filter states (what affects the chart)
  const [appliedStartDate, setAppliedStartDate] = useState<Date>(new Date('2024-12-31'));
  const [appliedEndDate, setAppliedEndDate] = useState<Date>(new Date('2025-01-15'));
  
  const [chartMetric, setChartMetric] = useState('conversations');

  const handleApplyFilters = () => {
    console.log('Applying filters:', { startDate, endDate });
    setAppliedStartDate(new Date(startDate));
    setAppliedEndDate(new Date(endDate));
  };

  // Generate random data for the selected period and metric
  const generateRandomData = React.useMemo(() => {
    const diffTime = Math.abs(appliedEndDate.getTime() - appliedStartDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Determine data points frequency - minimum 3 points, maximum 15 points
    const pointsCount = Math.min(Math.max(Math.floor(diffDays / 2), 3), 15);
    const interval = Math.floor(diffDays / pointsCount);
    
    const data = [];
    
    // Base values and ranges for each metric
    const metricConfig = {
      conversations: { base: 45, range: 40, growth: 1.02 },
      leads: { base: 25, range: 25, growth: 1.05 },
      contacts: { base: 120, range: 60, growth: 1.01 },
      conversion: { base: 65, range: 20, growth: 1.001 }
    };
    
    const config = metricConfig[chartMetric as keyof typeof metricConfig];
    let currentValue = config.base;
    
    for (let i = 0; i <= pointsCount; i++) {
      const currentDate = new Date(appliedStartDate);
      currentDate.setDate(currentDate.getDate() + (i * interval));
      
      // Don't exceed end date
      if (currentDate > appliedEndDate) {
        currentDate.setTime(appliedEndDate.getTime());
      }
      
      // Generate realistic random variation with slight upward trend
      const randomVariation = (Math.random() - 0.5) * config.range;
      currentValue = Math.max(1, currentValue * config.growth + randomVariation);
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        value: Math.round(currentValue)
      });
      
      // Break if we've reached the end date
      if (currentDate.getTime() >= appliedEndDate.getTime()) break;
    }
    
    console.log('Generated data points:', data.length, data);
    return data;
  }, [appliedStartDate, appliedEndDate, chartMetric]);

  // Check if we have data to display
  const hasData = generateRandomData.length > 0;

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
    <div className="h-full overflow-hidden p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral das suas atividades</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Conversas Ativas</p>
              <p className="text-2xl font-bold mt-1">12</p>
              <p className="text-xs text-muted-foreground mt-1">+2 desde ontem</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Leads</p>
              <p className="text-2xl font-bold mt-1">23</p>
              <p className="text-xs text-muted-foreground mt-1">+5 esta semana</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Contatos</p>
              <p className="text-2xl font-bold mt-1">156</p>
              <p className="text-xs text-muted-foreground mt-1">Total de contatos</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
              <p className="text-2xl font-bold mt-1">68%</p>
              <p className="text-xs text-muted-foreground mt-1">+12% este mês</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart and Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-320px)]">
        {/* Chart Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtro do gráfico:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-[110px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "dd/MM/yy") : "Data inicial"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        if (date) {
                          setStartDate(date);
                          console.log('Start date selected:', date);
                        }
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-sm text-muted-foreground">até</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-[110px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "dd/MM/yy") : "Data final"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        if (date) {
                          setEndDate(date);
                          console.log('End date selected:', date);
                        }
                      }}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Button 
                  onClick={handleApplyFilters} 
                  size="sm"
                  className="ml-2"
                >
                  Aplicar Filtro
                </Button>
              </div>
            </div>
          </Card>

          {/* Chart */}
          <Card className="h-[calc(100%-80px)]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{getMetricLabel(chartMetric)} ao Longo do Tempo</CardTitle>
                  <CardDescription className="mt-1">
                    Período de {format(appliedStartDate, 'dd/MM/yyyy')} a {format(appliedEndDate, 'dd/MM/yyyy')}
                  </CardDescription>
                </div>
                <Select value={chartMetric} onValueChange={setChartMetric}>
                  <SelectTrigger className="w-[160px]">
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
            <CardContent className="h-[calc(100%-120px)]">
              {hasData ? (
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={generateRandomData} key={`${appliedStartDate.getTime()}-${appliedEndDate.getTime()}-${chartMetric}`}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7D19F3" stopOpacity={0.6}/>
                          <stop offset="30%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                        domain={['dataMin', 'dataMax']}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                        domain={['dataMin', 'dataMax']}
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
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Nenhum dado encontrado para o período selecionado</p>
                    <p className="text-xs mt-1">Tente selecionar um período diferente</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Activities */}
          <Card className="h-[calc(50%-8px)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Nova conversa iniciada</p>
                  <p className="text-xs text-muted-foreground">há 2 minutos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Lead qualificado</p>
                  <p className="text-xs text-muted-foreground">há 15 minutos</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Contato adicionado</p>
                  <p className="text-xs text-muted-foreground">há 1 hora</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Mensagem respondida</p>
                  <p className="text-xs text-muted-foreground">há 2 horas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card className="h-[calc(50%-8px)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Indicadores de Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Tempo de resposta médio</span>
                  <span className="text-sm text-muted-foreground">2m 30s</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Satisfação do cliente</span>
                  <span className="text-sm text-muted-foreground">94%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '94%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Taxa de resolução</span>
                  <span className="text-sm text-muted-foreground">87%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '87%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};