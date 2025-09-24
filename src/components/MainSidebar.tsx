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
    isActiveRoute 
      ? "bg-accent text-accent-foreground font-medium" 
      : "hover:bg-accent/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {!collapsed && "Menu Principal"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(isActive(item.url))}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
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