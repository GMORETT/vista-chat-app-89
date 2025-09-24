import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, TrendingUp, HeadphonesIcon } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarHeader } from './ui/sidebar';

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
    `flex items-center gap-4 rounded-xl px-4 py-3 text-base font-medium transition-all duration-200 ${
      isActiveRoute 
        ? "bg-primary text-primary-foreground shadow-lg font-semibold" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-md"
    }`;

  return (
    <Sidebar className={collapsed ? "w-20" : "w-80"} collapsible="icon">
      <SidebarHeader className="border-b border-border/20 p-0">
        <div className={`flex items-center gap-4 p-6 ${collapsed ? 'justify-center p-5' : ''}`}>
          <div className="flex-shrink-0">
            <img 
              src="/assets/logo-solabs-white.png" 
              alt="Solabs" 
              className={`${
                collapsed 
                  ? 'h-12 w-12 min-h-[3rem] min-w-[3rem]' 
                  : 'h-14 w-auto max-w-[200px]'
              } object-contain transition-all duration-300`} 
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-bold text-sidebar-foreground truncate">SOLABS</span>
              <span className="text-sm text-sidebar-foreground/60 uppercase tracking-wider">Messages Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel className={`px-4 text-sm font-semibold text-sidebar-foreground/70 uppercase tracking-wider mb-4 ${collapsed ? 'sr-only' : ''}`}>
            Menu Principal
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {menuItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-auto p-0">
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(isActive(item.url))} 
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className={`${collapsed ? 'h-7 w-7' : 'h-6 w-6'} flex-shrink-0`} />
                      {!collapsed && (
                        <span className="flex-1 text-left text-base font-medium truncate">
                          {item.title}
                        </span>
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