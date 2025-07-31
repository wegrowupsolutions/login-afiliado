
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvolution } from '@/context/EvolutionContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, CheckCircle, Smartphone } from 'lucide-react';

const EvolutionCard = () => {
  const navigate = useNavigate();
  const { connectedInstance } = useEvolution();
  
  const handleClick = () => {
    navigate('/evolution');
  };
  
  return (
    <Card className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:border-gray-700 dark:text-white" onClick={handleClick}>
      <CardHeader className={`pb-2 text-white rounded-t-lg ${connectedInstance ? 'bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600' : 'bg-gradient-to-r from-blue-400 to-cyan-500 dark:from-blue-500 dark:to-cyan-600'}`}>
        <CardTitle className="flex items-center gap-2">
          {connectedInstance ? (
            <CheckCircle className="h-6 w-6" />
          ) : (
            <Link className="h-6 w-6" />
          )}
          {connectedInstance ? 'WhatsApp Conectado' : 'Conectar WhatsApp'}
        </CardTitle>
        <CardDescription className={connectedInstance ? "text-green-100" : "text-blue-100"}>
          {connectedInstance ? 'Gerenciar conexão' : 'Conectar e sincronizar'}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-center">
          <div className={`p-6 rounded-full ${connectedInstance ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
            {connectedInstance ? (
              <Smartphone className="h-14 w-14 text-green-500 dark:text-green-400" />
            ) : (
              <Link className="h-14 w-14 text-blue-500 dark:text-blue-400 animate-pulse" />
            )}
          </div>
        </div>
        {connectedInstance ? (
          <div className="text-center space-y-2">
            <p className="font-medium text-foreground">
              {connectedInstance.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {connectedInstance.phoneNumber}
            </p>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 text-center">
            Conecte e sincronize seu sistema com a plataforma Evolution.
          </p>
        )}
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-700/50 rounded-b-lg border-t dark:border-gray-700 flex justify-center py-3">
        <Badge 
          variant="outline" 
          className={connectedInstance 
            ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/50"
            : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/50"
          }
        >
          {connectedInstance ? 'Gerenciar' : 'Conectar WhatsApp'}
        </Badge>
      </CardFooter>
    </Card>
  );
};

export default EvolutionCard;
