import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MessageSquare, 
  TrendingUp,
  HeadphonesIcon
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
} from './ui/sidebar';

const menuItems = [
  { 
    title: 'Dashboard', 
    url: '/dashboard', 
    icon: LayoutDashboard
  },
  { 
    title: 'Mensageria', 
    url: '/mensageria', 
    icon: MessageSquare 
  },
  { 
    title: 'Funil/Vendas', 
    url: '/funil', 
    icon: TrendingUp 
  },
  { 
    title: 'Fale com a SOL', 
    url: '/fale-conosco', 
    icon: HeadphonesIcon 
  }
];

export const MainSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (isActiveRoute: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
      isActiveRoute 
        ? "bg-primary text-primary-foreground shadow-sm font-medium" 
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border/40 p-0">
        <div className={`flex items-center gap-3 p-4 ${collapsed ? 'justify-center' : ''}`}>
          <img 
            src="/assets/logo-solabs-white.png" 
            alt="Solabs" 
            className={`${collapsed ? 'h-8 w-8' : 'h-10 w-auto'} object-contain`}
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-foreground">Solabs</span>
              <span className="text-xs text-muted-foreground">Messages Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={`px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide ${collapsed ? 'sr-only' : ''}`}>
            Menu Principal
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0">
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(isActive(item.url))}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className={`${collapsed ? 'h-5 w-5' : 'h-4 w-4'} flex-shrink-0`} />
                      {!collapsed && (
                        <span className="flex-1 text-left">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};