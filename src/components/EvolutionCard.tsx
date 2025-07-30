import React from 'react';
import { Smartphone, Wifi, Clock, AlertCircle } from 'lucide-react';
import { EvolutionInstance } from '@/types/evolution';

interface EvolutionCardProps {
  instance: EvolutionInstance;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRefresh?: () => void;
}

export const EvolutionCard: React.FC<EvolutionCardProps> = ({
  instance,
  onConnect,
  onDisconnect,
  onRefresh
}) => {
  const getStatusColor = (status: EvolutionInstance['status']) => {
    switch (status) {
      case 'connected': return 'text-green-500 bg-green-50';
      case 'connecting': return 'text-blue-500 bg-blue-50';
      case 'failed': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusIcon = (status: EvolutionInstance['status']) => {
    switch (status) {
      case 'connected': return <Wifi size={16} />;
      case 'connecting': return <Clock size={16} />;
      case 'failed': return <AlertCircle size={16} />;
      default: return <Smartphone size={16} />;
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-card-foreground">{instance.name}</h3>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(instance.status)}`}>
          {getStatusIcon(instance.status)}
          <span className="capitalize">{instance.status}</span>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mb-3">
        <div>Criado: {instance.createdAt.toLocaleDateString()}</div>
        {instance.lastConnectedAt && (
          <div>Última conexão: {instance.lastConnectedAt.toLocaleDateString()}</div>
        )}
      </div>
      
      <div className="flex gap-2">
        {instance.status === 'disconnected' && (
          <button
            onClick={onConnect}
            className="flex-1 bg-green-500 text-white py-1 px-3 rounded text-sm hover:bg-green-600"
          >
            Conectar
          </button>
        )}
        
        {instance.status === 'connected' && (
          <button
            onClick={onDisconnect}
            className="flex-1 bg-red-500 text-white py-1 px-3 rounded text-sm hover:bg-red-600"
          >
            Desconectar
          </button>
        )}
        
        <button
          onClick={onRefresh}
          className="px-3 py-1 border border-border rounded text-sm hover:bg-accent"
        >
          Atualizar
        </button>
      </div>
    </div>
  );
};