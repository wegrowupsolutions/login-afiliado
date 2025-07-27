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
  ChevronRight,
  Play
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
    title: 'Academia',
    url: '/academia',
    icon: Play,
    description: 'Vídeos explicativos'
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
      "border-r border-border/30 bg-card/50 backdrop-blur-xl transition-all duration-300 shadow-sm",
      collapsed ? "w-16" : "w-72"
    )}>
      <SidebarContent className="p-0 h-full">
        {/* Logo Section */}
        <div className={cn(
          "flex items-center border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5",
          collapsed ? "justify-center px-2 py-4" : "justify-between px-6 py-6"
        )}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-xl opacity-20 blur-sm"></div>
              <div className="relative p-2.5 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Afiliado IA
                </h1>
                <p className="text-xs text-muted-foreground/80 font-medium">Versão 2.0</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          <SidebarGroup className={cn("space-y-2", collapsed ? "px-2" : "px-4")}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/80 px-3 mb-4 uppercase tracking-wider">
                Navegação Principal
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu className="space-y-2">
                {navigationItems.map((item, index) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) => cn(
                          "flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden",
                          "hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:shadow-md hover:scale-[1.02]",
                          "border border-transparent hover:border-primary/20",
                          collapsed ? "justify-center p-3 mx-0" : "gap-4 px-4 py-3.5",
                          isActive 
                            ? "bg-gradient-to-r from-primary/15 to-accent/15 text-primary border-primary/30 shadow-lg shadow-primary/10" 
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title={collapsed ? `${item.title} - ${item.description}` : undefined}
                        style={{
                          animationDelay: `${index * 50}ms`
                        }}
                      >
                        {/* Background glow effect for active state */}
                        {isActive(item.url) && (
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl"></div>
                        )}
                        
                        <div className={cn(
                          "relative z-10 p-2 rounded-lg transition-all duration-300",
                          isActive(item.url) 
                            ? "bg-gradient-to-br from-primary/20 to-accent/20 shadow-sm" 
                            : "group-hover:bg-primary/10"
                        )}>
                          <item.icon className={cn(
                            "h-5 w-5 transition-all duration-300 flex-shrink-0",
                            isActive(item.url) 
                              ? "text-primary drop-shadow-sm" 
                              : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
                          )} />
                        </div>
                        
                        {!collapsed && (
                          <div className="flex flex-col flex-1 min-w-0 relative z-10">
                            <span className={cn(
                              "text-sm font-semibold truncate transition-colors duration-300",
                              isActive(item.url) ? "text-primary" : "group-hover:text-foreground"
                            )}>
                              {item.title}
                            </span>
                            <span className={cn(
                              "text-xs truncate transition-colors duration-300",
                              isActive(item.url) ? "text-primary/70" : "text-muted-foreground/80 group-hover:text-muted-foreground"
                            )}>
                              {item.description}
                            </span>
                          </div>
                        )}
                        
                        {/* Enhanced active indicators */}
                        {isActive(item.url) && !collapsed && (
                          <>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-l-full shadow-lg"></div>
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          </>
                        )}
                        
                        {/* Active indicator for collapsed mode */}
                        {isActive(item.url) && collapsed && (
                          <>
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-primary to-accent rounded-l-full shadow-lg"></div>
                            <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          </>
                        )}
                        
                        {/* Subtle hover chevron for collapsed mode */}
                        {collapsed && (
                          <ChevronRight className={cn(
                            "absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3 opacity-0 transition-all duration-300",
                            "group-hover:opacity-50 group-hover:translate-x-1"
                          )} />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Footer section */}
        {!collapsed && (
          <div className="border-t border-border/30 p-4 bg-gradient-to-r from-muted/30 to-muted/10">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sistema Online</span>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}