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
    return location.pathname.startsWith(path);
  };
  const getNavClassName = (isActiveRoute: boolean) => `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-lg px-3 py-2 transition-all ${isActiveRoute ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`;
  return <Sidebar collapsible="icon" className="">
      <SidebarHeader className="border-b border-border/20 p-0">
        <div className={`flex items-center p-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          {collapsed ? (
            <span className="text-sm font-bold text-primary">SOLABS</span>
          ) : (
            <img src="/assets/logo-solabs-white.png" alt="Solabs" className="h-10 w-auto object-contain transition-all duration-200" />
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {menuItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(isActive(item.url))} title={collapsed ? item.title : undefined}>
                      <item.icon className={`${collapsed ? 'h-6 w-6' : 'h-6 w-6'} flex-shrink-0`} />
                      {!collapsed && <span className="text-sm font-medium">
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