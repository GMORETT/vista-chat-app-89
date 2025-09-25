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
    <div className="min-h-screen p-4 space-y-4">
      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Stats Cards - Top Row */}
        <div className="col-span-12 grid grid-cols-4 gap-3 h-fit mb-4">
          <Card className="px-1 py-1 pr-0">
            <div className="inline-flex items-center gap-1.5">
              <div>
                <p className="text-xs text-muted-foreground leading-tight">Conversas Ativas</p>
                <p className="text-base font-bold leading-tight">12</p>
                <p className="text-xs text-muted-foreground leading-tight">+2 desde ontem</p>
              </div>
              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>

          <Card className="px-1 py-1 pr-0">
            <div className="inline-flex items-center gap-1.5">
              <div>
                <p className="text-xs text-muted-foreground leading-tight">Leads</p>
                <p className="text-base font-bold leading-tight">23</p>
                <p className="text-xs text-muted-foreground leading-tight">+5 esta semana</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>

          <Card className="px-1 py-1 pr-0">
            <div className="inline-flex items-center gap-1.5">
              <div>
                <p className="text-xs text-muted-foreground leading-tight">Contatos</p>
                <p className="text-base font-bold leading-tight">156</p>
                <p className="text-xs text-muted-foreground leading-tight">Total de contatos</p>
              </div>
              <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>

          <Card className="px-1 py-1 pr-0">
            <div className="inline-flex items-center gap-1.5">
              <div>
                <p className="text-xs text-muted-foreground leading-tight">Taxa de Conversão</p>
                <p className="text-base font-bold leading-tight">68%</p>
                <p className="text-xs text-muted-foreground leading-tight">+12% este mês</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Card>
        </div>

        {/* Chart Section with Filter - Left Side */}
        <div className="col-span-8 space-y-2">
          {/* Filter Section */}
          <Card className="p-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">Período:</span>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[90px] h-7 justify-start text-left font-normal text-xs",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {startDate ? format(startDate, "dd/MM") : "Início"}
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

              <span className="text-xs text-muted-foreground">até</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-[90px] h-7 justify-start text-left font-normal text-xs",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {endDate ? format(endDate, "dd/MM") : "Fim"}
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
                className="h-7 text-xs px-3"
              >
                Aplicar
              </Button>
            </div>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{getMetricLabel(chartMetric)} ao Longo do Tempo</CardTitle>
                  <CardDescription className="text-xs">
                    {format(appliedStartDate, 'dd/MM/yyyy')} - {format(appliedEndDate, 'dd/MM/yyyy')} ({generateRandomData.length} pontos)
                  </CardDescription>
                </div>
                <Select value={chartMetric} onValueChange={setChartMetric}>
                  <SelectTrigger className="w-[120px] h-7 text-xs">
                    <SelectValue placeholder="Métrica" />
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
            <CardContent className="px-3 pb-3">
              <div className="h-80">
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
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                          tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                          domain={['dataMin', 'dataMax']}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
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
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Nenhum dado encontrado</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Section - Right Side */}
        <div className="col-span-4 h-full">
          <div className="space-y-4 h-full flex flex-col">
          <Card>
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm">Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">Nova conversa iniciada</p>
                    <p className="text-xs text-muted-foreground">há 2 minutos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">Lead qualificado</p>
                    <p className="text-xs text-muted-foreground">há 15 minutos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">Contato adicionado</p>
                    <p className="text-xs text-muted-foreground">há 1 hora</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">Mensagem respondida</p>
                    <p className="text-xs text-muted-foreground">há 2 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="min-h-[80px] flex-1">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-sm">Performance</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Tempo de resposta</span>
                    <span className="text-xs text-muted-foreground">2m 30s</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Satisfação</span>
                    <span className="text-xs text-muted-foreground">94%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Resolução</span>
                    <span className="text-xs text-muted-foreground">87%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
};