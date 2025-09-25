import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, TrendingUp, HeadphonesIcon } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarHeader } from './ui/sidebar';
const menuItems = [{
  title: 'Dashboard',
  url: '/dashboard',
  icon: LayoutDashboard
}, {
  title: 'Mensageria',
  url: '/mensageria',
  icon: MessageSquare
}, {
  title: 'Funil/Vendas',
  url: '/funil',
  icon: TrendingUp
}, {
  title: 'Fale com a SOL',
  url: '/fale-conosco',
  icon: HeadphonesIcon
}];
export const MainSidebar: React.FC = () => {
  const {
    state
  } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  const isActive = (path: string) => {
    // Handle root path as dashboard
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path);
  };
  const getNavClassName = (isActiveRoute: boolean) => `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 transition-all ${isActiveRoute ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`;
  return <Sidebar collapsible="icon" className="">
      <SidebarHeader className="border-b border-r border-border/20 p-0 h-14">
        <div className={`flex items-center justify-center h-full ${collapsed ? 'px-2' : 'px-4'}`}>
          {collapsed ? (
            <span className="text-xs font-bold text-primary">SOL</span>
          ) : (
            <img src="/assets/logo-solabs-white.png" alt="Solabs" className="h-8 w-auto object-contain" />
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg">
                    <NavLink to={item.url} className={getNavClassName(isActive(item.url))} title={collapsed ? item.title : undefined}>
                      <item.icon className="h-7 w-7 flex-shrink-0" />
                      {!collapsed && <span className="text-base font-medium">
                          {item.title}
                        </span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>;
};