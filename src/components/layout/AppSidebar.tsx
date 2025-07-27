import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  MessageSquare,
  Users,
  Bot,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight
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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: BarChart3,
    description: 'Visão geral'
  },
  {
    title: 'Chats',
    url: '/chats',
    icon: MessageSquare,
    description: 'Conversas ativas'
  },
  {
    title: 'Clientes',
    url: '/clients',
    icon: Users,
    description: 'Gerenciar clientes'
  },
  {
    title: 'Métricas',
    url: '/metrics',
    icon: BarChart3,
    description: 'Analytics'
  },
  {
    title: 'Evolution API',
    url: '/evolution',
    icon: Bot,
    description: 'WhatsApp Bot'
  },
  {
    title: 'Agenda',
    url: '/schedule',
    icon: Calendar,
    description: 'Agendamentos'
  },
  {
    title: 'Knowledge',
    url: '/knowledge',
    icon: FileText,
    description: 'Base de conhecimento'
  },
  {
    title: 'Configurações',
    url: '/config',
    icon: Settings,
    description: 'Ajustes do sistema'
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  
  return (
    <Sidebar className={cn(
      "border-r border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <SidebarContent className="p-0">
        {/* Logo Section */}
        <div className={cn(
          "flex items-center px-4 py-6 border-b border-border/40",
          collapsed ? "justify-center px-2" : "justify-between"
        )}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Afiliado IA
                </h1>
                <p className="text-xs text-muted-foreground">v2.0</p>
              </div>
            )}
          </div>
          {!collapsed && <SidebarTrigger />}
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-2 py-4">
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 mb-2">
              Navegação
            </SidebarGroupLabel>
          )}
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative overflow-hidden",
                        "hover:bg-primary/5 hover:text-primary",
                        isActive 
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isActive(item.url) ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                      )} />
                      
                      {!collapsed && (
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium truncate">
                            {item.title}
                          </span>
                          <span className="text-xs text-muted-foreground truncate">
                            {item.description}
                          </span>
                        </div>
                      )}
                      
                      {/* Active indicator */}
                      {isActive(item.url) && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l" />
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Collapse toggle for mini mode */}
        {collapsed && (
          <div className="mt-auto p-2">
            <SidebarTrigger className="w-full" />
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}