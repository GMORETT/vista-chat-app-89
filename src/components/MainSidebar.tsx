import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, TrendingUp, HeadphonesIcon, LogOut, Shield, Users, Building2 } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarHeader, SidebarFooter, SidebarTrigger } from './ui/sidebar';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmLogoutDialog } from './ConfirmLogoutDialog';
import { useLogoutConfirmation } from '@/hooks/useLogoutConfirmation';

const menuItems = [{
  title: 'Dashboard',
  url: '/dashboard',
  icon: LayoutDashboard
}, {
  title: 'Leads',
  url: '/leads',
  icon: Users
}, {
  title: 'Empresas',
  url: '/empresas',
  icon: Building2
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
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isModalOpen,
    isLoading,
    openLogoutConfirmation,
    closeLogoutConfirmation,
    confirmLogout
  } = useLogoutConfirmation();
  
  const collapsed = state === 'collapsed';
  const isAdmin = user?.role === 'super_admin' || user?.role === 'admin';

  const isActive = (path: string) => {
    // Handle root path as dashboard
    if (path === '/dashboard' && location.pathname === '/') {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (isActiveRoute: boolean) => `flex items-center ${collapsed ? 'justify-center w-full px-0' : 'gap-3 px-3'} rounded-lg py-2 transition-all ${isActiveRoute ? "bg-primary text-primary-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`;

  return (
    <>
      <Sidebar collapsible="icon" className="">
        <SidebarHeader className="border-b border-border/20 p-0 h-14">
          {collapsed ? (
            <div className="flex items-center justify-center h-full">
              <SidebarTrigger />
            </div>
          ) : (
            <div className="flex items-center justify-between h-full px-4">
              <img src="/assets/logo-solabs-white.png" alt="Solabs" className="h-8 w-auto object-contain" />
              <SidebarTrigger />
            </div>
          )}
        </SidebarHeader>
        
        <SidebarContent className={collapsed ? "px-2 py-6" : "px-3 py-6"}>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className={collapsed ? "space-y-2" : "space-y-3"}>
                {menuItems.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild size="lg" className={collapsed ? "w-full justify-center" : ""}>
                      <NavLink to={item.url} className={getNavClassName(isActive(item.url))} title={collapsed ? item.title : undefined}>
                        <item.icon className={`${collapsed ? 'h-5 w-5' : 'h-7 w-7'} flex-shrink-0`} />
                        {!collapsed && <span className="text-base font-medium">
                            {item.title}
                          </span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className={`border-t border-border/20 ${collapsed ? 'p-2' : 'p-3'}`}>
          <div className={collapsed ? "space-y-1" : "space-y-2"}>
            {!collapsed && (
              <div className="px-2 py-1">
                <span className="text-xs text-muted-foreground">
                  {user?.name || 'Usuário'}
                </span>
              </div>
            )}
            
            <div className={`flex ${collapsed ? 'flex-col items-center gap-1' : 'flex-row gap-2'}`}>
              {isAdmin && (
                <Button 
                  variant="ghost" 
                  size={collapsed ? "icon" : "sm"}
                  onClick={() => navigate('/admin')}
                  title="Admin"
                  className={collapsed ? "w-8 h-8" : "flex-1"}
                >
                  <Shield className="h-4 w-4" />
                  {!collapsed && <span className="ml-1">Admin</span>}
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size={collapsed ? "icon" : "sm"}
                onClick={openLogoutConfirmation} 
                title="Sair"
                className={collapsed ? "w-8 h-8" : "flex-1"}
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span className="ml-1">Sair</span>}
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <ConfirmLogoutDialog 
        open={isModalOpen} 
        onOpenChange={closeLogoutConfirmation} 
        onConfirm={confirmLogout} 
        isLoading={isLoading} 
      />
    </>
  );
};