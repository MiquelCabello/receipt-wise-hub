import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Receipt, 
  Upload, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

const AppLayout = () => {
  const { user, signOut } = useAuth();

  React.useEffect(() => {
    if (!user) {
      window.location.href = '/auth';
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/auth';
  };

  const navigationItems = [
    { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { title: 'Gastos', icon: Receipt, href: '/expenses' },
    { title: 'Subir Ticket', icon: Upload, href: '/upload' },
    { title: 'Analíticas', icon: BarChart3, href: '/analytics' },
    ...(user?.role === 'ADMIN' ? [
      { title: 'Empleados', icon: Users, href: '/employees' }
    ] : []),
    { title: 'Configuración', icon: Settings, href: '/settings' }
  ];

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 bg-gradient-financial rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">ExpenseWise</h2>
                <p className="text-xs text-sidebar-foreground/60">Gestión de Gastos</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.href}
                      className={({ isActive }) => cn(
                        "w-full justify-start gap-3 flex items-center px-3 py-2 rounded-md transition-colors",
                        isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.title}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <div className="px-4 py-2 border-t border-sidebar-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-h-screen">
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1" />
            </div>
          </header>
          
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;