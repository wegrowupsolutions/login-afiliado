import React, { createContext, useContext, useState, useCallback } from 'react';
import { EvolutionInstance } from '@/types/evolution';

interface ConnectedInstance {
  name: string;
  phoneNumber: string;
  status: 'connected';
}

interface EvolutionContextType {
  instances: EvolutionInstance[];
  connectedInstance: ConnectedInstance | null;
  addInstance: (instance: EvolutionInstance) => void;
  updateInstance: (name: string, updates: Partial<EvolutionInstance>) => void;
  removeInstance: (name: string) => void;
  getInstanceByName: (name: string) => EvolutionInstance | undefined;
  setConnectedInstance: (instance: ConnectedInstance | null) => void;
}

const EvolutionContext = createContext<EvolutionContextType | undefined>(undefined);

export const EvolutionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instances, setInstances] = useState<EvolutionInstance[]>([]);
  const [connectedInstance, setConnectedInstance] = useState<ConnectedInstance | null>(null);

  const addInstance = useCallback((instance: EvolutionInstance) => {
    setInstances(prev => {
      const existingIndex = prev.findIndex(i => i.name === instance.name);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = instance;
        return updated;
      }
      return [...prev, instance];
    });
  }, []);

  const updateInstance = useCallback((name: string, updates: Partial<EvolutionInstance>) => {
    setInstances(prev => prev.map(instance => 
      instance.name === name ? { ...instance, ...updates } : instance
    ));
  }, []);

  const removeInstance = useCallback((name: string) => {
    setInstances(prev => prev.filter(instance => instance.name !== name));
  }, []);

  const getInstanceByName = useCallback((name: string) => {
    return instances.find(instance => instance.name === name);
  }, [instances]);

  const value = {
    instances,
    connectedInstance,
    addInstance,
    updateInstance,
    removeInstance,
    getInstanceByName,
    setConnectedInstance
  };

  return (
    <EvolutionContext.Provider value={value}>
      {children}
    </EvolutionContext.Provider>
  );
};

export const useEvolution = () => {
  const context = useContext(EvolutionContext);
  if (context === undefined) {
    throw new Error('useEvolution must be used within an EvolutionProvider');
  }
  return context;
};