
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, PawPrint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  
  return (
    <header className="bg-gradient-to-r from-primary to-accent dark:from-tertiary-dark dark:to-quaternary-black text-white shadow-xl backdrop-blur-lg transition-all duration-500 border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <PawPrint className="h-8 w-8 text-petshop-gold animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Pet Paradise
            </h1>
            <p className="text-sm text-white/70">Dashboard Principal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-2 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
            Bem-vindo, {user?.user_metadata?.name || user?.email}
          </Badge>
          <ThemeToggle />
          <Button 
            variant="outline" 
            onClick={signOut} 
            className="border-white/30 text-white bg-white/5 hover:bg-white/15 backdrop-blur-sm transition-all duration-300 hover:scale-105"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
