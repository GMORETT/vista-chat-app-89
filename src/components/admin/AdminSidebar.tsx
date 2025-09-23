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
];

export const AdminSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
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