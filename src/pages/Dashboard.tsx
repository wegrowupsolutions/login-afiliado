
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDashboardRealtime } from '@/hooks/useDashboardRealtime';
import { AppLayout } from '@/components/layout/AppLayout';
import MetricsCard from '@/components/dashboard/MetricsCard';
import ChatsCard from '@/components/dashboard/ChatsCard';
import KnowledgeCard from '@/components/dashboard/KnowledgeCard';
import ClientsCard from '@/components/dashboard/ClientsCard';
import EvolutionCard from '@/components/dashboard/EvolutionCard';
import ScheduleCard from '@/components/dashboard/ScheduleCard';
import ConfigCard from '@/components/dashboard/ConfigCard';
import AcademiaCard from '@/components/dashboard/AcademiaCard';
import AgentConfigCard from '@/components/dashboard/AgentConfigCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Bot, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is admin
  const isAdmin = user?.email === 'teste@gmail.com';
  
  // Initialize real-time updates for the dashboard
  useDashboardRealtime();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-t-transparent border-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Principal</h1>
          <p className="text-muted-foreground">
            Painel de controle do Afiliado IA
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Leads
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                +0% do mês passado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <KnowledgeCard />
          <EvolutionCard />
          <AgentConfigCard />
          <MetricsCard />
          <ClientsCard />
          <ChatsCard />
          <AcademiaCard />
          {isAdmin && <ScheduleCard />}
          {isAdmin && <ConfigCard />}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
