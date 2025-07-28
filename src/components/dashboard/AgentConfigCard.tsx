import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';

const AgentConfigCard = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/config');
  };

  return (
    <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={handleClick}>
      <CardHeader className="pb-2 bg-gradient-to-r from-primary to-accent text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Configuração do Agente
        </CardTitle>
        <CardDescription className="text-white/80">
          Personalização e configurações
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className="bg-primary/10 dark:bg-primary/20 p-6 rounded-full">
            <Settings className="h-14 w-14 text-primary animate-pulse" />
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-center">
          Configure e personalize seu agente IA para atender suas necessidades específicas.
        </p>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge variant="outline" className="bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30">
          Configurar agente
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default AgentConfigCard;