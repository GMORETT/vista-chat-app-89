import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Inbox, 
  Users, 
  UserCheck, 
  Tags,
  LayoutDashboard,
  Building2,
  Shield,
  FileBarChart
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
  SidebarHeader,
  useSidebar,
} from '../ui/sidebar';

const mainMenuItems = [
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
];

const managementItems = [
  { 
    title: 'Inboxes', 
    url: '/admin/inboxes', 
    icon: Inbox 
  },
  { 
    title: 'Equipes', 
    url: '/admin/teams', 
    icon: Users 
  },
  { 
    title: 'Agentes', 
    url: '/admin/agents', 
    icon: UserCheck 
  },
  { 
    title: 'Etiquetas', 
    url: '/admin/labels', 
    icon: Tags 
  },
];

const auditItems = [
  { 
    title: 'Logs do Sistema', 
    url: '/admin/logs', 
    icon: Shield 
  },
  { 
    title: 'Auditoria Inboxes', 
    url: '/admin/logs/inboxes', 
    icon: FileBarChart 
  },
];

const allMenuItems = [...mainMenuItems, ...managementItems, ...auditItems];

export const AdminSidebar: React.FC = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === 'collapsed';
  
  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    
    // Para rotas com sub-rotas, verificar se não há uma correspondência mais específica
    const allPaths = allMenuItems.map(item => item.url);
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
    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
      isActiveRoute 
        ? "bg-primary text-primary-foreground font-medium shadow-sm" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    }`;

  const renderMenuItems = (items: typeof mainMenuItems) => (
    <SidebarMenu className="space-y-0.5">
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild size="default">
            <NavLink 
              to={item.url} 
              className={getNavClassName(isActive(item.url, item.exact))}
              title={collapsed ? item.title : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">
                  {item.title}
                </span>
              )}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-0 h-14">
        <div className={`flex items-center justify-center h-full ${collapsed ? 'px-2' : 'px-4'}`}>
          {collapsed ? (
            <img 
              src="/assets/logo-solabs-white.png" 
              alt="Solabs" 
              className="h-7 w-auto object-contain" 
            />
          ) : (
            <div className="flex items-center gap-3">
              <img 
                src="/assets/logo-solabs-white.png" 
                alt="Solabs" 
                className="h-8 w-auto object-contain" 
              />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Administration</p>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-3">
        {/* Main Section */}
        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs font-semibold text-muted-foreground mb-1 ${collapsed ? 'sr-only' : ''}`}>
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainMenuItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={`text-xs font-semibold text-muted-foreground mb-1 ${collapsed ? 'sr-only' : ''}`}>
            Gerenciamento
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(managementItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Audit Section */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className={`text-xs font-semibold text-muted-foreground mb-1 ${collapsed ? 'sr-only' : ''}`}>
            Auditoria & Logs
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(auditItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};