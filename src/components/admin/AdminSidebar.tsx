import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Inbox, 
  Users, 
  UserCheck, 
  Tags,
  LayoutDashboard,
  Building2,
  Shield
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
} from '../ui/sidebar';

const menuItems = [
  { 
    title: 'Dashboard', 
    url: '/admin', 
    icon: LayoutDashboard,
    exact: true
  },
  { 
    title: 'Clientes', 
    url: '/admin/clients', 
    icon: Building2 
  },
  { 
    title: 'Inboxes', 
    url: '/admin/inboxes', 
    icon: Inbox 
  },
  { 
    title: 'Teams', 
    url: '/admin/teams', 
    icon: Users 
  },
  { 
    title: 'Agents', 
    url: '/admin/agents', 
    icon: UserCheck 
  },
  { 
    title: 'Labels', 
    url: '/admin/labels', 
    icon: Tags 
  },
  { 
    title: 'Logs', 
    url: '/admin/logs', 
    icon: Shield 
  },
  { 
    title: 'Auditoria Inboxes', 
    url: '/admin/logs/inboxes', 
    icon: Shield 
  },
];

export const AdminSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    
    // Para rotas com sub-rotas, verificar se não há uma correspondência mais específica
    const allPaths = menuItems.map(item => item.url);
    const moreSpecificPaths = allPaths.filter(p => 
      p.startsWith(path) && p !== path && location.pathname.startsWith(p)
    );
    
    // Se existe uma rota mais específica que corresponde, não ativar esta
    if (moreSpecificPaths.length > 0) {
      return false;
    }
    
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
            {!collapsed && "Administration"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavClassName(isActive(item.url, item.exact))}
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