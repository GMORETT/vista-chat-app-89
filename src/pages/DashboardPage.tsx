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

  // Mock data for charts
  const mockData = {
    conversations: [
      { date: '2024-12-15', value: 32 },
      { date: '2024-12-20', value: 38 },
      { date: '2024-12-25', value: 42 },
      { date: '2024-12-30', value: 45 },
      { date: '2025-01-01', value: 52 },
      { date: '2025-01-05', value: 48 },
      { date: '2025-01-10', value: 61 },
      { date: '2025-01-15', value: 75 },
      { date: '2025-01-20', value: 68 },
      { date: '2025-01-25', value: 82 },
      { date: '2025-01-30', value: 78 },
    ],
    leads: [
      { date: '2024-12-15', value: 18 },
      { date: '2024-12-20', value: 21 },
      { date: '2024-12-25', value: 25 },
      { date: '2024-12-30', value: 23 },
      { date: '2025-01-01', value: 28 },
      { date: '2025-01-05', value: 35 },
      { date: '2025-01-10', value: 42 },
      { date: '2025-01-15', value: 38 },
      { date: '2025-01-20', value: 55 },
      { date: '2025-01-25', value: 62 },
      { date: '2025-01-30', value: 58 },
    ],
    contacts: [
      { date: '2024-12-15', value: 98 },
      { date: '2024-12-20', value: 105 },
      { date: '2024-12-25', value: 115 },
      { date: '2024-12-30', value: 120 },
      { date: '2025-01-01', value: 125 },
      { date: '2025-01-05', value: 135 },
      { date: '2025-01-10', value: 145 },
      { date: '2025-01-15', value: 150 },
      { date: '2025-01-20', value: 152 },
      { date: '2025-01-25', value: 156 },
      { date: '2025-01-30', value: 160 },
    ],
    conversion: [
      { date: '2024-12-15', value: 58 },
      { date: '2024-12-20', value: 62 },
      { date: '2024-12-25', value: 65 },
      { date: '2024-12-30', value: 65 },
      { date: '2025-01-01', value: 68 },
      { date: '2025-01-05', value: 62 },
      { date: '2025-01-10', value: 70 },
      { date: '2025-01-15', value: 75 },
      { date: '2025-01-20', value: 72 },
      { date: '2025-01-25', value: 68 },
      { date: '2025-01-30', value: 71 },
    ]
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
    <div className="h-full overflow-hidden p-3 space-y-2">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral das suas atividades</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-2 h-[calc(100vh-90px)]">
        {/* Stats Cards - Top Row */}
        <div className="col-span-12 grid grid-cols-4 gap-2">
          <Card className="p-1">
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">Conversas</p>
                <p className="text-sm font-bold">12</p>
              </div>
              <MessageSquare className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">+2 ontem</p>
          </Card>

          <Card className="p-1">
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">Leads</p>
                <p className="text-sm font-bold">23</p>
              </div>
              <TrendingUp className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">+5 semana</p>
          </Card>

          <Card className="p-1">
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">Contatos</p>
                <p className="text-sm font-bold">156</p>
              </div>
              <Users className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">Total</p>
          </Card>

          <Card className="p-1">
            <div className="flex items-center gap-1">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">Taxa</p>
                <p className="text-sm font-bold">68%</p>
              </div>
              <BarChart3 className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">+12% mês</p>
          </Card>
        </div>

        {/* Chart Section - Left Side */}
        <div className="col-span-9 space-y-1">
          {/* Chart Filters */}
          <Card className="p-1.5">
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
                      "w-[70px] h-6 justify-start text-left font-normal text-xs",
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
                      "w-[70px] h-6 justify-start text-left font-normal text-xs",
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
                className="h-6 text-xs px-2"
              >
                Aplicar
              </Button>
            </div>
          </Card>

          <Card className="h-[calc(100%-40px)]">
            <CardHeader className="pb-1 pt-2 px-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">{getMetricLabel(chartMetric)}</CardTitle>
                  <CardDescription className="text-xs">
                    {format(appliedStartDate, 'dd/MM')} - {format(appliedEndDate, 'dd/MM')} ({generateRandomData.length} pts)
                  </CardDescription>
                </div>
                <Select value={chartMetric} onValueChange={setChartMetric}>
                  <SelectTrigger className="w-[100px] h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conversations">Conversas</SelectItem>
                    <SelectItem value="leads">Leads</SelectItem>
                    <SelectItem value="contacts">Contatos</SelectItem>
                    <SelectItem value="conversion">Taxa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-2 h-[calc(100%-50px)]">
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
                    <BarChart3 className="h-6 w-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">Sem dados</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Performance Section - Right Side */}
        <div className="col-span-3 space-y-1">
          <Card className="h-[calc(50%-2px)]">
            <CardHeader className="pb-1 pt-1.5 px-1.5">
              <CardTitle className="text-xs">Atividades</CardTitle>
            </CardHeader>
            <CardContent className="px-1.5 pb-1.5 h-[calc(100%-25px)]">
              <div className="space-y-1 h-full overflow-y-auto">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">Conversa iniciada</p>
                    <p className="text-xs text-muted-foreground">2min</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">Lead qualificado</p>
                    <p className="text-xs text-muted-foreground">15min</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">Contato add</p>
                    <p className="text-xs text-muted-foreground">1h</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-[calc(50%-2px)]">
            <CardHeader className="pb-1 pt-1.5 px-1.5">
              <CardTitle className="text-xs">Performance</CardTitle>
            </CardHeader>
            <CardContent className="px-1.5 pb-1.5 h-[calc(100%-25px)]">
              <div className="space-y-1.5 h-full">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate">Resposta</span>
                    <span className="text-xs text-muted-foreground">2m30s</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1 mt-0.5">
                    <div className="bg-primary h-1 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate">Satisfação</span>
                    <span className="text-xs text-muted-foreground">94%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1 mt-0.5">
                    <div className="bg-primary h-1 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate">Resolução</span>
                    <span className="text-xs text-muted-foreground">87%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-1 mt-0.5">
                    <div className="bg-primary h-1 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};